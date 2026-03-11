#!/usr/bin/env bash
set -euo pipefail

# Disable Prisma telemetry (checkpoint.prisma.io) — avoids firewall blocks in sandboxed environments
export DISABLE_PRISMA_TELEMETRY=1

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

ENV_LOCAL=".env.local"
if [[ -f "$ENV_LOCAL" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_LOCAL"
  set +a
fi

log_warn "This will DROP all database data and re-migrate + re-seed!"
read -r -p "Are you sure? [y/N] " confirm
case "$confirm" in
  [yY][eE][sS]|[yY])
    ;;
  *)
    echo "Aborted."
    exit 0
    ;;
esac

log_info "Resetting database..."
npx prisma migrate reset --force

log_info "Generating Prisma client..."
npx prisma generate

log_success "Database reset complete!"
echo ""
echo "  Dev credentials after reset:"
echo "  Admin: luxcium_tmp@local.dev / pass_UNSAFE_tmp"
echo "  User:  user@local.dev / testpassword123"
