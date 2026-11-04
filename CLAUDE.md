# CLAUDE.md

## Git

- **Never commit without explicit permission.** Make changes, show what changed, and wait for the user to review and say to commit — every time. Approval for one commit does not carry over to the next.
- **Never push without explicit permission.** Vercel auto-deploys from this repo, so a push can ship to production.

## Worktrees

- Create worktrees inside the project at `.worktrees/<name>` (e.g. `git worktree add -b <branch> .worktrees/<name> <base>`), never as sibling folders — the user reviews diffs in VS Code's Source Control panel, which only sees them here.
- `.worktrees/` is already ignored in `.gitignore` and excluded in `tsconfig.json`; `.vscode/settings.json` sets `git.repositoryScanMaxDepth: 2` so they show up in Source Control.
- Each new worktree needs `npm ci` and a copy of `.env.local` from the project root before it can build.
- Remove when done with `git worktree remove .worktrees/<name>`.

## Database

- Prisma 7 schema in `prisma/schema.prisma`. All tables live in the `synergy` Postgres schema. The client is generated to `src/generated/` (gitignored); import it from `@/lib/prisma`.
- Neon branches: `dev` is used locally via `.env.local` (`DATABASE_URL` pooled, `DIRECT_URL` direct with `&schema=synergy` for migrations). `main` is production and its URL only lives in Vercel's environment variables.
- Migrations: generate SQL with `prisma migrate diff`, making sure every statement is qualified with `"synergy".`; add CHECK constraints Prisma can't express by hand. Apply to `dev` first with `npx prisma migrate deploy`, and to production just before deploying. Never run `migrate reset` or `db push` against Neon.
- Auth is Better Auth (`src/lib/auth.ts`). Users are created by the admin only; old MD5 passwords are upgraded on first sign-in.

## Public repo

This repo is public. Never commit `.env.local`, `assets/certificates/`, the old MySQL dumps, the old PHP source, or the question bank as a file.

## Code style

Follow `code-conventions.md`.
