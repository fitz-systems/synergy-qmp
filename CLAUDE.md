# CLAUDE.md

## Git

- **Never commit without explicit permission.** Make changes, show what changed, and wait for the user to review and say to commit — every time. Approval for one commit does not carry over to the next.
- **Never push without explicit permission.** Vercel auto-deploys from this repo, so a push can ship to production.

## Worktrees

- Create worktrees inside the project at `.worktrees/<name>` (e.g. `git worktree add -b <branch> .worktrees/<name> <base>`), never as sibling folders — the user reviews diffs in VS Code's Source Control panel, which only sees them here.
- `.worktrees/` is already ignored in `.gitignore` and excluded in `tsconfig.json`; `.vscode/settings.json` sets `git.repositoryScanMaxDepth: 2` so they show up in Source Control.
- Each new worktree needs `npm ci` and a copy of `.env.local` from the project root before it can build.
- Remove when done with `git worktree remove .worktrees/<name>`.

## Code style

Follow `code-conventions.md`.
