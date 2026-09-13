#!/usr/bin/env bash
# Canonical remote deploy for one VM.
# Intended to run on the server as deploy@host in /opt/otdelka-360.
#
#   ./scripts/deploy.sh full|restart|status|logs [service]
#
# Never prints environment secrets. Never deletes volumes.

set -Eeuo pipefail

ROOT="/opt/otdelka-360"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"
LOCK_FILE="${ROOT}/.deploy.lock"
MAIN_BRANCH="main"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy.sh full
  ./scripts/deploy.sh restart
  ./scripts/deploy.sh status
  ./scripts/deploy.sh logs [app|caddy|postgres]

full     fetch/ff-only main, build app, migrate, recreate stack, health + smoke
restart  recreate/restart containers without git/build/migrate
status   git SHA, compose ps, health, disk, memory (no secrets)
logs     tail container logs (no env dump)

Build-time NEXT_PUBLIC_* / SITE_ENV changes require full, not restart.
EOF
}

log() { printf '%s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

require_repo() {
  cd "$ROOT" || die "cannot cd to ${ROOT}"
  [[ -f "$ENV_FILE" ]] || die "missing ${ENV_FILE} in ${ROOT}"
  [[ -f "$COMPOSE_FILE" ]] || die "missing ${COMPOSE_FILE} in ${ROOT}"
  [[ -f "scripts/deploy.sh" ]] || die "missing scripts/deploy.sh"
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "not a git repo"
}

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

read_env_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n1 || true)"
  [[ -n "$line" ]] || return 0
  printf '%s' "${line#*=}" | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

require_clean_tracked() {
  local dirty
  dirty="$(git status --porcelain --untracked-files=no)"
  if [[ -n "$dirty" ]]; then
    printf '%s\n' "$dirty" >&2
    die "tracked working tree is not clean"
  fi
}

acquire_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    die "another deploy is already running (lock ${LOCK_FILE})"
  fi
}

current_sha() {
  git rev-parse HEAD
}

short_sha() {
  git rev-parse --short HEAD
}

validate_compose() {
  compose config >/dev/null
}

wait_postgres() {
  local i
  for i in $(seq 1 40); do
    if compose exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  die "postgres did not become healthy"
}

wait_app_healthy() {
  local i status
  for i in $(seq 1 60); do
    status="$(compose ps --format json app 2>/dev/null | head -n1 || true)"
    if printf '%s' "$status" | grep -q '"Health":"healthy"'; then
      return 0
    fi
    if compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
      return 0
    fi
    sleep 3
  done
  die "app did not become healthy"
}

api_health() {
  compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(async(r)=>{const t=await r.text(); if(!r.ok) process.exit(1); process.stdout.write(t);}).catch(()=>process.exit(1))"
}

verify_caddy() {
  if ! compose ps --status running --services | grep -qx caddy; then
    die "caddy is not running"
  fi
}

run_smoke() {
  local base
  base="$(read_env_value NEXT_PUBLIC_SITE_URL)"
  if [[ -z "$base" ]]; then
    die "NEXT_PUBLIC_SITE_URL is not set; cannot smoke public routes"
  fi
  compose exec -T -e "SMOKE_BASE_URL=${base}" app node scripts/smoke-public-routes.mjs
}

print_summary() {
  local previous="${1:-}"
  local next="${2:-}"
  local smoke="${3:-skipped}"
  log "---- deploy summary ----"
  [[ -n "$previous" ]] && log "previous SHA: ${previous}"
  [[ -n "$next" ]] && log "new SHA:      ${next}"
  log "git SHA:      $(git rev-parse HEAD)"
  log "branch:       $(git branch --show-current)"
  log "smoke:        ${smoke}"
  log "health:       $(api_health 2>/dev/null || echo 'unavailable')"
  compose ps
}

cmd_full() {
  require_repo
  require_clean_tracked
  acquire_lock

  local previous new_sha smoke_status
  previous="$(current_sha)"
  log "previous SHA: ${previous}"

  git fetch origin
  git checkout "$MAIN_BRANCH"
  git pull --ff-only origin "$MAIN_BRANCH"
  new_sha="$(current_sha)"
  log "new SHA: ${new_sha}"

  validate_compose

  log "building app image"
  if ! compose build app; then
    die "build failed; migrations were not run"
  fi

  log "starting postgres"
  compose up -d postgres
  wait_postgres

  log "running Payload migrations (no seed)"
  if ! compose run --rm app npm run migrate; then
    die "migration failed; database was not destroyed; stack was not recreated"
  fi

  log "recreating postgres/app/caddy"
  compose up -d --remove-orphans postgres app caddy
  wait_app_healthy
  verify_caddy

  log "API health"
  api_health
  printf '\n'

  smoke_status="passed"
  if ! run_smoke; then
    smoke_status="FAILED"
    print_summary "$previous" "$new_sha" "$smoke_status"
    die "post-deploy smoke failed; database migrations were not reversed"
  fi

  print_summary "$previous" "$new_sha" "$smoke_status"
}

cmd_restart() {
  require_repo
  acquire_lock
  validate_compose
  log "restarting containers without git/build/migrate"
  log "note: NEXT_PUBLIC_* / SITE_ENV changes require: ./scripts/deploy.sh full"
  compose up -d --no-build --force-recreate --remove-orphans app caddy
  wait_app_healthy
  verify_caddy
  api_health
  printf '\n'
  compose ps
}

cmd_status() {
  require_repo
  log "git SHA:  $(git rev-parse HEAD) ($(git rev-parse --short HEAD))"
  log "branch:   $(git branch --show-current)"
  log "site env: $(read_env_value SITE_ENV)"
  log ""
  compose ps
  log ""
  log "health: $(api_health 2>/dev/null || echo 'unavailable')"
  log ""
  log "disk:"
  df -h / /var/lib/docker 2>/dev/null || df -h /
  log ""
  log "memory:"
  free -h 2>/dev/null || true
  log ""
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
}

cmd_logs() {
  require_repo
  local service="${1:-}"
  if [[ -n "$service" ]]; then
    case "$service" in
      app|caddy|postgres) ;;
      *) die "unknown service ${service} (app|caddy|postgres)" ;;
    esac
    compose logs --tail=200 "$service"
  else
    compose logs --tail=120
  fi
}

MODE="${1:-}"
shift || true

case "$MODE" in
  full) cmd_full ;;
  restart) cmd_restart ;;
  status) cmd_status ;;
  logs) cmd_logs "${1:-}" ;;
  -h|--help|help|"") usage ;;
  *) usage; die "unknown mode: ${MODE}" ;;
esac
