# Development Workflow

Branch protection on `main` requires every change to go through a pull request and pass the
`Lint and Build` CI check. Nothing broken ever reaches production. This file is a quick reference
for the correct flow.

---

## Making a change

```bash
# 1. Always branch from the latest main
git checkout main && git pull
git checkout -b fix/your-description

# 2. Update CHANGELOG.md for public changes OR LOG.md for private dashboard changes
#    Add entries under the relevant heading in [Unreleased] (Added / Changed / Fixed / Removed)
#    NEVER add private dashboard details to CHANGELOG.md - use LOG.md only
# Then stage and commit (conventional format, no em/en dashes, no Oxford commas)
git add .
git commit -m "fix: short description of what changed"

# 3. Push the branch
git push -u origin fix/your-description

# 4. Create the PR and enable auto-merge in one go
gh pr create --title "fix: short description" --body "What changed and why."
gh pr merge --squash --delete-branch --auto

# 5. Wait ~2 minutes for CI (Lint and Build) to pass, then it merges automatically.
#    Vercel deploys from main within ~1 minute after merge.
```

Total time from commit to live: about 3-5 minutes.

---

## Commit message rules

The `.githooks/commit-msg` hook rejects commits that violate these:

- Use conventional prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- No em dashes (`-`) or en dashes (`-`): use a hyphen `-` instead
- No Oxford comma (`x, y, and z`): write `x, y and z`
- No AI co-author credits or AI attribution in any commit message
- UK English only throughout all files and commit messages

---

## Changelog rules

- `CHANGELOG.md` is public-facing. Never include private dashboard changes in it.
- All private dashboard changes go in `LOG.md` at the repo root.
- Update `LOG.md` in the same commit as any private dashboard change.

---

## Session end rules

At the end of every session:
1. Delete all local branches except `main`: `git branch | grep -v main | xargs git branch -D`
2. Delete all remote branches except `main`: `git branch -r | grep -v main | grep -v HEAD | sed 's/origin\///' | xargs -I {} git push origin --delete {}`

---

## Language and style rules

- UK English only (colour not color, behaviour not behavior, etc.)
- No em dashes (`-`), no en dashes (`-`): use a hyphen `-` instead
- No Oxford commas: write `x, y and z` not `x, y, and z`
- No AI co-author credits anywhere
- All inline code comments must be first-person: "I use..." or "I check..." not "This function..." or "The component..."
- PR descriptions, LOG.md entries and WORKFLOW.md must all use first-person where applicable ("I'll run this in Supabase...", "I changed X because...")

---

## If the PR is not mergeable after CI passes

This usually means main moved ahead while your branch was open. Rebase and push:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
gh pr merge --squash --delete-branch --auto
```

---

## Checking PR status

```bash
# See open PRs
gh pr list

# See a specific PR
gh pr view 82

# See CI status on current branch
gh pr checks
```

---

## Branch naming conventions

| Type | Example |
| ---- | ------- |
| New feature | `feat/blog-newsletter` |
| Bug fix | `fix/sitemap-404` |
| Content update | `content/add-phaemos-post` |
| Chore / config | `chore/update-deps` |

---

## Environment variables

All secrets live in Vercel project settings. Never commit real values.
Add placeholders to `.env.example` when adding a new variable.

Current variables (see `.env.example` for full list):

| Variable | Purpose |
| -------- | ------- |
| `RESEND_API_KEY` | Contact form email delivery |
| `BEEHIIV_API_KEY` | Newsletter subscriptions |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv publication identifier |
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA (public) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile CAPTCHA (server) |
| `UPSTASH_REDIS_REST_URL` | Rate limiting for contact form |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting for contact form |
| `AUTH_SECONDARY_PIN` | Master PIN for Diary, Notes and Vault (bcrypt hash stored in DB overrides this) |
| `WAKATIME_API_KEY` | WakaTime API key - GitHub Actions secret only, not Vercel (sync runs in CI, dashboard reads Supabase) |

---

## One-time setup on a new clone

```bash
git clone https://github.com/zaccesss/isaac-adjei-portfolio.git
cd isaac-adjei-portfolio
npm install
git config core.hooksPath .githooks
```

The last line activates the commit-msg and prepare-commit-msg hooks that strip AI attribution
and enforce message style.
