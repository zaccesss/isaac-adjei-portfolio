// Colophon - how this site is built. I like sites that are transparent about
// their stack and decisions. This page is that.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Code2, Server, Palette, Cpu, Layers, ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Colophon",
  description: "How isaacadjei.me is built - the stack, the decisions and the details.",
  alternates: {
    canonical: "https://www.isaacadjei.me/colophon",
  },
  openGraph: {
    images: ["/api/og?title=Colophon&description=How%20isaacadjei%2Eme%20is%20built%20-%20the%20stack%2C%20the%20decisions%20and%20the%20details%2E"],
  },
}

const sections = [
  {
    icon: Code2,
    heading: "Frontend",
    items: [
      {
        name: "Next.js 16 (App Router)",
        detail:
          "The entire site is a Next.js application - a framework that handles both the user-facing pages and the server-side logic in one codebase. I use the App Router, which lets me choose on a per-page basis whether content is built on the server (faster initial load, better for SEO) or in the browser (needed for anything interactive like the live status widget). Most pages are server-rendered and sent to you pre-built.",
      },
      {
        name: "TypeScript",
        detail:
          "JavaScript with a strict type system layered on top. Every piece of data in this site has a defined shape - blog posts, project entries, API responses, all of it. This means the editor can catch mistakes before the code even runs, which matters when a lot of things are interconnected. Strict mode throughout with no exceptions.",
      },
      {
        name: "Tailwind CSS",
        detail:
          "A utility-first CSS framework - instead of writing separate stylesheet files, styles are applied directly as class names in the HTML. It keeps styling co-located with the component it applies to, which makes maintenance straightforward. I combine it with shadcn/ui (see below) for more complex interactive components.",
      },
      {
        name: "shadcn/ui",
        detail:
          "A collection of pre-built, accessible UI components that I own the code for - dialogs, dropdowns, tooltips, badges, the command palette. Unlike a traditional component library where you import a package you cannot change, shadcn/ui components live directly in the codebase and can be modified freely. Built on Radix UI primitives, which handles the tricky accessibility behaviour (keyboard navigation, focus trapping, ARIA attributes).",
      },
      {
        name: "Framer Motion",
        detail:
          "Used sparingly for the entrance animations on the homepage hero section. The staggered fade-in as the page loads is handled here. I deliberately keep motion minimal on the rest of the site - animation should enhance content, not compete with it.",
      },
      {
        name: "Lucide React and React Icons",
        detail:
          "All icons across the site. Lucide for UI icons (arrows, checks, chevrons, status indicators and so on). React Icons for brand logos where Lucide does not have an official one - GitHub, LinkedIn, Spotify, Discord and similar.",
      },
      {
        name: "Geist",
        detail:
          "The typeface designed by Vercel and used across this site. Geist Sans for all body text, headings and UI labels - clean and highly legible at any size. Geist Mono for timestamps, file paths, code snippets and technical labels where fixed-width spacing matters. Both are loaded as Next.js font optimisations so they are never fetched from an external CDN.",
      },
      {
        name: "next-themes",
        detail:
          "Manages the light and dark mode toggle. It stores your preference in localStorage so the site remembers which theme you chose across visits. The 150ms crossfade on toggle is handled here. No flash of the wrong theme on page load.",
      },
    ],
  },
  {
    icon: Server,
    heading: "Backend and data",
    items: [
      {
        name: "Vercel",
        detail:
          "Where the site is hosted and deployed. Every time a change is merged to the main branch on GitHub, Vercel automatically builds and deploys the new version within about a minute. Preview deployments are also created for every pull request so changes can be reviewed at a live URL before they go public. The domain and SSL certificate are managed here too.",
      },
      {
        name: "Upstash Redis",
        detail:
          "Redis is a data store that keeps everything in memory rather than on disk, which makes reads and writes extremely fast. I use Upstash's serverless version for anything that changes frequently and needs to be retrieved quickly: live device status from the daemons, the currently playing Spotify track, blog post reaction counts and rate limiting on the contact form. Redis is not a traditional database - it is a short-term, high-speed cache.",
      },
      {
        name: "Next.js API routes",
        detail:
          "All the server-side logic lives in route handlers inside the Next.js app. When the live status widget asks 'is the PS5 online?', it is calling one of these routes, which in turn reads from Redis. The Spotify now-playing card, the GitHub activity strip, the contact form submission, blog reactions - each is a separate server-side function that runs on demand. None of this logic runs in your browser.",
      },
      {
        name: "Blog and project data",
        detail:
          "All blog posts and project entries are stored as typed TypeScript arrays in two files: data/blog.ts and data/projects.ts. There is no external CMS, no database, no third-party content API. I write content directly as code, which means it is versioned in Git alongside everything else, renders instantly with no database round-trip and is easy to search and edit. Blog posts use a block-based structure - each post is an array of typed blocks (heading, paragraph, list, code, image, quote) rendered by a shared component.",
      },
      {
        name: "RSS feed",
        detail:
          "An RSS feed is generated dynamically at /feed.xml from the blog post data. RSS is a standard format that lets anyone subscribe to this site in a feed reader and receive new posts automatically without visiting the site. The feed is styled with an XSL stylesheet so it looks presentable in browsers that render it directly rather than treating it as raw XML.",
      },
      {
        name: "Resend",
        detail:
          "Email delivery for the contact form. When you submit a message, the name, email and content are sent to a server-side route which calls the Resend API to forward it to my inbox. Nothing is stored in a database - the email is sent and that is it. Submissions are also rate-limited via Redis to prevent the form being used for spam.",
      },
      {
        name: "Beehiiv",
        detail:
          "The platform behind the isaacadjei.me newsletter. When you subscribe via the site, a server action calls the Beehiiv API to add your email to the publication. Beehiiv handles list management, sending, tracking and unsubscribes. Every issue has a one-click unsubscribe link at the bottom.",
      },
      {
        name: "GitHub Actions",
        detail:
          "Automated workflows that run whenever code changes. The main one generates the CV PDF: whenever cv.html is updated on the main branch, an action runs html2pdf.js in a headless Node environment, converts the HTML to a PDF and commits the file back to the repo. This means the PDF is always in sync with the HTML source without any manual export step.",
      },
      {
        name: "Cloudflare Turnstile",
        detail:
          "The bot protection on the contact form. Unlike traditional CAPTCHAs that make you identify traffic lights or buses, Turnstile works silently in the background and only challenges when it suspects bot activity. Server-side verification happens before any email is sent - if the Turnstile check fails, the request is rejected. Free tier, no tracking pixels, no fingerprinting.",
      },
    ],
  },
  {
    icon: Palette,
    heading: "Design decisions",
    items: [
      {
        name: "Dark mode first",
        detail:
          "The dark theme is the primary design target - it is what I look at most often and what I optimise for. Both light and dark themes use the same component code; only the CSS custom property values change between them. The preference is persisted across visits and the toggle crossfades at 150ms to avoid a jarring flash.",
      },
      {
        name: "No animations on scroll",
        detail:
          "Scroll-triggered animations - things that fade or slide in as you scroll down - are deliberately avoided on most pages. They add visual noise, can cause nausea for users sensitive to motion and make the page feel slower even when it is not. Entrance animations are limited to the homepage hero. Everything else just loads.",
      },
      {
        name: "No city, ever",
        detail:
          "The live status widget shows my current country and timezone but never the city. The Mac daemon has access to GPS-level location via CoreLocationCLI but deliberately only passes the country code to Redis. This is a hard privacy line - knowing I am in the UK is useful context for the clock; knowing I am in a specific neighbourhood is not.",
      },
      {
        name: "Blog as structured data, not markdown",
        detail:
          "Most developer sites use MDX - markdown files with embedded React components. I went a different route: each blog post is a typed TypeScript object with a content array of explicit block types (heading, paragraph, code, list, quote, image). A shared block renderer turns these into HTML. The trade-off is more verbose authoring, but the payoff is full control over how every element renders, no MDX compilation step and complete type safety throughout.",
      },
      {
        name: "Command palette",
        detail:
          "Cmd+I (or Ctrl+I on Windows) opens a site-wide command palette powered by cmdk. You can jump to any page, search projects, toggle the theme and more without touching the mouse. The shortcut is I for Isaac rather than K (the more common convention) - a small personal touch.",
      },
      {
        name: "Share feature",
        detail:
          "Projects, blog posts and the CV all have a share button. On desktop it copies the page URL to the clipboard and shows a brief confirmation. On mobile it opens the native share sheet so you can send the link through any app. The button is deliberately only present on shareable content pages - not on utility pages like Skills or About.",
      },
      {
        name: "Responsive but desktop-first content",
        detail:
          "The site is fully responsive and works on any screen size, but the richer content - live status cards, the lab terminal, project galleries - is designed with a larger screen in mind. A slim dismissible banner appears on narrow screens to set that expectation. The banner text is foreground-coloured (not grey) so it is actually readable.",
      },
      {
        name: "Google Analytics (GA4)",
        detail:
          "Privacy-conscious page-view analytics. Fully anonymised - no individual visitor is identified or tracked across other websites. I can see which pages are read most and which content is landing well, which helps me decide what to write next. Nothing personal is collected.",
      },
    ],
  },
  {
    icon: Layers,
    heading: "Notable pages and features",
    items: [
      {
        name: "/lab - interactive terminal",
        detail:
          "An in-browser terminal built from scratch with a custom command parser. Type 'help' to see available commands. It works as a hidden layer of the site - you can navigate to pages, run easter eggs, explore projects and find things not linked anywhere else. On mobile it is accessible via a floating button. The blinking cursor and monospaced aesthetic are intentional.",
      },
      {
        name: "/blog - block-based post renderer",
        detail:
          "Blog posts are authored as typed TypeScript objects rather than markdown files. A shared block renderer handles every block type: headings, paragraphs, code with syntax highlighting, numbered and bulleted lists, pull quotes, images with captions and reference links (numbered superscript links that compile into a references section at the bottom). Each post also has an emoji reaction bar backed by Redis.",
      },
      {
        name: "/consumed - media tracking",
        detail:
          "A public log of books, articles, videos, courses and other media. Organised by category with filtering. The data lives in a TypeScript array alongside the blog and project data - same versioned-in-Git approach. Not reviews, just a record of what I have read, watched or listened to.",
      },
      {
        name: "/changelog - public release history",
        detail:
          "Every meaningful change to the site is logged here as a versioned entry. Updated manually in CHANGELOG.md and rendered as a timeline. It is a habit I picked up from open-source projects and I find it useful for tracking how the site has evolved over time.",
      },
      {
        name: "OG image generation",
        detail:
          "Every page has a dynamically generated Open Graph image at /api/og. When you share a link on Twitter, LinkedIn, iMessage or any platform that shows a preview card, the image is generated on the fly using Vercel's @vercel/og library. It renders the page title and description as a styled card using the Geist font. This is why shared links look intentional rather than blank.",
      },
    ],
  },
  {
    icon: Cpu,
    heading: "The live status system",
    items: [
      {
        name: "How it works",
        detail:
          "The live status widget on /now, the homepage and /lab shows real data from my devices in near real-time. Background services (daemons) run on each machine and push data to Upstash Redis every 30 to 60 seconds. The site then reads from Redis when you load the page. If a device goes offline, Redis keys expire after a short window and the card shows the last known state with a timestamp.",
      },
      {
        name: "MacBook daemon",
        detail:
          "A Python script managed by launchd on macOS. It runs in the background at all times and writes to Redis every 30 seconds: battery percentage, charging state, local timezone and current weather. Weather comes from Open-Meteo, a free European meteorological API with no API key required that uses the ECMWF model - more accurate for UK weather than most commercial alternatives. Location is determined via CoreLocationCLI (GPS-level accuracy) with ipinfo.io as a fallback. Only country code and timezone are stored - city is deliberately excluded for privacy.",
      },
      {
        name: "Lenovo and Gaming PC daemons",
        detail:
          "Python scripts managed by NSSM (Non-Sucking Service Manager) as proper Windows services - they start on boot, restart on crash and run without a visible terminal. The Gaming PC daemon also reads GPU utilisation via pynvml (NVIDIA's Python library) and detects the currently running game through five escalating tiers: a hardcoded map of known games, the Steam Web API, Epic Games local manifest files, EA App manifest files and finally process-name fuzzy matching against IGDB's game database. Cover art is fetched from IGDB on first detection and cached for the session.",
      },
      {
        name: "Spotify",
        detail:
          "A Next.js API route fetches the currently playing track from the Spotify Web API on demand. The OAuth access token (which expires every hour) is refreshed server-side and cached in Redis so it is never fetched on every single request. The progress bar on the card ticks every second client-side based on the position returned by Spotify, and the full API is polled every 10 seconds. When nothing is playing, the last played track is shown in a greyed-out state from a separate Redis key.",
      },
      {
        name: "PS5",
        detail:
          "A Cloudflare Worker runs on a cron every 2 minutes and polls the PlayStation Network presence API using a custom OAuth v2 flow written from scratch - no third-party libraries. Sony's session cookie (NPSSO) is exchanged for a short-lived access token and a long-lived refresh token on first run. The refresh token is stored in Cloudflare Workers KV and rotated on each use, so the session stays valid for around 60 days before needing a new NPSSO. Game cover art is fetched from IGDB on each run. The result (online status, game name, cover art, last seen timestamp) is written to Upstash Redis.",
      },
      {
        name: "Discord",
        detail:
          "The Discord presence card uses Lanyard, a free open-source API that exposes Discord rich presence data for opted-in users. It shows online status (online, idle, do not disturb, offline), current activity (game being played, VS Code workspace, Spotify playback via Discord) and elapsed time. On /now the card always shows, even offline. On /notes it only appears when I am online. Multiple simultaneous activities stack with type labels.",
      },
      {
        name: "GitHub activity",
        detail:
          "The GitHub strip uses the GitHub REST API to show the last repository I pushed to and when. It is fetched server-side and cached in Redis for 5 minutes. My profile repo (zaccesss/zaccesss) is excluded so the strip always shows real project activity rather than profile README updates.",
      },
    ],
  },
]

export default function ColophonPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Colophon</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          How this site is built. I like sites that are open about their stack and decisions,
          so here is mine.
        </p>
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground flex-wrap">
          <span>
            Source:{" "}
            <a
              href="https://github.com/zaccesss/isaac-adjei-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </span>
          <span>
            Deployed on{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
            >
              Vercel
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </span>
          <span>
            DNS via{" "}
            <a
              href="https://cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
            >
              Cloudflare
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </span>
        </div>
      </section>

      {sections.map(({ icon: Icon, heading, items }, si) => (
        <div key={heading}>
          {si > 0 && <Separator className="mb-14" />}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-base font-semibold">{heading}</h2>
            </div>
            <ul className="space-y-5">
              {items.map(({ name, detail }) => (
                <li key={name} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ))}

      <Separator />

      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
        Something interesting or something broken?{" "}
        <Link
          href="/contact"
          className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          Let me know.
        </Link>
      </p>
    </div>
  )
}
