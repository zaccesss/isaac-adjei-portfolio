# Next Session Plan

Delete this file once all items below are marked DONE.

---

## Original 5 items - ALL DONE

- [x] Item 1 - `fix/digest-rename` - renamed Nexus Dashboard in digest - PR #208 merged
- [x] Item 2 - `fix/scraper-accumulate-and-filters` - scraper bugs, 30-day TTL, filters - PR #209 merged
- [x] Item 3 - `feat/inventory-detail-pages` - inventory detail pages, updated_at trigger - PR #210 merged
- [x] Item 4 - `feat/ps5-daemon` / `fix/livestatuscards-icons-and-github` - PS5 card, Cloudflare Worker - PR #211 merged
- [x] Item 5 - `feat/notes-live-indicator-and-now-cards` - /now LiveStatusCards, pulsing indicator, PS5 card fixes - PR #214 merged

---

## Remaining work - TODO next session

### A - LiveStatusCards UI fixes (branch: `fix/livestatuscards-github-link-and-icon-colours`)

**File:** `components/shared/LiveStatusCards.tsx`

#### A1 - Device icon colours

The device type icons (Laptop for MacBook/Lenovo, Monitor for GPC, SiPlaystation for PS5) are currently blue when online. There is too much blue in the cards alongside the WiFi icon and "online now" text. Change all four device icons so they use foreground when online and muted when offline.

Changes needed (search for each and update):

```
MacBook Laptop icon:   text-blue-500 -> text-foreground   (keep text-muted-foreground/40 for offline)
Lenovo Laptop icon:    text-blue-500 -> text-foreground   (keep text-muted-foreground/40 for offline)
GPC Monitor icon:      text-blue-500 -> text-foreground   (keep text-muted-foreground/40 for offline)
PS5 SiPlaystation icon: text-blue-500 -> text-foreground  (keep text-muted-foreground/40 for offline)
```

**A2 - GitHub profile link**

Add a clickable ExternalLink icon after the relative time in the GitHub strip, linking to `https://github.com/zaccesss`. The user wants: `pushed repo-name  4m ago | [link icon]`.

1. Add `ExternalLink` to the lucide-react import at the top of the file.
2. In the GitHub strip JSX, find the `<span className="text-xs text-muted-foreground/50 shrink-0 ml-auto">{github.relativeTime}</span>` line.
3. Wrap that span and a new link in a `div` with `ml-auto flex items-center gap-1.5 shrink-0`:

```tsx
<div className="flex items-center gap-1.5 shrink-0 ml-auto">
  <span className="text-xs text-muted-foreground/50">{github.relativeTime}</span>
  <span className="text-foreground/20 dark:text-foreground/15 select-none">|</span>
  <a
    href="https://github.com/zaccesss"
    target="_blank"
    rel="noopener noreferrer"
    className="text-muted-foreground/40 hover:text-foreground transition-colors"
  >
    <ExternalLink className="h-3 w-3" />
  </a>
</div>
```

4. Also add the link to the no-recent-activity branch so it is always accessible:

```tsx
<span className="text-xs text-muted-foreground/40">no recent activity</span>
<a
  href="https://github.com/zaccesss"
  target="_blank"
  rel="noopener noreferrer"
  className="ml-auto text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
>
  <ExternalLink className="h-3 w-3" />
</a>
```

**After editing:** confirm locally on `/notes` and `/now` before committing. Then commit, push and `gh pr create` + `gh pr merge --squash --delete-branch --auto`.

---

### B - Stale pages and documentation (branch: `chore/docs-stale-pages-and-changelog`)

**B1 - `app/colophon/page.tsx`**

In the `"The live status system"` section, add two new items after the Spotify item:

```ts
{
  name: "PS5 daemon",
  detail:
    "A Cloudflare Worker (workers/ps5-presence) polls the PSN API every 60 seconds using the psnawp library. It writes my online status, current game and last-seen timestamp to Upstash Redis. The NPSSO session token is stored in Cloudflare secrets - it never touches the codebase or the client.",
},
{
  name: "GitHub activity",
  detail:
    "The GitHub strip in the live status widget uses the GitHub REST API to show the last repository I pushed to and how long ago. Fetched server-side and cached briefly in Redis.",
},
```

**B2 - `app/uses/page.tsx`**

Hardware section - add after the ESP32/STM32 item:

