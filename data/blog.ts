export type PostType = "blog" | "journal" | "research" | "notes"

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "divider" }

export interface BlogPost {
  slug: string
  title: string
  date: string
  type: PostType
  description: string
  tags: string[]
  readingTime: number // minutes
  published: boolean
  content: ContentBlock[]
}

export const POST_TYPES: { label: string; value: PostType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Journal", value: "journal" },
  { label: "Research", value: "research" },
  { label: "Notes", value: "notes" },
]

export const posts: BlogPost[] = [
  {
    slug: "building-my-portfolio",
    title: "Building My Portfolio: Decisions, Stack, and What I Learned",
    date: "2025-04-12",
    type: "blog",
    description:
      "Why I rebuilt my portfolio from scratch with Next.js, the design decisions I made, and what the process taught me about shipping something personal.",
    tags: ["Next.js", "Design", "Personal"],
    readingTime: 5,
    published: true,
    content: [
      {
        type: "p",
        text: "I've had a version of a portfolio online for a while — a terminal-style single-page HTML file at zacess.com. It was fun to build and genuinely terminal-accurate, but it didn't show off my work in a way that felt useful to a recruiter or someone who wanted to understand what I actually do.",
      },
      {
        type: "p",
        text: "So I rebuilt. This is the new one. Here's what I decided and why.",
      },
      {
        type: "h2",
        text: "Why Next.js?",
      },
      {
        type: "p",
        text: "I wanted something I could grow over time — add project pages, a blog, maybe interactive demos. A single HTML file stops scaling the moment you want more than one page. Next.js with the App Router gave me proper routing, server components, metadata for SEO, and a structure I already knew from coursework.",
      },
      {
        type: "h2",
        text: "Design: starting from the terminal",
      },
      {
        type: "p",
        text: "The terminal site had a clear visual identity — monospace font, dark background, deliberate green-on-black colour. I didn't want to lose that entirely. The new site uses GeistMono for labels and code, keeps a dark mode as the default feel, and uses a royal blue primary colour instead of the more generic purple that shadcn defaults to.",
      },
      {
        type: "ul",
        items: [
          "Framer Motion for entrance animations — subtle, not distracting",
          "shadcn/ui for base components so I'm not rebuilding buttons and dialogs",
          "Ctrl+I command palette for quick navigation (for Isaac, obviously)",
          "No hero animations that block the page — everything starts visible",
        ],
      },
      {
        type: "h2",
        text: "What I learned",
      },
      {
        type: "p",
        text: "Shipping something personal is harder than shipping coursework. With coursework there's a spec. Here the only constraint is 'does this represent me well?' — and that's surprisingly difficult to answer.",
      },
      {
        type: "p",
        text: "The best decision I made was writing the projects section as problem/solution/learnings rather than a list of tech stacks. It forced me to articulate why I built things, not just what I used.",
      },
      {
        type: "quote",
        text: "Don't list what you used. Explain the decision you made and what it cost you.",
        source: "Something I told myself halfway through",
      },
    ],
  },
  {
    slug: "week-1-aston",
    title: "Week 1 at Aston: What Second Year Actually Feels Like",
    date: "2025-09-22",
    type: "journal",
    description:
      "First journal entry of second year. Modules, lab sessions, and the gap between what I expected and what it actually is.",
    tags: ["University", "EEE", "Year 2"],
    readingTime: 3,
    published: true,
    content: [
      {
        type: "p",
        text: "Second year started on Monday. The jump from first year is real — the modules assume you've retained everything from last year, which I mostly have, but the pace is different. No easing in.",
      },
      {
        type: "h2",
        text: "Modules this semester",
      },
      {
        type: "ul",
        items: [
          "Digital Systems Design — FPGAs, VHDL, state machines",
          "Analogue Electronics — op-amp circuits, feedback, filters",
          "Embedded Systems — ARM Cortex-M, bare metal C",
          "Engineering Mathematics — Laplace transforms, Z-transforms",
          "Professional Engineering Practice — CV, presentations, ethics",
        ],
      },
      {
        type: "h2",
        text: "First lab session",
      },
      {
        type: "p",
        text: "Embedded Systems lab was first. We got handed a Nucleo board and a datasheet and told to blink an LED using bare registers — no HAL, no CubeMX. I like that. The HAL abstracts too much for someone who wants to understand what's actually happening on the silicon.",
      },
      {
        type: "p",
        text: "The main thing I'm carrying into this year: ask more questions in the lab sessions. Last year I worked through problems silently. That's not faster — it's just lonelier.",
      },
    ],
  },
  {
    slug: "iot-security-gaps",
    title: "Security Gaps in Consumer IoT: A Survey of Common Attack Vectors",
    date: "2025-11-30",
    type: "research",
    description:
      "A review of published literature on IoT device vulnerabilities — hardcoded credentials, unencrypted traffic, and insufficient update mechanisms.",
    tags: ["IoT", "Security", "Research", "Embedded"],
    readingTime: 12,
    published: false,
    content: [],
  },
  {
    slug: "spi-vs-i2c",
    title: "SPI vs I²C: When to Use Which",
    date: "2026-01-14",
    type: "notes",
    description:
      "Quick reference notes comparing SPI and I²C for embedded projects — speed, wiring, use cases, and when the choice actually matters.",
    tags: ["SPI", "I2C", "Embedded", "Notes"],
    readingTime: 4,
    published: false,
    content: [],
  },
  {
    slug: "yunex-traffic-virtual",
    title: "Yunex Traffic Virtual Experience: Smart Mobility Takeaways",
    date: "2025-08-20",
    type: "journal",
    description:
      "Reflections on the Yunex Traffic virtual programme — IoT in intelligent transportation, C-V2X communication, and what I'd do differently next time.",
    tags: ["Yunex", "IoT", "Transport", "Virtual"],
    readingTime: 4,
    published: false,
    content: [],
  },
]

export function getPublishedPosts(): BlogPost[] {
  return posts.filter((p) => p.published)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}
