# Pre-Deploy Verification Checklist

Run through this before pushing a release or after a big batch of changes.
Tick each box in GitHub once verified (these are GitHub-flavoured markdown checkboxes).

---

## Public pages

- [ ] `/` - Homepage loads, hero visible, navigation works
- [ ] `/about` - Loads, content readable
- [ ] `/projects` - Grid displays, filters work, links work
- [ ] `/projects/audio-amplifier` - Detail page loads, gallery works, highlights visible
- [ ] `/projects/led-cube` - Detail page loads, video player visible
- [ ] `/projects/astoncv` - Detail page loads
- [ ] `/projects/zacess-pages` - Detail page loads
- [ ] `/projects/cnc-control` - Detail page loads
- [ ] `/projects/goods-lift` - Detail page loads
- [ ] `/projects/cad-portfolio` - Detail page loads
- [ ] `/projects/git-unlocked` - Detail page loads
- [ ] `/projects/phaemos` - Detail page loads
- [ ] `/projects/avr-zac` - Detail page loads
- [ ] `/experience` - Loads correctly, timeline renders
- [ ] `/skills` - Skills grid renders, icons load
- [ ] `/cv` - CV page loads, PDF preview works, download buttons work
- [ ] `/blog` - Loads, published posts visible; motivation and scripture widgets no longer appear at the bottom
- [ ] `/blog/[slug]` - A published post loads and renders correctly; ol-links references render as numbered clickable links
- [ ] `/notes` - Loads; motivation and scripture widgets appear above the lab terminal link at the bottom
- [ ] `/lab` - Loads
- [ ] `/now` - Loads
- [ ] `/consumed` - Loads, tabs work, media cards render
- [ ] `/newsletter` - Loads, subscribe form visible
- [ ] `/changelog` - Loads, entries visible
- [ ] `/uses` - Loads
- [ ] `/colophon` - Loads
- [ ] `/links` - Loads
- [ ] `/all-pages` - Lists public pages only, no dashboard entries
- [ ] `/privacy` - Loads
- [ ] `/security-policy` - Loads
- [ ] `/sitemap.xml` - Lists public routes only, no /dashboard paths
- [ ] `/robots.txt` - Disallows /dashboard/ and /api/dashboard/
- [ ] `404` - Custom 404 page shows on unknown route
- [ ] Contact form - Submits successfully, email arrives
- [ ] Share button - Present on `/projects/[slug]` detail, `/blog/[slug]` post, `/cv` and `/links` only; click on desktop shows "Copied!" for ~2s; mobile share sheet opens; confirm it is NOT present on experience, skills, about, now, notes, newsletter, consumed, colophon or uses
- [ ] OG thumbnails - View source of any public page and confirm `<meta property="og:image">` present with `/api/og?title=...` URL
- [ ] OG image renders - Visit `/api/og?title=Test&description=Hello` directly and confirm image renders correctly

---

## CV downloads

- [ ] PDF download - Downloads correct Isaac_Adjei_CV.pdf (not stale)
- [ ] Word download - Downloads Isaac_Adjei_CV.docx (not JSON error)
- [ ] Role PDFs - cv-software.pdf, cv-embedded.pdf, cv-devops.pdf, cv-quant.pdf, cv-security.pdf, cv-data.pdf all open correctly
- [ ] Role DOCX - Each role-specific Word file downloads with the correct filename
- [ ] Print button - Opens new tab and triggers print dialog
- [ ] CV preview iframe - Renders inline on /cv page

---

## Live status widget

