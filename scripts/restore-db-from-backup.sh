#!/usr/bin/env bash
# Restore the mbn_stroy pg_dump archive into the production postgres service,
# reconcile payload_migrations, then run the remaining Payload migrations.
#
# Intended flow on the VM (repo at /opt/otdelka-360):
#   ./scripts/restore-db-from-backup.sh /opt/otdelka-360/recovery/mbn_stroy_recovery_YYYYMMDD_HHMM.backup
#
# Preconditions:
#   * .env.production exists and is filled (POSTGRES_*, DATABASE_URL, PAYLOAD_SECRET)
#   * postgres container is running (compose up -d postgres), database is EMPTY
#     or does not contain business tables yet — the script refuses to run
#     against a database that already has payload collections.
#   * the app image is built (compose build app)
#
# Safety: fails on first error, never runs seeds, never runs migrate:fresh.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_FILE="${1:-}"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[[ -n "$BACKUP_FILE" ]] || die "usage: $0 <path-to-pg_dump-backup>"
[[ -f "$BACKUP_FILE" ]] || die "backup file not found: $BACKUP_FILE"
[[ -f "$ENV_FILE" ]] || die "missing $ENV_FILE"

set -a; source "$ENV_FILE"; set +a
: "${POSTGRES_USER:?required}"
: "${POSTGRES_DB:?required}"
: "${PAYLOAD_SECRET:?required}"
: "${DATABASE_URL:?required}"

compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

echo "== restore-db-from-backup =="
echo "backup: $BACKUP_FILE"

# 1. postgres must be up
compose ps --status running --services | grep -qx postgres \
  || die "postgres is not running — start it first: compose up -d postgres"

# 2. refuse to run against a DB that already has business data
EXISTING_TABLES="$(compose exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select count(*) from information_schema.tables where table_schema='public' and table_name in ('projects','users','media','leads','work_types')")"
[[ "$EXISTING_TABLES" == "0" ]] \
  || die "database already contains payload tables ($EXISTING_TABLES) — aborting to protect existing data"

# 3. restore archive (copy file into the postgres container, restore, clean up)
echo "-- restoring archive (pg_restore --no-owner --no-acl --exit-on-error)"
CID="$(compose ps -q postgres)"
docker cp "$BACKUP_FILE" "$CID":/tmp/restore.backup
docker exec "$CID" pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --no-owner --no-acl --exit-on-error /tmp/restore.backup
docker exec "$CID" rm /tmp/restore.backup
echo "-- restore finished"

# 4. reconcile payload_migrations (dev/-1 marker -> initial migration record)
echo "-- reconciling payload_migrations"
compose exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
  < scripts/reconcile-payload-migrations.sql

# 5. run remaining migrations via the app image
echo "-- running payload migrate"
compose run --rm app npm run migrate

# 6. integrity check
echo "-- verification"
compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
\pset footer off
select 'projects' as t, count(*) from projects
union all select '_projects_v', count(*) from _projects_v
union all select 'projects_sections', count(*) from projects_sections
union all select 'users', count(*) from users
union all select 'media', count(*) from media
union all select 'leads', count(*) from leads
union all select 'work_types', count(*) from work_types order by 1;
select id, name, batch from payload_migrations order by id;
SQL

echo "== done =="
echo "Next: create admin users (docs/deploy-new-server.md §4), upload media to S3, then start the stack."
