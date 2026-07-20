# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Security

- Made the vault fail safe when its encryption key is missing. Without VAULT_ENCRYPTION_KEY the vault pages used to throw on read while a save threw an opaque error deep in the encrypt step; now the pages pass the rows through and show a banner that encryption is not configured, while the write actions return a clear message rather than throwing. Separately I added a deliberately gated way to export the vault decrypted for moving my secrets into a password manager, kept apart from the normal encrypted backup: Settings downloads a vault-only file with the secrets in the clear, behind the session, the PIN plus a typed confirmation, with its own filename so it never mixes with a routine backup
- A sweep of small hardening fixes across the API surface. The incident webhook takes its secret from a header only (a URL secret lands in access logs) and every shared-secret comparison, the cron bearer tokens included, now runs in constant time through one helper; the public stats routes log their real database error server-side and return a generic message; blog reactions validate the slug with the same rule the read-event route uses; the read-event visitor key is a salted one-way hash instead of a reversible encoding; the Spotify widget route carries the same rate limit as the other public widgets; the vault encryption migration route pages past the 1000-row cap; incident dedupe matches on the exact title so one check's name can never be a substring of another's; the Discord bot escapes LIKE wildcards in every search and computes the medication day window in London time; the dashboard install manifest points at the brand icons; the links page GitHub URL follows the configured username; the content security policy allows the Vercel toolbar so it stops spamming my own console
- Hardened the dashboard PIN gate. The verified cookie is now a signed, expiring token bound to my session and checked server-side on every gated page rather than a bare flag; the per-type vault and modules pages and both notes pages now perform the same server-side PIN check their index pages already did, so gated content never reaches the browser without it; change-pin carries the same rate limit as verify-pin and a failed save now reports the failure instead of success; the config actions accept only a fixed set of preference keys, so the PIN hash is not reachable through them
- Made the full-backup export and import trustworthy. The export now pages every table past the 1000-row PostgREST cap instead of silently truncating each one at 1000, and a table that fails to read makes the whole export fail loudly rather than downloading as if complete; both the export and the import are now behind the PIN as well as the session, since the bundle carries diary and vault content. The import validates every row, re-encrypts any legacy plaintext vault row on the way in, caps the payload size and reports a partial failure instead of claiming success. Clearing all tracked applications now pages and verifies its trash backup against the row count before deleting, so a read past the first 1000 rows can never be lost
- Closed a fail-open gap in the Discord bot's owner gate. The check only rejected a non-owner while `DISCORD_OWNER_ID` was set, so leaving that id unset disabled the gate entirely on what is a public endpoint. It now fails closed and rejects every caller until the owner id is configured

### Added

- A Control page for the whole personal OS (/dashboard/control): every dispatchable workflow across my six repos in one table with a Run now button per job, its Healthchecks state, the last ten runs as dots, a success rate, the last run's time and duration and its schedule (read live from the cron-ops scheduler when reachable, otherwise built-in labels). The run route only accepts jobs on a fixed allowlist and the statuses come from one aggregated route cached for a minute, so polling stays gentle on GitHub and Healthchecks. The operational panels moved here from Settings: the job triggers, the Linear and Strava syncs, the integrations list and the maintenance-mode toggle; Settings keeps the personal preferences and links across
- Every Linear issue this app opens now lands assigned to me with category labels instead of sitting unassigned in the team backlog: health incidents carry health plus a label naming the repo and a label naming the specific job the failing check belongs to across all six repos, application syncs carry career plus application, university deadline syncs carry university. The assignee is resolved through Linear's own viewer query against the API key rather than a hardcoded id. Labels are found or created on first use
- An uptime status board (/dashboard/uptime): the health half of the control page on its own screen. A headline of how many systems are up, late or down, every Healthchecks check across both projects as a pill grid (including the site checks that have no job to run here), then each job's recent run history with its success rate. It reads the same cached control-status route as the control page, so it adds no extra polling
- The Pulled At column doubles as a dead-link warning: a scraped row no scrape has stamped in 14 days shows its date in red with a stale marker, so I know a listing has likely left the boards before I click through
- A "Pulled At" column at the end of the applications tracker showing when the scraper last saw each listing, so a fresh posting and one that has quietly vanished from the boards are finally distinguishable at a glance; rows I added by hand show a dash
- Music joins the digests for the first time: plays, listening time and the top artist appear in the daily Discord embed, the weekly email and the AI narrative alongside everything else. Fitness now carries the sports and the calories burned, the reads figure distinguishes opens from finished reads, the applied roles carry their category, work mode and location; the weekly email names the roles applied to instead of only counting them
- A Sentry-to-Discord relay (`/api/sentry-webhook`): Sentry's free plan has no native Discord integration, so a Sentry Custom Integration now posts issue alerts to this route, which verifies Sentry's signature and reposts a compact embed to the errors Discord channel through the existing webhook. It reuses the same pattern as the incident endpoint, so application errors land alongside the scheduled-job failures

### Fixed

- Swept the dashboard, music and lab charts for a group of layout bugs. The bar charts that sit beside a pie no longer sit off to the left: recharts 3 stopped reserving width for a hidden Y axis, so the copied negative left margin was pushing every hidden-axis plot past the card edge while clipping its first label. The first (and second) category labels are back everywhere a bar's X axis had no explicit interval and so fell back to recharts quietly dropping the leading ones. The coding language, editor and project bars now carry a colour legend matching the donut beside them. The heart-rate trend and the other dotted fitness lines no longer force every date label, so a long period stops crowding them into an unreadable strip. The music analytics genres plus the public lab genres now fold together spellings that differ only by case or a trailing s, so afrobeats and afrobeat read as one slice. The applications status donut is centred too
- The applications table collapses duplicate rows of the same role to one clean row pointing at the best link. The same programme lands from several sources (the Trackr plus a direct careers API, or the daily re-scrape before the URL heal catches up), so a role showed as several rows, one with the real posting link and the others with only the company careers page or none, which is what left some internships looking link-less while every other tab read clean. Rows are now deduplicated for display on company, role and location, keeping the one I have already progressed over any scraped twin and otherwise the most specific apply link, so a direct posting always wins over a search or careers landing page. Nothing is deleted: every row stays in the database and stays editable, this only decides which duplicate to render, and the tab counts follow the same de-duplication
- The digests now report exactly the days they claim to. The gatherer windowed date-keyed tables with a lower bound only, so a digest labelled with the day that just ended also swept in rows dated today; the scheduled 00:30 run barely noticed, but triggering the digest manually in the afternoon nearly doubled the coding hours by stacking today so far on top of yesterday under yesterday's label. Every area now gathers over completed London calendar days (the weekly email over exactly the Mon-Sun that ended), date and timestamp columns are bounded on both sides with the clocks-change nights handled, the visitor figure counts opens rather than every scroll-depth event a reader fires, published posts no longer leak today's into yesterday's digest and both senders take their label from the same range the queries used. The bot's /today and /week keep their natural meaning as clean calendar windows ending on the current day

- Made every dashboard save tell the truth about whether it worked. Across the whole dashboard the forms fired their save and ignored the result, and because Supabase returns an error object rather than throwing, a rejected create, edit or delete looked exactly like a success: the dialog closed, the item appeared, then vanished on the next reload with nothing shown. The quick-capture sheet was worse, flashing a green "saved" every time regardless. Now the create actions report failure consistently, a shared helper raises a toast when a write fails, and every screen checks its result: it rolls its optimistic change back and tells me it failed instead of pretending it saved. This covers goals, modules and grades, applications and interview prep, the vault, diary and notes, streaks and habits (including the daily check-in taps), the health pages, faith and study logs, the calendar and timetable, contacts, open source, inventory, wishlist, reminders, the university pages, the me/us/course editors, files and the settings theme toggle
- Made every Discord command tell the truth about whether it worked. None of the bot's database writes checked their result, so a failed insert, update or delete still replied with a success tick, because Supabase returns an error object rather than throwing; each of the roughly fifty writes is now checked and a genuine failure says so instead of claiming success. Deleting a goal, application, contribution, contact, reminder, note, wishlist or inventory item from Discord now goes through the recycle bin the same way the dashboard does, so it is recoverable rather than gone; the `/weight`, `/study` and `/faith` undo now removes the most recent entry by time rather than by an effectively random id order; and `/app add` takes an optional type instead of always recording Internship
- Silenced the dashboard console for good: the content security policy now names the hosts the Cloudflare beacon and GA4's regional collectors actually use, both analytics scripts load on the public site only via a pathname-aware component (my own dashboard traffic was skewing the visitor stats), and the dashboard greeting and relative-time badges render client-side only, which removes the React hydration mismatch the server's UTC clock caused against the visitor's local time
- Made the recycle bin trustworthy end to end. Restoring a soft-deleted item now verifies a row was actually revived (and re-inserts from the snapshot when it was not) before the recovery copy is dropped, so a restore can never silently destroy the only backup; deleting a habit, streak or module now snapshots its logs and assessments inside the trash entry, so a restore brings the history back rather than a hollow parent; resetting a streak now leaves an undo point in the trash, where before it wiped every check-in with no recovery at all; the nightly trash cleanup now hard-deletes the hidden rows and storage blobs behind expired soft-deleted items instead of orphaning them forever, and emptying the trash pages its read so items past the first thousand are handled too

### Changed

- Tidied the dashboard chrome. Each dashboard page now names itself in the browser tab (Me, Goals, Vault and the rest) rather than every tab reading a generic Dashboard. The light and dark toggle moved out of Settings to a fixed top-right corner like the public pages, keeping the saved preference. The sidebar header dropped the duplicate avatar now that it matches the ia home mark beside it
- The Linear view now pages its issues at 25 a page with the shared pager the rest of the dashboard uses, so a growing workspace no longer mounts every open issue at once. The summary counts still cover the whole set; only the grouped list below shows a page at a time
- Cleaned up the sql folder documentation: the migration files that shared or followed the duplicate 042 number were renumbered into a clean sequence (the old-to-new mapping is documented in the migrations README), the migrations README now lists every file 001-045 with what it adds and both sql READMEs stop referring to the long-removed schema.sql. The root and dashboard READMEs also catch up with the post-analytics route rename
- Applications now stamp their applied date automatically when they move to Applied or Submitted, so the pipeline timeline stays real without me filling the date by hand
- Made Dependabot auto-merge ecosystem-aware: patch and minor bumps and major GitHub Actions bumps auto-merge once the `Lint and Build` check passes, but major `npm` bumps are now held for manual review instead of auto-merging, since a breaking runtime bump could pass lint and build and still deploy. The `automerge` label path (used by `cv-pdf.yml`) is unchanged

### Added

- Cron idempotency ledger (`cron_runs` table, migration 045): a `(job, run_date)` primary key that each message-sending job claims before it sends, so a scheduled run that the platform delayed into its target hour can never double-post the same digest, reminder or alert. Written by both the Next.js server and the automations scripts via the service-role key; RLS enabled with no policy to match migration 037. The daily trash-cleanup cron prunes rows older than 90 days so it never grows unbounded
- Midday WakaTime sync (automations repo): a second daily sync at 12:30 UK so the coding dashboard reflects the morning's hours during the day, on top of the end-of-day sync that now runs as the first step of the coding-recap workflow

### Changed

- Scheduled jobs now fire at a fixed UK wall-clock time year-round, through both BST and GMT. Neither Vercel Cron nor GitHub Actions observes British Summer Time (both are UTC only), so every time-of-day job now runs from two crons - a GMT branch and a BST branch one hour apart - and acts only when it is genuinely the intended hour in `Europe/London`, exiting quietly otherwise (the same trick the routine checklist already used). New `lib/london-time.ts` provides the `london()` gate and the `claimCronRun()` idempotency claim; a shared `scripts/lib/uk-cron.mjs` does the same for the automations scripts, with a `TZ=Europe/London date` gate step in each workflow. Retimed to true UK time: the weekly email digest (now Monday 00:30, so it covers the full previous Mon-Sun), the daily Discord digest (now 00:30, so it reads as "yesterday in full" instead of arriving mid-morning half-empty), the PS5 NPSSO check (Mon 09:00), the vault-expiry checks (09:00 web / 08:00 Discord), the trash cleanup (03:00), the Strava sync (04:00), the streak reminder (08:00) and the coding recap (00:30). The paired Vercel crons use distinct `?dst=` query paths because Vercel rejects two cron entries with the same path. The job scraper stays on a single UTC midnight cron - its every-2-days schedule can't be cleanly bracketed and a scraper's start hour is immaterial
- Coding recap consolidated into one workflow at 00:30 UK: it now syncs WakaTime first (after midnight, so the previous day is complete) and then posts the summary, removing the cross-job timing race between the old separate 23:00 sync and 23:30 summary. The summary reports the day that just ended in UK local time rather than the UTC "today"
- Live status (homepage, /now, /lab): retuned the polling so the edge cache actually does its job. Spotify now polls every 15s against a 20s edge cache (was 5s against a 4s cache), the device/GitHub/Discord snapshot every 45s against a 60s cache (was 20s against 15s), and the lab gaming panel's PS5/gaming-PC routes now cache for 45s against their 30s poll (was 15s). The old cache lifetimes were shorter than the poll intervals, so every single poll was a cache miss that invoked a Vercel function - that alone was most of my Fluid CPU usage and pushed the free tier to 100%. With the lifetimes above the poll intervals, open tabs genuinely share one cached response; track changes still appear within ~15-30s, and the device daemons only write every 1-2 minutes anyway so nothing loses real freshness

