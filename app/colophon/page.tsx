// Colophon - how this site is built. I like sites that are transparent about
// their stack and decisions. This page is that.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Code2, Server, Palette, Cpu, ArrowUpRight } from "lucide-react"

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
          "The entire site is a Next.js application. I use the App Router with server components for everything that does not need interactivity, and client components only where required.",
      },
      {
        name: "TypeScript",
        detail:
          "Strict mode throughout. All data shapes are typed, all API responses are typed. It catches mistakes before they reach production.",
      },
      {
        name: "Tailwind CSS",
        detail:
          "Utility-first styling. Combined with shadcn/ui for the components that needed a solid base (command menu, dialogs, badges, tooltips).",
      },
      {
        name: "Framer Motion",
        detail:
          "Used sparingly for entrance animations on the homepage sections. I try not to let animation get in the way of content.",
      },
      {
        name: "Lucide React and React Icons",
        detail:
          "All icons. Lucide for UI icons, React Icons for brand logos (GitHub, LinkedIn, Spotify etc).",
      },
      {
        name: "Geist",
        detail:
          "The typeface. Vercel's Geist Sans for body and headings, Geist Mono for code, timestamps and technical labels.",
      },
    ],
  },
  {
    icon: Server,
    heading: "Backend and data",
    items: [
      {
        name: "Upstash Redis",
        detail:
          "Serverless Redis used for live device status, Spotify token caching, blog reaction counts and rate limiting on the contact form. The main store for anything real-time.",
      },
      {
        name: "Next.js API routes",
        detail:
          "All server logic lives in route handlers inside the App Router. Spotify, GitHub, device status, reactions, the contact form - all separate route files.",
      },
      {
        name: "Blog and project data",
        detail:
          "Stored as typed TypeScript arrays in data/blog.ts and data/projects.ts. No CMS, no database. I write content directly in code which means it is versioned in Git and fast to render.",
      },
      {
        name: "RSS feed",
        detail:
          "Generated dynamically at /feed.xml from the blog post data. Styled with an XSL stylesheet so it renders nicely in browsers that still support RSS.",
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
          "The dark theme is my primary design target. I use CSS custom properties (via shadcn/ui tokens) so both themes share the same component code. The toggle crossfades at 150ms.",
      },
      {
        name: "No animations on scroll",
        detail:
          "I deliberately avoid scroll-triggered animations on most pages. They add visual noise, can cause accessibility issues and tend to slow the perceived load time. Entrance animations are limited to the homepage.",
      },
      {
        name: "Blog as structured data",
        detail:
          "Each post is a typed object with a content array of blocks (headings, paragraphs, lists, code, quotes, images). I wrote a block renderer rather than using MDX. It gives me full control over how every element looks without an extra compilation step.",
      },
      {
        name: "Command palette",
        detail:
          "Cmd+I (or Ctrl+I on Windows) opens a command palette powered by cmdk. I prefer keyboard-first navigation and wanted the site to feel like an app, not just a document.",
      },
    ],
  },
  {
    icon: Cpu,
    heading: "The live status system",
    items: [
      {
        name: "Device daemons",
        detail:
          "Three Python daemons run as background services on my MacBook, Lenovo laptop and Gaming PC. Each writes battery, CPU, GPU, game detection and other data to Redis every 30 to 60 seconds using the Upstash REST API.",
      },
      {
        name: "MacBook daemon",
        detail:
          "Runs via launchd on macOS. Sends battery percentage, charging state, timezone and local weather to Redis.",
      },
      {
        name: "Lenovo and Gaming PC daemons",
        detail:
          "Run via NSSM (Non-Sucking Service Manager) as Windows services so they auto-start on boot and restart on crash. The Gaming PC daemon also uses pynvml to read NVIDIA GPU utilisation and scans running processes to detect active games.",
      },
      {
        name: "Spotify integration",
        detail:
          "A separate API route fetches the currently playing track using the Spotify Web API. The OAuth access token is refreshed server-side and cached in Redis.",
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
            <span className="text-foreground">Vercel</span>
          </span>
          <span>
            DNS via{" "}
            <span className="text-foreground">Cloudflare</span>
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
