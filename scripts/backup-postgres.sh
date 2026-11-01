#!/usr/bin/env bash
# PostgreSQL custom-format dump → verify → private Yandex Object Storage bucket.
# Cron-safe: no tty, no secrets on argv, flock-protected, non-zero on failure.
#
# Usage (from the repository root, on the VM):
#   ./scripts/backup-postgres.sh
#
# Optional env:
#   COMPOSE_FILE   (default: docker-compose.prod.yml)
#   ENV_FILE       (default: .env.production)
#   KEY_PREFIX     (default: postgres/daily)
#   LOCK_FILE      (default: /tmp/otdelka-360-backup.lock)
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
KEY_PREFIX="${KEY_PREFIX:-postgres/daily}"
LOCK_FILE="${LOCK_FILE:-/tmp/otdelka-360-backup.lock}"

die() { printf 'BACKUP-ERROR: %s\n' "$*" >&2; exit 1; }

# single-instance lock
exec 9>"$LOCK_FILE"
flock -n 9 || die "another backup is already running"

[[ -f "$ENV_FILE" ]] || die "missing $ENV_FILE"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${POSTGRES_USER:?required}"
: "${POSTGRES_DB:?required}"
: "${BACKUP_S3_BUCKET:?required}"
: "${S3_ACCESS_KEY_ID:?required}"
: "${S3_SECRET_ACCESS_KEY:?required}"

compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

CID="$(compose ps -q postgres)"
[[ -n "$CID" ]] || die "postgres container is not running"

DATE_UTC="$(date -u +%Y-%m-%d)"
STAMP="$(date -u +%Y%m%d_%H%M%S)"
KEY="${KEY_PREFIX}/${DATE_UTC}/otdelka360_${STAMP}.backup"
CTMP="/tmp/backup-${STAMP}.dump"

TMP_DIR="$(mktemp -d)"
chmod 0777 "$TMP_DIR"   # app container runs as uid 1001 and must write download.dump
LOCAL_DUMP="${TMP_DIR}/local.dump"
DL_DUMP="${TMP_DIR}/download.dump"
trap 'rm -rf "$TMP_DIR"; docker exec "$CID" rm -f "$CTMP" >/dev/null 2>&1 || true' EXIT

echo "-- dumping ${POSTGRES_DB} (pg_dump -Fc)"
docker exec "$CID" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f "$CTMP" \
  || die "pg_dump failed"
docker exec "$CID" pg_restore --list "$CTMP" >/dev/null \
  || die "archive failed pg_restore --list verification (in-container)"
docker cp "$CID":"$CTMP" "$LOCAL_DUMP" || die "docker cp failed"
[[ -s "$LOCAL_DUMP" ]] || die "dump file is empty"

SHA_LOCAL="$(sha256sum "$LOCAL_DUMP" | cut -d' ' -f1)"
echo "-- archive ok, sha256 computed"

echo "-- uploading s3://${BACKUP_S3_BUCKET}/${KEY}"
compose run --rm \
  -e S3_BUCKET="$BACKUP_S3_BUCKET" \
  -v "$LOCAL_DUMP:/tmp/upload.dump:ro" \
  app node scripts/upload-s3.mjs /tmp/upload.dump "$KEY" \
  || die "upload or HeadObject verification failed"

echo "-- download-back verification"
compose run --rm \
  -e S3_BUCKET="$BACKUP_S3_BUCKET" -e DL_KEY="$KEY" \
  -v "$TMP_DIR:/work" \
  app node -e '
    const {S3Client,GetObjectCommand}=require("@aws-sdk/client-s3");
    const fs=require("fs");
    const c=new S3Client({region:process.env.S3_REGION||"ru-central1",endpoint:process.env.S3_ENDPOINT,forcePathStyle:true,credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}});
    (async()=>{
      const r=await c.send(new GetObjectCommand({Bucket:process.env.S3_BUCKET,Key:process.env.DL_KEY}));
      fs.writeFileSync("/work/download.dump",Buffer.from(await r.Body.transformToByteArray()));
    })().catch(e=>{console.error("download failed:",e.message);process.exit(1)});
  ' \
  || die "download-back failed"

SHA_DL="$(sha256sum "$DL_DUMP" | cut -d' ' -f1)"
[[ "$SHA_LOCAL" == "$SHA_DL" ]] || die "sha256 mismatch after download-back"

docker cp "$DL_DUMP" "$CID":/tmp/verify.dump
docker exec "$CID" pg_restore --list /tmp/verify.dump >/dev/null \
  || die "downloaded archive failed pg_restore --list"
docker exec "$CID" rm -f /tmp/verify.dump

echo "BACKUP-OK: s3://${BACKUP_S3_BUCKET}/${KEY} size=$(stat -c%s "$LOCAL_DUMP") sha256=${SHA_LOCAL:0:16}…"
