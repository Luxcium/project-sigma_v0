# Project Sigma v0

A production-ready Next.js 15 web application template with full authentication, role-based access control, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-first, no config file)
- **UI Components**: Shadcn UI (button, input, label, card)
- **Database**: PostgreSQL 16 via Docker
- **ORM**: Prisma 6
- **Auth**: Auth.js v5 (`next-auth@beta`) — Credentials + GitHub OAuth
- **Validation**: Zod
- **Runtime**: Node.js 22

## Quick Start

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Docker & Docker Compose
- `openssl` (for secret generation)

### First-time setup

```bash
bash scripts/first-run.sh
```

This script will:
1. Copy `.env.example` → `.env.local` and generate `AUTH_SECRET`
2. Install npm dependencies
3. Start the PostgreSQL container via Docker Compose
4. Run Prisma migrations
5. Seed the database with dev users

Then start the dev server:

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

## Dev Credentials

> ⚠️ **UNSAFE — development only. Remove before production.**

| Role  | Email                    | Password          |
|-------|--------------------------|-------------------|
| Admin | `luxcium_tmp@local.dev`  | `pass_UNSAFE_tmp` |
| User  | `user@local.dev`         | `testpassword123` |

To find all unsafe references before going to production:

```bash
grep -r "UNSAFE\|luxcium_tmp\|pass_UNSAFE" . --include="*.ts" --include="*.env*"
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string                     |
| `AUTH_SECRET`         | Random secret for Auth.js (32+ bytes)            |
| `AUTH_URL`            | Canonical app URL                                |
| `AUTH_GITHUB_ID`      | GitHub OAuth App Client ID (optional locally)    |
| `AUTH_GITHUB_SECRET`  | GitHub OAuth App Client Secret (optional locally)|
| `SEED_ADMIN_EMAIL`    | Email for the bootstrapped admin user            |
| `SEED_ADMIN_PASSWORD` | Password for the bootstrapped admin user         |

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start dev server with Turbopack      |
| `npm run build`      | Production build                     |
| `npm run lint`       | ESLint                               |
| `npm run format`     | Prettier (write)                     |
| `npm run db:migrate` | Run Prisma migrations                |
| `npm run db:seed`    | Seed the database                    |
| `npm run db:studio`  | Open Prisma Studio                   |
| `bash scripts/reset-db.sh` | Drop & re-migrate & re-seed    |

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   # Auth.js route handler
│   ├── auth/login/               # Login page + server action
│   ├── dashboard/                # Protected user dashboard
│   ├── admin/                    # Admin-only panel
│   ├── forbidden/                # 403 page
│   ├── layout.tsx
│   ├── page.tsx                  # Redirects to /dashboard
│   └── globals.css               # Tailwind v4 + CSS variables
├── auth.ts                       # Auth.js config (with Prisma adapter)
├── auth.config.ts                # Edge-safe auth config (for middleware)
├── components/
│   ├── auth/login-form.tsx       # Client component with useActionState
│   └── ui/                       # Shadcn UI components
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.types.ts             # Shared auth types
│   ├── auth-guards.ts            # Server-side route guards
│   └── validations/auth.ts       # Zod schemas
middleware.ts                     # Edge auth middleware
prisma/
├── schema.prisma
└── seed.ts
```

## Authentication Flow

- **Credentials**: Email + bcrypt password via `authorize()` callback
- **GitHub OAuth**: Configured via `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- **Session strategy**: JWT (compatible with Edge middleware)
- **Role-based access**: `USER` and `ADMIN` roles enforced in middleware callbacks and server-side guards

## DevContainer

Open in VS Code with the Dev Containers extension for a fully configured environment with ESLint, Prettier, Prisma, and Tailwind CSS IntelliSense.
