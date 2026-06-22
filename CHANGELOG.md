# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

- Dashboard: file manager at `/dashboard/files` - upload, rename, move between folders, soft delete, signed download; backed by Supabase Storage and `user_files` table (migration 034)
- Dashboard: calendar custom events - create, edit and delete individual events (not just iCal feeds); FAB and slot-click to open form; detail sheet with edit/delete for custom events; `calendar_events` table (migration 033)
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