### Fixed

- Strava Fitness-habit day: a workout done late on a British-summer evening was ticking the Fitness habit on the wrong calendar day, because the tick used the activity's UTC `start_date` (which rolls past midnight before UK time does). It now uses `start_date_local`, so the habit always lands on the day I actually trained. The stored activity rows and the analytics charts are untouched - they still read UTC `start_date`, so nothing visual changed
- Digest date labels: the daily Discord digest and the weekly email now stamp the period they actually summarise. Moved to just after midnight, a digest was headed with the new day's date while its content covered the day before; the daily digest now names the day that just ended and the weekly names the Monday-to-Sunday it covers
- Links page: corrected the GitHub, GitLab, Codeberg, Stack Overflow and Hackster usernames so my profile links resolve to the right accounts, and aligned the X (Twitter) link so both places use the same handle
- Lab page: the projects donut now lines up with the languages donut. A long repo name in the legend was reserving extra width and pushing the projects pie out of line, so I gave every donut legend the same fixed width and capped the label to fit, with the full names still shown in the progress-bar list beside each chart
- Sitemap: removed /privacy for real this time - the page is noindex, and listing it in the sitemap kept sending Google conflicting signals (the Search Console "excluded by noindex" validation kept failing). A v2.x entry claimed this was done already, but the URL was still in app/sitemap.ts
- Dashboard save bug (silent data loss on empty date fields): saving a secure note, a job application, a goal or an inventory item could silently do nothing - the dialog closed, the item looked saved, then vanished on the next reload, with no error shown anywhere. The forms submitted an empty string for optional date fields (key-expiry, applied/closing dates, target date, purchase/warranty dates), Postgres rejected the empty string because those are date columns, and the save actions never checked the database error, so a failed write looked exactly like a successful save. Empty dates are now stored as null and every one of these saves and edits now checks the write, so a genuine failure surfaces and reverts instead of quietly losing the entry. Found and fixed across the vault, applications, goals and inventory pages after an audit of every dashboard save path

### Security

- Me page: removed my personal email, date of birth and student number from the DEFAULT_PROFILE fallback in the page source. The dashboard reads those values from the me_profile config row in Supabase as before - the fallback only ever rendered when the database was unreachable, and this repo is public, so private identifiers no longer belong in the source

---

## [v2.43.0] - 2026-06-24

### Added

- Medication reminders: a new /dashboard/health/medication-reminder page to manage scheduled medication and health reminders for me or family, each firing at one or more local times within an optional date range, to Discord, email or SMS. An analytics view charts reminders sent per day and by medication with an adherence figure, backed by a doses log that records every send. The reminders are delivered by a job in my automations repo reading the same tables, firing at the right local hour through BST and GMT. Migration 040 adds the medication_reminders and medication_doses tables

---

## [v2.42.0] - 2026-06-24

### Added

- A full Discord command set for the personal OS bot, so I can drive the whole dashboard from Discord. Read commands: /today, /week, /goals, /applications, /deadlines, /calendar, /contacts, /vault, /coding, /fitness, /weight, plus /habit list and /streak status. Write commands: /habit done and /streak log, and a /log group for quick weight, study-session and diary captures - all owner-gated and writing the same Supabase tables the dashboard uses (so a Discord check-in shows up on the dashboard). A /help command lists every command with its usage. Everything that touches the database defers and edits its reply, so it always answers inside Discord's three-second window

---

## [v2.41.0] - 2026-06-24

### Added

- A Discord bot for the personal OS, built as a stateless Vercel endpoint (/api/discord-interaction) rather than a hosted process. It verifies Discord's Ed25519 signature, answers slash commands only from my own Discord user id, and defers the heavier ones so it always replies within Discord's three-second window. First commands: /ping, /today and /week (the last two reuse the shared digest gatherer). Three Node scripts go with it - scripts/register-discord-commands.mjs registers the commands, scripts/setup-discord-server.mjs builds the whole private server in one run (categories, channels with topics and a webhook per channel for the automated sends) and scripts/export-discord-server.mjs reads an existing server's structure as a reference

---

## [v2.40.0] - 2026-06-24

### Added

- Cron monitoring with Healthchecks.io: each scheduled job (the weekly email digest, the daily Discord digest, the Strava sync, the vault-expiry check and the trash cleanup) pings a named check when it runs, so a silently-dead cron raises an alert instead of failing unnoticed. It is guarded on a ping key, so without one the crons run exactly as before
- A public /api/health endpoint that returns 200 when the app can reach the database and 503 when it cannot, so an external uptime monitor (Better Stack) can poll it and drive a status page
- An /api/incident webhook that opens an urgent Linear issue when a monitor reports a problem (a dead cron from Healthchecks, or the site down from Better Stack). It is guarded by a shared secret so only my monitors can reach it, and it reuses the existing Linear integration, filing into my existing Linear team (LINEAR_UNI_TEAM_ID)
- Cloudflare Web Analytics: a privacy-friendly, cookieless visitor beacon that loads only when its token is set
- A Status link to the public status page (status.isaacadjei.me) in the footer, the all-pages directory and the Cmd+I command menu (Shift+M hotkey), plus a Cloudflare Web Analytics note in the privacy policy

---

## [v2.39.0] - 2026-06-24

### Added

- Server-side error monitoring with Sentry: my route, server-action and cron exceptions are captured and, through the Sentry to Linear integration, open Linear issues so failures become trackable work. It is Node only - no client SDK, no session replay, no PII - so the public bundle is untouched and nothing about visitors is collected

### Fixed

- Sentry is wired Node only on purpose. The Sentry edge SDK bloats the edge middleware past Vercel's edge-function size limit and fails the deploy, and that only surfaces at Vercel's deploy step, not in a local or CI build (which is why two earlier attempts passed everything yet never deployed). instrumentation.ts now loads and imports Sentry only on the Node runtime, with a dynamic import in onRequestError, and there is no edge config and no withSentryConfig

### Changed

- Temporarily unpublished the Sky Black Heritage celebration-day post (published: false) to rewrite after the celebration. The post file, content and cover image are kept

---

## [v2.38.0] - 2026-06-24

### Added

- Comprehensive AI-written digests. Both the weekly email and the daily Discord digest now cover everything I track in the period (applications, coding, study, fitness, weight, goals, streaks, habits, faith, diary, content reads, open source) plus a forward block (calendar events and deadlines coming up, contacts to follow up, anything expiring soon). An AI intro phrases the figures, trying the best free models in turn (Groq, Gemini, OpenRouter, GitHub Models) with a plain-template fallback. The weekly summary is exhaustive, the daily one stays tight, and the model only ever receives counts and typed alerts - never vault names or values, contact names or company names
- A weight-loss tracker under Health: a card on the overview opens a sub-page with a weight goal (progress, weekly rate and a projected finish date), daily or weekly weight, food (calories and protein) and manual workout logging alongside synced Strava activities, and today's calorie balance. The digest reads the goal and coaches it
- A weight-loss analytics page on the shared analytics framework (period selector, stat cards, and weight-trend, calories-per-day, workouts-by-type and average-macros charts)

### Security

- Locked the new weight-tracker tables (nutrition_logs, workout_logs) to the service-role server only. They were briefly created with a public "allow all" anon policy, now dropped, matching every other table here

---

## [v2.37.0] - 2026-06-23

### Added

- A Strava row and a "Sync activities" action in Settings under Integrations, alongside Spotify, WakaTime and Linear

### Changed

- The maintenance page keeps a single dark/light toggle but otherwise renders bare (no site header or footer), and follows the visitor's device theme by default
- The maintenance gate now redirects logged-out visitors to /maintenance instead of rewriting, so the page renders without the site chrome, and the command menu is hidden there

### Fixed

- The maintenance middleware no longer runs NextAuth auth() on every public page (it uses a session-cookie presence check), removing the MissingSecret noise and the per-request overhead; the dashboard stays protected by its own server-side auth
- /maintenance is gated in production (non-owners are sent home when maintenance is off) so the public cannot stumble onto it, while I can still preview it locally
- Gave the maintenance GIF its real 320x180 dimensions to stop the Next aspect-ratio warning

---

## [v2.36.0] - 2026-06-23

### Added

- A public maintenance mode I toggle from Settings, with a custom message and a maintenance page at /maintenance (reusing the lab GIF and a contact line). Logged-out visitors see it when it is on, and I always keep full access to the site and dashboard. Enabling it purges the Cloudflare cache so it takes effect immediately when the Cloudflare token is set, and degrades gracefully without it
- Selective export: I can export specific sections (e.g. just Applications) from Settings instead of the whole database. Since import only restores the sections present in a file, this doubles as selective import
- Two more Strava charts (cumulative distance and time of day) so the fitness page covers more

### Changed

- Reordered the fitness analytics charts (distance and distance by sport, then heart rate and pace, then training by day and sport split) and recoloured the pace trend orange so the sport-split pie is the only multi-colour chart

### Fixed

- Removed "Year 2" from the University overview subtitle (it now reads "Academic hub")

---

## [v2.35.0] - 2026-06-23

### Added

- Blog and TIL analytics are now period-aware and richer: an opens-over-time chart plus the funnel, heatmap, top posts and completion all recomputed from dated read events for the selected range
- Open Source contributions analytics gained a period selector (in-period, merged, all-time) driven by the submitted date

### Changed

- The University section menu is now collapsible so the selected page can use the full width, and the choice persists across reloads
- Calendar feed toggles now persist: an unticked feed stays hidden across reloads until I re-tick it

### Fixed

- Removed the duplicate "Year 2" label on the University overview

---

## [v2.34.0] - 2026-06-23

### Added

- The University Submissions log gained a "submitted in" period selector with In-period, Total logged and Modules cards, scoping the log to what I submitted in the chosen range

---

## [v2.33.0] - 2026-06-23

Richer, fully interactive analytics and a sidebar tidy-up.

### Added

- Strava now syncs automatically every day, and each day with an activity auto-ticks a Fitness habit (created on first sync). I can still tick or untick it by hand, and through the Discord bot once that lands. A manual change is never overwritten by a sync

### Changed

- Every chart now follows the period selector. The Coding weekly charts used to be stuck at 13 weeks; they now scale with the range (24h to All). The Strava distance bars and recent-activities table follow it too, and the recent list shows up to 50 in the chosen period instead of a fixed 12
- The Applications analytics cards gained period-over-period trend arrows and a conversion-from-applied progress section (assessment, interview, offer)
- The Strava analytics page gained personal bests (longest run, fastest pace, longest time, most climb, biggest day), a training-by-day-of-week chart and a pace trend line beside heart rate
- Study, Habits, Faith and Body Metrics now have the same period selector driving their stat cards and charts, replacing the old fixed 30 and 90 day windows

### Fixed

- Sidebar items are now all the same size; the first item in the Analytics and University groups no longer renders larger than the rest
- Sidebar highlighting now lights up only the most specific page. Opening Fitness analytics no longer also highlights Health, because a child route like /dashboard/health/analytics was matching its parent /dashboard/health

---

## [v2.32.0] - 2026-06-23

### Added

- A private Strava activity analytics page, reachable from the Health overview and the Analytics menu. I connect Strava once, my runs and rides sync into the dashboard, and the page charts a 52-week training heatmap, weekly distance, heart-rate trend, sport split and distance by sport, with stat cards for activities, distance, moving time and elevation over any period. Everything renders from synced rows so the page is instant, and a Sync button pulls fresh activities on demand. My tokens stay server-side and nothing is shared publicly

---

## [v2.31.0] - 2026-06-23

The Applications tracker now shows every scraped role, and clearing them is honest.

### Changed

- The Applications tracker now loads every application, not just the most recent 1000. It previously capped scraped listings at 1000 rows, so its tab totals disagreed with the Applications analytics page (which already counts all of them). The tracker now pages through the whole table so the two always match, and it renders the rows in windows with infinite scroll, so even tens of thousands of scraped roles never freeze the page
- "Clear scraped jobs" in Settings now permanently deletes every scraped listing in one pass. The old version backed them up to trash first, but the backup silently capped at 1000 rows while the delete removed all of them, so most were never really recoverable, and copying thousands of re-scrapeable rows into trash on every clear just moved the clutter. It still only ever touches status 'scraped', so anything I have applied to, interviewed for, been offered, rejected from or saved is kept untouched, and my real pipeline and its analytics survive any number of clears

---

## [v2.30.1] - 2026-06-23

### Fixed

- My own applications were silently disappearing from the Applications page. The table holds thousands of scraped job listings and a single query is capped at 1000 rows, so the scraper's recent rows were filling that window and evicting my older real applications. The page now loads my real applications in their own query so they can never be pushed out
- Re-applied two assistant tweaks lost in a merge race: the accuracy guardrail (only state facts that are in the data, never invent companies or numbers) and the quick panel defaulting to Gemini Flash

---

## [v2.30.0] - 2026-06-23

### Added

- A floating quick-ask AI panel on the dashboard pages whose data the assistant can read (applications, coding, university, calendar and the rest). It reuses the same read-only assistant on a fast free model for a quick question without leaving the page, and never appears on my private pages

---

## [v2.29.2] - 2026-06-23

More assistant reach and a privacy tidy-up.

### Added

- The assistant can read my portfolio: public projects, experience, education, skills, societies, blog and TIL titles, and research
- Full coding analytics: hours over time plus top languages, projects, editors and operating systems

