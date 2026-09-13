#!/usr/bin/env bash
# PostgreSQL dump → gzip → Yandex Object Storage.
# Intended for the production VM. Does not install cron.
#
# Usage (from the repository root):
#   ./scripts/backup-postgres.sh
#
# Optional env:
#   COMPOSE_FILE  (default: docker-compose.prod.yml)
#   ENV_FILE      (default: .env.production)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${S3_BUCKET:?S3_BUCKET is required}"
: "${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
: "${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"

DATE_UTC="$(date -u +%Y-%m-%d)"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
KEY="db-backups/${DATE_UTC}/otdelka-360-${STAMP}.sql.gz"

TMP_DIR="$(mktemp -d)"
TMP="$TMP_DIR/backup.sql.gz"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Dumping PostgreSQL..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl \
  | gzip -c > "$TMP"
chmod 644 "$TMP"

echo "Uploading backup to Object Storage..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm \
  -v "$TMP:/tmp/backup.sql.gz:ro" \
  app node scripts/upload-s3.mjs /tmp/backup.sql.gz "$KEY"

echo "Done: $KEY"
