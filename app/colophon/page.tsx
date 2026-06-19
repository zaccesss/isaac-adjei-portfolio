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

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  )
}

type ColophonItem = { name: string; detail: React.ReactNode }

const sections: { icon: React.ComponentType<{ className?: string }>; heading: string; items: ColophonItem[] }[] = [
  {
    icon: Code2,
    heading: "Frontend",
    items: [
      {
        name: "Next.js 16 (App Router)",
        detail: <>The entire site is a <A href="https://nextjs.org">Next.js</A> application - a framework that handles both the user-facing pages and the server-side logic in one codebase. I use the App Router, which lets me choose on a per-page basis whether content is built on the server (faster initial load, better for SEO) or in the browser (needed for anything interactive like the live status widget). Most pages are server-rendered and sent to you pre-built.</>,
      },
      {
        name: "TypeScript",
        detail: <><A href="https://www.typescriptlang.org">TypeScript</A> is JavaScript with a strict type system layered on top. Every piece of data in this site has a defined shape - blog posts, project entries, API responses, all of it. This means the editor can catch mistakes before the code even runs, which matters when a lot of things are interconnected. Strict mode throughout with no exceptions.</>,
      },
      {
        name: "Tailwind CSS",
        detail: <><A href="https://tailwindcss.com">Tailwind CSS</A> is a utility-first CSS framework - instead of writing separate stylesheet files, styles are applied directly as class names in the HTML. It keeps styling co-located with the component it applies to, which makes maintenance straightforward. I combine it with <A href="https://ui.shadcn.com">shadcn/ui</A> (see below) for more complex interactive components.</>,
      },
      {
        name: "shadcn/ui",
        detail: <><A href="https://ui.shadcn.com">shadcn/ui</A> is a collection of pre-built, accessible UI components that I own the code for - dialogs, dropdowns, tooltips, badges, the command palette. Unlike a traditional component library where you import a package you cannot change, shadcn/ui components live directly in the codebase and can be modified freely. Built on <A href="https://www.radix-ui.com">Radix UI</A> primitives, which handles the tricky accessibility behaviour (keyboard navigation, focus trapping, ARIA attributes).</>,
      },
      {
        name: "Framer Motion",
        detail: <><A href="https://www.framer.com/motion/">Framer Motion</A> is used sparingly for the entrance animations on the homepage hero section. The staggered fade-in as the page loads is handled here. I deliberately keep motion minimal on the rest of the site - animation should enhance content, not compete with it.</>,
      },
      {
        name: "Lucide React and React Icons",
        detail: <>All icons across the site. <A href="https://lucide.dev">Lucide React</A> for UI icons (arrows, checks, chevrons, status indicators and so on). <A href="https://react-icons.github.io/react-icons/">React Icons</A> for brand logos where Lucide does not have an official one - GitHub, LinkedIn, Spotify, Discord and similar.</>,
      },
      {
        name: "Geist",
        detail: <><A href="https://vercel.com/font">Geist</A> is the typeface designed by Vercel and used across this site. Geist Sans for all body text, headings and UI labels - clean and highly legible at any size. Geist Mono for timestamps, file paths, code snippets and technical labels where fixed-width spacing matters. Both are loaded as Next.js font optimisations so they are never fetched from an external CDN.</>,
      },
      {
        name: "next-themes",
        detail: <><A href="https://github.com/pacocoursey/next-themes">next-themes</A> manages the light and dark mode toggle. It stores your preference in localStorage so the site remembers which theme you chose across visits. The 150ms crossfade on toggle is handled here. No flash of the wrong theme on page load.</>,
      },
      {
        name: "Giscus",
        detail: <>The comment system on blog posts, powered by <A href="https://giscus.app">Giscus</A> and backed by <A href="https://docs.github.com/en/discussions">GitHub Discussions</A>. When you leave a comment it is stored as a GitHub Discussion on the public repo - no separate database, no third-party ad-funded platform. Giscus loads the discussion thread for each post by matching the page URL to a discussion. You need a GitHub account to comment. The widget respects the site theme and switches between light and dark automatically.</>,
      },
    ],
  },
  {
    icon: Server,
    heading: "Backend and data",
    items: [
      {
        name: "Vercel",
        detail: <><A href="https://vercel.com">Vercel</A> is where the site is hosted and deployed. Every time a change is merged to the main branch on GitHub, Vercel automatically builds and deploys the new version within about a minute. Preview deployments are also created for every pull request so changes can be reviewed at a live URL before they go public. The domain and SSL certificate are managed here too.</>,
      },
      {
        name: "Upstash Redis",
        detail: <>Redis is a data store that keeps everything in memory rather than on disk, which makes reads and writes extremely fast. I use <A href="https://upstash.com">Upstash</A>&apos;s serverless version for anything that changes frequently and needs to be retrieved quickly: live device status from the daemons, the currently playing Spotify track, blog post reaction counts and rate limiting on the contact form. Redis is not a traditional database - it is a short-term, high-speed cache.</>,
      },
      {
        name: "Next.js API routes",
        detail: <>All the server-side logic lives in route handlers inside the <A href="https://nextjs.org">Next.js</A> app. When the live status widget asks &apos;is the PS5 online?&apos;, it is calling one of these routes, which in turn reads from Redis. The Spotify now-playing card, the GitHub activity strip, the contact form submission, blog reactions - each is a separate server-side function that runs on demand. None of this logic runs in your browser.</>,
      },
      {
        name: "Content data",
        detail: <>All content on this site is stored as typed TypeScript files. Blog posts live in data/blog/, TIL entries in data/til/, project listings in data/projects.ts, research publications in data/respub.ts and consumed media in seven per-category files under data/consumed/ (videos, podcasts, books, music, articles, resources, others). There is no external CMS, no database and no third-party content API. Everything is written directly as code, versioned in Git alongside everything else, and renders instantly with no database round-trip. Blog posts and TIL entries share the same block-based structure: each is an array of explicitly typed blocks (heading, paragraph, list, code, image, quote, note callout, embed) rendered by a shared component. This gives complete control over how every element looks with full type safety throughout.</>,
      },
      {
        name: "RSS feeds",
        detail: <>Three RSS 2.0 feeds are generated dynamically: blog posts at <A href="/blog/feed.xml">/blog/feed.xml</A>, TIL entries at <A href="/til/feed.xml">/til/feed.xml</A> and newsletter issues at <A href="/newsletter/feed.xml">/newsletter/feed.xml</A>. Each feed is styled with an XSL stylesheet so it renders as a clean, readable page in browsers that display it directly rather than as raw XML. Visiting any feed URL in a browser also shows a fully styled HTML view with pagination and thumbnails. Append ?raw to any feed URL to get the raw XML. Add any feed to your reader of choice to receive updates automatically.</>,
      },
      {
        name: "Resend",
        detail: <>Email delivery for the contact form, handled by <A href="https://resend.com">Resend</A>. When you submit a message, the name, email and content are sent to a server-side route which calls the Resend API to forward it to my inbox. Nothing is stored in a database - the email is sent and that is it. Submissions are also rate-limited via Redis to prevent the form being used for spam.</>,
      },
      {
        name: "Beehiiv",
        detail: <><A href="https://www.beehiiv.com">Beehiiv</A> is the platform behind the isaacadjei.me newsletter. When you subscribe via the site, a server action calls the Beehiiv API to add your email to the publication. Beehiiv handles list management, sending, tracking and unsubscribes. Every issue has a one-click unsubscribe link at the bottom.</>,
      },
      {
        name: "GitHub Actions",
        detail: <><A href="https://github.com/features/actions">GitHub Actions</A> runs automated workflows whenever code changes. The main one generates the CV PDF: whenever cv.html is updated on the main branch, an action runs html2pdf.js in a headless Node environment, converts the HTML to a PDF and commits the file back to the repo. This means the PDF is always in sync with the HTML source without any manual export step.</>,
      },
      {
        name: "Cloudflare Turnstile",
        detail: <><A href="https://www.cloudflare.com/products/turnstile/">Cloudflare Turnstile</A> is the bot protection on the contact form. Unlike traditional CAPTCHAs that make you identify traffic lights or buses, Turnstile works silently in the background and only challenges when it suspects bot activity. Server-side verification happens before any email is sent - if the Turnstile check fails, the request is rejected. Free tier, no tracking pixels, no fingerprinting.</>,
      },
    ],
  },
  {
    icon: Palette,
    heading: "Design decisions",
    items: [
      {
        name: "Dark mode first",
        detail: "The dark theme is the primary design target - it is what I look at most often and what I optimise for. Both light and dark themes use the same component code; only the CSS custom property values change between them. The preference is persisted across visits and the toggle crossfades at 150ms to avoid a jarring flash.",
      },
      {
        name: "No animations on scroll",
        detail: "Scroll-triggered animations - things that fade or slide in as you scroll down - are deliberately avoided on most pages. They add visual noise, can cause nausea for users sensitive to motion and make the page feel slower even when it is not. Entrance animations are limited to the homepage hero. Everything else just loads.",
      },
      {
        name: "No city, ever",
        detail: "The live status widget shows my current country and timezone but never the city. The Mac daemon has access to GPS-level location via CoreLocationCLI but deliberately only passes the country code to Redis. This is a hard privacy line - knowing I am in the UK is useful context for the clock; knowing I am in a specific neighbourhood is not.",
      },
      {
        name: "Structured data, not markdown",
        detail: "Most developer sites use MDX: markdown files with embedded React components. I went a different route: each blog post and TIL entry is a typed TypeScript object with a content array of explicit block types (heading, paragraph, code, list, quote, image, note callout, embed). A shared block renderer turns these into HTML. The trade-off is more verbose authoring, but the payoff is full control over how every element renders, no MDX compilation step and complete type safety throughout. Because both blog posts and TIL entries use the same block types, the renderer is shared between them.",
      },
      {
        name: "Command palette",
        detail: <>Cmd+I (or Ctrl+I on Windows) opens a site-wide command palette powered by <A href="https://cmdk.dev">cmdk</A>. You can jump to any page, search projects, toggle the theme and more without touching the mouse. The shortcut is I for Isaac rather than K (the more common convention) - a small personal touch.</>,
      },
      {
        name: "Share feature",
        detail: "Projects and blog posts have a share button. On desktop it copies the page URL to the clipboard and shows a brief confirmation. On mobile it opens the native share sheet so you can send the link through any app. The button is deliberately only present on shareable content pages, not on utility pages like Skills or About.",
      },
      {
        name: "Responsive but desktop-first content",
        detail: "The site is fully responsive and works on any screen size, but the richer content - live status cards, the lab terminal, project galleries - is designed with a larger screen in mind. A slim dismissible banner appears on narrow screens to set that expectation. The banner text is foreground-coloured (not grey) so it is actually readable.",
      },
      {
        name: "Google Analytics (GA4)",
        detail: <>Privacy-conscious page-view analytics via <A href="https://marketingplatform.google.com/about/analytics/">Google Analytics</A>. Fully anonymised - no individual visitor is identified or tracked across other websites. I can see which pages are read most and which content is landing well, which helps me decide what to write next. Nothing personal is collected.</>,
      },
    ],
  },
  {
    icon: Layers,
    heading: "Notable pages and features",
    items: [
      {
        name: "/lab - interactive terminal, GitHub stats, live coding stats, Spotify visualiser and PCB viewer",
        detail: "An in-browser terminal with 30+ commands spanning navigation, content, live stats and personality. Several commands animate theatrically line by line. The coding stats panel has a period selector, stat cards, daily trend line, 7x24 interactive heatmap, charts and hour-of-day bars. The Spotify visualiser renders 52 horizontal equaliser bars with a gradient that darkens with bar height; album art spins like a vinyl record when playing and its colours bleed through the bar shapes; a bright indigo sine wave below the bars reacts to track energy. The PCB viewer loads the actual 3D mesh of the audio amplifier board (real GLB model via react-three-fiber and drei) with angle presets, wireframe mode, auto-rotate and a grid; below it are drag-to-orbit copper layer renders, a front/back photo flip card of the built board, an assembled board photo and the full circuit schematic - the latter two open fullscreen in a lightbox on click.",
      },
      {
        name: "/blog - block-based post renderer",
        detail: "Blog posts are authored as typed TypeScript objects rather than markdown files. A shared block renderer handles every block type: headings, paragraphs, code with syntax highlighting, numbered and bulleted lists, pull quotes, images with captions and reference links (numbered superscript links that compile into a references section at the bottom). Each post also has an emoji reaction bar backed by Redis. The listing page has a text search input and type filter tabs (Blog, Journal, Research, Notes, Report, Article, Resources) that work together with pagination.",
      },
      {
        name: "/til - Today I Learned",
        detail: <>Short, structured notes on things I discover while working. Each entry has a category, date, a lead paragraph and optional detail blocks using the same typed block system as blog posts, so a TIL entry can contain syntax-highlighted code examples, section headings, note callouts, embeds and source links. The listing page has a text search input and category filter pills derived from the entries actually present (no empty categories ever appear). Pagination shows ten entries per page. Each entry has its own permalink at /til/[slug] where the full detail, tags and prev/next navigation are shown. There is a subscribe-in-your-reader RSS feed at <A href="/til/feed.xml">/til/feed.xml</A>. Entries span a wide range: embedded systems and firmware, algorithms and data structures, TypeScript and Next.js, Linux internals, Git internals, security concepts, hardware design, music and piano practice, fitness, Ghanaian cooking and culture and faith.</>,
      },
      {
        name: "/respub - research and publications",
        detail: <>A catalogue of formal research outputs: citable papers, technical notes and open-source curricula. Each entry links directly to its record on <A href="https://zenodo.org">Zenodo</A>, <A href="https://orcid.org">ORCID</A> or the relevant platform so it can be found, cited or built on. The page also shows profile links across academic networks (<A href="https://orcid.org">ORCID</A>, <A href="https://scholar.google.com">Google Scholar</A>, <A href="https://zenodo.org">Zenodo</A>, <A href="https://www.researchgate.net">ResearchGate</A>, <A href="https://www.academia.edu">Academia.edu</A>) in a single row. Data lives in data/respub.ts alongside the other content files. No external academic CMS.</>,
      },
      {
        name: "/links - social hub",
        detail: <>A single page linking out to every platform I am active on: <A href="https://github.com/zaccesss">GitHub</A>, <A href="https://linkedin.com">LinkedIn</A>, <A href="https://open.spotify.com">Spotify</A>, <A href="https://youtube.com">YouTube</A>, <A href="https://orcid.org">ORCID</A>, <A href="https://www.goodreads.com">Goodreads</A>, <A href="https://www.chess.com">Chess.com</A> and more. Each platform has its icon and a short description of what you will find there. The page also embeds a live Spotify now-playing card so you can see what is on while you browse. All link data lives in data/links.ts alongside the other content files.</>,
      },
      {
        name: "/consumed - media tracking",
        detail: "A public log of everything watched, listened to and read across the year, split into seven dedicated subpages: Videos, Audio, Books, Music, Articles, Resources and Others. Each subpage has a year and month filter. All data lives in per-category TypeScript files under data/consumed/ - same versioned-in-Git approach as the rest of the site. The main /consumed page shows all categories at once in a tabbed view; each tab navigates to its dedicated subpage. Video entries support both single videos and playlists via inline YouTube embeds. Audio entries embed Spotify via the Spotify oEmbed API.",
      },
      {
        name: "/contact - contact form",
        detail: <>The contact form at <A href="/contact">/contact</A> uses <A href="https://resend.com">Resend</A> for email delivery and <A href="https://www.cloudflare.com/products/turnstile/">Cloudflare Turnstile</A> for silent bot protection. Submissions are rate-limited via Redis. Nothing is stored - the message goes straight to my inbox and that is it. You can also reach me directly at <A href="mailto:contact@isaacadjei.me">contact@isaacadjei.me</A>.</>,
      },
      {
        name: "/changelog - public release history",
        detail: "Every meaningful change to the site is logged here as a versioned entry. Updated manually in CHANGELOG.md and rendered as a timeline. It is a habit I picked up from open-source projects and I find it useful for tracking how the site has evolved over time.",
      },
      {
        name: "OG image generation",
        detail: <>Every page has a dynamically generated Open Graph image at /api/og. When you share a link on Twitter, LinkedIn, iMessage or any platform that shows a preview card, the image is generated on the fly using <A href="https://vercel.com/docs/functions/og-image-generation">Vercel&apos;s @vercel/og</A> library. It renders the page title and description as a styled card using the Geist font. This is why shared links look intentional rather than blank.</>,
      },
    ],
  },
  {
    icon: Cpu,
    heading: "The live status system",
    items: [
      {
        name: "How it works",
        detail: <>The live status widget on /now, the homepage and /lab shows real data from my devices in near real-time. Background services (daemons) run on each machine and push data to <A href="https://upstash.com">Upstash Redis</A> every 30 to 60 seconds. The site then reads from Redis when you load the page. If a device goes offline, Redis keys expire after a short window and the card shows the last known state with a timestamp.</>,
      },
      {
        name: "MacBook daemon",
        detail: <>A Python script managed by launchd on macOS. It runs in the background at all times and writes to Redis every 30 seconds: battery percentage, charging state, local timezone and current weather. Weather comes from <A href="https://open-meteo.com">Open-Meteo</A>, a free European meteorological API with no API key required that uses the ECMWF model - more accurate for UK weather than most commercial alternatives. Location is determined via <A href="https://github.com/fulldecent/corelocationcli">CoreLocationCLI</A> (GPS-level accuracy) with <A href="https://ipinfo.io">ipinfo.io</A> as a fallback. Only country code and timezone are stored - city is deliberately excluded for privacy.</>,
      },
      {
        name: "Lenovo and Gaming PC daemons",
        detail: <>Python scripts managed by <A href="https://nssm.cc">NSSM (Non-Sucking Service Manager)</A> as proper Windows services - they start on boot, restart on crash and run without a visible terminal. The Gaming PC daemon also reads GPU utilisation via <A href="https://pypi.org/project/pynvml/">pynvml</A> (NVIDIA&apos;s Python library) and detects the currently running game through five escalating tiers: a hardcoded map of known games, the <A href="https://developer.valvesoftware.com/wiki/Steam_Web_API">Steam Web API</A>, Epic Games local manifest files, EA App manifest files and finally process-name fuzzy matching against <A href="https://www.igdb.com">IGDB</A>&apos;s game database. Cover art is fetched from IGDB on first detection and cached for the session.</>,
      },
      {
        name: "Spotify",
        detail: <>A Next.js API route fetches the currently playing track from the <A href="https://developer.spotify.com/documentation/web-api">Spotify Web API</A> on demand. The OAuth access token (which expires every hour) is refreshed server-side and cached in Redis so it is never fetched on every single request. The progress bar on the card ticks every second client-side based on the position returned by Spotify, and the full API is polled every 10 seconds. When nothing is playing, the last played track is shown in a greyed-out state from a separate Redis key.</>,
      },
      {
        name: "PS5",
        detail: <>A <A href="https://workers.cloudflare.com">Cloudflare Worker</A> runs on a cron every 2 minutes and polls the <A href="https://www.playstation.com">PlayStation Network</A> presence API using a custom OAuth v2 flow written from scratch - no third-party libraries. Sony&apos;s session cookie (NPSSO) is exchanged for a short-lived access token and a long-lived refresh token on first run. The refresh token is stored in <A href="https://developers.cloudflare.com/kv/">Cloudflare Workers KV</A> and rotated on each use, so the session stays valid for around 60 days before needing a new NPSSO. Game cover art is fetched from <A href="https://www.igdb.com">IGDB</A> on each run. The result (online status, game name, cover art, last seen timestamp) is written to Upstash Redis.</>,
      },
      {
        name: "Discord",
        detail: <>The Discord presence card uses <A href="https://github.com/Phineas/lanyard">Lanyard</A>, a free open-source API that exposes Discord rich presence data for opted-in users. It shows online status (online, idle, do not disturb, offline), current activity (game being played, VS Code workspace, Spotify playback via Discord) and elapsed time. On /now the card always shows, even offline. On /notes it only appears when I am online. Multiple simultaneous activities stack with type labels.</>,
      },
      {
        name: "GitHub activity",
        detail: <>The GitHub strip uses the <A href="https://docs.github.com/en/rest">GitHub REST API</A> to show the last repository I pushed to and when. It is fetched server-side and cached in Redis for 5 minutes. My profile repo is excluded so the strip always shows real project activity rather than profile README updates.</>,
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
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
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
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
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
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 inline-flex items-center gap-0.5"
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