### Changed

- Removed Health from what the assistant can read; it is medical data (weight, BMI, blood pressure) I never needed it to see
- The assistant page copy now reads in the first person, since only I use it

---

## [v2.29.1] - 2026-06-23

Polish on the new assistant after a live test.

### Fixed

- Attaching a large image no longer fails with a Vercel payload-too-large error. Images are downscaled to 1568px max and re-encoded in the browser before sending (what vision models use internally anyway), so phone photos just work. Multiple files are capped at a safe total with a friendly message instead of a cryptic error
- The assistant now talks like a warm, opinionated personal assistant that knows my background, instead of a strict data terminal that refused opinions and kept saying "dashboard data". It still only reads an allow-list of my data and can never touch private sections
- Saved chats that include an image now save reliably (lifted the server-action body limit to 4mb)
- A Stop button cancels a hung or slow model so the input can never get stuck
- The chat scrollbar no longer overlaps the message avatars
- Code in replies renders in a proper box with a one-click Copy button, and the assistant is told to fence its code blocks

### Changed

- The model menu is grouped and labelled honestly by what actually works: reliable free (Gemini Flash, Groq, GitHub GPT-4o), rate-limited free (OpenRouter Qwen/Llama/Gemma), trial-credit (DeepSeek, Kimi, GLM) and paid (Gemini Pro, Claude, GPT, MiniMax), and each option shows a live "add key" hint based on which keys are actually set
- DeepSeek switched to the current deepseek-v4-flash and deepseek-v4-pro ids (the old chat and reasoner names retire in July 2026)
- The assistant can now also read university (modules and deadlines), calendar, inventory and wishlist on top of the existing sections; diary, vault, us, me, notes and contacts stay private
- Tightened what leaves for a model: faith notes and calendar locations are never sent, each section reads only the minimum it needs, and the assistant is told to flag any secret it spots and never repeat it back
- The assistant names us and me explicitly as private sections it cannot read

---

## [v2.29.0] - 2026-06-23

The dashboard assistant got a big upgrade - it can read my data on demand, handle images and PDFs, and save chats.

### Added

- The assistant now reads an allow-list of my own data on demand (applications, coding, streaks, habits, goals, faith, study, health, content) to answer real questions. It has no way to reach my private sections (vault, diary, notes, university, contacts) - there is simply no tool for them
- Attach an image or PDF and it analyses it (via Gemini)
- Save a chat to come back to later, with per-chat delete - nothing is saved unless I choose to
- A wide model dropdown: free models (Gemini 2.5 Flash and Pro, Groq Llama 3.3, GPT-OSS 120B, Qwen3 80B, Qwen3 Coder, Llama 3.3, Gemma 4 and GPT-4o free via GitHub) plus key-gated ones that light up when I add their key (Claude Opus/Sonnet/Fable/Haiku, GPT-5/4.1/4o, DeepSeek, Kimi, GLM, MiniMax). Images and PDFs are routed to Gemini automatically

---

## [v2.28.0] - 2026-06-23

A read-only in-dashboard AI assistant.

### Added

- A new Assistant page in the dashboard - a chat that reads a snapshot of my own data (applications, coding, streaks, goals, deadlines) and answers questions or drafts text. It is read-only by design so it can never change or delete anything, sits behind my login and is rate limited. A model dropdown switches between Gemini, Groq Llama 3.3, DeepSeek R1, DeepSeek V3 and Llama, with automatic fallback if one is unavailable

---

## [v2.27.0] - 2026-06-22

Two public-site fixes (the lab coding stats and the live Discord card) plus image upload in the notes and diary editor.

### Fixed

- The lab "In the code" stats and the top-content widgets read with the old anon key, which the database lockdown now blocks, so they showed zeros. They use the server key again like every other server read
- The /now Discord card showed me as offline even when I was online and active, because the client checked a field the live-status endpoint no longer returns. It reads the right field again

### Added

- The notes and diary editor can now insert images by picking a file from my device. Images upload to private storage and load through an auth-gated link, so they stay as private as the rest of my notes

---

## [v2.26.0] - 2026-06-22

Notes and diary now have a proper rich text editor.

### Changed

- The notes and diary editors are now a rich text editor (TipTap) with headings, bold, italic, lists, checklists, code blocks with syntax highlighting, quotes, links and images, a formatting toolbar and keyboard shortcuts. Existing notes are untouched and still export as markdown

---

## [v2.25.0] - 2026-06-22

Phase 5 logging and automation - the dashboard records more of what happens and the daily digest nudges me to follow up with people.

### Added

- The daily digest now has a "Follow-ups due" section listing contacts I have flagged or have not contacted in over 30 days
- Sign-ins, sign-outs, PIN changes and theme changes are now recorded in the activity log

---

## [v2.24.0] - 2026-06-22

Three live bugs reported while verifying the post-audit deploy: the per-tab application analytics, the calendar routine feed and the streak reset button.

### Fixed

- Applications: the analytics panel inside each tab read "0 applications in view" on every tab because it matched a row's type against the tab's plural label ("Internships") instead of the stored value ("Internship"), so nothing matched. It now uses the same tab mapping the table uses, so each tab's stat cards, status breakdown, category split and funnel populate. The weekly and monthly trend charts also fall back to the row's created date when no applied date is set, so they stop rendering empty
- Calendar: the Daily Routine feed showed nothing on the dashboard even though it renders correctly in Apple Calendar - the page was fetching my own feed over the network during server rendering, which loops through the CDN and comes back empty in production. The routine iCal is now built in-process with no network request, so its events appear alongside the other feeds
- Streaks: the Reset button cleared the check-ins in the database but the card never changed, because it relied on a server revalidate that does not refresh state the page holds locally. Reset now updates the card immediately, reverts if the save fails, and asks for confirmation first since clearing check-ins cannot be undone

---

## [v2.23.0] - 2026-06-22

The remainder of the pre-Phase-5 audit: analytics across more dashboard sections, plus every remaining low and medium finding.

### Added

- Analytics on Goals, Habits, Contacts, Inventory and Vault - a row of stat cards and a chart on each, matching the Streaks layout and computed from data already on the page. Inventory and Vault also get a search box that filters the list as you type

### Fixed

- "Clear all applications" no longer deletes the scraped Jobs-tab rows, only the tracked ones; bulk deletes and clear-all now stop if the trash backup fails instead of deleting anyway; syncing to Linear counts real failures separately from genuine skips; creating a scraped-shaped application no longer trips the manual-entry validation; the activity logger requires auth; tracked-status matching is case-insensitive; and a theme change no longer lags because its cache tag expires immediately
- The OpenSource status dropdown saves once instead of twice; new notes can be created pinned (a Pin toggle sits beside Lock in the editor); the calendar UNTIL rule is compared in UTC so recurring events end on the right day; blog reactions are rate limited and reject non-emoji keys; the read-event route uses edge-safe base64; and the timetable card reads its saved attendance and notes in an effect so the first render no longer mismatches
- The scraper reads the real CV, cover letter, written-answers and visa-sponsorship values from the matching Trackr columns instead of writing "Yes" for every role, and refreshes them on each run

### Changed

- One shared Redis client across the API routes instead of a new connection per file; getLanyard returns only the fields the live status card renders rather than the full Discord payload

---

## [v2.22.0] - 2026-06-22

A pre-Phase-5 hardening pass: a full audit of the dashboard, server actions, scraper and calendar found a batch of bugs, several of which silently lost data. All of the critical and high-severity ones are fixed and live.

### Fixed

- Dashboard: deleting an item in twelve sections (Health sections, workouts and nutrition, Body Metrics, University modules, deadlines, submissions, notes and resources, Library, Faith and Study) copied it to trash but never removed the original, so it never actually disappeared. All twelve now delete after backing up
- Trash: restoring an item deleted the trash copy even when the restore itself failed, losing the only backup; permanently deleting or emptying trash left the underlying soft-deleted rows and their Storage files orphaned; deleting a file never removed the Storage object. All fixed, and restore is now soft-delete aware
- Calendar and timetable: my own Routine and Timetable iCal feeds rendered invisible because timezone-qualified times were read as UTC and pushed events off the visible week. A single shared parser now converts a wall-clock time in its zone to the correct instant, detects all-day events, expands daily and monthly recurrence (not just weekly), and gives each recurring occurrence a unique key
- Scraper: a re-run of one migration could delete every scraped row, and the scraper never refreshed existing entries. It now upserts by URL - new roles inserted, known roles refreshed in place, nothing ever deleted - and preserves my own status, notes, starred flag and applied date
- Scraper: The Trackr rows (internships, placements, spring weeks) were stored almost empty - no location, the closing date set on 2 of 4400+ rows, and most with no clickable link. It now reads the Trackr column headers and pulls location, opening date, closing date, last-year opening and the real application link from the correct columns
- Applications: "clear all jobs" targeted a table that does not exist, so it silently did nothing; it now clears the scraped rows it was meant to
- Dashboard: delete, edit, move and status changes across applications (table and kanban), health, vault, goals, inventory, diary and streaks updated the screen optimistically with no way back, so a failed save left the UI showing a state the database had rejected until a refresh. Every one now snapshots and reverts on failure
- Faith: the edit button showed a Star icon and the stats said "90 days" while summing all time. Vault: editing an entry visually reset its hidden and locked flags. Contacts: a fast double-click created the contact twice. Linear sync could create duplicate issues from a read-after-update race. The medication reminder intermittently returned a Cloudflare 403 from Discord for want of a User-Agent header. The nightly coding summary failed on a top-level await. All fixed
- Dashboard search: a lone "%" matched every row; the home "last updated" stat was always a week stale; the share button swallowed a blocked clipboard write silently

### Changed

- Server-side database access now prefers the Supabase service-role key when it is set, falling back to the anon key, so the per-table "allow all" policies can be tightened later to lock the anon key out without breaking any server read or write
- The scraper keeps a role for 14 days after its deadline passes rather than dropping it the instant the date ticks over, moved off a deprecated timestamp call, and id-validation now requires a uuid shape

---

## [v2.21.0] - 2026-06-22

### Added

- Live status: the MacBook and Lenovo cards now show a real battery gauge - the inner bar fills to the actual percentage and shifts colour as it drains (the site blue when healthy, amber below 30%, red at or below 20%), with a charging bolt overlaid while plugged in. Replaces the fixed battery icon
- Live status: the Gaming PC card was rebuilt to mirror the PS5 card. CPU and GPU now render as small live sparklines accumulated client-side from the existing polls (one point per daemon write, so no extra Redis or server load), the current game shows underneath only while a game is actually running, and the last game played shows when the PC is offline (from a new `gpc:last-game` key the daemon writes whenever a game is detected). The cover art the daemon was already fetching is finally surfaced, and the old "CPU: x% | GPU: y%" text line is gone

### Changed

- Live status: the MacBook daemon now derives its timezone directly from the GPS coordinates (CoreLocationCLI plus the offline `timezonefinder`) instead of from the IP address, so the clock follows the exact zone even in large multi-timezone countries; ipinfo stays the fallback. The daemon resolves CoreLocationCLI by absolute path because launchd runs it with a minimal PATH that excludes Homebrew, which had been silently forcing the ipinfo fallback
- Live status: the "online now" window on each device card was widened so a card stays "online" through the full write-plus-edge-cache-plus-poll lag instead of briefly flipping to "last seen" while the device is genuinely on; the charging bolt on the new battery gauge was enlarged for legibility

### Fixed

- Live status: device cards could show "last seen 37m ago" while the daemons were running. Cloudflare's Browser Cache TTL was holding the snapshot in the browser for its 4-hour default, overriding the origin's short cache, so a tab kept serving a frozen copy. The client now fetches with `cache: "no-store"` (the request still hits the 15s edge cache, so it stays cheap) and the Browser Cache TTL now respects the origin headers
- Live status: the edge caching introduced in v2.19.0 and v2.20.0 was still not taking effect because the site sits behind Cloudflare, whose free plan does not cache API routes without an explicit rule (responses came back `cf-cache-status: DYNAMIC`). Three Cloudflare cache rules now edge-cache `/api/live-status`, `/api/spotify` and the device routes, so reads are finally viewer-independent and Upstash stays well within its monthly command budget
- Live status: the gaming PC card showed a broken game image - the daemon's hardcoded fallback art (such as Fortnite's Epic banner) is hotlink-blocked and returns HTTP 403, and the IGDB cover it otherwise used is portrait box-art that crops to an ugly vertical slice in the card's square image slot. Every detected game now resolves a landscape IGDB artwork from the reliable images.igdb.com CDN and picks the most-rated match so a DLC or season pack never beats the base game, matching the look of the PS5 card. Steam titles fall back to their Steam header, with a curated image as the last resort
- Live status: the gaming PC card showed games I do not own and was not playing - the daemon's fuzzy detection tier (tier 5) cleans any running process name and searches IGDB, so background apps and Windows system processes (such as the Windows 11 widget board) matched unrelated indie games of a similar name. The fuzzy tier is now **off by default** (set `ENABLE_FUZZY_DETECTION=1` to re-enable) because it is the only tier that guesses, and no heuristic can be a hard guarantee; with it off, only the four deterministic tiers (known exe map, Steam, Epic, EA) run, so a non-game can never appear. When it is enabled it is also far tighter than before: its blocklist gained the Windows 11 shell processes, Xbox Game Bar and common developer CLI and terminal tools, and a match must now clear both a higher name-similarity bar (0.8) and a minimum IGDB rating count (20), since an exact name collision otherwise scores a perfect similarity. The reliable way to add a game stays a one-line entry in `KNOWN_GAMES`