- [ ] `/` - LiveStatusCards renders on homepage (Spotify, London time, MacBook battery, GitHub)
- [ ] `/notes` - LiveStatusCards renders; PS5 card shows correct status; GitHub strip shows last push with clickable profile link; Discord card visible when online/idle/dnd, hidden when offline
- [ ] `/now` - LiveStatusCards renders identically to /notes with one difference: Discord card always visible (shows "last seen Xm ago" at reduced opacity when offline); pulsing blue dot visible in header
- [ ] `/lab` - LiveStatusCards renders on lab page
- [ ] Spotify card - Shows now-playing with album art and progress bar when a track is active; shows last-played greyed-out state when nothing playing
- [ ] MacBook battery - Battery percentage and charging state visible; shows "last seen Xm ago" when daemon is offline
- [ ] GitHub strip - Shows last push repo and time; clicking the username opens GitHub profile in a new tab
- [ ] PS5 card - when PS5 is online: device name in default foreground (not blue), icon in foreground, no redundant "Online" line below wifi status; when offline: last-seen time shown
- [ ] Discord card (online) - Status dot is green/yellow/red, current activity name visible (game, VS Code, etc.), elapsed time shown
- [ ] Discord card (multiple activities) - When Playing and Listening simultaneously, both appear stacked with "Playing" and "Listening" labels and a divider between them
- [ ] Discord card (offline, /now) - Card shows greyed-out "last seen Xm ago" rather than disappearing
- [ ] Discord card (offline, /notes) - Card is completely hidden when offline
- [ ] Discord card external link - Clicking the link icon opens discord.com/users/1087417301583790212 in a new tab
- [ ] PS5 offline "Last played" - when PS5 is offline, "Last played: [game name]" text is visible below "last seen Xm ago" on the card; no cover art image is shown when offline
- [ ] PS5 IGDB cover art - when PS5 is online and in a game, the cover art shown is the IGDB image (not the PSN promotional conceptIconUrl)
- [ ] PS5 lastSeen reflects genuine last-online time - compare card's "last seen" time to when the PS5 was actually switched off; it should not show the cron polling time
- [ ] GPC 5-tier known-games - a game in the KNOWN_GAMES dict (e.g. EA FC) is detected when the process is running
- [ ] GPC 5-tier Steam - a Steam game not in KNOWN_GAMES is detected via Steam Web API when STEAM_API_KEY is set in NSSM
- [ ] GPC env vars complete - IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, STEAM_API_KEY and STEAM_ID are all set in NSSM AppEnvironmentExtra; verify with `nssm get gpc-daemon AppEnvironmentExtra`

---

## Dashboard - authentication

- [ ] `/dashboard/login` - Sign in with GitHub works, redirects to /dashboard on success
- [ ] `/dashboard` when logged out - Redirects to login
- [ ] PIN gate - Prompts for PIN on Diary, Notes and Vault; correct PIN grants access
- [ ] PIN cookie - Confirm cookie is httpOnly and SameSite=Strict in DevTools > Application
- [ ] Inactivity logout - Auto-logs out after 1 hour of inactivity

---

## Dashboard - pages

- [ ] `/dashboard/me` - Bio, stats and links load
- [ ] `/dashboard/us` - Content loads
- [ ] `/dashboard/goals` - List renders, add/edit/delete CRUD works
- [ ] `/dashboard/goals/[category]` - Category filter pages load
- [ ] `/dashboard/health` - Overview loads
- [ ] `/dashboard/health/[section]` - Gym, nutrition and running sub-pages load
- [ ] `/dashboard/diary` - Entries show, mood chart renders, write/edit/delete work; 3-dot menu has Hide/Pin/Lock options
- [ ] `/dashboard/notes` - Notes list, PIN gate, folder view work; 3-dot menu has Hide/Pin/Lock options
- [ ] `/dashboard/notes/[folder]` - Folder-filtered view loads
- [ ] `/dashboard/applications` - Table and Kanban views load; both Internships and Jobs tabs work; status dropdown works; funnel chart visible at bottom of page
- [ ] `/dashboard/applications` categories - Multiple category groups visible (Software Engineering, Data Science, AI and Machine Learning, DevOps and Infrastructure, Embedded, Quant Developer, etc.) not just Software Engineering
- [ ] `/dashboard/applications` Kanban - Drag-and-drop between status columns works; cards show correctly
- [ ] `/dashboard/vault` - PIN gate, entries list, CRUD work; 3-dot menu has Hide/Lock options
- [ ] `/dashboard/streaks` - Cards show, 90-day heatmap renders, activity line chart renders, check-in works
- [ ] `/dashboard/habits` - Habit tracker loads, add/delete works, check-in works
- [ ] `/dashboard/settings` - PIN change, theme toggle, scraper trigger, test digest button and Discord digest button all work
- [ ] `/dashboard/course` - Course module list loads
- [ ] `/dashboard/modules` - Module overview loads
- [ ] `/dashboard/modules/[year]` - Year-filtered module pages load
- [ ] `/dashboard/wishlist` - List loads, CRUD works
- [ ] `/dashboard/wishlist/[category]` - Category pages load
- [ ] `/dashboard/inventory` - List loads, CRUD works; category pages with >50 items show prev/next pagination controls
- [ ] `/dashboard/inventory/[category]` - Category pages load; pagination shows "1-50 of N items" when over limit
- [ ] `/dashboard/inventory/[category]/[id]` - Detail page loads with all fields; back navigation works; edit and delete buttons work

