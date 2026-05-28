// Public changelog for isaacadjei.me.
// I keep this in sync with CHANGELOG.md. Each release is a typed object so
// the page is always structured and readable rather than raw markdown.

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

// I list releases newest-first. The "Unreleased" entry at the top covers
// anything that has shipped to the site but has not yet been tagged.
const releases: ChangeEntry[] = [
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
      "/all-pages keyboard shortcut shows ⌘+I on Mac and Ctrl+I on Windows/Linux; symbol size bumped to text-sm for visibility",
      "pages command on /all-pages highlighted in primary colour and links directly to /lab",
    ],
    security: [
      "Force brace-expansion to 5.0.6 via npm overrides to resolve CVE-2026-45149 (GHSA-jxxr-4gwj-5jf2) - transitive dep via eslint-config-next",
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
            className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
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
