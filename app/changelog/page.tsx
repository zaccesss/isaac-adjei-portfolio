// I keep the public changelog in sync with CHANGELOG.md, using typed objects so the page is always structured.

import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { ScrollText, Plus, Wrench, Zap, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Changelog",
  description: "What has changed on isaacadjei.me, from the first commit to the latest update.",
  alternates: {
    canonical: "https://www.isaacadjei.me/changelog",
  },
  openGraph: {
    images: ["/api/og?title=Changelog&description=What%20has%20changed%20on%20isaacadjei%2Eme%2C%20from%20the%20first%20commit%20to%20the%20latest%20update%2E"],
  },
}

type ChangeEntry = {
  version: string
  date: string
  label?: string
  added?: string[]
  changed?: string[]
  fixed?: string[]
  security?: string[]
}

// I list releases newest-first.
const releases: ChangeEntry[] = [
  {
    version: "Unreleased",
    date: "2026-07-10",
    security: [
      "Patched a dependency vulnerability flagged across three separate alerts, all the same underlying issue in a shared transitive package",
    ],
    added: [
      "/lab: the GitHub contributions calendar now has a second, circuit-board-styled isometric view underneath the usual flat one - one extruded block per day lit up like an LED on the busiest days, defaulting to a fixed isometric angle but now with drag to rotate, scroll to zoom and a flat top-down view too",
      "/contribute: a full contributing guide covering the range of what I build - software, hardware, images and design, writing and courses, and this site; sections on ways to help, pull requests, using AI, patience and getting in touch, each cross-linked to its GitHub repo",
      "/code-of-conduct: a short personal intro followed by the Contributor Covenant 2.1 in full",
      "/support: where to get help - discussions, an issue, my support email and my contact page",
    ],
    changed: [
      "/security-policy: added a cross-link to its GitHub repo and a pointer to my projects",
      "/lab: the Spotify genre chart folds together genres that differ only by capitalisation or a trailing s, so near-identical genres like afrobeats and afrobeat now read as one slice",
      "Blog posts and project pages now name their section in the browser tab, matching TIL: Blog | the post title, Project | the project name. Notes and Consumed detail pages picked up the same convention: Notes | the note title, Consumed | the book, video or artist",
      "Notes pages and every consumed item now have a share button too, matching blog posts, TIL entries and projects",
      "The World Cup 2026 AI Predictor note is rewritten as the Multi-Sport AI Predictor: the tournament happened without it (Spain won), so it now covers what actually happened and the plan to generalise the same model into an open-ended platform covering football, basketball, tennis, cricket, motorsport, rugby, athletics and volleyball, with more sports added over time",
      "The footer's secondary links reordered to Now, Lab, Notes, Consumed, Research, Tags, Search",
      "The Spotify now-playing widget updates faster on /now, the homepage and /consumed/music",
      "/security-policy and /code-of-conduct now show a \"Last updated\" date, same as /privacy and /notes",
      "/respub: each publication now has its own page with the full abstract, keywords and a citation section (an APA-style reference plus a copyable BibTeX block); the listing page is a lighter teaser that links into it",
      "/all-pages reorganised to match the header navigation, with the old flat list split into clearer groups",
      "/tags now covers notes and consumed resources too, alongside blog, TIL, projects, publications and the rest of consumed",
      "/links: EWskills joined the Competitive section alongside LeetCode, Codeforces and AtCoder",
      "/consumed rebuilt: every item now sorts by its real year and month instead of a fixed 2026, search works across the whole page and every category, books and podcasts got proper cards with working links to their own pages, and the category tabs stay visible when switching category instead of disappearing",
      "Every /consumed item, plus every music artist page, now has prev/next navigation between entries",
      "/tags and /sitemap.xml now cover music artist genres too, alongside every other tagged content type",
      "/lab: the GitHub contributions calendar now shows a genuine year of history from a daily-synced record instead of GitHub's own rolling 52-week graph, matching the same calendar style as the Wakatime coding heatmap and Strava's training calendar",
    ],
    fixed: [
      "/lab and the dashboard: heatmap and calendar colours could silently fall back to solid black instead of the real colour scale, and switching light or dark mode left every chart's colours a step behind until a full reload - both fixed",
      "The whole site runs leaner: the guard that gates maintenance mode and the logged-out dashboard redirect now runs at the edge again rather than as a full server function on every request, after a framework rename had quietly made it the bulk of the site's hosting compute",
      "A sweep of every blog post, TIL entry and consumed-page link caught a dozen that had gone dead since they were written; each now points at the correct current source or an equivalent replacement",
      "The Sky Celebration Day post and TIL are live again, reworded to reflect that a red weather warning moved the day to fully virtual on the day itself",
      "/lab: the genre chart could show a stray non-genre tag for an artist with little Last.fm data of their own; junk tags are now filtered more reliably",
      "The homepage's Today I Learned preview could show older entries ahead of a genuinely new one; it now always shows the 3 most recent",
      "Dropped the \"Ongoing\" badge from Phaemos and avr-zac on /projects, now that their date range already carries that meaning",
      "Trimmed the newsletter page's closing \"explore the rest of the site\" block down to Blog and TIL, since the rest was already one click away from the header or footer",
    ],
  },
  {
    version: "v2.24.0",
    date: "2026-07-10",
    label: "New identity",
    added: [
      "A signature 'ia' mark now heads every page - it signs itself when you arrive, types the name letter by letter on your first visit of a session and re-signs as you move around; the dot on the i blinks as a little status light",
      "404: a small constellation of the initials draws itself above the terminal",
      "/lab: the loading screen powers up as a copper circuit-board trace and a braille divider spelling the initials sits under the terminal",
      "Loading screens across blog, projects, search and the other sections pulse a small 'ia' mark instead of a grey bar",
    ],
    changed: [
      "New favicon and app icon: an 'ia' tile that follows your device's light or dark mode, with two blue dots gently alternating in the browser tab where supported",
      "TIL moved into the main navigation after Blog; the duplicate Blog and TIL links left the footer",
      "Link previews: the share card's logo tile now uses the site's own colours instead of the old purple gradient",
    ],
  },
  {
    version: "v2.23.0",
    date: "2026-07-06",
    added: [
      "/links: my Gitea profile joined the code forges list",
    ],
  },
  {
    version: "v2.22.0",
    date: "2026-07-05",
    changed: [
      "/lab: the Spotify genre split and listening-era charts were rebuilt on the same chart set as the rest of the lab, so they render crisper and match the coding charts",
    ],
  },
  {
    version: "v2.21.1",
    date: "2026-07-02",
    fixed: [
      "/links: the GitHub, GitLab, Codeberg, Stack Overflow and Hackster links pointed at misspelt handles - all corrected",
      "/lab: the projects donut no longer drifts out of line with the languages donut when project names run long",
    ],
  },
  {
    version: "v2.21.0",
    date: "2026-06-22",
    added: [
      "/now: the MacBook and Lenovo cards now show a proper battery gauge that fills to the real level and shifts from blue to amber to red as it drains, with a bolt while charging",
      "/now: the Gaming PC card was rebuilt to match the PS5 one - CPU and GPU now show as small live graphs, the game I am playing shows underneath while I play, and the last game I played shows once the PC is off",
    ],
    fixed: [
      "/now, homepage and /lab: the device cards no longer get stuck on an old 'last seen' time while a device is actually online - they stay live now, and the clock follows my exact timezone from GPS when I travel",
    ],
  },
  {
    version: "v2.19.0",
    date: "2026-06-21",
    changed: [
      "/now, homepage and /lab live status: rebuilt to be lighter and steadier - the device, Spotify, GitHub and Discord widgets now refresh through cached endpoints that visitors share, so the cards stay fast and live no matter how many people are viewing at once; Spotify track changes still appear within a few seconds",
      "/lab: the coding heatmap dropped its small duplicate hourly bar strip - the 'by hour of day' chart beside it already shows that, more clearly",
    ],
    fixed: [
      "Live status: the Spotify and GitHub cards no longer go blank together during a brief cache hiccup - each now falls back to its own live source independently",
    ],
  },
  {
    version: "v2.15.0",
    date: "2026-06-21",
    changed: [
      "/now: Spotify visualiser rebuilt - it extracts the dominant colours from the current album art and renders a sine wave above a bouncy equaliser, both tinted from the cover; bar peaks darken as they rise like a real meter and the wave swings wider and darkens in step with the bar beneath each point; drawn on a device-pixel-ratio canvas so it stays crisp and identically proportioned on every screen, animated on delta-time, and tuned for light and dark mode; it no longer pretends to react to audio (Spotify retired the audio analysis API) so the motion is honest album-colour ambience",
      "/now: Spotify song changes now appear in near-realtime, and the live status stream pauses while the browser tab is hidden so a backgrounded page no longer polls",
      "/lab: Spotify Top Picks genres are back, sourced from Last.fm (Spotify retired its artist genre data) - the genres tab shows a rank-weighted donut and breakdown with duplicate tags merged, and each top artist lists its genre tags again",
      "/lab: Spotify Top Picks artists tab gains an underground-to-mainstream spectrum of my top artists by audience size, and the tracks tab a listening-era chart from my all-time tracks by release decade",
    ],
  },
  {
    version: "v2.11.0",
    date: "2026-06-20",
    changed: [
      "/now: Spotify widget now detects song changes within 5 seconds - a dedicated fast SSE channel polls only Spotify every 5s, keeping the main status stream at its 60s cadence",
      "/lab: Spotify visualiser bars are now slightly taller with a stronger gradient (30% opacity at the base rising to fully opaque at the peak); bars can no longer touch the sine wave - a hard cap keeps 3px of clearance at all times; peak cap dots now use the foreground colour so they are visible in both light and dark mode",
      "/lab: Top Picks - track list and artist list are now shown first with bar charts below (was the other way around); track bars now show real track duration (longest track = 100%) rather than rank position; artist bars now show real follower counts (most followed = 100%); each bar chart has a description label explaining the metric; genre breakdown now fetches genres from a dedicated batch artist call so genres are populated for mainstream artists",
    ],
  },
  {
    version: "v2.10.0",
    date: "2026-06-19",
    added: [
      "/lab: WakaTime coding dashboard - period selector (24h/7d/30d/90d/1y/all), stat cards, daily trend line chart, 7x24 interactive coding heatmap with hourly sparkline (total activity per UTC hour collapsed across all days) and peak coding hour, language and project progress bars, language and editor pie charts, weekday and hour-of-day bar charts, all with hover tooltips",
      "/lab: 20+ new terminal commands including stats, streak, today, languages, vscode, os (live WakaTime data), posts (most-read blog and TIL), grade, uptime, now, mottos, hire, cv, decrypt, matrix, make",
      "/lab: theatrical command animations - hack, coffee, decrypt, matrix, make, sudo and zac now play out line by line with real delays",
      "/lab: clickable link line type in the terminal - URLs render as primary-coloured anchor tags",
      "/lab: TypingMotto component - types out bash-style commands character by character, pauses then loops; used under the GitHub stats panel and the coding dashboard",
      "/lab: Spotify visualiser - 52-column horizontal equaliser with a gradient darkening from light violet at the base to dark indigo at the peak (taller bar = darker colour); album art spins like a vinyl record when playing and its colours bleed through the bar shapes via SVG clipPath; bright indigo sine wave below the bars brightens with track energy; blurred album art as card background",
      "/lab: PCB viewer full redesign - full-width interactive 3D model (real geometry from the original 3DS file converted to GLB, loaded via react-three-fiber + drei); angle presets (front, back, top, bottom, left, right); wireframe toggle, auto-rotate toggle and grid helper; below the 3D model: copper layer drag-to-orbit panels, real board front/back flip card (photos of the actual built board), assembled board photo and full circuit schematic - the photo and schematic cards open in a fullscreen lightbox on click",
      "/about: approach code animation now ends with a highlighted primary-blue motto line - nohup hustle && disown impostor_syndrome",
      "/consumed/music/[slug] - individual artist pages for each featured artist; cards on /consumed/music now link through to the detail page with YouTube embed, genre tag and personal notes",
      "/notes/codeforces-auto-push - research note on auto-pushing competitive programming solutions to GitHub; maps what already exists (CFPusher for Codeforces, LeetHub 3.0 and LeetSync for LeetCode, AtCommitter for AtCoder, UpCode for bulk upload) and where the gaps are (no tool for TryHackMe, no unified extension); plans a single Manifest V3 extension covering Codeforces, AtCoder and TryHackMe with one GitHub PAT and one organised repo",
    ],
  },
  {
    version: "v2.9.0",
    date: "2026-06-18",
    added: [
      "/respub - academic profile page: research interests, external links (ORCID, Google Scholar, ResearchGate, Academia.edu) and publications list",
      "/til - Today I Learned: 63 entries across 21 categories; search, category filter and pagination (10 per page); reading time per entry; RSS feed at /til/feed.xml",
      "/til/[slug] - individual TIL entry pages with ShareButton, optional ToC sidebar and prev/next navigation",
      "/tags - tag cloud aggregating blog, TIL, projects, publications and consumed content; client-side search",
      "/tags/[tag] - content filtered by a single tag across all content types in grouped sections",
      "/search - unified full-text search across blog, TIL, projects, publications, notes, newsletter and consumed; results ranked by relevance score",
      "/consumed/[category]/[slug] - 216 individual consumed item pages with embedded players (YouTube for videos, Spotify for podcasts) and breadcrumb navigation",
      "/newsletter/feed.xml - newsletter RSS feed with styled browser view and ?raw for raw XML",
      "/blog/feed.xml - blog RSS feed at its canonical URL; old /feed.xml permanently redirects here",
      "FeaturedTIL section on homepage: 3 most recent TIL entries between Featured Blog Posts and Newsletter; each card links to /til/[slug]",
      "Root-level error boundary (app/error.tsx): calm card with Try again and Go home buttons; distinct from the terminal-style 404",
      "Custom 404 page: interactive terminal with boot animation, clickable shortcut links and a live command input",
      "Giscus comment system on all blog posts: GitHub Discussions-powered; dark/light theme matches site",
      "Blog reactions: 8 standard emoji plus an extended picker (28 additional via SmilePlus); counts shown inline; stored per-post per-user",
      "Blog cover images on all 20 published posts; RSS feeds include thumbnails for feed reader preview",
      "Tags and Search added to CommandMenu (Cmd+K) and footer secondary nav row",
      "Secondary footer nav row: Now, Notes, Lab, Uses, Colophon, Changelog",
      "Notes page TIL callout card linking to /til",
      "Lab terminal new commands: til, respub, rss, blogfeed, tilfeed, newsletterfeed, playing (async), lastgame (async), pushed (async)",
      "Newsletter While you wait section: TIL and Research and publications cross-links added",
      "Dual PWA manifests: separate manifests for the public portfolio and dashboard with distinct icons, names and start URLs",
      "Links page restructured from 4 to 10 sections (Professional, Writing, Academic, Code, Competitive Programming, Hackathons, Social, Content, Support, Other); 12 new platforms added including HackerRank, CodeChef, Stack Overflow, TryHackMe and ResearchGate; quick social icon row under bio",
      "Projects pagination: 9 per page with prev/next navigation; AI/ML added as a project category",
      "dotfiles project added to /projects: full detail page with overview, 8 highlights, tech stack and 2-image gallery; covers 59 topic files, cross-platform aliases, 3-platform git mirroring and Starship integration",
      "/uses Terminal and shell section: dotfiles entry and Starship entry with shared config explanation",
      "Skills page Core Tools: Starship added",
      "Project detail page: inline code rendering via backtick syntax so command names render as styled code elements",
      "New blog post: How to Contribute to Open Source: A Practical Guide; published 2026-06-13",
      "Blog renderer: Spotify episode embeds and inline [text](url) link rendering in paragraph and list blocks",
      "All 34 blog posts enriched with references sections (6-13 items each) and inline links for tools and projects mentioned",
    ],
    changed: [
      "Blog RSS canonical URL moved from /feed.xml to /blog/feed.xml; old URL redirects (301) with query-param forwarding",
      "Projects: phaemos recategorised to IoT; cad-portfolio and git-unlocked recategorised to Academic; filter bar gains IoT and Academic buttons",
      "Blog inline links now styled in blue across blog, colophon, consumed, now and uses pages",
      "ps5:last-game Redis key: only written when a game is actively running so sitting at the home screen no longer overwrites the last played title",
      "All hover scale and translate CSS transforms scoped to sm: breakpoint to prevent GPU compositing layer exhaustion on iOS Safari",
      "Social icons on hero and contact page standardised to react-icons/fa6 for GitHub and LinkedIn",
      "Consumed overview: Year and Month filter labels added; Category label above tabs; all category subpages gain Year filter",
      "Newsletter issues API now filters out scheduled posts with a future publish date before returning the response",
      "Removed: BuyMeACoffee from hero and contact social link rows (remains in /links Support section and blog AuthorCard)",
    ],
    fixed: [
      "Mobile Safari and Chrome renderer crash (A problem repeatedly occurred) on / and /projects: a single oversized project thumbnail was decoding to over 500MB in browser memory; hover transforms also scoped to sm: and the header's blur effect scoped to desktop so no GPU layers are created on touch devices",
      "PS5 last played game now persists correctly when offline",
      "PS5 status no longer shows a stale last seen time while actively online",
      "Giscus comment iframe blocked by CSP: giscus.app added to frame-src allowlist",
      "RSS ?raw query param now serves Content-Type: application/xml for Chrome native XML viewer",
      "Newsletter page showing scheduled issues before their publish date",
      "First project card on /projects and first post cover on /blog now load eagerly instead of lazily, fixing a slower Largest Contentful Paint for the above-the-fold image on each page",
      "/lab under-construction GIF reduced from 1.6MB to 833KB via recompression with no visible quality loss; also now loads eagerly to fix a Largest Contentful Paint warning",
      "/lab terminal maximise button left a 31px gap below the header instead of sitting flush against it",
    ],
  },
  {
    version: "v2.8.0",
    date: "2026-05-30",
    added: [
      "Mobile banner: slim dismissible notice below the header on screens narrower than 768px suggesting the site is best viewed on a laptop or desktop; hidden via md:hidden so it never appears on wider screens",
      "git-unlocked project gallery expanded with 4 new images: 3D GitHub logo badge (card preview), Octocat with GitHub profile on laptop, Octocat and Groot figurines and close-up Octocat; card preview image updated from banner SVG to the 3D logo badge",
      "/now page intro now links to nownownow.com/p/n4lZ alongside the existing Derek Sivers credit so visitors can find the listed profile",
      "Colophon expanded: shadcn/ui and next-themes as separate entries; backend section adds Vercel, Resend, Beehiiv, GitHub Actions and Cloudflare Turnstile; design section adds GA4, share feature and responsive design note; new Notable pages and features section covers /lab, /blog renderer, /consumed, /changelog and OG image generation; all live status entries expanded with more detail; Vercel and Cloudflare links added to header meta",
      "/now page content refreshed: updated Where I am (London for summer), Studying (FPGA/VHDL, competitive programming on Neetcode/Leetcode/Codeforces, hackathons), Building (accurate Phaemos hardware detail, World Cup 2026 AI Predictor added, This site blurb updated), Thinking about (internship search, events, Sky campus mention), Outside of work (running and hiking added)",
    ],
    changed: [
      "PS5 Cloudflare Worker cron reduced from every minute to every 2 minutes to stay within the 1,000 write/day free tier KV limit (720 writes/day vs previous 1,440); Redis TTL for ps5:status extended from 120s to 150s to keep a 30s buffer between key expiry and the next poll",
    ],
    fixed: [
      "Header theme toggle and hamburger menu now pin correctly to the far right on small screens; replaced the three-column grid with flex justify-between on mobile so the controls are never left drifting toward the centre when the desktop navigation is hidden",
      "Mobile banner text changed from text-muted-foreground to text-foreground so it reads clearly as black on light and white on dark",
      "/now page header now shows Updated live only - removed Last updated May 2026 which was misleading alongside a live indicator",
      "/notes and /privacy pages updated from May 2026 to June 2026",
    ],
  },
  {
    version: "v2.7.0",
    date: "2026-05-29",
    added: [
      "PS5 Busy mode: doNotDisturb PSN status treated as online; busy field added to Worker, API route and card",
      "Notes page teaser strip: slim animated live status preview on /notes linking to /now; full widget removed from notes",
      "Now and Lab added to main navigation; navigation centred in header using three-zone grid layout",
      "Contact page now shows email address below the contact form",
      "Footer social row reordered and simplified: All Pages, Contact, Newsletter, LinkedIn, GitHub, ORCID",
      "Footer newsletter signup form removed; newsletter signup remains on /blog and /newsletter",
      "Spotify card shows Spotify icon and external link to profile in card header",
      "GPC daemon fetches cover art from IGDB (Twitch API) on first game detection and caches per session",
      "GPC daemon sends game_image alongside game name; GPC card renders the cover art thumbnail",
      "GPC daemon 5-tier game detection: hardcoded dict, Steam Web API, Epic Games manifests, EA App manifests and process-name IGDB fuzzy search",
      "FiveM added to GPC game detection",
      "GPC daemon cover art for GTA V, FC 26, Apex Legends, Rocket League, Overwatch 2, Fortnite, Minecraft and FiveM",
      "PS5 Worker fetches game cover art from IGDB on each cron run; falls back to PSN conceptIconUrl when IGDB is not configured",
      "PS5 card renders IGDB cover art when online; shows text-only last played game name when offline",
      "PS5 Worker exchanges NPSSO for a refresh token on first run and stores it in KV; subsequent runs use the refresh token automatically",
    ],
    changed: [
      "Spotify icon colour changed from Spotify green to blue to match site colour theme",
      "GitHub strip moved above Discord card in live status widget",
      "Home removed from navigation; avatar links to homepage",
      "/uses and /now references to 'notes page' corrected to 'now page'",
    ],
    fixed: [
      "feed.xml?raw no longer crashes with Cloudflare CPU timeout; returns raw XML directly instead of running regex transforms",
      "PS5 lastGame and lastGameImage now read from lastKnown instead of the live source so the last played game persists when offline",
      "PS5 card no longer shows online when console is off; API returns last genuine online timestamp rather than cron polling timestamp",
      "PS5 Worker updated to current PSN client ID and required headers; old client ID was removed by PSN and caused 400 errors",
      "PS5 Worker IGDB request includes Content-Type: text/plain header required by the Apicalypse query format",
      "Discord activity card sorts Playing before Watching to match Discord display order",
      "Discord activity large icon shows the small icon as a bottom-right overlay",
      "Discord activity elapsed timestamp shows seconds in H:MM:SS / M:SS format and updates live every second",
    ],
    security: [
      "Force brace-expansion to 5.0.6 via npm overrides to resolve CVE-2026-45149 (GHSA-jxxr-4gwj-5jf2)",
    ],
  },
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
  {
    version: "v2.3.0",
    date: "2026-05-20",
    added: [
      "/consumed page: 49 YouTube videos, 12 Spotify podcasts and 10 books logged for 2026; content sorted oldest to newest across January to May; All tab groups by month; click-to-play video facade; music section links to the Notes page Spotify widget",
      "/now page: snapshot of what I am doing right now covering location, studying, building, reading, thinking about, outside of work and listening; inspired by nownownow.com",
      "/uses page: all the hardware, software and tools I use day to day",
      "/colophon page: how the site is built, the full stack and the decisions behind it",
      "/changelog page: this page, full version history from the first commit",
      "Dark/light mode crossfade: 150ms ease transition on theme toggle instead of instant swap",
      "Next and previous post navigation at the bottom of every blog post",
      "Blog reactions: thumbs up, flame, lightbulb and heart per post stored in Redis; one click, no comments",
      "Post series grouping: series and seriesPart fields on BlogPost; SeriesBanner component on post pages; series indicator on post cards",
      "Hall of Fame reframe: personal acknowledgements (God, mum, dad) lead the page before security researchers",
      "Command menu searches projects and includes all hidden pages in a More group",
      "Gaming PC daemon, API route and live card: NVIDIA RTX 4060 GPU%, CPU% and active game via pynvml, runs via NSSM",
      "Lenovo daemon, API route and live card: battery and charging state via NSSM service",
      "Spotify device name shown in the card label when actively playing",
      "Spotify podcast and episode support: episode title, show name and episode artwork shown the same as tracks",
      "Spotify last played: when nothing is active the card shows the previous track or episode in a greyed-out grayscale state",
      "Real-time Spotify progress bar: ticks forward every second client-side and snaps to the true position on each API poll",
      "RSS feed 'View raw XML' button: opens a syntax-highlighted dark HTML view of the raw feed with colour-coded tags, attributes, CDATA and processing instructions",
      "Scrolling marquee on long Spotify track titles: title scrolls continuously when it overflows the card width, looping seamlessly; short titles stay static",
    ],
    changed: [
      "/consumed description updated to 'so far this year' to reflect ongoing additions",
      "Gaming PC card restructured: offline state shows only last-seen; GPU, CPU and game fields are live-only",
      "Live status layout: time card moved to the left column and MacBook card to the right in the two-column row",
      "Spotify polling interval reduced from 30s to 10s so track changes appear faster",
      "GitHub icon replaced with GitBranch from lucide-react in the last-pushed card",
    ],
    fixed: [
      "YouTube and Spotify embeds blocked by CSP: added www.youtube.com and open.spotify.com to frame-src",
      "Gaming PC card CPU and GPU combined onto one line to prevent the card expanding taller than others",
      "Charging state hidden on device cards when last daemon update is more than 5 minutes old",
      "Separator and icon visibility improved in both light and dark mode",
      "Sitemap missing 7 pages: /now, /consumed, /uses, /changelog, /colophon, /all-pages and /privacy were live but not indexed by Google",
      "RSS feed unstyled in Chrome: Chrome 131 dropped XSLT support; the feed now serves a styled dark HTML page to browsers and raw XML to feed readers",
      "Spotify podcasts not showing in widget: the player API call was missing ?additional_types=track,episode so Spotify silently returned nothing for episodes",
    ],
  },
  {
    version: "v2.2.0",
    date: "2026-05-18",
    added: [
      "Dynamic OG images per blog post and project page via Next.js ImageResponse",
      "Article JSON-LD structured data on all published blog posts",
      "Beehiiv past newsletter issues on the newsletter page, cached in Redis",
      "Related posts section at the bottom of each blog post (up to 3 shared-tag matches)",
      "GitHub contribution heatmap, commits, PRs, issues and last pushed on the Lab page",
      "Blog post search in the command menu",
      "RSS feed XSL stylesheet so the feed renders as a styled page in browsers",
    ],
    changed: [
      "All ten project long descriptions expanded with design rationale and build process",
      "Homepage hero completely rewritten with a two-paragraph structure and nav links",
      "Lab terminal auto-focuses input after boot so you can type immediately",
      "Sitemap lastModified dates changed from new Date() to real last-changed dates",
    ],
    fixed: [
      "OG/Twitter image generation routes marked noindex so Google ignores them",
      "Privacy page removed from sitemap to resolve conflicting noindex signals",
    ],
  },
  {
    version: "v2.1.0",
    date: "2026-05-15",
    added: [
      "Live status widget: Spotify now playing with album art and progress bar, London time, MacBook battery and charging state, GitHub last push",
      "Mac daemon (scripts/mac-daemon.py): writes battery, charging state, timezone and weather to Redis every 30s via launchd",
      "Reading progress bar at the top of every blog post",
      "Copy button on all code blocks",
      "Sticky table of contents sidebar on blog posts with 3+ headings",
      "Custom 404 page: terminal-style animated boot sequence with error line",
      "/notes/world-cup-ai-predictor and /notes/prosthetics-health-tech detail pages",
      "AstonCV blog post",
    ],
    changed: [
      "Live status cards moved from homepage to /notes and /lab",
      "Spotify polling interval reduced from 30s to 10s",
      "Newsletter page fully rewritten with topic cards and past issues link",
    ],
    fixed: [
      "All em dashes and en dashes removed sitewide",
      "Oxford commas removed from all content",
    ],
  },
  {
    version: "v2.0.0",
    date: "2026-05-14",
    added: [
      "Full blog system with 11 published posts across 7 content types",
      "Blog-to-project cross-linking via projectSlug field",
      "Newsletter system via Beehiiv API with subscription form",
      "/notes page: public notebook with current builds and plans",
      "/lab page: interactive terminal with 30+ commands",
      "/security-policy and /hall-of-fame pages",
      "Command menu keyboard shortcuts (Mod+H/A/P/E/S/B/N/J/C/L)",
    ],
    changed: [
      "Blog page redesigned with type filter tabs and date-sorted post grid",
      "Lab page: terminal moved here with upgraded colour scheme",
      "About page intro expanded with retinoblastoma, father, Adisadel leadership and more",
    ],
    fixed: [
      "Blog post 404s: params now awaited as Promise in Next.js dynamic routes",
      "Lab terminal crash on boot fixed",
    ],
    security: [
      "/security-policy published with responsible disclosure contact and response timeline",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-05-11",
    added: [
      "avr-zac project: ATmega644P bare metal C with nine-mode state machine",
      "Phaemos smart maintenance platform added to featured projects",
      "ORCID profile link in footer and /links",
      "Cybersecurity project category",
      "Platforms & Operating Systems skills category",
      "public/.well-known/security.txt",
      "Per-page canonical tags on all routes",
    ],
    fixed: [
      "GitHub username corrected from zaccesss to zaccesss throughout",
    ],
  },
  {
    version: "v1.0.1",
    date: "2026-05-06",
    fixed: [
      "ERR_TOO_MANY_REDIRECTS in production caused by conflicting host redirect rules",
      "Canonical host handling consolidated between app and edge layers",
      "ThemeProvider typing compatibility restored for next-themes",
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-04-28",
    label: "Initial launch",
    added: [
      "Full portfolio site launched on isaacadjei.me",
      "Pages: Home, About, Projects, Experience, Skills, Blog, Contact, CV, Links",
      "Project detail pages with image gallery for 7 projects",
      "CV viewer and downloadable PDF route",
      "Contact form with honeypot, rate limiting and input sanitisation",
      "Command palette (Cmd/Ctrl+I) for quick navigation",
      "Dark/light mode toggle",
      "Scroll progress indicator and back-to-top button",
      "Open Graph and Twitter card metadata",
      "Cloudflare Turnstile on contact form",
      "Content Security Policy headers",
      "Upstash Redis rate limiting",
      "Gitleaks secret scanning in CI",
      "Dependabot auto-updates with auto-merge",
    ],
  },
]

const categoryConfig = {
  added:    { icon: Plus,   label: "Added",    colour: "text-green-600 dark:text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20"  },
  changed:  { icon: Zap,    label: "Changed",  colour: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
  fixed:    { icon: Wrench, label: "Fixed",    colour: "text-sky-600   dark:text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"    },
  security: { icon: Shield, label: "Security", colour: "text-rose-600  dark:text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20"   },
} as const

export default function ChangelogPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ScrollText className="h-7 w-7 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          What has changed on this site from the first commit to the latest update.
          Full history is also in{" "}
          <a
            href="https://github.com/zaccesss/isaac-adjei-portfolio/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            CHANGELOG.md
          </a>
          .
        </p>
      </section>

      <Separator />

      {/* Release entries */}
      <div className="space-y-12">
        {releases.map((release, i) => {
          const isUnreleased = release.version === "Unreleased"
          return (
            <div key={release.version} className="space-y-5">
              {i > 0 && <Separator className="mb-12" />}

              {/* Version header */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold font-mono">
                  {isUnreleased ? (
                    <span className="text-primary">{release.version}</span>
                  ) : (
                    release.version
                  )}
                </h2>
                {release.date && (
                  <span className="text-xs font-mono text-muted-foreground">{release.date}</span>
                )}
                {release.label && (
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    {release.label}
                  </span>
                )}
                {isUnreleased && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                    live on site
                  </span>
                )}
              </div>

              {/* Change categories */}
              <div className="space-y-4">
                {(["added", "changed", "fixed", "security"] as const).map((cat) => {
                  const items = release[cat]
                  if (!items || items.length === 0) return null
                  const { icon: Icon, label, colour, bg, border } = categoryConfig[cat]
                  return (
                    <div key={cat} className="space-y-2">
                      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${bg} ${border} ${colour}`}>
                        <Icon className="h-3 w-3" />
                        {label}
                      </div>
                      <ul className="space-y-1.5">
                        {items.map((item, j) => (
                          <li key={j} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