---

## Dashboard - features

- [ ] Quick Capture FAB - Opens dialog on click, all 4 tabs (Diary/Note/Goal/Job) save correctly, toast confirms success
- [ ] Keyboard shortcuts - g+d navigates to Diary, g+n to Notes, g+g to Goals, g+a to Applications, g+h to Health, g+s to Streaks, g+v to Vault, g+x to Settings
- [ ] Keyboard shortcut help - ? key opens help dialog listing all shortcuts
- [ ] Ctrl+K global search - Opens command palette, typing filters goals/notes/diary/applications, Enter navigates
- [ ] Dark mode - Toggle in Settings persists on page reload and across different browsers/tabs
- [ ] Activity log - Recent dashboard actions visible in activity feed

---

## Dashboard - digest and cron

- [ ] Weekly email digest - Trigger from Settings > Weekly Digest; email arrives at DIGEST_EMAIL via Resend with goals, applications, streaks and diary sections
- [ ] Discord daily digest - Trigger from Settings > Discord Digest > "Send now"; rich embed appears in Discord channel with 4 inline fields (goals, applications, streaks, diary)
- [ ] Discord digest cron - Vercel cron dashboard shows `0 8 * * *` job for `/api/dashboard/discord-digest`
- [ ] Vault expiry cron - Vercel cron dashboard shows `0 9 * * *` job for `/api/dashboard/vault-expiry-check`; trigger manually from Vercel and confirm Discord embed appears for any entries expiring within 30 days

---

## Job scraper

- [ ] Scraper trigger - Settings > "Run Now" dispatches GitHub Actions job; status shows "queued" then "in_progress" on polling
- [ ] Scraped results - /dashboard/applications shows new scraped roles from multiple sources (The Trackr, Greenhouse, Lever, Adzuna, Jooble, Arbeitnow, Jobicy, Reed)
- [ ] Adzuna links - Confirm Adzuna job URLs resolve to the company's own ATS page (not adzuna.co.uk/jobs/...) by clicking a few
- [ ] Category detection - Scraped roles land in correct category groups (not all in Software Engineering); check for Data Science, AI/ML, DevOps, Embedded, Quant roles
- [ ] Seniors filtered - No "Senior", "Lead" or "Staff" roles appear in the scraped listings
- [ ] UK/EU only - No US-only roles (located in San Francisco, New York, etc.) appear

---

## Security

- [ ] `/api/dashboard/*` routes return 401 when called without a valid session
- [ ] PIN cookie is httpOnly and SameSite=Strict (no JavaScript access, no cross-site send)
- [ ] No secrets visible in client-side bundle (check Network tab, confirm no .env values in JS files)
- [ ] CSP headers present on public pages (check Response headers for Content-Security-Policy)
- [ ] CSP includes `api.lanyard.rest` in connect-src (required for Discord presence card)
- [ ] X-Frame-Options: SAMEORIGIN on CV page (iframe preview works, but page cannot be embedded externally)
- [ ] robots.txt disallows /dashboard and /api/dashboard
- [ ] Contact and newsletter API responses include `Cache-Control: no-store` header (check Network tab)
- [ ] Newsletter rate limit - submit 4 times from the same IP; 4th returns HTTP 429
- [ ] OG route strips non-ASCII - visit `/api/og?title=test%C3%A9` and confirm `é` not rendered in the image
- [ ] Dashboard server actions reject invalid input - call a write action with a 501-char string and confirm `{ error: "Invalid input" }` returned

---

## Performance

- [ ] Public pages load in under 3 seconds on simulated slow 3G (Chrome DevTools throttling)
- [ ] No console errors on any public page
- [ ] No console errors on any dashboard page
- [ ] No hydration warnings in the browser console on any page

---

## Sign-off

**Date:** ___________
**Issues found:** ___________
