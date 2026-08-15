# .github/workflows/

Every GitHub Actions workflow in this repo, what triggers it and what it does.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [ci.yml](ci.yml) | Push to `main`, every PR targeting `main` | Installs dependencies, lints, builds - catches TypeScript errors, ESLint violations and broken builds before they reach production on Vercel |
| [gitleaks-scan.yml](gitleaks-scan.yml) | Push to `main`, every PR targeting `main` | Scans the repository for hard-coded secrets and credentials, using a pinned gitleaks binary installed directly to avoid the paid-licence action wrapper |
| [cv-pdf.yml](cv-pdf.yml) | Push to `main` touching `public/resume/cv.html`, plus `workflow_dispatch` | Regenerates the CV PDF and DOCX artefacts and opens an auto-merging PR to commit them back, keeping the downloadable CV in sync with the source HTML |
| [generate-cvs.yml](generate-cvs.yml) | Weekly schedule, plus `workflow_dispatch` (also dispatched by cron-ops as a safety net) | Regenerates all CV artefacts (HTML, PDF, DOCX) from `cv.yml` and opens an auto-merging PR. The weekly run catches a date-gated `visibleFrom` entry taking effect with nothing else to trigger a rebuild |
| [deploy-ps5-presence.yml](deploy-ps5-presence.yml) | Push to `main` touching `workers/ps5-presence/**` | Deploys the ps5-presence Cloudflare Worker, so a merged fix to it never sits live-but-unshipped the way it once did for three weeks |

All third-party actions across these workflows are pinned to a full commit SHA rather than a
mutable tag, so a tag like `@v4` cannot be silently updated to malicious code.
