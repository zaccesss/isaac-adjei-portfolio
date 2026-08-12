// The single source of truth for every action the control page can run and watch: one entry per
// dispatchable GitHub Actions workflow across my six repos. The run route refuses anything not in
// this table, so the dashboard can never be talked into dispatching an arbitrary workflow, and the
// status route drives its whole aggregation from the same list.
//
// hcSlug ties a job to its Healthchecks check (the slugs come from the automations STATUS.md badge
// table plus the fleet project's check names). schedule is the human label shown when the live
// cron-ops /schedule endpoint is unreachable; for automations jobs it mirrors
// cron-ops/worker/src/schedule.ts, which stays the source of truth for what actually fires.

import { GH_OWNER, AUTOMATIONS_REPO, PORTFOLIO_REPO } from "@/lib/site-config"

export interface ControlJob {
  /** Stable id used by the run route: "<repo>/<workflow file>". */
  id: string
  repo: string
  repoLabel: string
  workflow: string
  label: string
  description: string
  /** Healthchecks slug (or lowercase name) this job pings, when it has a check. */
  hcSlug?: string
  /** Fallback schedule label, Europe/London. Overridden by the live cron-ops schedule when up. */
  schedule?: string
  /** Fixed inputs sent with the dispatch. Anything not listed relies on the workflow's defaults. */
  inputs?: Record<string, string>
}

const AUTOMATIONS = AUTOMATIONS_REPO
const PORTFOLIO = PORTFOLIO_REPO

function job(repo: string, repoLabel: string, workflow: string, rest: Omit<ControlJob, "id" | "repo" | "repoLabel" | "workflow">): ControlJob {
  return { id: `${repo}/${workflow}`, repo, repoLabel, workflow, ...rest }
}