```ts
{
  name: "PlayStation 5 (ZACCESS-PS5)",
  detail:
    "My PS5. Online status, current game and last-seen time are polled every 60 seconds by a Cloudflare Worker using the PSN presence API, and displayed live in the status widget on /notes and /now.",
},
```

Services section - add after the GitHub API item:

```ts
{
  name: "Cloudflare Workers",
  icon: `${SKI}=cloudflare`,
  href: "https://workers.cloudflare.com",
  detail:
    "Serverless edge workers. One worker (workers/ps5-presence) polls the PSN API every minute and writes presence data to Upstash Redis, replacing the need for a daemon running on a local machine.",
},
```

**B3 - `DOCUMENTATION.md`**

Find the env vars table and add after the Spotify entries:

```
| `PSN_NPSSO` | Optional | 64-char NPSSO session token from Sony auth - used by the Cloudflare Worker to poll PSN presence; renew from playstation.com cookies if the PS5 card goes stale |
```

Find the file structure tree and add `workers/ps5-presence/` after the `scripts/` block with a comment: `# Cloudflare Worker - polls PSN every 60s`.

**B4 - `CHANGELOG.md` (repo)**

The Unreleased section already has some entries. Add the missing ones and correct the device icon entry (icons are now foreground not blue). The Unreleased section should read:

```markdown
## [Unreleased]

### Added

- PS5 live card in the status widget - online/offline, current game and last-seen time via Cloudflare Worker polling PSN every 60s
- Cloudflare Worker at workers/ps5-presence replaces the Mac-based PS5 daemon for presence polling
- Inventory item detail pages at /dashboard/inventory/[category]/[id] with full field layout, warranty colour coding and edit/delete actions
- Live status cards widget added to /now page
- Pulsing blue "Updated live" indicator on the /now page header
- Clickable GitHub profile link in the live status GitHub strip after the last-pushed timestamp
- Share button on /cv and /links pages next to name
- Open Graph thumbnails on every public page via /api/og

### Fixed

- PS5 card device name no longer shown in blue - names are now always default foreground colour across all device cards
- Device type icons (Laptop, Monitor, PlayStation) now use foreground colour when online and muted when offline, reducing visual noise alongside the blue WiFi indicator
- PS5 card no longer shows a redundant "Online" or "Offline" status line - status text is only shown for informative states such as "Busy"

### Changed

- Em and en dashes removed throughout; replaced with hyphens
- Oxford commas removed throughout
```

**B5 - `app/changelog/page.tsx` (website)**

The website changelog only shows public features - no dashboard or private items. Add a new `v2.4.0` entry (dated 2026-05-27) and update the Unreleased entry.

Unreleased entry (update the existing one to this):

```ts
{
  version: "Unreleased",
  date: "",
  added: [
    "PS5 live card in the status widget - online/offline, current game and last-seen time, powered by a Cloudflare Worker polling PSN every 60 seconds",
    "Live status cards widget added to /now page",
    "Pulsing blue 'Updated live' indicator on the /now page header",
    "Clickable GitHub profile link in the live status GitHub strip after the last-pushed timestamp",
  ],
  fixed: [
    "PS5 card device name no longer shown in blue - device names are now always default foreground colour",
    "Device type icons (Laptop, Monitor, PlayStation) now use foreground when online and muted when offline",
    "PS5 card removed redundant 'Online'/'Offline' status line - status text only appears for informative states such as 'Busy'",
  ],
},
```

v2.4.0 entry (insert after Unreleased, before v2.3.0):

```ts
{
  version: "v2.4.0",
  date: "2026-05-27",
  added: [
    "Share button on project detail pages, blog posts, /cv and /links - Web Share API with clipboard fallback and 2-second 'Copied!' confirmation",
    "Open Graph thumbnails on every public page via /api/og - dynamic per-page title and description",
  ],
  changed: [
    "Em and en dashes removed throughout the site; replaced with hyphens",
    "Oxford commas removed throughout",
  ],
},
```

**B6 - `README.md`**

In the env vars block, add `PSN_NPSSO=` after the Spotify entries:

```
PSN_NPSSO=
```

**B7 - `docs/verification.md`**

Add to the Dashboard - features section:

```
- [ ] `/dashboard/inventory/[category]/[id]` - Detail page loads with all fields; back navigation works; edit and delete buttons work
```

Add to the Dashboard - widgets section or a new "Live status widget" section:

