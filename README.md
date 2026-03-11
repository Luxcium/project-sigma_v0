# Project Sigma v0

A production-ready Next.js 15 web application template with full authentication, role-based access control, and PostgreSQL.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 15, App Router, Turbopack |
| Language | TypeScript 5 (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| React | React 19 |
| Styling | Tailwind CSS v4 (CSS-first: `@import "tailwindcss"` — no `tailwind.config.ts`) |
| UI Components | Shadcn UI (button, input, label, card) |
| Database | PostgreSQL 16 via Docker |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter` |
| Auth Providers | Credentials (email + bcrypt) + GitHub OAuth |
| Session | JWT strategy |
| Validation | Zod |
| State/Mutations | React 19 `useActionState` + Server Actions |
| Runtime | Node.js 22 |

## Quick Start

```bash
git clone https://github.com/Luxcium/project-sigma_v0.git
cd project-sigma_v0
bash scripts/first-run.sh
```

The `first-run.sh` script is fully automated and idempotent — it handles everything:
- Copies `.env.example` → `.env.local` and generates a real `AUTH_SECRET`
- Installs npm dependencies
- Starts PostgreSQL via Docker Compose and waits for health check
- Runs Prisma migrations and generates the client
- Seeds the database with dev users

Then start the development server:

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

## First-Run Credentials

> ⚠️ **UNSAFE — development only. Remove before production.**

| Role  | Email                    | Password          |
|-------|--------------------------|-------------------|
| Admin | `luxcium_tmp@local.dev`  | `pass_UNSAFE_tmp` |
| User  | `user@local.dev`         | `testpassword123` |

## Context-Specific Instructions

### Local Development (Docker for DB)

Prerequisites: Node.js 22+, Docker & Docker Compose, `openssl`

```bash
bash scripts/first-run.sh
npm run dev
```

### DevContainers (VS Code)

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
2. Open the repo folder in VS Code
3. Click **Reopen in Container** — `first-run.sh` runs automatically via `postCreateCommand`
4. Run `npm run dev` in the integrated terminal

### GitHub Codespaces

1. Click **Code → Create codespace on main** (or your branch)
2. The `postCreateCommand` in `.devcontainer/devcontainer.json` automatically runs `first-run.sh`
3. Run `npm run dev` — Codespaces will offer to open port 3000 in the browser

### GitHub Actions / CI

The application compiles and type-checks without a live database:

```bash
npm ci
npx tsc --noEmit
npm run lint
```

For integration tests requiring a database, start Docker services first:

```bash
docker compose up -d
bash scripts/first-run.sh
```

## ⚠️ SECURITY: Remove Before Production

The following **temporary dev credentials** must be removed before deploying to production:

### Files containing `UNSAFE` / `luxcium_tmp` references

| File | What to remove |
|------|----------------|
| `prisma/seed.ts` | Delete the entire `luxcium_tmp` upsert block (marked `TODO: REVOKE BEFORE PRODUCTION`) |
| `.env.example` | Remove `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` lines |
| `.env.local` | Delete or regenerate with production-safe values |

### Grep commands to find all references

```bash
# Find all UNSAFE credential references
grep -r "UNSAFE\|luxcium_tmp\|pass_UNSAFE" . --include="*.ts" --include="*.env*"

# Find all TODO: REVOKE comments
grep -r "REVOKE BEFORE PRODUCTION" . --include="*.ts"
```

### Checklist before production

- [ ] Delete the `luxcium_tmp` upsert block in `prisma/seed.ts`
- [ ] Remove `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env.example`
- [ ] Set a real `AUTH_SECRET` (not the dev-generated one)
- [ ] Configure real `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
- [ ] Use a production-grade PostgreSQL instance (not Docker Compose)
- [ ] Remove `output: 'standalone'` if not deploying to Docker/Kubernetes

## Environment Variables

Copy `.env.example` to `.env.local` (done automatically by `first-run.sh`):

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string                     |
| `AUTH_SECRET`         | Random secret for Auth.js (auto-generated)       |
| `AUTH_URL`            | Canonical app URL                                |
| `AUTH_GITHUB_ID`      | GitHub OAuth App Client ID (optional locally)    |
| `AUTH_GITHUB_SECRET`  | GitHub OAuth App Client Secret (optional locally)|
| `SEED_ADMIN_EMAIL`    | ⚠️ UNSAFE — email for bootstrapped admin user   |
| `SEED_ADMIN_PASSWORD` | ⚠️ UNSAFE — password for bootstrapped admin user|

## Scripts

| Command                     | Description                          |
|-----------------------------|--------------------------------------|
| `npm run dev`               | Start dev server with Turbopack      |
| `npm run build`             | Production build                     |
| `npm run lint`              | ESLint                               |
| `npm run format`            | Prettier (write)                     |
| `npm run db:migrate`        | Run Prisma migrations                |
| `npm run db:seed`           | Seed the database                    |
| `npm run db:studio`         | Open Prisma Studio                   |
| `bash scripts/reset-db.sh` | Drop & re-migrate & re-seed          |

## Architecture Overview

```
project-sigma_v0/
├── .devcontainer/
│   ├── devcontainer.json       # postCreateCommand: bash scripts/first-run.sh
│   └── Dockerfile              # Node 22 base image
├── prisma/
│   ├── schema.prisma           # User, Account, Session, VerificationToken
│   └── seed.ts                 # Upserts dev users (⚠️ REVOKE BEFORE PROD)
├── scripts/
│   ├── first-run.sh            # One-command setup (idempotent)
│   └── reset-db.sh             # Wipe + re-migrate + re-seed
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts  # Auth.js handler
│   │   ├── auth/login/
│   │   │   ├── actions.ts      # 'use server' — loginAction
│   │   │   └── page.tsx        # Server Component wrapper
│   │   ├── dashboard/page.tsx  # Protected (USER role)
│   │   ├── admin/page.tsx      # Protected (ADMIN role)
│   │   ├── forbidden/page.tsx  # 403 page
│   │   ├── globals.css         # Tailwind v4 @import + @theme
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/login-form.tsx # 'use client', useActionState
│   │   └── ui/                 # Shadcn components (button, input, label, card)
│   ├── lib/
│   │   ├── auth.types.ts       # ExtendedUser, AugmentedToken, UserRole
│   │   ├── auth-guards.ts      # requireAuth(), assertAdmin(), assertUser()
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── utils.ts            # cn() helper
│   │   └── validations/auth.ts # Zod LoginSchema
│   ├── auth.config.ts          # Edge-safe config (no Prisma, no Node APIs)
│   └── auth.ts                 # Node runtime (PrismaAdapter + Credentials)
├── middleware.ts                # imports auth.config.ts ONLY
├── docker-compose.yml          # PostgreSQL 16
├── .env.example                # Committed — contains placeholder + UNSAFE dev creds
└── .env.local                  # Gitignored — generated by first-run.sh
```

## Authentication Flow

- **Credentials**: Email + bcrypt password hashed via `bcryptjs` in `authorize()` callback
- **GitHub OAuth**: Configured via `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- **Session strategy**: JWT (Edge-compatible for middleware)
- **Route protection** (middleware):
  - `/admin/**` → requires `role === 'ADMIN'`, else redirect to `/forbidden`
  - `/dashboard/**` → requires authenticated session, else redirect to `/auth/login`
  - `/auth/login` → if already authenticated, redirect to `/dashboard`
- **Server-side guards**: `requireAuth()`, `assertAdmin()`, `assertUser()` in `src/lib/auth-guards.ts`
