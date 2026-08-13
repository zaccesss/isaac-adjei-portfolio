# .github/

GitHub Actions workflows. All run on `ubuntu-latest` with least-privilege `permissions:` blocks and pin third-party actions to a full commit SHA (supply-chain attack prevention).

## Workflows

| File | Trigger | Description |
| --- | --- | --- |
| `ci.yml` | push to main, PR to main | Lint, build and `check-image-sizes` (fails if any image in `public/images` exceeds 50 megapixels - added 2026-06-18 after a 140-megapixel image crashed mobile browsers) |
| `deploy-ps5-presence.yml` | push touching `workers/ps5-presence/**`, manual | Deploys the PS5 presence Cloudflare Worker. Added 2026-06-18 after a fix to this worker sat undeployed for 3 weeks because deployment was a manual, easily-forgotten `wrangler deploy` step |
| `gitleaks-scan.yml` | push, PR | Scans for credential leaks |
| `cv-pdf.yml` | manual/on CV source change | Generates CV PDFs |
| `generate-cvs.yml` | manual/on CV source change | Generates role-specific CV variants |
| `daily-coding-summary.yml` | scheduled | Posts a daily WakaTime coding summary |
| `job-scraper.yml` | scheduled | Runs the dashboard job scraper |
| `vault-expiry-check.yml` | scheduled | Checks for vault items nearing expiry; calls Supabase directly (not the Vercel endpoint - Cloudflare blocks `curl` to it) |
| `wakatime-sync.yml` | scheduled (daily 23:30 UTC) | Syncs WakaTime coding stats |

## Conventions

- Workflows that merge or push using the default `GITHUB_TOKEN` do not trigger other workflows' `push` or `pull_request` events (GitHub's anti-recursion safeguard) - any workflow that needs to react to a bot-authored merge must use a `schedule` trigger instead, since that doesn't depend on what authored the previous event
- Workflow runs triggered by a bot-authored push to an open PR's branch can be held by GitHub for manual approval - avoid pushing commits to open PR branches from automation where possible