---

## [v2.20.0] - 2026-06-21

### Fixed

- Live status: the CDN edge cache added in v2.19.0 was not actually taking effect - Next.js rewrites the `Cache-Control` header on dynamic route handlers and strips `s-maxage` before it reaches Vercel's edge, so `/api/live-status` and `/api/spotify` were served uncached (no `x-vercel-cache`). The cache directives now go through `CDN-Cache-Control` / `Vercel-CDN-Cache-Control`, which Next leaves untouched, so the edge caches the responses and reads stay flat against viewer count

---

## [v2.19.0] - 2026-06-21

### Changed

- Live status (`/now`, homepage, `/lab`): replaced the per-tab SSE stream with two CDN-cached polling endpoints - a combined `/api/live-status` snapshot (every device, GitHub and Discord read in a single Redis `mget`, edge-cached 15s) and a faster `/api/spotify` (edge-cached 4s for near-realtime track changes). Because the responses are cached at the edge, every open tab in a region shares one origin response, so server and Redis load stays flat no matter how many people are watching - the old SSE held a Redis-polling connection open per tab
- Spotify now-playing uses zero Redis on the hot path: the access token is cached in-memory (not Redis), the now-playing result is no longer cached in Redis (the CDN cache is the dedup layer), and the last-played fallback is written only when the track actually changes
- Device daemons write less often (laptops every 120s, gaming PC every 60s, down from 30s) since the CDN cache, not the write cadence, now bounds read load
- `/lab` coding heatmap: removed the small hourly sparkline that sat under the grid; it duplicated the "by hour of day" bar chart beside it, which is clearer and uses the space better

### Fixed

- Live status resilience: the Spotify and GitHub cards no longer go dark when Redis has a problem - each now isolates its Redis read so a cache outage falls through to the live Spotify/GitHub API instead of returning empty (previously a Redis blip took down every card at once, even the ones with their own data source)

---

## [v2.18.0] - 2026-06-21

### Fixed

- Dashboard: the data export/backup queried table names that do not exist (`vault_entries`, `diary_entries`, `wishlist_items`, `open_source_projects`, `notes_folders`, `blog_posts`), so the vault, diary, wishlist and open-source rows were silently dropped from every backup. It now uses the real table names from one shared list (no destructuring to drift out of sync), and the import surfaces unknown tables in its result instead of skipping them silently

---

## [v2.17.0] - 2026-06-21

### Fixed

- Dashboard: the floating markdown formatting toolbar (Bold/Italic/Strikethrough/Link on text selection) now works inside dialogs. It is portaled to `document.body`, outside the React root, so React's synthetic click never fired and the press instead bubbled to the Radix Dialog which treated it as an outside click and closed - "it closes and does nothing". The press is now handled with a native listener on the toolbar node: `preventDefault` keeps the editor's selection alive and `stopPropagation` keeps the dialog open while the formatting is applied

---

## [v2.16.0] - 2026-06-21

### Changed

- `/now` visualiser: brought the sine wave back above the bars with the old livelier bounce; bar peaks now darken as they rise (a taller bar reaches into the dark end of the gradient, like a real meter) and the wave swings wider and darkens in step with the bar beneath each point, all tinted from the album art and theme-aware
- Lab Spotify: the mainstream-vs-underground scatter is now a clean underground-to-mainstream spectrum, and the listening-era chart is computed from all-time top tracks so the decades actually spread rather than skewing to this month
- Lab Spotify and the live-status cards: first-person wording throughout (my top artists, my longest tracks, "I'm not playing anything")

### Fixed

- Lab Spotify genres: duplicate tags Last.fm returns in different spellings ("hip-hop" and "hip hop") are now merged into one genre

---

## [v2.15.0] - 2026-06-21

### Added

- Lab: Spotify genres restored via Last.fm (Spotify deprecated artist genres in Mar 2025) - the genres tab now shows a rank-weighted genre donut plus a breakdown, and each top artist lists its genre tags again
- Lab: artists tab gains a mainstream-vs-underground scatter (your rank against artist follower count), and the tracks tab gains a listening-era chart by release decade
- `/now` visualiser rebuilt: extracts the album art's dominant colours and renders soft drifting glow blooms behind organic equaliser bars, on a device-pixel-ratio canvas with delta-time animation so it stays crisp and identically proportioned on every screen; renders correctly in both light and dark mode

### Changed

- `/now` visualiser no longer pretends to react to audio (Spotify deprecated audio-features/analysis in Nov 2024); the motion is honest album-colour ambience, and the dead `energy`/`tempo`/`loudness`/`beats` props are removed
- Lab Spotify route no longer calls the deprecated audio-features endpoint, and adds track release dates + popularity for the new charts

---

## [v2.14.0] - 2026-06-21

### Changed

- Live status: every source (Spotify, devices, GitHub and Discord) is now read in-process through a shared `lib/live-status` module instead of the SSE stream HTTP-calling its own `/api` routes; this removes a second serverless invocation per source per tick that was driving the Vercel Active CPU bill
- Live status: the SSE stream now pauses when the browser tab is hidden and resumes on focus, so a backgrounded `/now`, `/lab` or dashboard tab no longer polls all day
- Spotify `/now`: adaptive polling (3s while playing, 15s when idle) backed by a 3s Redis result cache, so track skips appear in near-realtime while Spotify's API is hit at most once every few seconds no matter how many tabs are open

### Fixed

- Live status: the SSE stream's timers are now cleared on disconnect via the stream's `cancel()` handler; the previous cleanup returned from `start()` was silently ignored by the Streams API and could leak intervals

---

## [v2.13.0] - 2026-06-20

### Added

- Dashboard: iCal routine feed rebuilt - dynamic weekly generation for current Mon-Sun in Europe/London timezone; switches at Monday 00:00; no RRULE (was flooding Apple Calendar with year-long events); all micro-events for all 4 day types (Mon-Thu, Friday no-football default, Saturday, Sunday) with full descriptions; habit and streak events include a reminder note; sleep blocks span midnight into next day; two daily hydration reminders (10:00 and 19:00)
- Dashboard: shared `ColourPickerDialog` component - palette icon trigger, dialog with preset swatches, custom colour wheel, hex input and Apply/Cancel; Apply is the only action that commits the colour change; rolled out to Calendar (event form, feed list, add feed), Habits (edit) and Streaks (edit) replacing all inline colour pickers
- Dashboard: floating text formatting toolbar appears on any text selection across all dashboard inputs; markdown textareas get B/I/S/Link; plain inputs get Link only; Link wraps selected URL as `[](url)` or selected text as `[text]()`; hides on Escape or click outside
- Docs: Discord central bot plan added to `docs/thoughts.md` - channel structure, slash commands, automated send schedule and third-party bot policy for Phase 5

---

## [v2.12.0] - 2026-06-20

### Added

- Dashboard: Markdown editor with Write/Preview toggle rolled out to all long-form text fields - Faith notes, Study notes, Goals description, Contacts notes, Wishlist notes, Inventory notes, University notes (editor and display)
- Dashboard: file manager now supports folder and subfolder creation; folders persist in localStorage even before files are uploaded; move-to-folder shows a dropdown of all existing folders
- Dashboard: file manager upload limit raised from 50 MB to 500 MB per file; Supabase bucket limit updated to match

### Fixed

- Dashboard: empty trash button on `/dashboard/trash` now shows a confirmation dialog before permanently deleting all items
- Dashboard: Supabase Storage `user-files` bucket created (was missing, causing "Bucket not found" error); RLS policies corrected to `allow all` matching all other dashboard tables
- Dashboard: `calendar_events` and `user_files` table RLS policies fixed from `auth.uid() = user_id` to `allow all` so server-side inserts work with the anon key

---

## [v2.11.0] - 2026-06-20

### Added

- Dashboard: file manager at `/dashboard/files` - upload, rename, move between folders, soft delete, signed download; backed by Supabase Storage and `user_files` table (migration 035)
- Dashboard: calendar custom events - create, edit and delete individual events (not just iCal feeds); FAB and slot-click to open form; detail sheet with edit/delete for custom events; `calendar_events` table (migration 034)
- Dashboard: timetable redesigned with Day/Week/Month/Year view switcher; week grid with hour rows; week navigation; custom event creation (meetings, society events etc) merged with iCal feed
- Dashboard: full-text search (`Cmd+K`) now queries Supabase with 300ms debounce across goals, notes, diary, applications, contacts, habits and streaks
- Dashboard: application analytics added as an inline tab on the Applications page, filtered to the current type tab (Internships, Graduate Schemes etc); combined all-types analytics at `/dashboard/analytics/applications`
- Dashboard: routine iCal feed at `/api/routine-ical` - public subscribable `.ics` with RRULE weekly recurring events for Mon-Fri and weekend schedules
- Dashboard: Files link added to sidebar Personal group

### Changed

- `/now` and `/lab`: Spotify widget now detects song changes within 5 seconds - dedicated fast SSE channel polls Spotify every 5s; full device stream remains at 60s
- `/lab`: Spotify visualiser bars reverted to BAR_H=80 VH=110; hard cap prevents bars touching the sine wave; gradient strengthened (30% opacity at base to 100% at top); peak caps now use foreground colour so they are visible in dark mode
- `/lab`: Top Picks reordered - track/artist list shown first, bar charts below; track bars now show real track duration (longest = 100%); artist bars show real follower counts; each chart has a description label; genre descriptions added
- `/lab`: Spotify top-picks API now batch-fetches artist follower counts and genres from `/v1/artists` so genres populate for mainstream artists
- Dashboard: application analytics sidebar entry links to `/dashboard/analytics/applications` (combined view); per-type analytics accessible via the inline tab on the Applications page
- `/colophon`: Spotify entry updated to describe the dual SSE channels (5s Spotify / 60s all-devices)

### Fixed

- Dashboard: calendar scroll container height raised from 60vh to 75vh so 23:00+ events are no longer clipped at the bottom of the week view

---

## [v2.10.0] - 2026-06-19

### Added

- `/lab`: Spotify top picks panel: tracks and artists tabs now show a ranked popularity bar chart (one coloured bar per entry) instead of image mosaics; genre tab shows bar chart aggregated from all top-20 artists with coloured bars and pill tags; audio stat pills (energy, mood, tempo, danceability) retained
- `/lab`: section order updated to GitHub stats, WakaTime, PCB viewer, gaming panel, Spotify analytics
- `/now` Spotify visualiser: bar height increased, peak caps added at the top of each bar - caps darken on beat and scale with loudness so loud peaks are visibly more intense; beat detection now uses 250ms progress ticks for tighter sync; audio analysis fetches all artist genres (was limited to 2 per artist)
- Dashboard search (`Cmd+K`): query text is highlighted in all results - matching substring shown with a primary-colour highlight so matching portions stand out
- University timetable: each event card now has attendance buttons (Present / Late / Absent) and an expandable notes field; both are persisted in localStorage per event and date
- Calendar: per-feed visibility toggle in the feed legend - click any feed pill to hide all its events; the pill shows strikethrough and an outlined dot while hidden; event count updates in real time
- Calendar: free colour picker (`<input type="color">`) alongside the preset swatches when adding or editing an iCal feed, in habits, and in streaks - any hex colour can now be chosen

### Changed

- Dashboard sidebar restructured into collapsible groups (Daily, Wellbeing, Personal, Belongings, Analytics) with chevron arrows; collapse state persisted per group in localStorage; active groups stay open automatically
- Spotify top-picks API now returns all artist genres (previously capped at 2 per artist) and fetches the top 20 artists (was 15); ISR cache removed so genre data is always fresh

### Fixed

- Edit controls added to Habits and Streaks (pencil icon opens pre-filled dialog with name, description and colour swatch picker) and Body Metrics (hover reveals pencil alongside delete)
- `updateHabit` and `updateBodyMetric` server actions added to `app/dashboard/actions.ts`
- `SpotifyBars`: `progressSetAtRef` initialised to `0` instead of `performance.now()` at render time to satisfy the `react-hooks/purity` ESLint rule that was failing CI

---

## [Unreleased - previous]

### Added

- `/consumed/music/[slug]`: individual artist pages - each music entry in the consumed list now has its own page with full details, tracklist, and related context, following the existing `/consumed/[category]/[slug]` pattern
- `/notes/prosthetics-health-tech`: long-form research note on prosthetics and health technology
- `/notes/world-cup-ai-predictor`: long-form research note on the World Cup AI predictor project
- `/lab`: PCB viewer upgraded - 3D Proteus render as the default front face, real board photographs in a lightbox gallery with zoom
- `/lab`: Spotify album art bars - gradient bars (light base to dark peak) use album art colours; sine wave restored below the bars
- `/now` and live status cards: Spotify section redesigned - album artwork now spins as a disc while playing, album art colour bleeds into the card background as a tint, animated 48-bar equaliser and sine wave embedded directly inside the card. Bars pulse at the track's BPM and use the actual `energy` value from Spotify's audio features so a high-energy track produces tall fast bars and a slow mellow track produces low slow ones. Album art colours show through the bars. Paused/stopped state gracefully idles to near-flat
- `/lab`: top picks panel - ranked list of your top 20 tracks and top 15 artists from the past 4 weeks (Spotify `short_term` range) with popularity bars. Tracks view includes an energy vs mood scatter chart (hover a dot for track and artist name); quadrant corners labelled dark / happy / hype / chill
- `/lab`: gaming panel - live PS5 and PC status side by side; shows current or last game with cover art, online badge and last-seen time; PC card adds CPU and GPU usage bars when online
- `/lab`: WakaTime coding heatmap and hour-of-day bar chart now appear side by side on the same row instead of stacked
- `/colophon`: updated `/lab` entry to describe the top picks panel (Spotify energy-vs-mood scatter), gaming panel and the Spotify visualiser now embedded in the live card on `/now`

