# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/zaccesss/isaac-adjei-portfolio/compare/v1.0.1...HEAD
