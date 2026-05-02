# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/zaccessss/isaac-adjei-portfolio/compare/HEAD...HEAD
