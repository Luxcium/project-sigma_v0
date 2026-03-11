#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── 1. Check prerequisites ──────────────────────────────────────────────────
log_info "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [[ -z "$NODE_VERSION" ]]; then
  log_error "Node.js is not installed. Please install Node.js 22+."
  exit 1
fi
if [[ "$NODE_VERSION" -lt 22 ]]; then
  log_warn "Node.js version is $NODE_VERSION. Recommended: 22+."
fi
log_success "Node.js $(node --version) detected."

# Check Docker
if ! command -v docker &>/dev/null; then
  log_error "Docker is not installed. Please install Docker."
  exit 1
fi
log_success "Docker detected: $(docker --version)"

# ── 2. Set up .env.local ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

ENV_EXAMPLE=".env.example"
ENV_LOCAL=".env.local"

if [[ ! -f "$ENV_LOCAL" ]]; then
  log_info "Copying $ENV_EXAMPLE to $ENV_LOCAL..."
  cp "$ENV_EXAMPLE" "$ENV_LOCAL"
  log_success ".env.local created."
else
  log_warn ".env.local already exists. Skipping copy."
fi

# ── 3. Generate AUTH_SECRET ─────────────────────────────────────────────────
if grep -q "CHANGE_ME_openssl_rand_base64_32" "$ENV_LOCAL"; then
  log_info "Generating AUTH_SECRET..."
  AUTH_SECRET_VALUE=$(openssl rand -base64 32)
  # Use a temp file approach for cross-platform sed compatibility
  sed "s|CHANGE_ME_openssl_rand_base64_32|${AUTH_SECRET_VALUE}|g" "$ENV_LOCAL" > "$ENV_LOCAL.tmp"
  mv "$ENV_LOCAL.tmp" "$ENV_LOCAL"
  log_success "AUTH_SECRET generated and injected into .env.local."
else
  log_warn "AUTH_SECRET already set in .env.local. Skipping."
fi

# ── 4. Install dependencies ─────────────────────────────────────────────────
log_info "Installing npm dependencies..."
npm install --prefer-offline 2>/dev/null || npm install
log_success "Dependencies installed."

# ── 5. Start PostgreSQL via Docker Compose ──────────────────────────────────
log_info "Starting PostgreSQL container..."
docker compose up -d

log_info "Waiting for PostgreSQL to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0
until docker compose exec -T postgres pg_isready -U postgres -d webapp_db &>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [[ $RETRY_COUNT -ge $MAX_RETRIES ]]; then
    log_error "PostgreSQL failed to become healthy after ${MAX_RETRIES} retries."
    exit 1
  fi
  echo -n "."
  sleep 2
done
echo ""
log_success "PostgreSQL is healthy."

# ── 6. Run Prisma migrations ────────────────────────────────────────────────
log_info "Running Prisma migrations..."
# Load .env.local for prisma
set -a
# shellcheck disable=SC1090
source "$ENV_LOCAL"
set +a

npx prisma migrate dev --name init --skip-seed 2>/dev/null || \
  npx prisma migrate deploy 2>/dev/null || \
  log_warn "Migration may have already been applied."
log_success "Prisma migrations complete."

# ── 7. Generate Prisma Client ───────────────────────────────────────────────
log_info "Generating Prisma client..."
npx prisma generate
log_success "Prisma client generated."

# ── 8. Seed the database ────────────────────────────────────────────────────
log_info "Seeding database..."
npx prisma db seed
log_success "Database seeded."

# ── 9. Print success message ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Project Sigma v0 — Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Dev credentials (UNSAFE — dev only):"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  Admin  Email:    luxcium_tmp@local.dev                 │"
echo "  │  Admin  Password: pass_UNSAFE_tmp                       │"
echo "  │  User   Email:    user@local.dev                        │"
echo "  │  User   Password: testpassword123                       │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
echo "  To start the development server:"
echo "    npm run dev"
echo ""
echo "  App will be available at: http://localhost:3000"
echo ""
echo -e "${YELLOW}  ⚠️  Remember to remove all UNSAFE dev credentials before production!${NC}"
echo -e "${YELLOW}     grep -r 'UNSAFE\\|luxcium_tmp\\|pass_UNSAFE' . --include='*.ts' --include='*.env*'${NC}"
echo ""