- `/lab`: WakaTime coding dashboard ("In the code") with period selector (24h/7d/30d/90d/1y/all), 4 stat cards (total time, daily avg, active days, best day), daily trend line chart, 7x24 interactive coding heatmap, language and project progress bars, language pie chart, editor pie chart, weekday bar chart (weekends highlighted), hour-of-day bar chart - all with hover tooltips
- `/lab`: 20 new terminal commands: `stats`, `streak`, `today`, `languages`, `vscode`, `os` (live WakaTime data), `posts` (most-read blog and TIL from DB), `grade`, `uptime`, `now`, `mottos`, `hire`, `cv`, `decrypt`, `matrix`, `make`, `whoami` (updated), `approach` (updated). Commands `hack`, `coffee`, `decrypt`, `matrix`, `make` now play out line by line with real delays rather than appearing all at once
- `/lab`: `link` line type in the terminal - URLs render as clickable anchors in primary colour (used in `now` for Phaemos GitHub and `grade` for the Aston course page)
- `/lab`: under construction banner updated to reflect terminal is fully operational
- `components/shared/TypingMotto.tsx`: typing animation component that types out a bash-style command character by character, pauses, then loops. Respects `prefers-reduced-motion`
- `app/api/top-content/route.ts`: public endpoint returning top 5 most-read blog posts and top 5 most-read TIL entries by unique full-read count from `blog_read_events`
- `components/shared/GitHubStats.tsx`: `$ git push origin career --force` typing motto at the bottom
- `components/lab/WakatimeStats.tsx`: `$ rm -rf impostor_syndrome && touch grass` typing motto at the bottom
- `components/shared/ApproachAnimation.tsx`: `// $ nohup hustle && disown impostor_syndrome` woven as the final line of the code animation, rendered in primary blue to stand out
- Terminal boot sequence: `$ while true; do learn && build && ship; done` system line
- Terminal `status` command: `$ ssh internship@2026 -i private_key.pem` closing line
- `docs/thoughts.md`: first-person notes on future ideas including /stats page, terminal email gate, lab experiments, AI features and more

