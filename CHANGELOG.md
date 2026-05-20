# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Fixed

- /all-pages keyboard shortcut now adapts to OS - shows `⌘+I` on Mac and `Ctrl+I` on Windows/Linux via `useModKey` hook; symbol size increased for visibility
- `pages` command on /all-pages highlighted in primary colour and links directly to /lab

### Security

- Force `brace-expansion` to 5.0.6 via npm overrides to resolve CVE-2026-45149 (GHSA-jxxr-4gwj-5jf2)

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
- Newsletter page fully rewritten with topic cards, cross-links to blog and notes, and "Read past issues on Beehiiv" link
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

- GitHub username corrected from zaccessss (4 s) to zaccesss (3 s) across all data files, layout and README

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

[Unreleased]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v1.1.0...HEAD
[v1.1.0]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v1.0.1...v1.1.0