```
- [ ] /notes - LiveStatusCards renders; PS5 card shows correct status; GitHub strip shows last push with clickable profile link
- [ ] /now - LiveStatusCards renders identically to /notes; pulsing blue dot visible in header
- [ ] PS5 card - when PS5 is online: device name in default foreground (not blue), icon in foreground, no redundant "Online" line below wifi status
```

**B8 - `docs/SUGGESTIONS.md`**

Add to the bottom:

```markdown
### Inventory pagination

Category pages have no pagination. Add `LIMIT 50 OFFSET n` on the Supabase query and pagination controls before the list grows past 50 items.

---

### Weather accuracy - Apple WeatherKit

The daemon weather can be 2-3 degrees off the macOS Weather app because they use different data sources. Apple WeatherKit (requires Apple Developer account) is the same API that powers the Weather app - it would give GPS-accurate temperature and matching weather icons. Investigate as a replacement for the current OpenWeatherMap/weather source on the MacBook daemon. Also: the moon icon should only show between 7pm and 5am (sun rises early in summer - 6am was sometimes showing moon during daylight). Change the threshold in `scripts/mac-daemon.py` from `hour >= 19 or hour < 6` to `hour >= 19 or hour < 5`.

---

### PS5 NPSSO renewal reminder

The NPSSO session token expires after 60 days of inactivity. If the Cloudflare Worker stops writing to Redis, the PS5 card shows stale data silently. Add a Vercel cron that checks the age of the `ps5:status` key in Redis once a week and sends a Resend email if the key is missing or older than 50 days, prompting a manual NPSSO renewal.
```

**B9 - `docs/LOG.md`**

Add to the top under `## 2026-05-28`:

```
- chore/docs-stale-pages-and-changelog: updated colophon (PS5 daemon, GitHub activity entries), uses (PS5 hardware, Cloudflare Workers service), DOCUMENTATION.md (PSN_NPSSO env var, workers/ file structure), CHANGELOG.md (full unreleased section), website changelog page (Unreleased + v2.4.0 entries), README.md (PSN_NPSSO env var), verification.md (inventory detail page + live widget checks), SUGGESTIONS.md (3 new items: inventory pagination, Apple WeatherKit/moon hours, NPSSO renewal reminder). NEXT-SESSION-PLAN.md updated with done/not done status.
- fix/livestatuscards-github-link-and-icon-colours: device type icons changed from blue-when-online to foreground-when-online (less visual noise), ExternalLink icon added to GitHub strip after relative time linking to github.com/zaccesss profile.
```

**After all edits:** confirm locally, then commit, push and create PRs as usual. No co-author lines.

---

### C - Security audit and verification (do after A and B are merged)

Run through `docs/verification.md` manually. Pay attention to:

- All `/api/dashboard/*` routes return 401 without a valid session
- No secrets visible in client-side bundle (Network tab, confirm no env values in JS files)
- CSP headers present on public pages
- robots.txt still disallows /dashboard and /api/dashboard
- PS5 card renders correctly on /notes and /now in both light and dark mode
- GitHub strip link opens github.com/zaccesss in a new tab

Also run:

```bash
grep -r "npsso\|upstash_redis_rest\|spotify_client_secret\|resend_api" --include="*.ts" --include="*.tsx" --include="*.py" -i . | grep -v ".env" | grep -v "node_modules"
```

Confirm zero results (no secrets hardcoded).

---

### D - Comments and code quality audit

Scan all files changed in this session and confirm:

- All code comments are first person ("I check...", "I poll...", "I use...")
- No em dashes (`-`) or en dashes used in comments or prose
- No Oxford commas in comments or page content
- No multi-line comment blocks - one short line maximum
- No comments describing WHAT the code does (names already do that) - only WHY when non-obvious

Files to check: `components/shared/LiveStatusCards.tsx`, `app/now/page.tsx`, `app/colophon/page.tsx`, `app/uses/page.tsx`.

---

### E - Moon hours fix (quick, can do standalone)

**File:** `scripts/mac-daemon.py`

The current threshold replaces day emojis with the moon emoji between 7pm and 6am. Sun can rise before 6am in summer so the moon sometimes shows during daylight. Change to 7pm-5am.

Find the condition (something like `hour >= 19 or hour < 6`) and change `< 6` to `< 5`.

Branch: `fix/mac-daemon-moon-hours` - tiny change, merge immediately.

---