- Settings: "Clear all applications" now requires typing "clear applications" in a confirmation
  dialog before executing; the action soft-deletes via Trash (recoverable) rather than
  hard-deleting directly (closes #376)
- Applications: archive/reopen controls - each row in the table now has an Archive button; archived entries are hidden from the default view, Kanban, Analytics and the funnel. A filter-bar toggle switches to the archived-only view where each entry has a Reopen button. New `archiveApplication`/`reopenApplication` server actions with `application.archive`/`application.reopen` activity log events (closes #375)
- `components/analytics/` - shared analytics framework skeleton: `AnalyticsPeriodProvider`/`PeriodSelector` (24h/7d/30d/90d/1y/all), `StatCard`, `LineChart`/`BarChart`/`PieChart`, `TrendIndicator`, `ProgressBar`. Not yet wired into any section - Coding/Blog/Modules/Applications migrate onto it next (closes #367)
- `lib/streaks.ts` (`useStreak`) and `lib/goal-progress.ts` (`useGoalProgress`) - generalise the current/longest streak maths from `StreaksClient.tsx` and the goal status taxonomy from `GoalsClient.tsx` so Study/Faith reuse them instead of reinventing (closes #368)
- `components/ui/confirm-dialog.tsx` (`useConfirmDialog`) - shared confirmation dialog with a typed-confirmation mode for the highest-blast-radius actions, replacing the plan for inconsistent native `confirm()`/`window.confirm()` calls. Not yet wired into Settings/OpenSource - that rollout is Phase 1/4 (closes #369)

### Fixed

- Applications: added `lib/application-status.ts` as the single source of truth for status normalisation, funnel classification and pipeline state, replacing three drifted copies of `normaliseStatus()` in Kanban, Analytics and the Table view (closes #365, closes #374)
- Applications Kanban: scraped/untouched job entries no longer leak onto the board - the active-tracking filter now runs against the raw status before normalisation instead of after, which is what let the check silently stop matching anything
- Applications funnel chart: Assessment and Interview stages no longer double-count the same entries
- Dashboard `verify-pin` route had no brute-force protection - added a 5 attempts per 15 minutes per IP rate limit, same Upstash pattern as `/api/contact` (closes #373)

### Removed

- `delete_stale_entries()` in the job scraper was dead code, defined but never called - removed entirely so it cannot be wired back in by accident (closes #370)

### Changed

- `job-scraper.py` docstring corrected from "every 3 days" to "every 2 days" to match the actual cron schedule (closes #371)
- Added a missing index on `activity_log.created_at` ahead of the table growing large enough for it to matter (closes #372)

---

## [v2.9.0] - 2026-06-18

### Added

- `/respub` - Academic profile page: research interests, external links (ORCID, Google Scholar, ResearchGate, Academia.edu) and publications list
- `/til` - Today I Learned: 63 short-form entries across 21 categories (C, Embedded, Git, CSS, Next.js, TypeScript, Algorithms, Security, Hardware, AI/ML, Python, Linux, Architecture, Database, Web, Music, Fitness, Cooking, Faith, Life, Culture); search, category filter and pagination (10 per page); reading time per entry; RSS feed at `/til/feed.xml`
- `/til/[slug]` - Individual TIL entry pages with full content blocks, ShareButton, optional ToC sidebar and prev/next navigation
- `/tags` - Tag cloud aggregating tags from blog, TIL, projects, publications and consumed content; client-side search
- `/tags/[tag]` - Content filtered by a single tag across all content types in grouped sections (Blog Posts, TIL Entries, Projects, Publications, Consumed)
- `/search` - Unified full-text search across blog, TIL, projects, publications, notes, newsletter and consumed; results ranked by relevance score; debounced input
- `/consumed/[category]/[slug]` - 216 individual consumed item detail pages; embedded YouTube player for videos, Spotify embed for podcasts, prose notes for books; breadcrumb navigation
- `/newsletter/feed.xml` - Newsletter RSS feed with HTML browser view (styled issue cards) and `?raw` for raw XML
- `/blog/feed.xml` - Blog RSS feed at its canonical URL; old `/feed.xml` permanently redirects here
- FeaturedTIL section on homepage: 3 most recent published TIL entries between Featured Blog Posts and Newsletter sections; each card links to `/til/[slug]`
- Root-level error boundary (`app/error.tsx`): calm card with "Something went wrong", "Try again" reset button and "Go home" link; distinct from the terminal-style 404
- Custom 404 page: interactive terminal with boot animation, clickable shortcut links (projects, blog, notes, lab) and a live command input; footer links for lost visitors and for reporting missing pages
- Giscus comment system on all blog posts: GitHub Discussions-powered; dark/light theme matches site; gated behind `NEXT_PUBLIC_GISCUS_ENABLED` env var
- Blog reactions: GitHub-standard 8 emoji (thumbs-up, thumbs-down, laugh, hooray, confused, heart, rocket, eyes) plus extended picker (28 additional reactions via SmilePlus); counts shown inline; stored per-post per-user
- Blog cover images added to all 20 published posts; RSS feeds include `<enclosure>` thumbnails for feed reader thumbnail previews
- Tags link in footer secondary nav row; Tags and Search added to CommandMenu (Cmd+K)
- Secondary footer nav row added: Now, Notes, Lab, Uses, Colophon, Changelog
- Notes page: TIL callout card (Lightbulb icon) linking to `/til`
- Lab terminal new commands: `til` (5 most recent entries), `respub` (publications list), `rss` (all three feed URLs), `blogfeed`, `tilfeed`, `newsletterfeed` (open feed in new tab), `playing` (async: Spotify now playing), `lastgame` (async: PS5 current or last game), `pushed` (async: last repo pushed)
- Newsletter "While you wait" cross-links: TIL and Research and publications pills added
- Dual PWA manifests: separate manifest for the public portfolio and for the dashboard with distinct icons, names and start URLs
- Links page: restructured from 4 to 10 sections (Professional, Writing, Academic, Code, Competitive Programming, Hackathons, Social, Content, Support, Other); 12 new platforms added (HackerRank, CodeChef, Hackster, Stack Overflow, Bitbucket, AtCoder, Kaggle, TryHackMe, Devfolio, ResearchGate, Wellfound, dev.to); quick social icon row added under bio; stagger entrance animations and card hover effects
- Stack Overflow added to /links and the icon row
- Projects pagination: 9 per page with prev/next navigation; AI/ML added as a project category
- dotfiles project added to /projects: full detail page with overview, 8 highlights, tech stack and 2-image gallery; covers 59 topic files, cross-platform aliases, accessibility colour scheme, 3-platform git mirroring and Starship integration
- /uses Terminal and shell section: dotfiles entry and Starship entry with shared config explanation
- Skills page Core Tools: Starship added
- Project detail page: inline code rendering via backtick syntax so command names render as styled `code` elements
- 14 new blog posts scheduled to publish automatically from June through September 2026 across article, notes, journal and research types; all posts include references and inline links
- New blog post "How to Contribute to Open Source: A Practical Guide" published live (2026-06-13, 14-minute read)
- Spotify embed support in blog renderer: new `spotify` ContentBlock type with episode iframe and optional caption
- Inline link rendering in blog renderer: `[text](url)` syntax in p, ul and ol blocks renders as clickable links; external URLs open in new tab with noopener noreferrer
- All 34 blog posts enriched with references sections (6-13 items each) and inline links for tools and projects mentioned

### Changed

- Blog RSS canonical URL moved from `/feed.xml` to `/blog/feed.xml`; old URL serves a 301 redirect with query-param forwarding
- Projects: phaemos recategorised to IoT; cad-portfolio and git-unlocked recategorised to Academic; filter bar gains IoT and Academic buttons
- Blog inline links now styled `text-primary` (blue) across blog slug, colophon, consumed, now and uses pages
- `/respub` academic profile links (email, ORCID, Google Scholar, ResearchGate, LinkedIn): label text in `text-primary` blue; icons remain muted
- `ps5:last-game` Redis key: only written when a game is actively running so sitting at the home screen no longer overwrites the last played title
- All `hover:scale` and `hover:-translate-y` CSS transforms scoped to `sm:` breakpoint to prevent GPU compositing layer exhaustion on iOS Safari
- Social icons on hero and contact page standardised to react-icons/fa6 (GitHub and LinkedIn)
- Consumed overview page: interactive Year and Month filter labels added; Category label above tabs; all category subpages gain Year filter
- Newsletter issues API now filters out scheduled posts with a future `publish_date` before returning the response

### Fixed

- Mobile Safari and Chrome renderer crash ("A problem repeatedly occurred") on `/` and `/projects`: a single oversized project thumbnail was decoding to over 500MB in browser memory; hover transforms also scoped to `sm:` and the header's blur effect scoped to desktop so no GPU layers are created on touch devices
- PS5 "last played" game now persists correctly when offline
- PS5 status no longer shows a stale "last seen" time while actively online
- Giscus comment iframe not loading: `giscus.app` added to CSP `frame-src` allowlist
- RSS `?raw` query param now serves `Content-Type: application/xml` for Chrome native XML viewer
- Newsletter page showing scheduled issues before their publish date
- `ws` package CVE (CVSS 7.5 - memory exhaustion DoS) resolved via `>=8.21.0` override
- First project card on `/projects` and first post cover on `/blog` now load eagerly instead of lazily, fixing a slower Largest Contentful Paint for the above-the-fold image on each page
- `/lab` under-construction GIF reduced from 1.6MB to 833KB via recompression with no visible quality loss; also now loads eagerly to fix a Largest Contentful Paint warning
- `/lab` terminal maximise button left a 31px gap below the header instead of sitting flush against it

### Removed

- BuyMeACoffee from hero and contact social link rows (remains in /links Support section and blog AuthorCard)
- BuyMeACoffee button from the hero and contact pages (remains in /links Support section and blog AuthorCard)

---

## [v2.8.0] - 2026-05-30

### Added

- Mobile banner: slim dismissible notice below the header on screens narrower than 768px suggesting the site is best viewed on a laptop or desktop; hidden via `md:hidden` so it never appears on wider screens
- git-unlocked project gallery expanded with 4 new images: 3D GitHub logo badge (card preview), Octocat with GitHub profile on laptop, Octocat and Groot figurines and close-up Octocat; card preview image updated from banner SVG to the 3D logo badge
- /now page intro now links to nownownow.com/p/n4lZ alongside the existing Derek Sivers credit so visitors can find the listed profile
- Colophon expanded: shadcn/ui and next-themes as separate entries; backend section adds Vercel, Resend, Beehiiv, GitHub Actions and Cloudflare Turnstile; design section adds GA4, share feature and responsive design note; new "Notable pages and features" section covers /lab, /blog renderer, /consumed, /changelog and OG image generation; all live status entries expanded with more detail; Vercel and Cloudflare links added to header meta
- /now page content refreshed: updated Where I am (London for summer), Studying (FPGA/VHDL, competitive programming on Neetcode/Leetcode/Codeforces, hackathons), Building (accurate Phaemos hardware detail, World Cup 2026 AI Predictor added, This site blurb updated), Thinking about (internship search, events, Sky campus mention), Outside of work (running and hiking added)

### Changed

- PS5 Cloudflare Worker cron reduced from every minute to every 2 minutes to stay within the 1,000 write/day free tier KV limit (720 writes/day vs previous 1,440); Redis TTL for ps5:status extended from 120s to 150s to keep a 30s buffer between key expiry and the next poll

### Fixed

- Header theme toggle and hamburger menu now pin correctly to the far right on small screens (phones, narrow windows, iPad split-view); replaced the three-column grid with `flex justify-between` on mobile and `md:grid md:grid-cols-[1fr_auto_1fr]` on larger screens so the controls are never left drifting toward the centre when the desktop navigation is hidden
- Mobile banner text changed from `text-muted-foreground` (grey on both modes) to `text-foreground` so it reads clearly as black on light and white on dark
- /now page header now shows "Updated live" only - removed "Last updated May 2026" which was misleading alongside a live indicator
- /notes and /privacy pages updated from "May 2026" to "June 2026"

---

## [v2.7.0] - 2026-05-29

### Added

- PS5 Busy mode: doNotDisturb PSN status treated as online; `busy` field added to Worker, API route and card
- Notes page teaser strip: slim animated live status preview on /notes linking to /now; full widget removed from notes
- Now and Lab added to main navigation; navigation centred in header using three-zone grid layout
- Contact page now shows email address below the contact form
- Footer social row reordered and simplified: All Pages, Contact, Newsletter, LinkedIn, GitHub, ORCID
- Footer newsletter signup form removed; newsletter signup remains on /blog and /newsletter
- Spotify card shows Spotify icon and external link to profile in card header
- GPC daemon fetches cover art from IGDB (Twitch API) on first game detection and caches per session; falls back to publisher CDN URLs when IGDB is not configured
- GPC daemon sends `game_image` alongside the game name; GPC card renders the cover art thumbnail next to the game name
- GPC daemon 5-tier game detection: hardcoded dict, Steam Web API, Epic Games manifests, EA App manifests and process-name IGDB fuzzy search - detects any installed game without hardcoding exe names
- FiveM added to GPC game detection
- GPC daemon cover art for GTA V, GTA VI, FC 26, FC 27, Apex Legends, Rocket League, Overwatch 2, Fortnite, Minecraft and FiveM
- PS5 Worker fetches game cover art from IGDB on each cron run; falls back to PSN `conceptIconUrl` when IGDB is not configured or the lookup fails
- PS5 card renders IGDB cover art when online; shows text-only last played game name when offline (no image)
- PS5 Worker exchanges NPSSO for a refresh token on first run and stores it in KV; subsequent runs use the refresh token so the NPSSO is only needed once per 60 days

### Changed

- Spotify icon colour changed from Spotify green to blue to match site colour theme
- GitHub strip moved above Discord card in live status widget so it is always visible
- Home removed from navigation; avatar already links to homepage
- /uses and /now text references to "notes page" corrected to "now page"
- docs/PROJECT.md updated: Cloudflare Worker section added, env vars table expanded, GPC and PS5 sections updated
- docs/LOG.md Session 5 entry added covering all changes in this release
- docs/TROUBLESHOOTING.md created with 8 common issues and fixes
- docs/verification.md updated with live status and GPC 5-tier checks
- docs/SUGGESTIONS.md updated with Steam env vars and Discussions page suggestion
- .env.example updated with IGDB and Steam env vars
- .github/SECURITY.md created

### Fixed

- feed.xml?raw no longer crashes with Cloudflare CPU timeout; returns raw XML directly instead of running regex transforms
- PS5 lastGame and lastGameImage now read from `lastKnown` instead of the live source so the last played game persists when offline
- PS5 card no longer shows online when console is off; API returns last genuine online timestamp rather than cron polling timestamp
- PS5 Worker updated to current PSN client ID and required headers; old client ID was removed by PSN and caused 400 errors
- PS5 Worker IGDB request includes `Content-Type: text/plain` header required by the Apicalypse query format; without it the API silently returned no results
- Discord activity card sorts Playing (type 0) before Watching (type 3) to match Discord display order
- Discord activity large icon shows the small icon as a bottom-right overlay
- Discord activity elapsed timestamp shows seconds in H:MM:SS / M:SS format matching Discord and updates live every second

### Security

- Force `brace-expansion` to 5.0.6 via npm overrides to resolve CVE-2026-45149 (GHSA-jxxr-4gwj-5jf2)

---

## [v2.6.0] - 2026-05-29

### Added

- 8 new published blog posts across research, blog, article and resources types:
  - "Getting Started with FPGAs" - beginner-friendly VHDL introduction with LED blink example, tool links and Wikimedia architecture diagrams
  - "Bionic Vision and Ocular Prosthetics: Where the Science Actually Stands" - retinoblastoma, Argus II, PRIMA, optogenetic therapy, engineering challenges in restoring vision
  - "TypeScript Patterns That Actually Matter in Production" - discriminated unions, satisfies, branded types, const assertions and exhaustiveness checking
  - "Why Every Software Engineer Should Understand Hardware" - opinion article on abstraction costs and debugging across layers
  - "Resources for Engineering and Technology" - curated books, courses, YouTube channels and coding tools with descriptions and links; must-watch video section; link to /consumed
  - "Security Gaps in Consumer IoT" - Mirai, KRACK, Ripple20, ETSI EN 303 645, OWASP IoT Top 10 with verified references
  - "SPI vs I2C: When to Use Which" - deep technical comparison with Wikimedia timing diagrams, clock modes, address conflicts and code examples
  - "RTOS Fundamentals" - FreeRTOS task scheduling, queues, mutexes and stack management (published then swapped to draft in favour of FPGA post)
- 3 draft posts: UART From Scratch, DMA Explained and Getting Started with FPGAs (swapped from RTOS)
- YouTube video embed support via new `video` ContentBlock type and renderer
- Motivation and scripture widgets extracted to shared `InspirationWidget` component and moved from /blog to /notes page
- `upload.wikimedia.org` added to Next.js `remotePatterns`; `dangerouslyAllowSVG` enabled for SVG diagram support
- MacBook daemon switched from WeatherAPI to Open-Meteo (ECMWF model) for better UK weather accuracy
- CoreLocationCLI GPS integration in mac-daemon.py for street-level location precision over IP geolocation
- Night emoji fix: cloudy conditions now show cloud emoji rather than moon; only clear and mainly-clear nights show moon
- PS5 live card in the status widget - online/offline, current game and last-seen time via Cloudflare Worker polling PSN every 60s
- Discord presence card in the live status widget on /now and /notes, powered by the Lanyard API; shows status dot, current rich presence activity and elapsed time
- Discord card shows all concurrent activities (Playing, Listening, Watching) in a stacked list with type labels and dividers
- External link icon on Discord card opens Discord profile in a new tab
- Live status cards widget added to /now page with pulsing blue "Updated live" indicator
- Clickable GitHub profile link in the live status GitHub strip
- Share button on /cv and /links pages
- Open Graph thumbnails on every public page via /api/og

### Changed

- "Building My Portfolio" blog post expanded with live status system section and rewritten origin story to reflect zacess.com starting point
- Phaemos blog post, project page and notes entry updated for 4-node hardware architecture (ESP32, STM32 Black Pill, Arduino Nano, Raspberry Pi Pico 2W) and full sensor list
- Resources post renamed from embedded/software engineering to engineering and technology with tools and YouTube sections
- Business analytics post type corrected from research to notes
- RSS feed channel description updated to reflect new post types

### Fixed

- Cloudy night conditions now show cloud emoji rather than moon
- SPI vs I2C and other research posts now use `ol-links` blocks with verified reference URLs
- PubMed reference IDs replaced with PubMed search URLs to avoid stale or incorrect direct links
- Broken Cloudflare Dyn, Mandiant and PSTI reference links replaced with verified alternatives
- Discord card CSP: added `api.lanyard.rest` to connect-src
- PS5 card device name and icons use foreground colour instead of blue
- PS5 card no longer shows redundant "Online"/"Offline" status line

---

## [v2.5.0] - 2026-05-28

### Added

- PS5 live card in the status widget - online/offline, current game and last-seen time via Cloudflare Worker polling PSN every 60s
- Cloudflare Worker at workers/ps5-presence replaces the Mac-based PS5 daemon for presence polling
- Inventory item detail pages at /dashboard/inventory/[category]/[id] with full field layout, warranty colour coding and edit/delete actions

### Fixed

- PS5 card device name no longer shown in blue
- Device type icons use foreground colour when online and muted when offline

---

## [v2.4.0] - 2026-05-27

### Security

- Sanitise title and description query parameters in the OG image route (truncate and strip non-ASCII)
- Add rate limiting to the newsletter subscription endpoint (3 requests per IP per hour via Upstash)
- Add Cache-Control: no-store to contact and newsletter API responses
- Add runtime input validation to all dashboard server actions
- Force `brace-expansion` to 5.0.6 via npm overrides to resolve CVE-2026-45149 (GHSA-jxxr-4gwj-5jf2)

### Changed

- README rewritten: shortened to essentials only, file structure and key dependencies moved to DOCUMENTATION.md, LinkedIn badge removed from footer
- Notes page: Business Website renamed, link corrected to zacess.com, project page now points to internal project, live site link added alongside phaemos.com link for Phaemos
- Notes page: Upcoming Projects moved above Summer Plans, Summer Plans expanded with FPGA/VHDL, competitive programming, academic prep and broader interests, "Last updated May 2026" added at bottom
- Notes page: Business Website description rewritten to reflect future business direction
- Projects: avr-zac and Phaemos marked as featured with SVG gallery images - terminal monitor, pipeline diagram and dashboard for Phaemos, chip diagram, code editor and state machine for avr-zac
- Projects: git-unlocked SVG banner added to gallery, viewBox corrected to remove transparent dead space
- Projects: NeoPixel preview image updated to neopixel-main.jpg, full image set in gallery
- Projects: Business Website renamed from "zacess.com - Interactive Terminal", description updated
- CV updated to target one page: profile rewritten, skills headings renamed (Skills (Professional and Technical), Web and Frameworks, AI/ML and Data), Jupyter Notebooks added, git-unlocked corrected to 217+ files, volunteer roles merged to one bullet each, bold key terms added, AstonCV website link updated

### Fixed

- robots.txt now explicitly disallows /dashboard for crawlers
- /all-pages keyboard shortcut now adapts to OS - shows `⌘+I` on Mac and `Ctrl+I` on Windows/Linux; symbol size increased for visibility
- `pages` command on /all-pages highlighted in primary colour and links directly to /lab

---

## [v2.3.0] - 2026-05-20

### Added

- **`/consumed` page** - monthly content log for 2026; 49 YouTube videos, 12 Spotify podcasts and 10 books organised into January to May; "All" tab shows all content grouped by month with January first; click-to-play facade on video embeds keeps the page fast with many embeds; content sorted oldest to newest by real upload date; month chips colour-coded by month; music section links to the Notes page Spotify widget
- **`/now` page** - static snapshot of what Isaac is doing in his life at this moment; sections cover location, studying, building, reading, thinking about, outside of work and listening; inspired by nownownow.com; updated manually
- **`/uses` page** - hardware, software and tools Isaac uses day to day
- **`/colophon` page** - how the site is built, the stack and decisions behind it
- **`/changelog` page** - public changelog at `/changelog`, full version history of the site from first commit
- **Dark/light mode crossfade animation** - 150ms ease transition on theme toggle instead of instant swap
- **Next and previous post navigation** - prev/next links at the bottom of every blog post
- **Blog reactions** - thumbs up, flame, lightbulb and heart reaction buttons per post, stored in Redis under `reactions:{slug}:{type}`; lucide-react icons, one click, no comments
- **Post series grouping** - `series` and `seriesPart` fields on BlogPost; SeriesBanner component on post pages; series indicator on post cards
- **Hall of Fame reframe** - personal acknowledgements (God, mum, dad) lead the page before the security researchers section
- **Command menu** - now searches projects and includes all hidden/unlisted pages in a More group
- **Gaming PC daemon** - `scripts/gpc-daemon.py` writes CPU%, GPU% (NVIDIA RTX 4060 via pynvml) and current game name to Redis keys `gpc:status` (TTL 600s) and `gpc:last-known` every 30s; detects active games by scanning Windows processes; runs via NSSM
- **Gaming PC API route** - `app/api/gpc/route.ts` reads live/last-known fallback; CPU, GPU and game fields are only returned when the daemon is live (online=true)
- **Gaming PC card wired up** - polls `/api/gpc` every 30s; shows CPU%, GPU% and current game when online; shows only last-seen when offline
- **Lenovo daemon** - `scripts/lenovo-daemon.py` writes battery, charging state and timestamp to Redis keys `lenovo:status` (TTL 600s) and `lenovo:last-known` every 30s; runs on Windows via NSSM
- **Lenovo API route** - `app/api/lenovo/route.ts` reads from Redis with live/last-known fallback, same structure as macbook route
- **Lenovo card wired up** - live battery, charging state and last-seen status in the device grid; matches MacBook card behaviour
- **Spotify device name in label** - "Currently Listening on ZACCESS-GPC" (or whichever device is active) shown above the track when playing; uses the `/me/player` endpoint instead of `/me/player/currently-playing` to access device info
- **Podcast and episode support** - Spotify card now shows podcast episodes with episode title, show name and episode artwork just like tracks; `currently_playing_type` field used to detect episodes vs tracks
- **Spotify last played** - when nothing is active the Spotify card shows the previous track or episode in a greyed-out grayscale state with a "Last Played" label instead of a blank card; stored in Redis under `spotify:last_played` with no expiry
- **Real-time Spotify progress bar** - progress bar and timestamp tick forward every second client-side using a local interval; API response snaps the position back to the true value on each poll
- **Gaming PC status card** - new compact card in the live status grid showing ZACCESS-GPC; when Spotify is actively playing on that device the track name is shown with a music icon
- **Lenovo status card** - placeholder card added alongside the Gaming PC card ready for the Windows daemon
- **RSS feed "View raw XML" button** - opens `/feed.xml?raw` which renders a syntax-highlighted dark HTML view of the XML with colour-coded tags, attributes, CDATA and processing instructions; feed readers bypassing the browser still receive raw XML
- **Scrolling marquee for long Spotify titles** - track title scrolls continuously when it overflows the card width, looping seamlessly; short titles stay static

### Changed

- **`/consumed` description** - updated to "so far this year" to better reflect ongoing additions
- **Gaming PC card** - restructured to properly show online/offline state; when offline only last-seen is displayed; GPU, CPU and current game fields are live-only and hidden when the device is not sending updates
- **Live status layout** - Time card moved to the left column and MacBook card moved to the right column in the two-column row
- **Spotify polling interval** - reduced from 30 seconds to 10 seconds so track changes and skips appear within 10 seconds without waiting for a full refresh
- **GitHub icon** - replaced deprecated `Github` with `GitBranch` from lucide-react in the last-pushed card

### Fixed

- **YouTube and Spotify embeds blocked by CSP** - added `https://www.youtube.com` and `https://open.spotify.com` to `frame-src` in `next.config.mjs`; embeds on `/consumed` were showing "content blocked" in all browsers
- **Gaming PC card CPU and GPU on one line** - combined into "CPU: x% | GPU: y%" to prevent the card expanding taller than the others in the grid
- **Stale charging state on device cards** - if a device's last update is >5 minutes old, the charging icon and "charging" label are hidden; only the last known battery percentage is shown; charging reappears within 60s once the daemon sends its next ping on wake
- **Sitemap missing pages** - `/now`, `/consumed`, `/uses`, `/changelog`, `/colophon`, `/all-pages` and `/privacy` were live but absent from `/sitemap.xml`; all seven added with correct `lastModified` dates and `changeFrequency` values so Google can index them
- **RSS feed unstyled in Chrome** - Chrome 131 dropped XSLT support so the `<?xml-stylesheet?>` reference in the feed was silently ignored and visitors saw raw black-on-white XML; `/feed.xml` now detects `Accept: text/html` and serves a styled dark HTML page with avatar favicon and tag pills directly; feed readers still receive the raw XML they expect
- **Spotify podcasts not showing in widget** - the `/v1/me/player` API call was missing `?additional_types=track,episode`; without it Spotify only returns track data and gives no response for podcast episodes; adding the parameter means episodes now appear with title, show name and artwork the same as tracks

---

## [v2.2.0] - 2026-05-18

### Added

- **Dynamic OG images** - `app/blog/[slug]/opengraph-image.tsx` and `app/projects/[slug]/opengraph-image.tsx` generate unique social preview cards per post and project using Next.js ImageResponse; blog cards show post type badge, title, description and reading time; project cards show category badge, title, description and tech stack chips
- **Article JSON-LD on blog posts** - each published blog post now injects a `BlogPosting` structured data script with headline, description, datePublished, author, URL and keywords; helps Google surface rich results in search
- **Beehiiv past issues integration** - `/api/newsletter-issues` route fetches confirmed and archived posts from Beehiiv API; `PastIssues` client component displays them on the newsletter page with Live and Archived badges; results cached in Redis for 10 minutes
- **Related posts** - "You might also like" section at the bottom of each blog post showing up to 3 posts that share tags with the current post
- **Command menu post search** - published blog post titles are now searchable in the Ctrl/Cmd+I command menu under a Posts group; Actions group moved before Posts
- **Unsubscribe notes** - one-click unsubscribe reminder added below the newsletter form, in the footer newsletter widget and in the privacy policy newsletter section
- **GitHub stats on Lab page** - new `/api/github-stats` route fetches public repos, followers and total stars from the GitHub API; `GitHubStats` component replaces LiveStatusCards on the lab page with repo stats, top languages and top repos; results cached in Redis for 10 minutes
- **RSS XSL stylesheet** - `/feed.xsl` route serves an XSL stylesheet so browsers render the RSS feed as a styled HTML page with the site favicon instead of raw XML; feed items now include author and category tags
- **`/feed.xsl`** route added to sitemap

### Changed

- **Project detail pages** - expanded `longDescription` for all ten projects with additional paragraphs covering design rationale, build process, engineering challenges and key decisions; expansions are grounded in existing data with no fabricated details
- **Sitemap `lastModified` dates** - static routes now carry real dates instead of `new Date()` so Google can prioritise re-crawling pages that have actually changed; project routes use the project's stated year; blog routes already used post dates
- **Homepage hero** - complete rewrite; removed repetition of tagline; added two-paragraph structure with contextual nav links (Projects, About, Lab terminal) that are permanently underlined; separator line added; "or just scroll for more" appended; broad language with no specific technology listed
- **Homepage** - LiveStatusCards removed from the ContactCTA section
- **Privacy policy** - intro corrected from "isaacadjei.me" to "Isaac Adjei"; analytics section no longer names specific services; contact form and newsletter sections now link to Resend and Beehiiv privacy policies respectively; cookies section expanded; rights section expanded with infringement guidance
- **Lab terminal** - input auto-focuses after the boot sequence completes so users can type immediately without clicking; terminal body now has `overscroll-contain` so page does not scroll while scrolling inside the terminal
- **Quick navigate button** - kbd elements increased from `text-[10px]` to `text-xs` with slightly more padding so the symbol is clearly readable
- **Homepage ContactCTA** - description expanded to mention collaboration ideas and general conversation alongside internship opportunities
- **RSS feed** - added `managingEditor`, `image` channel elements and `author` and `category` tags on each item
- **"My Approach" typing animation** - looping syntax-highlighted code philosophy block on the About page, typing letter by letter at 60ms per character with a 2.5s hold and clean loop; uses site colour tokens for dark and light mode
- **`approach` lab terminal command** - easter egg in the `/lab` terminal that prints the approach philosophy block in monospaced output
- **RSS feed** - `/feed.xml` route handler generates a standard RSS 2.0 feed of all published blog posts; `<link rel="alternate">` added to the site `<head>` for browser auto-detection; RSS icon added to the blog page header
- **Privacy Policy page** - `/privacy` with original content covering Vercel Analytics, Google Analytics, contact form, Beehiiv newsletter, intellectual property, disclaimer and cookie usage; linked from the footer
- **Journey post acknowledgements** - dedicated acknowledgements section added as the first content block on the Journey blog post, rendered in primary blue; covers God, late father, mum and siblings
- **Journey card pinned styling** - Journey post card on the blog listing page has a blue border, subtle blue background tint and a "Pinned" badge to distinguish it from other posts
- **About page** - bio condensed from seven paragraphs to five; awards woven in contextually rather than leading; Adisadel roles corrected; father reference corrected from present to past tense throughout; `space-y-20` reduced to `space-y-12`
- **About page** - Aston Ghana Society and Aston Gaming Society commented out of `data/societies.ts`; IET, ESOC and ACS descriptions updated
- **Blog page** - Journey post re-pinned to top; date corrected to June 2024; all other posts sort by date descending; description updated to include "tech write-ups"; RSS icon made blue and larger
- **Navigation** - active nav link renders in primary blue with a thin underline indicator; mobile nav active state updated to primary blue
- **Newsletter page** - "See my notes" cross-link icon changed from Zap to Book
- **Notes page** - zaccess.com portfolio project entry updated with correct project link and GitHub repo
- **Prosthetics research page** - four Wikipedia references replaced with peer-reviewed PMC papers and NHS official sources
- **Privacy Policy** - expanded to include intellectual property, use of content, disclaimer and changes-to-policy sections; contact page linked for concerns
- **Contact page** - description expanded to include suggestions and feedback alongside professional opportunities
- **WORKFLOW.md** - updated to require a CHANGELOG entry before every commit

### Fixed

- **Noindex on OG/Twitter image routes** - added `X-Robots-Tag: noindex` headers in `next.config.mjs` for `/opengraph-image`, `/twitter-image` and all nested variants so Google stops treating these internal image generation endpoints as content pages
- **Sitemap** - removed `/privacy` from sitemap; it carries `noindex` so including it sent conflicting signals to Google Search Console
- **`ApproachAnimation`** - container now has a fixed height (`h-[240px]`) so the box no longer expands line by line as the code types in; uses `overflow-y-hidden` to clip content to the reserved space
- **`app/layout.tsx`** - JSON-LD schema `<script>` moved from `<body>` to `<head>` to resolve React console warning
- **`app/lab/page.tsx`** - `suppressHydrationWarning` added to `modLabel` kbd element to resolve hydration mismatch between server and client OS detection
- **`ApproachAnimation`** - typing loop rewritten using refs instead of mutable closure variables; fixes last character of each line being dropped due to React batching; rendering switched from `<pre>` to `w-max` div to prevent overflow clipping
- `scripts/mac-daemon.py` daemon interval reduced from 120s to 30s for more accurate live status
- `scripts/mac-daemon.py` now writes to a second `macbook:last-known` Redis key (no expiry) alongside `macbook:status` (EX 600) so device name, battery and last-seen timestamp persist after the 10-minute TTL expires
- `/api/macbook` falls back to `macbook:last-known` when the live key has expired, so the MacBook card always shows the device name, last battery percent and "last seen X ago" instead of going blank
- `scripts/mac-daemon.py` Upstash REST pipeline call corrected to use the proper body format; previous call stored the raw array string instead of the JSON object, causing `/api/macbook` to return all-null values

---

## [v2.1.0] - 2026-05-15

### Added

- **Live status widget** - iOS-style cards on homepage, /notes and /lab showing Spotify now playing (with album art and progress bar), London time (always Europe/London), MacBook battery percentage and charging state, GitHub last push and online/away indicator
- `/api/spotify` - Spotify now-playing API route with access token refresh via Upstash Redis cache
- `/api/macbook` - reads battery status written by the Mac daemon from Upstash Redis
- `/api/github-activity` - fetches last public push event from GitHub API, cached in Redis for 5 minutes
- `scripts/mac-daemon.py` - Python daemon that writes battery percentage, charging state, device name and timestamp to Upstash Redis every 120 seconds; safe (read-only syscalls, 0% CPU, no elevated privileges)
- `scripts/spotify-auth.mjs` - one-time OAuth helper to exchange a Spotify authorisation code for a refresh token
- `scripts/README.md` - full setup guide for mac-daemon including launchd plist for auto-start on login
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` added to `.env.example`
- **Reading progress bar** - 3px primary-colour bar fixed at the top of the viewport on all blog post pages, fills as you scroll
- **Copy button on code blocks** - hover reveals a Copy/Copied button on every code block in blog posts
- **Table of contents** - auto-generated sticky sidebar on xl screens for blog posts with 3+ headings, highlights active section via IntersectionObserver
- **Custom 404 page** - terminal-style animated not-found page with boot sequence, red error line and command links back to main pages
- `/notes/world-cup-ai-predictor` detail page - full project plan with data sources, ML approach, tech stack and timeline
- `/notes/prosthetics-health-tech` detail page - personal research page on ocular prosthetics and bio-integrated electronics with verified references
- AstonCV blog post (`astoncv-full-stack-cv-database`) covering all four versions from CHANGELOG
- Lab terminal and notes pages now use iOS-style LiveStatusCards instead of compact LiveStatus strip
- Online/away indicator derived from MacBook daemon heartbeat freshness (green pulse if last seen under 5 minutes, grey otherwise)

### Changed

- Journey blog post title changed from "From Adisadel to Aston: My Journey in Engineering" to "My Journey So Far"
- AVR blog post description and content updated to reflect ongoing status with a note at the end of the post
- Building My Portfolio blog post expanded with full tech stack details (React, TypeScript, Tailwind CSS, Node.js, Vercel, GA4, Beehiiv, Resend, Turnstile, Upstash, GitHub Actions)
- Notes page: all three ongoing project titles now link to their project page and/or GitHub repo; avr-zac has Ongoing badge
- Notes page: "Future Project Ideas" renamed to "Upcoming Project Ideas"
- Notes page: inline newsletter removed; footer newsletter restored on notes
- Blog page: terminal lab link moved above newsletter signup
- Spotify API updated to return `progress_ms`, `duration_ms` and `paused` state separately from `playing`
- MacBook API and daemon updated to include device name from `socket.gethostname()`
- Newsletter link updated sitewide from `newsletter.isaacadjei.me` to `isaacadjei.me/newsletter` (in `data/links.ts`, `data/social.ts` and footer)
- Newsletter page fully rewritten with topic cards, cross-links to blog and notes and "Read past issues on Beehiiv" link
- Ctrl/Cmd+T shortcut for Lab terminal changed to Ctrl/Cmd+J to avoid browser new-tab conflict
- Blog post page widened to `xl:max-w-5xl` on extra-large screens to accommodate TOC sidebar
- Sitemap updated with `/notes/world-cup-ai-predictor` and `/notes/prosthetics-health-tech`

### Fixed

- All em dashes and en dashes removed sitewide from content, comments and documentation
- Oxford commas removed from all content
- Footer newsletter now shows on /notes and /lab; hidden only on /blog and /newsletter
- `isaacadjei.me` text link removed from bottom of /links page
- `astoncv/` folder deleted from the working tree (was a gitignored local clone, no longer needed)
- `.gitignore` updated to exclude `astoncv/` permanently

---

## [v2.0.0] - 2026-05-14

### Added

- Full blog system with 11 published posts: personal journey, two-stage audio amplifier full technical report with 20 images, AVR bare metal, NeoPixel LED Cube, Phaemos, git-unlocked, British Airways, Yunex Traffic, Business Analytics, Building My Portfolio and Week 1 at Aston
- Blog post content types: blog, journal, research, report, article, notes, resources
- Image block type in ContentBlock union with figure and caption rendering
- ol-links block type for numbered reference lists with clickable URLs
- Blog listing page with type filter tabs and date-sorted posts (journey pinned first, Week 1 pinned last)
- Blog-to-project cross-linking: post detail pages show View Project and GitHub links via projectSlug field
- Newsletter system via Beehiiv API: /api/newsletter route, NewsletterForm component with compact and default variants
- /newsletter dedicated page
- FooterNewsletter client component hidden on blog, lab, newsletter and notes pages
- /notes page: public notebook with current builds, summer plans and future project ideas
- /lab page: interactive terminal with 30+ commands, amber/cyan colour scheme and full ARIA accessibility
- /security-policy page: responsible disclosure policy with contact email and response timeline
- /hall-of-fame page: security researcher acknowledgements
- Lab terminal cmd-list line type: command name in green, description in muted grey
- Lab terminal kv line type: cyan keys and amber values for key-value outputs (whoami, stack, version, date, time)
- Lab terminal success line type in green
- Notes and Blog pages: royal blue terminal card with blinking cursor linking to /lab
- Notes added to site navigation between Blog and Contact
- Notes (N) and Lab (T) keyboard shortcuts added to command menu; Links moved to L
- BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID added to .env.example and README
- blog-extract and blog-extract-my-testimony-and-journey added to .gitignore and deleted
- Audio amplifier blog report with 20 images in public/images/blog/audio-amplifier/
- Clean schematic image added to audio amplifier blog report and project gallery
- Ongoing badge for Phaemos and avr-zac on project cards and detail pages
- Causes section on About page with 9 causes including Education, Health, Faith and Open Source
- Zaccess accessibility tool mentioned in About page and journey blog post
- projectSlug optional field on BlogPost interface for project cross-linking
- ongoing optional field on Project interface

### Changed

- Blog page: terminal replaced with proper post grid with type filters
- Lab page: terminal moved here with 30+ commands and upgraded colour scheme
- Blog post detail: shows linked project page and GitHub button when projectSlug is set
- Lab terminal maximised mode: now starts below nav header so nav remains visible
- Lab terminal: preventScroll on focus to stop page scrolling when typing
- Lab terminal: 'help' highlighted in green bold in boot message
- About page intro: expanded with retinoblastoma, father as mechanical and refrigeration engineer, Adisadel leadership roles, Zaccess, British Airways and Yunex Traffic
- About page Adisadel: corrected to core subjects only and Athletics removed
- About page: Stanmore award now shows Jun 2024 date
- About page: leadership roles corrected to Dispensary Prefect, House Secretary and VP APOSA
- Experience: McDonald's entry removed
- Projects: git-unlocked and Phaemos moved after CAD portfolio with avr-zac last
- Projects: avr-zac marked ongoing with date 2026 - Present
- Projects: Phaemos marked ongoing with date 2025 - Present
- Skills: WSL2 renamed to Linux
- Links page: Newsletter added after Email entry
- Social links: Newsletter added between Email and ORCID with Newspaper icon
- Week 1 at Aston: content cleared to placeholder, tags corrected from EEE to EECS
- CV page title changed from "CV | Isaac Adjei" to "CV" to fix double name in browser tab
- tsconfig.json: blog-extract excluded from TypeScript compilation

### Fixed

- Blog post 404s: params now awaited as Promise in Next.js 15 dynamic route pages
- Lab terminal crash on boot: BOOT sequence captures line value before incrementing index
- Security policy and hall-of-fame pages resolve the 404s reported by Google Search Console

### Security

- /security-policy page published with responsible disclosure contact and response timeline
- /hall-of-fame page published for acknowledged security researchers
- security.txt Cloudflare references now resolve correctly instead of returning 404

---

## [v1.1.0] - 2026-05-11

### Added

- avr-zac project: ATmega644P bare metal C development with 7 progressive learning projects, nine-mode state machine and comprehensive documentation
- PHAEMOS Smart Maintenance Platform added to featured projects
- Two-Stage Audio Amplifier: GitHub repository link added
- ORCID profile link added to footer social links (between Email and LinkedIn)
- ORCID and Linktree added to /links Professional section
- Cybersecurity project category added to project filter
- Platforms & Operating Systems skills category (Windows, macOS, Ubuntu, WSL2)
- Microchip Studio added to Embedded & Hardware skills with local logo asset
- PlatformIO added to Embedded & Hardware skills
- public/.well-known/security.txt created (Contact, Expires, Preferred-Languages)
- Per-page canonical tags added to all routes (root-level canonical was incorrectly pointing all pages to the homepage)
- Layout files added for client component pages (skills, blog, links) to enable per-page canonical metadata
- repo-extract excluded from both .gitignore and TypeScript compilation

### Changed

- Projects reordered by relevance and completion: audio-amplifier, led-cube, astoncv, git-unlocked, phaemos first
- Footer Links entry URL updated from linktr.ee to isaacadjei.me/links
- avr-zac set to non-featured and moved to last position (ongoing project)
- AstonCV demo link updated to Aston University server URL
- More Projects text on /projects page now links to both GitHub and GitHub Projects
- Steam icon fixed (was using an expiring Wikipedia thumbnail path, now uses simpleicons)
- Root-level alternates canonical removed from layout.tsx; per-page canonicals used instead

### Fixed

- GitHub username corrected from zaccesss (4 s) to zaccesss (3 s) across all data files, layout and README

---

## [2026-05-06]

### Changed

- `.github/workflows/automerge-dependabot.yml` updated so auto-merge runs for all pull requests and enables merge when either the PR author is `dependabot[bot]` or the PR has the `automerge` label
- Canonical host handling consolidated to avoid split redirect ownership between app and edge layers

### Fixed

- `next.config.mjs`: removed host-based redirect rule that caused `ERR_TOO_MANY_REDIRECTS` in production when combined with edge-level domain redirects
- `app/share/page.tsx`: normalised metadata/share URLs to the canonical non-`www` host
- `components/providers/ThemeProvider.tsx`: restored `next-themes` typing compatibility using `React.ComponentProps<typeof NextThemesProvider>`

### Infrastructure

- Added release tag `v1.0.1` and published GitHub release "v1.0.1 - Redirect and Workflow Hotfixes"

---

## [2026-05-02c]

### Added

- Upstash Redis sliding-window rate limiter on `/api/contact` (3 requests per 10 minutes per IP) - replaces the previous in-memory Map which reset on every cold start
- `app/sitemap.ts` - generates `/sitemap.xml` at build time covering all 9 public routes; submitted to Google Search Console
- `.github/workflows/ci.yml` - CI pipeline: install, lint and build on every push and pull request to `main`; actions pinned to full commit SHAs
- `.github/workflows/gitleaks-scan.yml` - Gitleaks secret scanning on every push and pull request; uses direct binary install to avoid licence requirement of the action wrapper
- Schema.org `Person` JSON-LD block injected in `app/layout.tsx` for structured data
- `robots` and `alternates.canonical` metadata fields added to root layout
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables (see `.env.example`)
- Cloudflare proxying enabled on both CNAME records (was DNS only)
- Cloudflare SSL/TLS mode upgraded from Full to Full (strict)
- Cloudflare Bot Fight Mode, Client-side security and Speed optimisations enabled
- Cloudflare AI training bot blocking enabled
- SPF TXT record (`v=spf1 -all`) and DMARC TXT record (`p=reject`) added to Cloudflare DNS
- GitHub branch ruleset on `main`: PR required, linear history, force push blocked, `Lint and Build` status check required
- Dependabot alerts and security updates enabled on repository
- Repository website and topics set via GitHub API

### Changed

- `metadataBase` in `app/layout.tsx` corrected from `https://www.isaacadjei.me` to `https://isaacadjei.me` (no `www`)
- Root metadata description expanded to 164 characters for better search snippet coverage
- `next.config.mjs` CSP header: `script-src` now includes `https://challenges.cloudflare.com` so the Turnstile widget loads correctly; `X-XSS-Protection` header removed (deprecated, superseded by CSP); `images.domains` removed in favour of `remotePatterns`; AVIF and WebP image formats added
- `/api/contact` rate limiter description updated to reflect Upstash Redis backend

### Fixed

- `useModKey` hook: replaced `useEffect + setState` pattern with lazy `useState` initialiser, resolving an ESLint `react-hooks/exhaustive-deps` warning
- Cloudflare Turnstile widget was not rendering due to missing `https://challenges.cloudflare.com` in `script-src` CSP directive
- `.env.example` real credentials removed and replaced with placeholder values

---

## [2026-05-02b]

### Added

- `useModKey` hook: detects the user's OS client-side and returns the correct modifier label (`⌘` on Mac, `Ctrl` on Windows/Linux) and a `shortcut(key)` helper used everywhere
- Command menu split into two groups: Navigation (Home, About, Projects, Experience, Skills, Blog) and Actions (Contact, Links)
- All command menu shortcut labels now adapt to the user's OS
- Blog page: Scripture section below Motivation, fetches a random Bible verse from the NET Bible API, auto-refreshes every 30 minutes with a manual refresh button
- New `/api/bible-verse` route: proxies the NET Bible public API, strips HTML tags and falls back to Jeremiah 29:11 if the API is unavailable
- Visually hidden `DialogTitle` added to `CommandMenu` for screen reader accessibility

### Fixed

- Hero quick-navigate button keyboard hint now shows `⌘` on Mac and `Ctrl` on all other platforms
- Blog page footer hint (`Ctrl + I`) now also adapts to the user's OS
- Em dashes replaced with hyphens or colons in all code comments and documentation
- Oxford comma removed from README overview paragraph

---

## [2026-05-02a]

### Added

- Home link added to the desktop navigation bar (`NAV_LINKS` in `lib/constants.ts`)
- Command menu keyboard shortcuts for all pages: `⌘H/A/P/E/S/B/C/L` on Mac, `Ctrl+H/A/P/E/S/B/C/L` on Windows/Linux
- Links entry added to the command menu (was previously missing)

---

## [2026-05-02]

### Added

- NeoPixel demo video (`public/Media/neopixel-description.mp4`) shown below the LED cube project gallery
- Optional `video` field on the `Project` type so any project can display a demo video
- Beginner-style first-person comments throughout `data/skills.ts` and `app/skills/page.tsx`
- MIT licence and this changelog

### Fixed

- Five broken Wikimedia `/thumb/` icon URLs replaced with stable direct source links: Wireshark, Simulink, AMD, Obsidian and Notion
- Demo video embed given correct aspect ratio, `preload="metadata"` and a visible "Project demo" heading

### Reverted

- Tech stack category sections on the Skills page restored to always-visible: the collapsible `<details>` pattern added unnecessary friction

---

## [2026-04-28]

### Added

- Full portfolio site launched on [isaacadjei.me](https://isaacadjei.me)
- Pages: Home, About, Projects, Experience, Skills, Blog, Contact, CV, Links, Share
- Project detail pages with image gallery and lightbox for all projects
- Blog with MDX post support
- CV viewer and downloadable PDF route
- Contact form with honeypot, rate limiting and input sanitisation
- Command palette (`Cmd/Ctrl + K`) for quick navigation
- Dark/light mode toggle
- Scroll progress indicator and back-to-top button
- Animated text and section transitions via Framer Motion
- Open Graph and Twitter card metadata
- `robots.txt` for search engine indexing

### Projects included at launch

- 4x4x4 NeoPixel LED Cube (Arduino, WS2812B, embedded C++)
- Two-Stage Audio Amplifier (Proteus, KiCad, analogue design)
- Zacess Pages (static site generator)
- CNC Control System
- Goods Lift Controller
- CAD Portfolio
- AstonCV

### Fixed

- UK English prose style applied across all site content
- Vercel install conflict and lint config resolved
- Social preview canonical URLs corrected
- Git-unlocked topic file count updated

---

[v2.7.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v2.6.0...v2.7.0
[v2.6.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v2.5.0...v2.6.0
[v2.5.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v2.4.0...v2.5.0
[v2.4.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v1.1.0...v2.4.0
[v1.1.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v1.0.1...v1.1.0
