# Session Log

All session logs - newest first. Public-facing changes also in CHANGELOG.md.

---

## 2026-06-20 (PR #482) - Phase 4 polish: Spotify fixes, calendar, file manager, analytics, search (#461 #466 #468 #469 #475)

### Spotify song-change lag fix

- SSE stream (`/api/live-status/stream`) previously pushed all device status every 60s - song changes took up to 60s to appear in the widget
- Added a second, named `event: spotify` SSE channel inside the same stream that polls only `/api/spotify` every 5s; the full-device stream remains at 60s
- `LiveStatusCards` now registers an `addEventListener("spotify", ...)` handler alongside `onmessage` so the fast partial update is applied immediately without clearing other device state

### SpotifyBars visualiser

- Reverted BAR_H from 90 back to 80 and VH from 132 back to 110 (PR #481 squash-merge had reverted these)
- Added `MAX_BAR_H = BAR_TOP + BAR_H - WAVE_Y - 3` hard cap so bars can never touch or overlap the sine wave
- Gradient updated: 30% opacity at base, 70% at midpoint, 100% at top - more vivid, clearly visible gradient
- Peak cap dots changed from primary colour to foreground colour - visible in both light and dark mode

### SpotifyAnalytics top picks (lab page)

- `spotify-top` route now batch-fetches `/v1/artists?ids=` for accurate follower counts and genres per artist; added `duration_ms` to track objects
- Track tab: list shown first, then bar chart below with track duration as metric (longest = 100%); bar width is real data, not rank; label and description added
- Artist tab: list shown first, then bar chart below with follower count as metric (most followed = 100%); follower count shown inline; label and description added
- Genre tab: description text added explaining what bar width means; note about "genres pulled from top artists"
- Energy vs mood scatter plot retained - renders when Spotify audio features are available; hidden otherwise
- Genres now populate for mainstream artists (Drake, Eminem, Dave etc) via the batch artist fetch

### Calendar

- `maxHeight: "60vh"` changed to `"75vh"` in the scroll container so 23:00+ events are no longer clipped at the bottom

### File manager (#468)

- New route at `/dashboard/files` backed by `user_files` table (migration 034, applied) and Supabase Storage `user-files` bucket
- `FilesClient.tsx`: folder sidebar (All + per-folder), upload via drag/drop or button, inline rename, move to folder, soft delete via `moveToTrash`, download via signed URL
- REST fallback at `/api/files` (GET list, POST upload with 50 MB limit)
- Files link added to sidebar Personal group

### Calendar custom events (#469 partial)

- `calendar_events` table (migration 033, applied) with RLS
- `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` server actions
- CalendarClient: custom events merged with iCal feed events under a "Custom" pseudo-feed; FAB + slot-click opens `EventFormDialog`; `EventDetailSheet` shows full detail with edit/delete for custom events only; feed legend updated

### Timetable views (#469)

- `TimetableClient` fully rewritten: Day / Week / Month / Year view switcher; week grid with 8:00-21:00 hour rows; week navigation with auto-jump to nearest term week when current week is empty; custom events merged with iCal events (violet styling); "Add event" form calling `createCalendarEvent` with `event_type: "timetable"`

### Routine iCal feed (#475)

- New public endpoint `/api/routine-ical` returning a valid `.ics` file with RRULE-based weekly recurring events (Mon-Fri morning/evening, Friday extras, Saturday, Sunday routines); no auth required; subscribable from any calendar app

### Dashboard search (#461)

- `DashboardSearch` replaced client-side filtering with debounced 300ms `searchDashboard` server action; sections: goals, notes, diary, applications, contacts, habits, streaks; results limit 4 per section

### Application analytics (#466)

- `ApplicationsAnalytics` now accepts optional `typeFilter` prop to filter by application type
- Analytics is now an inline view tab on the Applications page (BarChart2 icon, alongside Table/Kanban/Timeline/Salary/Linear) - shows analytics filtered to the current tab type (Internships, Graduate Schemes etc)
- New route `/dashboard/analytics/applications` shows all-type combined analytics
- Sidebar "Applications" entry under Analytics now points to `/dashboard/analytics/applications`

---

## 2026-06-18 (PRs #339-350) - mobile crash root cause and CI/automerge overhaul

### Mobile crash investigation

- PR #339/#342 fixed a real but secondary issue: `ProjectCard`/`FeaturedBlogPosts` `sizes` attribute was requesting 1920w images on 3x DPR mobile instead of 750w
- PR #346 fixed a second secondary issue: Header's `backdrop-blur` + `transition-all` created an expensive GPU compositing layer recomposited on every scroll frame; scoped blur to `sm:` and up
- Crash still reproduced after both fixes - confirmed in a clean Safari private-mode test, then on three separate physical phones, ruling out device/cache as the cause
- Actual root cause (PR #349): `public/images/projects/git-unlocked/github-logo-3d.webp` was 14467x9744px (140 megapixels) - an unprocessed 3D render export. Vercel's image optimizer silently falls back to serving the original file untouched when it fails to resize a source image at this scale, confirmed by directly requesting `/_next/image?...&w=750` and getting back the full original regardless of requested width. Decoded in browser memory that's ~537MB for a single thumbnail - crashes any mobile browser on any device instantly, which is why it reproduced everywhere and was unaffected by the sizes/backdrop-blur fixes. Found by running the live site through a real browser engine and inspecting actual transferred bytes, not just the HTML
- Downscaled to 1600x1077 (13KB) via cwebp
- Added `scripts/check-image-sizes.ts`, wired into CI: fails the build if any image in `public/images` exceeds 50 megapixels

### PS5 fixes

- `ps5:last-game` write logic (added weeks ago) never actually shipped - the Cloudflare Worker's last deployment was 2026-05-29, three weeks before the fix was written. Deployed current worker source via `wrangler deploy --config ./wrangler.toml` (the bundled wrangler v3 picks the wrong project without an explicit `--config`); confirmed `lastGame` now populates correctly during a live game session
- Added `deploy-ps5-presence.yml`: auto-deploys the worker on any future push touching `workers/ps5-presence/**`, path-filtered so it costs near-zero Actions minutes
- `relativeLastSeen()` showed "last seen Xm ago" for PS5 while actively online roughly half the time - its "online now" threshold was 1 minute but the worker's cron only updates every 2 minutes. Added a per-call threshold parameter; PS5 now passes 3 minutes, Mac/Lenovo/gaming PC keep the 1 minute default (those daemons write every 30s)

### CI/automerge infrastructure (the actual story behind today's repeated friction)

- `gh pr merge --auto --delete-branch` only reliably deletes a branch when gh performs an *immediate* merge (checks already green at invocation). When checks are still pending - the common case, since the workflow fires on every push - gh just registers auto-merge intent with GitHub and exits; nothing client-side is left running to perform the deletion when the merge completes later. This is why branches sporadically went undeleted before today and consistently failed once multiple PRs were open at once (PRs #337, #343 attempted fixes that didn't address this)
- GitHub does not trigger other workflows' `push` or `pull_request` events for actions performed using a workflow's own `GITHUB_TOKEN` (anti-recursion safeguard). Confirmed via run history: every `automerge-dependabot.yml` run was `event: pull_request_target`, never `pull_request` or `push` - so event-based branch-deletion/PR-update triggers silently never fired for bot-driven merges
- Replaced event triggers with a scheduled `Repo maintenance` workflow (PR #347, corrected for cost in #348) - schedule triggers fire independently of what authored the previous event. Single job (not two), `0 */2 * * *` cron (~360 min/month) - GitHub bills per job rounded up to the nearest minute regardless of actual duration, so merging two jobs into one halves the cost
- Actual root cause of today's "needs manual approval" loop: the branch ruleset had `strict_required_status_checks_policy` enabled, requiring every PR to be up to date with main before merging. Once multiple PRs were open, each merge knocked others "behind"; the maintenance workflow pushed an `update-branch` commit authored by `github-actions[bot]` to fix that; GitHub then held the resulting CI run for manual approval because it was triggered by a bot-authored push rather than a human. Removed `strict_required_status_checks_policy` from the ruleset directly via the API (PR #350) - each PR now merges as soon as its own checks pass, matching how the repo behaved before today. The maintenance workflow no longer touches open PR branches at all, only deletes already-merged ones
- Added `CLOUDFLARE_API_TOKEN` repo secret (Edit Cloudflare Workers template, scoped to account + isaacadjei.me zone) for the new PS5 worker auto-deploy workflow

---

## 2026-06-15 to 2026-06-18 (PRs #285-337)

### Public pages and features

- `/respub`: academic profile page with research interests, publications list and external profile links (ORCID, Google Scholar, ResearchGate, Academia.edu); link label text styled `text-primary` blue
- `/til`: Today I Learned - 63 entries across 21 categories; search, category filter, pagination (10/page); reading time per entry; RSS feed at `/til/feed.xml`; individual pages at `/til/[slug]` with prev/next navigation, ShareButton and optional ToC sidebar
- `/tags`: tag cloud aggregating blog, TIL, projects, publications and consumed; client-side search; individual tag pages at `/tags/[tag]` with grouped content sections
- `/search`: unified full-text search with fieldScore/relevanceScore ranking across all content types
- `/consumed/[category]/[slug]`: 216 individual consumed item pages with YouTube embeds for videos, Spotify for podcasts, breadcrumb navigation
- `/newsletter/feed.xml` and `/blog/feed.xml`: RSS feeds with styled HTML browser view and `?raw` raw XML; old `/feed.xml` redirects to `/blog/feed.xml` with 301
- FeaturedTIL homepage section: 3 most recent TIL entries between Featured Blog Posts and Newsletter
- Custom 404 terminal page with boot animation and live command input
- Root error boundary (`app/error.tsx`) with "Try again" and "Go home" buttons
- Giscus comments on all blog posts (GitHub Discussions; gated behind `NEXT_PUBLIC_GISCUS_ENABLED`; dark/light theme)
- Blog reactions: 8 standard emoji plus SmilePlus extended picker; counts per post per user
- Blog cover images on all 20 published posts; RSS `<enclosure>` thumbnails added
- Tags and Search added to CommandMenu (Cmd+K) and footer secondary nav row
- Secondary footer nav row: Now, Notes, Lab, Uses, Colophon, Changelog
- Notes page TIL callout card
- Lab terminal new commands: til, respub, rss, blogfeed, tilfeed, newsletterfeed, playing, lastgame, pushed
- Newsletter "While you wait" cross-links to TIL and respub
- Dual PWA manifests: separate manifests for public portfolio and dashboard
- Links page restructured from 4 to 10 sections; 12 new platforms added; quick social icon row; stagger animations
- Projects pagination (9/page) and AI/ML category added
- Mobile Safari GPU crash fix: all hover transforms scoped to `sm:` breakpoint
- Social icons standardised to react-icons/fa6 for GitHub and LinkedIn

### Dashboard

- Linear two-way sync: migration 014 adds `linear_issue_id`; statuses mapped bidirectionally between Supabase and Linear
- Applications tracker new statuses: Final Round, Negotiating, Accepted, Ghosted, Withdrawn; Kanban columns updated
- Contacts tracker phone and github_url fields (migration 013)
- Trash/recycle bin with restore and 30-day auto-cleanup (migration 010)
- Activity log expanded: vault, wishlist, inventory, streaks, opensource and login events now tracked (migrations 009, 012)
- Dashboard home new stat cards
- Modules detail view: grade distribution pie chart and progress trend line chart
- Settings page: workflow status badges for WakaTime/CV/scraper; CV generation and WakaTime sync trigger buttons

### Infrastructure

- `gitleaks-scan.yml`: credential leak scanning on every push
- `update-pr-branches.yml`: auto-rebases open PRs when main changes
- `automerge-dependabot.yml` updated with `--delete-branch` flag (PR #337)
- Vault expiry check rewritten from curl to Node.js (Cloudflare was blocking curl requests)
- esbuild CVE patched via `>=0.25.2` override; ws CVE (CVSS 7.5) patched via `>=8.21.0` override
- CV workflow commits now use "Isaac Adjei" git identity

### Data

- `data/blog.ts` split into `data/blog/index.ts` + `data/blog/posts/*.ts` (38 files)
- `data/projects.ts` split into `data/projects/index.ts` + `data/projects/items/*.ts`
- New `data/til/`, `data/respub/` and `data/consumed/` sub-directories created
- `scripts/split-data.ts` one-off migration script (kept for reference)

### Migrations (001-015)

- 009: ensure activity_log table
- 010: trash table
- 011: contacts table
- 012: detail column on activity_log
- 013: phone and github_url on contacts
- 014: linear_issue_id on applications
- 015: markdown column comments

---

## 2026-06-13 (feat/cv-refresh)

Branch: `feat/cv-refresh`

### Job scraper fix

- `browser-sources` job runner changed from `ubuntu-latest` to `ubuntu-22.04` to fix
  Playwright `libasound2` installation failure on Ubuntu 24.04 (Noble)

### Blog enrichment

All 34 posts (20 published, 14 draft) enriched with references sections (6-13 items),
inline `[text](url)` links throughout body text and plain-English definitions.
Proteus vs KiCad ordering corrected; Art of Electronics URL fixed to Amazon UK.
New open-source-contributing post published live (2026-06-13).

### Blog renderer

- `spotify` ContentBlock type and renderer (episode iframe, lazy loading, optional caption)
- `renderInline()` function for `[text](url)` markdown in p/ul/ol blocks
- External links: new tab with noopener; internal: in-tab

### Dashboard Settings

- CV Generation "Regenerate" button added (fires cv-pdf.yml)
- WakaTime Sync "Sync now" button added (fires wakatime-sync.yml)
- New API routes: `/api/dashboard/trigger-cv` and `/api/dashboard/trigger-wakatime`

### Docs

- CHANGELOG.md, app/changelog/page.tsx, docs/verification.md, app/api/README.md updated

---

## 2026-06-13 (feat/job-scraper-fixes)

Branch: `feat/job-scraper-fixes`

### Blog overhaul

All changes in `data/blog.ts`.

- Date-gated publishing: `getPublishedPosts()` now filters by `p.published && p.date <= today`; posts with future dates are hidden from the listing but accessible at their direct URL
- Set all 10 scheduled draft posts to `published: true` so direct URLs are accessible for preview; date gate keeps them off the listing
- Expanded `uart-bare-metal` and `rtos-fundamentals` with deeper content (interrupt-driven receive, ring buffer ISR, baud rate accuracy, FreeRTOS heap schemes, task notifications, tickless idle)
- Added 5 new draft posts: `interrupt-driven-embedded-design`, `real-time-web-data`, `reading-datasheets`, `international-student-engineering-uk`, `javascript-event-loop`, `my-development-setup-2026`, `phaemos-engineering-decisions`, `eleven-things-learning-to-code`, `on-being-uncomfortable`
- Added 3 more posts: `writing-for-engineers`, `python-type-annotations`, `competitive-programming-start`; total scheduled drafts: 13
- Added references (ol-links) to every post that lacked them; changed types for several posts (article, notes, journal); added Jake Archibald event loop video embed to `javascript-event-loop`
- Fixed false MacBook M3 claim in dev setup post; content now verified against the /uses page
- Replaced all em dashes and en dashes with hyphens across the entire codebase

### Inventory URL field

- `app/dashboard/(protected)/inventory/InventoryCategoryClient.tsx`: added `url: string | null` to `Item` type; URL input in `ItemForm`; external link icon button on `ItemCard` when `url` is set; `handleAdd` and edit dialog include `url`
- `app/dashboard/actions.ts`: `createInventoryItem` and `updateInventoryItem` types updated to include `url`
- `sql/migrations/008_add_inventory_url.sql`: `ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS url TEXT`

### README

- Removed bottom `<div align="center">` badge links and capsule-render wave animation; last line is now plain "Built by [Isaac Adjei](https://isaacadjei.me)"
- Restored Frontend/Backend/Infrastructure icon grid tables that were accidentally removed

### Session logs

- Moved from repo root `session-logs/` to `docs/session-logs/` (matches gitignore entry `docs/session-logs/`)

### Docs updates

- `docs/DASHBOARD.md`: added inventory URL field section; updated Supabase schema reference
- `docs/verification.md`: added inventory URL check; added blog date-gate section

---

## 2026-06-05 (feat/dotfiles-project)

Branch: `feat/dotfiles-project`

### Change: dotfiles project added to the portfolio

I added my dotfiles repo as a full project entry in `data/projects.ts`. The detail page covers the 59-file modular structure, cross-platform alias consistency across macOS (zsh), Linux (bash) and Windows (PowerShell 7), the accessibility-motivated colour scheme (cyan, magenta, green, yellow chosen under deuteranopia/protanopia simulations), 3-platform git mirroring via push URLs with a pre-push hook, nvm lazy-load saving ~200ms per shell start, Starship loaded last at topic 59, ShellCheck/markdownlint CI and the 9-entry engineering journal.

Two terminal screenshots added to the project gallery: `banner.png` (welcome banner crop, 764x406) and `cmds.png` (full cmds output, 1400x823).

I also added two entries to the /uses Terminal and shell section - one for the dotfiles repo itself and one for Starship - and added Starship to the Skills page Core Tools category using the Simple Icons CDN icon (skillicons.dev does not have this icon).

I added a `renderWithCode()` helper to `ProjectDetail.tsx` so backtick-wrapped text in `longDescription` renders as styled `<code>` elements rather than plain text.

Files changed:

- `data/projects.ts`: dotfiles project entry added at end of projects array
- `app/uses/page.tsx`: dotfiles and Starship entries added to Terminal and shell section
- `data/skills.ts`: Starship added to Core Tools category
- `components/projects/ProjectDetail.tsx`: renderWithCode helper added; paragraph renderer updated to use it
- `public/images/projects/dotfiles/banner.png`: new screenshot - welcome banner crop
- `public/images/projects/dotfiles/cmds.png`: new screenshot - cmds command output

### Documentation

- `CHANGELOG.md`: Unreleased Added section updated with 4 new entries
- `app/changelog/page.tsx`: Unreleased added array updated with matching entries
- `docs/LOG.md`: this entry added

---

## 2026-05-30 (content/git-unlocked-images-newsletter - nownownow profile link)

Branch: `content/git-unlocked-images-newsletter`

### Change: nownownow.com profile linked from /now page

I added a link to my nownownow.com profile (`nownownow.com/p/n4lZ`) in the /now page intro paragraph, right after the existing Derek Sivers credit. This lets visitors find the listed profile and signals that the page is part of the nownownow movement.

I also considered adding it to the /links page but chose not to - the nownownow profile is really just a pointer back to this page, so it belongs on /now rather than alongside independent external profiles.

Files changed:

- `app/now/page.tsx`: nownownow.com/p/n4lZ linked in the intro paragraph after the Derek Sivers mention

### Documentation

- `CHANGELOG.md`: Unreleased Added section updated with nownownow link entry
- `app/changelog/page.tsx`: Unreleased added array updated with matching entry
- `docs/LOG.md`: this entry added

---

## 2026-05-29 (session 6 - fix/mobile-header-banner)

Branch: `fix/mobile-header-banner`

### Problem 1: Header controls centred instead of far right on small screens

On viewports narrower than the `md` breakpoint (768px) - phones, iPad split-view, half-width desktop windows - the theme toggle and hamburger icon were drifting toward the centre of the header instead of staying pinned far right.

Root cause: the header container used `grid-cols-[1fr_auto_1fr]` at all screen sizes. On mobile the `<Navigation>` component renders as `<nav className="hidden md:flex">` (display: none). A grid item with display:none still occupies its column in some browsers and the auto track did not collapse cleanly, shifting the third column away from the right edge.

Fix: switched the container to `flex items-center justify-between` on mobile (avatar stays left, controls stay right, hidden nav takes no space) and `md:grid md:grid-cols-[1fr_auto_1fr]` on larger screens to keep the centred nav.

Files changed:

- `components/layout/Header.tsx`: container class updated

### Problem 2: No indication to mobile visitors that the site is desktop-optimised

Added `components/layout/MobileBanner.tsx` - a slim `md:hidden` strip below the header with a monitor icon and a dismissible "This site is best experienced on a laptop or desktop" notice. Wired into `components/layout/PublicShell.tsx` between `<Header>` and `<main>`.

Files changed:

- `components/layout/MobileBanner.tsx`: new file
- `components/layout/PublicShell.tsx`: MobileBanner imported and rendered after Header

### Docs updated this session

- `CHANGELOG.md`: Unreleased section added with Added and Fixed entries
- `app/changelog/page.tsx`: Unreleased entry added at top of releases array
- `docs/LOG.md`: this entry added
- `docs/verification.md`: mobile header and banner checks added
- `DOCUMENTATION.md`: MobileBanner.tsx added to file structure and layout components list

---

## 2026-05-29 (session 5 - chore/docs-content-updates + release)

Branch: `chore/docs-content-updates`

This session completed Stage 2 (docs and content updates) and Stage 3 (v2.7.0 release and branch cleanup). PRs #241 and #242 had already merged to main before this session began.

### PR #241 changes (merged before this session)

- Navigation reordered: Home removed (avatar links to homepage), Now and Lab added, navigation centred in header using a three-zone grid layout
- Footer social row simplified: All Pages, Contact, Newsletter, LinkedIn, GitHub, ORCID - newsletter form removed from footer
- Contact page now shows email address (contact@isaacadjei.me) below the form
- Notes page: full live status widget replaced with a slim animated teaser strip linking to /now
- Spotify icon colour changed from Spotify green to blue to match site colour theme
- GitHub strip moved above Discord card in live status widget
- PS5 always-online fix: API now returns last genuine online timestamp from lastKnown rather than the cron polling time

### PR #242 changes (merged before this session)

- feed.xml?raw CPU fix: removed the buildRawHtml() function which ran six chained regex transforms over the full XML string and hit Cloudflare's CPU time limit. Now returns raw XML directly with Content-Type: application/rss+xml.
- PS5 Busy mode: doNotDisturb PSN status treated as online; busy field added to Worker, API route and LiveStatusCards.tsx card
- PS5 lastGame fix: lastGame and lastGameImage now read from lastKnown (no TTL) instead of the live source object which is null when offline
- Notes-to-now text corrections: /now page Listening section changed from "notes page" link to "above" (already on the now page); /uses page GPC and MacBook details corrected; sitemap lastModified dates updated to 2026-05-29

### Stage 2 - docs and content updates (this branch)

**Files updated:**

- `app/uses/page.tsx`: PS5 detail rewritten to mention custom OAuth v2 (no psnawp), NPSSO exchange, Cloudflare Workers KV refresh token storage and IGDB cover art; /notes removed from routing reference (only /now)
- `app/colophon/page.tsx`: PS5 daemon section rewritten from "psnawp library" to custom OAuth v2 implementation with KV token storage; GPC daemon updated to describe 5-tier detection and IGDB cover art
- `app/changelog/page.tsx`: Unreleased entries moved to v2.7.0 (2026-05-29) release block; v2.7.0 includes all changes from sessions 4 and 5
- `CHANGELOG.md`: Unreleased section replaced with v2.7.0 section; footer links updated
- `data/blog.ts`: building-my-portfolio post description updated to mention PS5 OAuth v2, 5-tier GPC daemon and IGDB cover art
- `docs/PROJECT.md`: deployment updated to mention Cloudflare Workers; env vars table expanded (IGDB, Steam, Beehiiv, GA); GPC section updated to 5-tier; PS5 offline rule updated to text-only; Cloudflare Worker section added
- `docs/LOG.md`: this entry added
- `docs/verification.md`: live status section updated with PS5 IGDB, offline text, GPC 5-tier and env var checks
- `docs/SUGGESTIONS.md`: NSSM command updated with STEAM_API_KEY and STEAM_ID; Discussions page suggestion added
- `docs/TROUBLESHOOTING.md`: new file with 8 common issues and fixes
- `.env.example`: IGDB and Steam vars added
- `.github/SECURITY.md`: new file

### Stage 3 - release

- Tagged v2.7.0 and published GitHub release
- Stale local branches cleaned up
- Memory updated to reflect v2.7.0 released

---

## 2026-05-29 (session 4 - fix/discord-activity-icon-ps5-last-game)

Branch: `fix/discord-activity-icon-ps5-last-game`

### Problems faced and fixes

**Problem 1: PSN OAuth client ID removed by Sony (400 on every authorize request)**

The old PSN client ID `09515159-7237-4370-9b4e-4f1afab1cbf2` was silently decommissioned. Discovered the replacement by inspecting the `psnawp` Python library source:
- New client ID: `09515159-7237-4370-9b40-3806e67c0891`
- New client secret: `[REDACTED - stored as Cloudflare Worker secret, never committed]`
- New redirect URI: `com.scee.psxandroid.scecompcall://redirect`
- PSN now also requires extra headers: `X-Requested-With`, `Sec-Fetch-Dest`, `Sec-Fetch-Mode`, `Sec-Fetch-Site` on the authorize request; `User-Agent` and `X-Psn-Correlation-Id` plus a `cid` body field on the token exchange.

**Problem 2: Stale NPSSO cookie**

The NPSSO was invalidated after signing out of PlayStation.com during debugging. Chrome stores it encrypted (AES-128-CBC, key from macOS Keychain) in `~/Library/Application Support/Google/Chrome/Profile 1/Cookies`. Wrote a Python script using `pycryptodome` to decrypt and extract it. Full script is in the `.claude` memory log.

Fix: `echo "npsso" | npx wrangler@3 secret put PSN_NPSSO`

**Problem 3: Wrong PSN presence API version (v1 → v2)**

Old v1 endpoint returned 400. v2 returns 200 and also includes `conceptIconUrl` for the current game. Updated endpoint:
```
GET /api/userProfile/v2/internal/users/{id}/basicPresences?type=primary&platforms=PS4,PS5,MOBILE_APP,PSPC&withOwnGameTitleInfo=true
```

**Problem 4: IGDB cover art not appearing (PS5 card showing PSN promo image)**

Root cause identified in session 4: the IGDB games API request was missing `Content-Type: text/plain`. IGDB's Apicalypse query format requires this header for the body to be parsed. Without it the API returns no results silently. Also the `catch {}` block was completely silent - added `console.log` so Cloudflare Worker logs show what happened.

Fix: added `"Content-Type": "text/plain"` header to the IGDB `/v4/games` request, added logging throughout `fetchIgdbCover`, expanded `IGDB_NAME_MAP` to cover GTA Online and GTA V/VI short names.

**Problem 5: Discord activity icons wrong**

`mp:external/` prefix maps to Discord's media CDN, `spotify:` to Spotify's CDN, and `application_id` + asset key to Discord's app-assets CDN. Fixed icon URL construction in `LiveStatusCards.tsx`.

**Problem 6: Discord timestamps showing hours without seconds**

Changed `activityElapsed()` to format as `H:MM:SS` / `M:SS`, added `activityTick` state incrementing every second so timestamps update live in the browser.

**Problem 7: PS5 last game not showing**

The `ps5:last-known` key stores the last known state even when the PS5 is offline. The API route at `/api/ps5` reads both `ps5:status` (live, 120s TTL) and `ps5:last-known` (no TTL) and exposes `lastGame` / `lastGameImage` so the card can show the last game greyed when offline.

### Files changed this session

| File | What changed |
|------|-------------|
| `workers/ps5-presence/src/index.ts` | New PSN client ID/secret/redirect, v2 presence endpoint, IGDB cover art with `Content-Type: text/plain`, logging, expanded name map, first-person comments |
| `workers/ps5-presence/wrangler.toml` | KV namespace binding `PS5_KV` added |
| `components/shared/LiveStatusCards.tsx` | Discord timestamps (seconds, live tick), Spotify icon, GPC/PS5 card layout, activity sorting |
| `scripts/gpc-daemon.py` | IGDB cover art via Twitch API, FiveM, fallback CDN URLs, game_image in payload, first-person comments |
| `scripts/spotify-auth.mjs` | First-person comments added |
| `app/api/ps5/route.ts` | Reads `game_image` (snake_case) from Redis, exposes `lastGame` / `lastGameImage` |
| `.gitignore` | Added `.open-next`, `.wrangler`, `.dev.vars*` |

### GPC daemon Windows NSSM setup (to do when back at uni)

The GPC daemon needs these env vars in NSSM - set them all in ONE call:
```powershell
nssm set gpc-daemon AppEnvironmentExtra UPSTASH_REDIS_REST_URL=https://... UPSTASH_REDIS_REST_TOKEN=... IGDB_CLIENT_ID=... IGDB_CLIENT_SECRET=...
nssm restart gpc-daemon
```

The IGDB credentials (`IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`) are the same Twitch app credentials used by the PS5 worker. Set them so the daemon can fetch box art without falling back to the hardcoded CDN URLs.

---

## 2026-05-29 (session 3 - v2.6.0 release)

Large content and feature session culminating in PR #235 (merged) and tagged v2.6.0.

**Blog content published (8 new posts):**
- Getting Started with FPGAs - beginner mental model, VHDL LED blink example, FPGA vs MCU comparison, tool links (Vivado, Quartus, IceStorm), Wikimedia SPI/I2C diagrams, FPGA references section
- Bionic Vision and Ocular Prosthetics - retinoblastoma epidemiology, conventional prosthetics, retinal implants (Argus II, PRIMA), cortical implants, optogenetics, PubMed search references to avoid stale IDs
- TypeScript Patterns That Actually Matter in Production - discriminated unions, satisfies operator, branded types, const assertions, exhaustiveness checking with never
- Why Every Software Engineer Should Understand Hardware - article type, abstraction costs, debugging across layers, performance intuition
- Resources for Engineering and Technology - renamed from embedded/software only; curated books, courses, YouTube channels (3Blue1Brown, Fireship, Theo, ByteByteGo, LowLevelTV, Computerphile, Reducible), coding tools (VS Code, JetBrains, Obsidian, Notion, Figma, Godbolt, Excalidraw), /consumed link, must-watch video section
- IoT Security Gaps - expanded with Mirai botnet, KRACK, Ripple20, ETSI EN 303 645, OWASP IoT Top 10; all reference links verified
- SPI vs I2C - deep technical comparison with clock modes, address conflicts, pull-up resistors, I2C bus hang recovery, comparison table; Wikimedia timing diagrams embedded
- RTOS Fundamentals - published initially then swapped to draft in favour of FPGA post

**Blog content: drafts added (published: false):**
- UART From Scratch (bare metal AVR C, baud rate calculation, printf via UART stream)
- DMA Explained (STM32, circular mode, cache coherency on Cortex-M7)
- RTOS Fundamentals (swapped from published back to draft)

**New blog post types and features:**
- `video` ContentBlock type added to blog.ts and renderer (YouTube embed via iframe)
- Must-watch videos section on resources post only (Nand2Tetris TED + Steve Jobs Stanford 2005)
- Images added to AVR bare metal, LED Cube, AstonCV and building my portfolio posts
- SPI vs I2C Wikimedia timing diagrams added - `upload.wikimedia.org` added to remotePatterns, `dangerouslyAllowSVG: true` enabled

**Updated content:**
- Building My Portfolio - rewritten intro with zacess.com origin story; private dashboard/job scraper details removed; date changed to October 2025; zacess.com terminal screenshot added
- Phaemos blog post, project page and notes entry - updated for 4-node hardware architecture (ESP32 primary with 11 sensors, STM32 Black Pill 100Hz FFT, Arduino Nano secondary, Raspberry Pi Pico 2W MicroPython ambient node)
- Business analytics post type corrected from research to notes

**Private dashboard features:**
- Vault expiry alerts cron at 0 9 * * * - `lib/vault-expiry-check.ts` + `/api/dashboard/vault-expiry-check/route.ts`; checks vault key_expiry (ISO date), card_expiry (MM/YY parsed) and inventory warranty_expiry; sends Discord embed sorted by days remaining; red if anything within 7 days, orange otherwise; silent if nothing expiring
- `InspirationWidget` shared component created - motivation (ZenQuotes) and scripture (labs.bible.org) widgets extracted from `/blog/page.tsx` and placed at bottom of `/notes/page.tsx` above the lab terminal link

**Mac daemon updates:**
- Switched from WeatherAPI to Open-Meteo (ECMWF model, no API key needed)
- CoreLocationCLI GPS added for street-level location accuracy; ipinfo.io retained for country/timezone
- Night emoji logic: only clear (WMO 0) and mainly-clear (WMO 1) show moon at night; partly cloudy (WMO 2) shows ☁️; other cloud conditions unchanged

**Skills reordering in generate-role-cvs.js:**
- `reorderSkillsBlock()` function implemented; parses `<p>` elements in skills-block by strong label prefix and reorders per `roleConfig.skillPriority`

**RSS feed:**
- Channel description updated to reflect new post types (research, article, resources)
- Feed is dynamic - auto-includes all published posts; no manual entries needed

**Docs and release:**
- CHANGELOG.md: unreleased content moved to v2.6.0 section; v2.5.0 section split out
- DASHBOARD.md: vault expiry alerts section added with full implementation detail
- PROJECT.md: Mac daemon section updated for Open-Meteo and CoreLocationCLI
- verification.md: blog and vault expiry checks updated
- SUGGESTIONS.md: newsletter items removed; CV auto PDF and LinkedIn sync kept; 6 mindblowing ideas added
- Tagged v2.6.0 and GitHub release created

## 2026-05-29 (session 2)

- feat/blog-drafts-vault-expiry-skills: published IoT security and SPI vs I2C drafts with significantly expanded content and references; added two new drafts (UART bare metal, RTOS fundamentals) as published: false; expanded "building my portfolio" post with live status system, dashboard, job scraper, Supabase and security sections; fixed skills reordering TODO in generate-role-cvs.js (WEATHERAPI_MAP replaced with reorderSkillsBlock function); built vault expiry alerts cron (lib/vault-expiry-check.ts + /api/dashboard/vault-expiry-check route) checking key_expiry, card_expiry and warranty_expiry, sending Discord embed for items expiring within 30 days, added to vercel.json at 0 9 * * *; updated SUGGESTIONS.md with CV automation and mindblowing ideas; fixed business analytics post type from research to notes.

## 2026-05-29

- fix/night-emoji-partly-cloudy: partly cloudy at night now emits ☁️ instead of ⛅ - sun should not be visible in night conditions.

## 2026-05-28 (session 2)

- fix/weather-accuracy-open-meteo-gps: switched mac-daemon.py from WeatherAPI to Open-Meteo (free, no API key, uses ECMWF for better UK accuracy); added CoreLocationCLI GPS fallback in fetch_location() for street-level precision over IP-based coordinates; fixed night emoji logic so only clear/mainly-clear nights show moon - cloudy conditions keep their cloud emoji at night; removed WEATHERAPI_KEY from .env.example; updated route.ts dayEmojis to no longer replace cloud emoji with moon.

## 2026-05-28

- fix/scraper-category-and-adzuna (7b4498b): improved detect_category in job-scraper.py with word-boundary regex for "AI" (`\bai\b`), additional quant companies (Virtu, SIG, DRW, Flow Traders, Akuna), full Embedded category (firmware/fpga/vhdl/rtos/bare metal/hardware engineer/IoT/microcontroller); capped Adzuna results_per_page from 50 to 15 per search; added `_resolve_url()` to follow Adzuna redirect_url tracking links to the real company ATS page; SUGGESTIONS.md replaced with newsletter content tasks only (Issue 001-003 on Beehiiv).
- feat/embedded-category-and-detect-improvements (PR #231): added "Embedded" to the CATEGORIES array in ApplicationsClient.tsx so Embedded roles from the scraper route to the correct group rather than Miscellaneous; expanded detectCategory client-side for all verticals (Embedded with firmware/fpga/rtos/hardware engineer/IoT; AI using word-boundary `_AI_WORD = /\bai\b/i`; Data Science adds data engineer and BI analyst; Quant adds Virtu/SIG/DRW; Cyber adds pen test and appsec).
- fix/discord-card-activities (PR #230): changed `.find()` to `.filter()` in LiveStatusCards.tsx so all concurrent Discord activities (Playing/Listening/Watching) render as a compact stacked list with type labels and elapsed time, separated by dividers; fixed ApplicationsClient.tsx category grouping to skip the DB default value of "Software Engineering" when grouping and filtering so Data Science/AI/DevOps roles appear in their correct category columns.
- fix/lanyard-csp (PR #229): added `api.lanyard.rest` to connect-src in next.config.mjs CSP header so Lanyard WebSocket and REST calls are not blocked by the browser.
- feat/discord-card-link (PR #228): added external link icon on the Discord presence card that opens `discord.com/users/1087417301583790212` in a new tab; corrected the Discord profile URL on /links to use the same deep-link format.
- fix/lanyard-always-show (PR #227): Discord card on /now no longer waits for Lanyard before rendering; shows immediately with offline placeholder so there is no layout shift on load.
- feat/lanyard-discord-card (PR #226): added Discord presence card to the live status widget powered by the Lanyard API (no auth, free); card shows status dot (online/idle/dnd/offline), current rich presence activity (game, VS Code workspace, Spotify via Discord) and custom status text; on /notes the card only appears when online/idle/dnd; on /now it is always visible and shows "last seen Xm ago" at reduced opacity when offline; Discord user ID 1087417301583790212 hardcoded in LiveStatusCards.tsx.
- feat/inventory-pagination (PR #225): added client-side prev/next pagination to inventory category pages with PAGE_SIZE = 50; shows "1-50 of N items" when paginated, plain "N items" when under the limit; adding a new item resets to page 0 so it is always visible at top.
- feat/applications-funnel (PR #224): added an Application Funnel section pinned to the bottom of the applications page (both Table and Kanban views); four cumulative stages: Applied (blue), Assessment (violet), Interview (amber), Offer (green); each stage shows count and conversion rate from previous stage; counts update when switching tabs (All / Internships / etc.).
- feat/discord-daily-digest: added lib/send-discord-digest.ts with fetchDigestData/buildEmbeds/sendDiscordDigest; created app/api/dashboard/discord-digest/route.ts (CRON_SECRET protected GET); added daily 8am UTC cron to vercel.json; DISCORD_WEBHOOK_URL must be added to Vercel environment variables.
- feat/scraper-adzuna-and-reed: added scrape_adzuna(), scrape_jooble() (JOOBLE_API_KEY), scrape_arbeitnow() and scrape_jobicy() (both free, no auth); improved scrape_reed() with graduate=true flag and more keyword variants; added all new secrets to job-scraper.yml and .env.example.
- fix/scraper-filters-and-status: fixed infer_type to use whole-word regex for "intern" (prevents "international" matching); added _SENIOR_ROLE_RE guard to Trackr non-internship category bypass; changed insert_job from upsert to insert-only so user-set statuses are never overwritten; added batch last_scraped_at refresh at end of run; removed Twilio from PRIORITY_COMPANIES; added scrape_reed() (requires REED_API_KEY secret); added send_discord_alert() for daily new-job notifications (requires DISCORD_WEBHOOK_URL secret); updated job-scraper.yml to pass new secrets; added both env vars to .env.example; removed CV editor from SUGGESTIONS.md; added Beehiiv branding instructions note to SUGGESTIONS.md.
- chore/docs-stale-pages-and-changelog: updated colophon (PS5 daemon, GitHub activity entries), uses (PS5 hardware, Cloudflare Workers service), DOCUMENTATION.md (PSN_NPSSO env var, workers/ file structure), CHANGELOG.md (consolidated unreleased sections), website changelog page (Unreleased + v2.4.0 entries), README.md (PSN_NPSSO env var), verification.md (inventory detail page + live widget checks). NEXT-SESSION-PLAN.md deleted - all items complete.
- feat/3dot-menus-kanban (PR #219): 3-dot MoreVertical dropdowns on Diary, Notes and Vault entry cards (Hide/Pin/Lock/Edit); drag-and-drop Kanban board for Applications with List/Grid toggle; job scraper `_INTERNAL_FUNCTION_RE` and `_SENIOR_ROLE_RE` guards to block internal engineering, recruiter and senior roles from student listings.
- PR #217 (merged): PS5 NPSSO renewal cron, PWA manifest, activity log page, Notes Now card, Vercel Analytics.
- PR #216 (merged): WeatherAPI.com weather source with is_day moon detection, friendly Mac device name via scutil.
- PR #211 (fix/livestatuscards-icons-and-github): PS5 card added to LiveStatusCards 2x2 grid with classic SiPlaystation icon, GitHub moved to full-width strip, Cloudflare Worker (workers/ps5-presence/) polling PSN every minute replacing Mac daemon, ps5-daemon.py fixed (npsso_cookie, busy status, User.get_presence), workers/ excluded from root tsconfig.json.
- feat/notes-live-indicator-and-now-cards (open PR #214): pulsing "Updated live" indicator added to /now page header (blue dot, matching device card online colour), LiveStatusCards added to /now page. Fixed PS5 card issues from PR #211 - device name colour (was blue, now default foreground), device icons (Laptop/Monitor/PS) now turn blue when online, redundant "Online" status line removed (status only shown for informative states like "Busy").
- feat/ps5-daemon: new scripts/ps5-daemon.py and com.zacess.ps5-daemon.plist, new app/api/ps5/route.ts, PS5 card added to LiveStatusCards.tsx 2x2 grid, GitHub moved to full-width strip between Spotify and device grid, PSN_NPSSO added to .env.example.
- feat/inventory-detail-pages: added /dashboard/inventory/[category]/[id] detail page with full item info, back navigation, edit/delete actions and warranty colour coding. Added stopPropagation on edit/delete icons in InventoryCategoryClient.tsx. SQL migration for updated_at column and trigger in supabase-schema.sql already added in a prior PR this session.
- PR fix/scraper-accumulate-and-filters: replaced reset_scraped_entries() with 30-day TTL stale delete, added last_scraped_at and sponsors_visa columns to supabase-schema.sql (SECTION A and B), fixed Bug A (Remote - US location strings including "palo alto", "gurugram"), Bug B (Internal title rejection in is_student_role), Bug C (seniority terms default to Full-time Job in infer_type), Bug D (Singapore/Australia moved to UK_EU_TERMS), fixed The Trackr placement/spring-week category bypass, changed GitHub Actions cron from every 30 minutes to midnight daily, added NotesCell expand/collapse component in ApplicationsClient.tsx.
- PR fix/digest-rename: renamed "Nexus Dashboard" to "Dashboard" in email subject line, "My Dashboard" in the from field and removed "Nexus -" prefix from the footer tagline in lib/send-weekly-digest.ts.
- PR #206 (fix/readme-and-share-cleanup): removed all em/en dashes from the entire repo (replaced with hyphens), removed Oxford commas, ShareButton scoped to project detail, blog slug, CV and links pages only (removed from experience, skills, about, now, notes, newsletter, consumed, colophon, uses, hall-of-fame and both notes sub-pages), added ShareButton to /cv and /links (next to name), fixed URL-encoded em dashes in OG metadata URLs, fixed TypeScript startTransition void issue across 16 dashboard files from PR #204.

## 2026-05-27

- LinkedIn social profile overhaul: all 9 project entries added, Proteus version fix PR #202.
- PR #203 (chore/docs-reorg): renamed memory/ to docs/, consolidated session logs, rewrote README to essentials only, moved file structure and key dependencies to DOCUMENTATION.md, removed LinkedIn badge from footer.
- PR #204 (fix/security-and-comments): patched recursive json() helper in contact route, added OG param sanitisation, Cache-Control: no-store on contact and newsletter responses, Upstash rate limiting on newsletter (3/hour), runtime input validation on all dashboard server actions, PIN gate and inline-styles comments, private entries removed from CHANGELOG, Unreleased versioned as v2.4.0.
- PR #205 (feat/share-links): new ShareButton component (Web Share API + clipboard fallback), OG thumbnails on every public page via /api/og, ShareButton wired to all relevant public pages.

---

## Session Start (2026-05-26)

- Date: 26 May 2026
- Branch strategy: one branch per feature, PR + auto-merge each
- Plan: c-dev-github-repos-isaac-adjei-portfoli-effervescent-cake.md

## Implementation Order

1. Create this log file - DONE
2. A1: Weather night icon fix (public)
3. A2: Weekly digest refactor (private)
4. A3: CV improvements + FPGA/VHDL + PDF/DOCX scripts (public)
5. Phase 12: Mood Analytics in Diary (private)
6. Phase 13: Quick Capture widget (private)
7. Phase 14: Dashboard keyboard shortcuts (private)
8. Phase 15: Dashboard global search (private)
9. Phase 16: Streak charts (private)
10. Phase 17: Dark mode persistence (private)
11. DOCUMENTATION.md (public)

---

## A1: Weather Night Icon Fix

### Status: COMPLETE - PR #183 merged, PR #184 auto-merging (7pm threshold update)

Files changed:
- `app/api/macbook/route.ts` - checks local hour, replaces day emojis with moon between 7pm-6am

---

## A2: Weekly Digest Refactor

### Status: COMPLETE - PR #185 MERGED

Root cause: internal HTTP fetch in trigger-digest was failing on Vercel (header stripping on redirects).
Fix: extracted all logic to `lib/send-weekly-digest.ts`, both routes call it directly.

Files changed:
- `lib/send-weekly-digest.ts` - NEW shared helper with all Supabase queries and Resend call
- `app/api/dashboard/trigger-digest/route.ts` - removed HTTP fetch, calls helper directly
- `app/api/dashboard/weekly-digest/route.ts` - keeps CRON_SECRET check, calls helper

---

## A3: CV Improvements

### Status: COMPLETE - PR #186 MERGED, follow-up fixes on fix/cv-downloads (pending PR)

PR #186 changes (merged):
- `data/cv.yml` - FPGA/VHDL added to embedded.hardware, software section order fixed (skills before education), Cancer Research UK tagged for all roles
- `data/skills.ts` - FPGA (AMD/Wikimedia logo) and VHDL (embeddedc icon) added to Embedded & Hardware
- `scripts/generate-pdfs.js` - NEW Puppeteer script generating A4 PDFs for all 6 roles
- `scripts/generate-docx.js` - NEW docx script generating role-specific Word files from cv.yml
- `package.json` - added generate-pdfs and generate-docx scripts
- `.github/workflows/ci.yml` - bumped to Node 22, changed npm ci to npm install

Issues encountered with PR #186:
- FPGA icon: cdn.simpleicons.org/xilinx slug removed after AMD acquisition, fixed with AMD logo from Wikimedia
- CI lock file sync: puppeteer v25 transitive deps missing, fixed by switching to npm install
- generate-cvs.js incorrectly overwrote the hand-crafted cv.html with a bare 162-line generated version, stripping all content (ORCID, icons, hardware skills, extra projects etc.)
- All cv-*.html files also overwritten with minimal generated versions

fix/cv-downloads branch - PR #187 MERGED - also contains:
- Restored cv.html and all cv-*.html to original comprehensive 1545+ line versions from git
- Added FPGA and VHDL to Embedded & Hardware line in cv.html and cv-embedded.html
- Fixed generate-cvs.js to never overwrite cv.html
- Fixed generate-cvs.yml to only git-add cv-*.html (not cv.html), use npm install
- Restored original role-specific PDFs (generated from wrong templates by #186)
- Kept new role-specific DOCX files (now genuinely different per role, replacing old identical copies)
- Fixed CV preview iframe: CSP frame-src includes 'self', X-Frame-Options changed to SAMEORIGIN
- Fixed print button: window.open instead of blocked iframe.contentWindow.print()
- Fixed Word download route: filename corrected from cv.docx to Isaac_Adjei_CV.docx
- Regenerated main Isaac_Adjei_CV.pdf from restored cv.html (136536 -> 151931 bytes)
- Updated generate-pdfs.js to include main CV PDF in generation list

---

## CI Workflow Fixes

### Status: COMPLETE - PR #188 MERGED

Root cause: Ubuntu 24.04 (Noble) renamed libasound2 to libasound2t64. Both CV workflows were failing on the install step. cv-pdf.yml also had no Chromium deps step and was using npm ci (lock file mismatch with puppeteer).

Files changed:
- `.github/workflows/generate-cvs.yml` - libasound2 -> libasound2t64, Node 20 -> 22
- `.github/workflows/cv-pdf.yml` - npm ci -> npm install, Node 20 -> 22, added Chromium deps step

---

## Phase 12: Mood Analytics in Diary

### Status: COMPLETE - PR #189 MERGED

Files changed:

- `app/dashboard/(protected)/diary/DiaryClient.tsx` - added collapsible BarChart showing mood frequency over last 30 days, derived from existing entries state with no extra Supabase query

---

## Phase 13: Quick Capture Widget

### Status: COMPLETE - PR #190 MERGED

Files changed:

- `components/dashboard/QuickCapture.tsx` - NEW: fixed FAB (bottom-right), Radix Dialog, 4 tabs (Diary/Note/Goal/Job), each wired to existing server actions
- `app/dashboard/(protected)/layout.tsx` - added QuickCapture and Toaster
- `package.json` / `package-lock.json` - added sonner for toast notifications

---

## Phase 14: Dashboard Keyboard Shortcuts

### Status: COMPLETE - PR #191 MERGED

Files changed:

- `hooks/useDashboardShortcuts.ts` - NEW: g+key navigation, ? triggers help, ignores input fields
- `components/dashboard/ShortcutHelp.tsx` - NEW: dialog showing all shortcuts
- `app/dashboard/(protected)/layout.tsx` - added ShortcutHelp

---

## Phase 15: Global Search (Ctrl+K)

### Status: COMPLETE - PR #192 MERGED

Files changed:

- `components/dashboard/DashboardSearch.tsx` - NEW: Ctrl+K CommandDialog, fetches last 50 of goals/notes/diary/applications on first open
- `app/dashboard/actions.ts` - added getDashboardSearchData server action
- `app/dashboard/components/DashboardSidebar.tsx` - added search trigger in sidebar

---

## Phase 16: Streak Charts + Phase 17: Dark Mode Persistence

### Status: COMPLETE - PR #193 MERGED

Phase 16 files:

- `app/dashboard/(protected)/streaks/page.tsx` - extended query from 30 to 90 days
- `app/dashboard/(protected)/streaks/StreaksClient.tsx` - heatmap extended to 90 days, LineChart added showing per-streak activity

Phase 17 files:

- `components/dashboard/ThemeSync.tsx` - NEW: applies saved theme from Supabase on dashboard load
- `app/dashboard/(protected)/layout.tsx` - fetches theme_preference, renders ThemeSync
- `app/dashboard/(protected)/settings/SettingsClient.tsx` - theme toggle now calls setConfig to persist preference

---

## Session Cleanup (2026-05-26)

### Status: COMPLETE (this session)

- Deleted `memory/PLAN-2026-05-24.md` (completed, superseded)
- Deleted `memory/CV_GENERATION_DISABLED.md` (outdated - CV generation re-enabled)
- Deleted `memory/LOG-2026-05-25.md` (archived - yesterday's session)
- Deleted `.claude/worktrees/` (empty folder)
- Rewrote `memory/SUGGESTIONS.md` - removed done items, kept only genuine backlog
- Rewrote `memory/verification.md` - updated checklist for current feature set
- Fixed non-first-person comments in: opengraph-image.tsx, sitemap.ts, SocialLinks.tsx, useScrollPosition.ts
- Created `app/robots.ts` - disallows /dashboard/ and /api/dashboard/ from crawlers
- Updated sitemap.ts comment to clarify it never includes private paths

---

## 2026-05-24 - CV awards and experience emphasis

- Removed duplicated school names from education award lines in `public/resume/cv.html`
- Restored bold keyword emphasis in Experience bullets and regenerated CV PDF/DOCX artefacts
- Updated CV artefact workflow to regenerate PDF/DOCX after `cv.html` lands on `main`, then open an artefact-only PR for auto-merge
- Routed the Experience page CV download button through `/api/cv-pdf` to match the other PDF CTAs
- Avoided PR self-commit loops by moving generated CV artefacts into a separate automated PR flow
- Set dashboard metadata to the absolute title `Isaac Adjei | Dashboard` so the browser tab does not duplicate the name

---

## 2026-05-24 - CV download artefacts regenerated

- Regenerated `public/resume/Isaac_Adjei_CV.pdf` from the merged CV HTML after PR #164
- Added `public/resume/Isaac_Adjei_CV.docx` so Word download has a committed artefact

---

## 2026-05-24 - Dashboard fixes and login redesign

### Group A + B - Dashboard fixes and login redesign (feat/dashboard-fixes-login)

- A1: Added metadata export to `(protected)/layout.tsx` so all dashboard tabs show "Isaac Adjei | Dashboard" without affecting the public site root layout
- A2: Fixed LinkedIn URL template in `MeClient.tsx` to use `www` and a trailing slash
- A3: Created `(protected)/page.tsx` so the dashboard home grid renders inside the sidebar layout; deleted the outer `page.tsx` (was causing TypeScript error); added "Open Dashboard" CTA button linking to `/dashboard/me`
- A4: Added PIN gate to Course and Modules pages via new `CourseWrapper.tsx` and `ModulesWrapper.tsx` client components; updated Settings PIN-protected pages text to include Course and Modules
- A5: Added "Preferences" section to `SettingsClient.tsx` with a Sun/Moon toggle that calls `setTheme` from `next-themes`
- A6: Created `app/api/dashboard/trigger-digest/route.ts` as an authenticated wrapper around the weekly-digest route; added "Weekly Digest" section in Settings with "Send test" button and success/error feedback
- A7: Mapped GitHub API status codes in `trigger-scraper/route.ts` to human-readable messages; Settings scraper handler now shows the specific `error` field from the API response
- B: Redesigned login page with avatar image, bold name, styled card and full-width GitHub sign-in button

---

## 2026-05-24 - CV content edits

### Group C - CV content edits (fix/cv-content-edits)

- Added cybersecurity to profile
- Merged Aston University education bullets into one
- Added pipe school/country format to both education awards; added font-weight: normal to .edu-award
- Added Java to Languages; changed PHP 8.2 to PHP in Web/Frameworks; added Kubernetes to Cloud/DevOps
- AstonCV project: 11 -> 12+ security controls; Implemented -> Engineered
- Synonyms: LED Cube Implemented -> Introduced; CNC Implemented -> Engineered; BA Analysed -> Reviewed; Yunex Analysed -> Examined
- Ghana High Commission roles: merged to single technical bullet each

---

## 2026-05-24 - CV Word download

### Group D - CV Word download (feat/cv-word-download)

- Installed html-to-docx package
- Created app/api/cv-word/route.ts - reads cv.html live, returns .docx with correct MIME type
- Added "Download Word" button to CVViewer next to existing download buttons
- Extended .github/workflows/cv-pdf.yml to also generate Isaac_Adjei_CV.docx on cv.html changes

---

## 2026-05-24 - Applications tab and scraper fixes

### Group E - Applications tab and scraper fixes (fix/applications-scraper-fixes)

- Renamed "Summer Internships" tab to "Internships" and "Summer Internship" type to "Internship" throughout ApplicationsClient.tsx
- Fixed job-scraper.py whole-word regex for "intern" to stop false positives from "internal"/"international"
- Scraper type labels updated: "Summer Internship" -> "Internship"
- Changed scraper insert to upsert (on_conflict=url) to prevent duplicate inserts
- Added empty-set guard in load_existing_keys with clear warning log
- Confirmed CYCLE_CUTOFF is datetime(2025, 9, 1)
- Improved trigger-scraper route error messages with status-code-to-text mapping
- Updated Settings UI to show specific scraper error text from API response

---

## 2026-05-21 - Full dashboard overhaul, CV update, codebase comments

### What we did
- Dashboard home page at `/dashboard` - mission-control overview with stat cards for all sections
- Settings page at `/dashboard/settings` - PIN change, lock all, scraper status, Run Now trigger
- Manual lock button and Cmd+L shortcut on Diary, Notes and Vault
- Sub-pages for all sections: Goals by category, Modules by year, Health (Gym/Nutrition/Running), Vault by type, Wishlist by category, Inventory by category, Notes by folder - all dynamic [param] routes
- Weekly email digest via Vercel cron every Sunday 6pm - Resend to DIGEST_EMAIL
- New API routes: scraper-status, trigger-scraper, weekly-digest
- DashboardBreadcrumb component, Settings sidebar link, Framer Motion dashboard variants
- getDashboardSummary server action (parallel Supabase queries)
- Security audit: all API routes verified, PIN checks confirmed server-side, robots.txt updated to disallow /dashboard
- First-person comments added across all new dashboard files and public API routes
- CV updated: profile rewritten, one-page, Java removed, skills headings renamed, Jupyter Notebooks added, git-unlocked corrected to 217+ files, PHAEMOS marked active development, AstonCV website link updated to astoncv.zacess.com, volunteering merged to 1 bullet each, bold key terms
- Auto-regenerate PDF workflow: `.github/workflows/cv-pdf.yml` - triggers on cv.html push to main
- Memory folder reorganised: RULES.md, PROJECT.md, DASHBOARD.md, combined LOG.md
- PRs merged: #157 (dashboard overhaul), #158 (CV PDF), #159 (CV PDF auto-workflow)

---

## 2026-05-21 - Applications tracker: scraper fixes, Jobs tab, filters

### What we did
- Fixed Add/Edit dialog white screen: Radix UI Select v2 rejects `value=""` on SelectItem; replaced all 5 optional Selects with sentinel values `"auto"` / `"none"`
- Fixed scraper ingesting full-time jobs and US jobs: removed priority-company exception, added US_LOCATIONS reject list
- Fixed 2024 entries: added CYCLE_CUTOFF = 2025-09-01
- Fixed opening_date stored in notes string: now written to proper DB column
- Fixed stale data: reset_scraped_entries() deletes all status=scraped rows at run start
- Added Jobs tab: full-time tech roles, dual-pass Greenhouse/Lever/Ashby
- Added Remotive scraper: remote full-time jobs
- Removed location restriction from internship scraping: worldwide, location shown in table
- Added Location column, location priority sort, Location and Keyword filter dropdowns
- Pinned job scraper to ubuntu-22.04 (ubuntu-latest = 24.04 breaks Playwright)
- Removed CV from /all-pages listing
- PRs #149-#154 merged

---

## 2026-05-21 - Applications page rebuilt, job scraper overhaul, PIN auth fix

### What we did
- PIN gate returning 401: root cause was `getToken` (NextAuth v4) used in NextAuth v5 project; fixed by replacing with `auth()` in verify-pin and change-pin routes
- Applications page full rewrite to match The Trackr layout: tabs, inline status dropdown, category groups, date colour coding, stats bar
- Job scraper full rewrite: Playwright for The Trackr, Greenhouse JSON API, Lever JSON API, Ashby, Gradcracker, RateMyPlacement, TargetJobs, student-role filter, URL deduplication
- New applications DB fields: opening_date, last_year_opening, housing_location, cv_required, cover_letter_required, written_answers, sponsors_visa, category

---

## 2026-05-20 - Full Nexus dashboard build (PRs #140-#145)

### What we did
- Set up NextAuth.js v5 with GitHub OAuth, numeric user ID allow-list
- Created Supabase project, wrote all tables and seed data in supabase-setup.sql
- Built all dashboard sections: Me, Us, Goals, Health, Diary (PIN gate), Notes, Wishlist, Inventory, Course, Modules, Applications, Vault (PIN gate), Streaks
- Sidebar: collapsible, mobile hamburger, correct nav order
- Inactivity auto-logout: 1 hour

---

## 2026-05-20 - /consumed page, /now, brace-expansion security fix

### What we did
- Built `/consumed` page: 49 YouTube videos, 12 Spotify podcasts, 10 books for 2026; All tab; click-to-play; real upload dates; month chips
- Fixed CSP blocking YouTube/Spotify embeds (added to frame-src in next.config.mjs)
- Fixed brace-expansion CVE (npm overrides to force 5.0.6)

---

## 2026-05-19 - Gaming PC daemon and card

### What we did
- Confirmed NVIDIA RTX 4060 GPU (pynvml used)
- Wrote scripts/gpc-daemon.py: CPU%, GPU%, active game via process scan, writes to gpc:status and gpc:last-known
- Wrote app/api/gpc/route.ts with live/last-known fallback and offline null rule
- Wired up Gaming PC card in LiveStatusCards.tsx

---

## 2026-05-19 - Lenovo daemon and stale charging fix

### What we did
- Wrote scripts/lenovo-daemon.py: battery, charging, timestamp to lenovo:status and lenovo:last-known
- Wrote app/api/lenovo/route.ts
- Wired up Lenovo live card
- Set up NSSM Windows service for auto-start

### NSSM gotchas (apply to all Windows daemons)
- Use full Python path in nssm install
- Install pip packages to system site-packages (LocalSystem cannot see user packages)
- Set multiple env vars in ONE nssm call (two calls overwrite each other)
- SERVICE_PAUSED = process crashed, not paused - always check the log
- Run nssm in admin PowerShell

### Stale charging fix
- Added isStale() helper in LiveStatusCards.tsx - if lastSeen > 5 min, hide charging state
- Prevents charging icon freezing when device shuts down while plugged in

---

## 2026-05-24 - Session end status (for next agent)

### COMPLETED this session (all merged to main)
- Group D: CV Word download - /api/cv-word route, Download Word button in CVViewer, DOCX in cv-pdf.yml workflow
- Group E: Applications tab renamed to "Internships", scraper whole-word regex fix, upsert dedup, error messages
- Group C: CV edits - cybersecurity in profile, Aston bullets merged, award pipe format, Java + Kubernetes + PHP fix, AstonCV 12+ controls, synonyms replaced, Ghana HC bullets merged
- Group A+B: Tab title fix, LinkedIn URL fix, sidebar on dashboard home, Course + Modules PIN gates, dark mode in Settings, test digest button, scraper error messages, login page redesign

### NOT DONE - do these next session
- Group F: 3-dot menus (Edit/Hide/Pin/Lock) on Diary, Notes and Vault entries + Now section on Notes home page. SQL must be run in Supabase first - see memory/SUGGESTIONS.md for exact SQL and full spec.
- Group G: CV templates (6 role-specific HTML files + /cv/templates picker page) - can start now that Group C is merged.
- SUGGESTIONS.md: full list of future features and dashboard improvements

### Manual steps still needed
1. Run SQL in Supabase (see SUGGESTIONS.md Group F section) BEFORE Group F code deploys
2. Go to /dashboard/me and update LinkedIn slug from "isaac-adjei" to "isaacadjei" (no hyphen) after Group A+B deploys
