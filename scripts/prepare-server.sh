#!/usr/bin/env bash
# Idempotent preparation of a fresh Ubuntu 24.04 VM for the Отделка 360 stack.
# Run ON THE SERVER as a user with passwordless sudo:
#   bash scripts/prepare-server.sh
#   bash scripts/prepare-server.sh --enable-ufw   # also configure firewall
#
# Safe to re-run: every step checks current state first.
# Never deletes data, never touches SSH auth, contains no secrets.
set -Eeuo pipefail

APP_DIR="/opt/otdelka-360"
APP_USER="${SUDO_USER:-$(id -un)}"
SWAP_FILE="/swapfile"
SWAP_SIZE="2G"
ENABLE_UFW="no"

for arg in "$@"; do
  case "$arg" in
    --enable-ufw) ENABLE_UFW="yes" ;;
    -h|--help)
      echo "Usage: bash scripts/prepare-server.sh [--enable-ufw]"
      exit 0 ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

log()  { printf '%s\n' "$*"; }
step() { printf '\n== %s ==\n' "$*"; }
ok()   { printf 'OK   %s\n' "$*"; }
skip() { printf 'SKIP %s\n' "$*"; }

SUDO=""
if [[ "$(id -u)" -ne 0 ]]; then
  if sudo -n true 2>/dev/null; then
    SUDO="sudo"
  else
    echo "This script needs sudo. Run: sudo -v, then retry." >&2
    exit 1
  fi
fi

# ---------------------------------------------------------------- system check
step "System check"
. /etc/os-release
log "OS:      ${PRETTY_NAME}"
log "Kernel:  $(uname -r)"
log "User:    ${APP_USER} ($(id))"
free -h | sed 's/^/MEM    /'
df -h / | sed 's/^/DISK   /'
swapon --show || true
log "Ports 80/443/3000/5432:"
ss -tln | grep -E ':(80|443|3000|5432)\b' || log "  none listening (good)"

if [[ "${VERSION_ID:-}" != "24.04" ]]; then
  log "WARN: expected Ubuntu 24.04, got ${VERSION_ID:-unknown} — continuing anyway"
fi

# ---------------------------------------------------------------- docker
step "Docker Engine + Compose plugin"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  skip "docker already installed: $(docker --version)"
else
  log "installing docker from the official Docker apt repository"
  $SUDO apt-get update
  $SUDO apt-get install -y ca-certificates curl
  $SUDO install -m 0755 -d /etc/apt/keyrings
  if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
      | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
  else
    skip "docker apt key already present"
  fi
  if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
      | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
  else
    skip "docker apt repo already configured"
  fi
  $SUDO apt-get update
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
$SUDO systemctl enable --now docker
ok "docker enabled at boot: $(docker --version), $(docker compose version)"

if id -nG "$APP_USER" | tr ' ' '\n' | grep -qx docker; then
  skip "user ${APP_USER} already in docker group"
else
  $SUDO usermod -aG docker "$APP_USER"
  ok "added ${APP_USER} to docker group (re-login required)"
fi

# ---------------------------------------------------------------- swap
step "Swap ${SWAP_SIZE}"
if swapon --show=NAME --noheadings | grep -q .; then
  skip "swap already active: $(swapon --show=NAME,SIZE --noheadings | tr '\n' ' ')"
else
  $SUDO fallocate -l "$SWAP_SIZE" "$SWAP_FILE" \
    || $SUDO dd if=/dev/zero of="$SWAP_FILE" bs=1M count=2048 status=progress
  $SUDO chmod 600 "$SWAP_FILE"
  $SUDO mkswap "$SWAP_FILE" >/dev/null
  $SUDO swapon "$SWAP_FILE"
  ok "swap enabled: $(swapon --show=NAME,SIZE --noheadings | tr '\n' ' ')"
fi
if grep -qE "^${SWAP_FILE}[[:space:]]" /etc/fstab; then
  skip "swap already in /etc/fstab"
elif swapon --show=NAME --noheadings | grep -qx "$SWAP_FILE"; then
  echo "$SWAP_FILE none swap sw 0 0" | $SUDO tee -a /etc/fstab >/dev/null
  ok "swap persisted in /etc/fstab"
fi

# ---------------------------------------------------------------- app dir
step "Application directory ${APP_DIR}"
if [[ -d "$APP_DIR" ]]; then
  skip "${APP_DIR} exists (contents left untouched)"
else
  $SUDO mkdir -p "$APP_DIR"
  ok "created ${APP_DIR}"
fi
CURRENT_OWNER="$(stat -c '%U:%G' "$APP_DIR")"
if [[ "$CURRENT_OWNER" == "${APP_USER}:${APP_USER}" ]]; then
  skip "owner already ${CURRENT_OWNER}"
else
  $SUDO chown "${APP_USER}:${APP_USER}" "$APP_DIR"   # dir only, not recursive
  ok "owner set to ${APP_USER}:${APP_USER}"
fi

# ---------------------------------------------------------------- firewall
step "Firewall (ufw)"
if [[ "$ENABLE_UFW" == "yes" ]]; then
  if ! command -v ufw >/dev/null 2>&1; then
    $SUDO apt-get install -y ufw
  fi
  # SSH first — never lock ourselves out.
  $SUDO ufw allow OpenSSH >/dev/null
  $SUDO ufw allow 80/tcp >/dev/null
  $SUDO ufw allow 443/tcp >/dev/null
  # App (3000) and Postgres (5432) stay closed: they live on the docker network.
  $SUDO ufw default deny incoming >/dev/null
  $SUDO ufw default allow outgoing >/dev/null
  $SUDO ufw --force enable
  ok "ufw enabled"
  $SUDO ufw status verbose
else
  skip "ufw left as-is (rerun with --enable-ufw after checking SSH access)"
  log "  planned rules if enabled: allow OpenSSH, 80/tcp, 443/tcp; deny rest inbound"
fi

# ---------------------------------------------------------------- summary
step "Summary"
log "docker:  $(docker --version 2>/dev/null || echo missing)"
log "compose: $(docker compose version 2>/dev/null || echo missing)"
log "swap:    $(swapon --show=NAME,SIZE --noheadings | tr '\n' ' ' || echo none)"
log "app dir: $(stat -c '%U:%G %n' "$APP_DIR" 2>/dev/null || echo missing)"
log "ports:   $(ss -tln | grep -E ':(80|443|3000|5432)\b' || echo 'none of 80/443/3000/5432 listening')"
log "ufw:     $(command -v ufw >/dev/null && $SUDO ufw status | head -1 || echo 'not installed')"
log ""
log "Next: git clone the repo into ${APP_DIR} and follow docs/deploy-new-server.md"