export const CONTROL_JOBS: ControlJob[] = [
  // Automations - the daily data and reminder jobs. The daily ones claim their day, so a manual
  // run after the scheduled one lands as a harmless skip rather than a double post.
  job(AUTOMATIONS, "Automations", "medication-reminders.yml", {
    label: "Medication reminders",
    description: "Sends due medication doses over Discord, email and SMS",
    // Shares the "reminders" check with reminders.yml below - the free Healthchecks plan's check
    // cap meant this could not keep its own, and both run on the same 15-minute cadence and post a
    // user-visible message on success, so a silent failure of either is obvious anyway.
    hcSlug: "reminders",
    schedule: "every 15 min",
  }),
  job(AUTOMATIONS, "Automations", "reminders.yml", {
    label: "Reminders",
    description: "Fires one-off appointment and meeting reminders",
    hcSlug: "reminders",
    schedule: "every 15 min",
  }),
  job(AUTOMATIONS, "Automations", "spotify-history.yml", {
    label: "Spotify history",
    description: "Records my recent plays into listening history",
    hcSlug: "spotify-history",
    schedule: "every 30 min",
  }),
  job(AUTOMATIONS, "Automations", "wakatime-sync.yml", {
    label: "WakaTime sync",
    description: "Pulls coding time into the dashboard heatmap",
    hcSlug: "wakatime-sync",
    schedule: "every 6 hours",
  }),
  job(AUTOMATIONS, "Automations", "daily-coding-summary.yml", {
    label: "Daily coding summary",
    description: "Posts the coding recap to Discord; re-run skips if today already posted",
    hcSlug: "daily-coding-summary",
    schedule: "00:30 UK",
  }),
  job(AUTOMATIONS, "Automations", "daily-analytics.yml", {
    label: "Daily analytics",
    description: "Posts the blog, fitness, applications and music digests; re-run skips if today already posted",
    hcSlug: "daily-analytics",
    schedule: "01:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "job-scraper.yml", {
    label: "Job scraper",
    description: "Scrapes the boards and career sites and syncs new roles",
    hcSlug: "job-scraper",
    schedule: "03:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "recategorise.yml", {
    label: "Recategorise",
    description: "Re-tags scraped applications; a manual run previews as a dry run",
    hcSlug: "recategorise",
    schedule: "05:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "routine.yml", {
    label: "Routine checklist",
    description: "Posts the morning checklist and the evening still-unlogged pass",
    hcSlug: "routine",
    schedule: "07:00 + 20:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "streak-reminder.yml", {
    label: "Streak reminder",
    description: "Nudges the coding and study streaks, morning and evening",
    hcSlug: "streak-reminder",
    schedule: "08:00 + 20:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "vault-expiry-check.yml", {
    label: "Vault expiry check",
    description: "Warns about credentials that are about to expire",
    hcSlug: "vault-expiry-check",
    schedule: "08:00 UK",
  }),
  job(AUTOMATIONS, "Automations", "fix-scraped-types.yml", {
    label: "Fix scraped types",
    description: "One-off type cleanup for scraped rows; manual only",
  }),
  job(AUTOMATIONS, "Automations", "github-contributions-sync.yml", {
    label: "GitHub contributions sync",
    description: "Tops up the current year's GitHub contribution count between the portfolio's own once-daily sync",
    hcSlug: "github-contributions-sync",
    schedule: "every 3 hours",
  }),
  job(AUTOMATIONS, "Automations", "control-status-sync.yml", {
    label: "Control status sync",
    description: "Snapshots job runs and check status into this dashboard's own Ops page history",
    hcSlug: "control-status-sync",
    schedule: "every 15 min",
  }),

  // Portfolio - the site's own workflows.
  job(PORTFOLIO, "Portfolio", "cv-pdf.yml", {
    label: "CV PDFs",
    description: "Rebuilds every role PDF and DOCX from the HTML source",
    schedule: "on CV changes",
  }),
  job(PORTFOLIO, "Portfolio", "generate-cvs.yml", {
    label: "Generate CVs",
    description: "Regenerates every CV and cover letter; also catches date-gated experience entries",
    hcSlug: "cv-regen",
    schedule: "02:00 UK, every Sunday",
  }),
  job(PORTFOLIO, "Portfolio", "deploy-ps5-presence.yml", {
    label: "Deploy PS5 presence",
    description: "Redeploys the PS5 presence worker",
    schedule: "on changes",
  }),

  // Fleet - the ops repos that keep everything else mirrored, configured and scheduled.
  job("cron-ops", "cron-ops", "deploy-worker.yml", {
    label: "Deploy scheduler",
    description: "Redeploys the cron-ops scheduler worker",
    hcSlug: "cron-ops",
    schedule: "on changes",
  }),
  job("repo-ops", "repo-ops", "deploy-worker.yml", {
    label: "Deploy worker",
    description: "Redeploys the repo-ops worker",
    hcSlug: "repo-ops",
    schedule: "on changes",
  }),
  job("repo-ops", "repo-ops", "apply-settings.yml", {
    label: "Apply repo settings",
    description: "Applies my standard settings to every repo",
    inputs: { repo: "all" },
  }),
  job("repo-ops", "repo-ops", "scaffold.yml", {
    label: "Scaffold repos",
    description: "Scaffolds the standard files into every repo",
    inputs: { repos: "all" },
  }),
  job("mirror-ops", "mirror-ops", "deploy-worker.yml", {
    label: "Deploy worker",
    description: "Redeploys the mirror-ops worker",
    schedule: "on changes",
  }),
  job("mirror-ops", "mirror-ops", "sweep.yml", {
    label: "Mirror sweep",
    description: "Mirrors every repo to the backup forges",
    hcSlug: "mirror-ops",
    schedule: "10:17 + 22:17 UK",
  }),
  job("meta-mirror", "meta-mirror", "export.yml", {
    label: "Meta export",
    description: "Backs up issues, settings and metadata for every repo",
    hcSlug: "meta-mirror",
    schedule: "00:07, every 3 days",
  }),
]

export const CONTROL_JOB_IDS = new Set(CONTROL_JOBS.map((j) => j.id))

export function findControlJob(id: string): ControlJob | undefined {
  return CONTROL_JOBS.find((j) => j.id === id)
}

/** The repos in display order, for grouping the table. */
export const CONTROL_REPO_ORDER = [
  { repo: AUTOMATIONS, label: "Automations" },
  { repo: PORTFOLIO, label: "Portfolio" },
  { repo: "cron-ops", label: "cron-ops" },
  { repo: "repo-ops", label: "repo-ops" },
  { repo: "mirror-ops", label: "mirror-ops" },
  { repo: "meta-mirror", label: "meta-mirror" },
]

export { GH_OWNER }
