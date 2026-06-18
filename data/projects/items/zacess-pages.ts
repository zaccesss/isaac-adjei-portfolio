import type { Project } from "../index"

const _zacess_pages: Project = {
    id: "zacess-pages",
    title: "Business Website",
    description:
      "Personal website at zacess.com with a terminal-style interface, built with Next.js 14 and TypeScript. Currently evolving into a full business presence - direction not fully set yet but the foundation is live.",
    longDescription:
      "zacess-pages is a terminal-style landing page for zacess.com, built as a proper Next.js 14 App Router application with TypeScript and Tailwind CSS. It behaves like a genuine CLI session rather than a styled webpage pretending to be one. A ZacessOS boot sequence plays on load with staggered delays, then the prompt activates with a blinking block cursor. The terminal supports command history via up/down arrow keys, tab autocomplete (single match completes immediately, multiple matches lists all options), line-by-line output with a 20ms per-line delay and a suggest mode that collects typed input and fires a pre-filled mailto link.\n\nThe core challenge was making the terminal feel real rather than decorative. Real terminals have history, autocomplete with multi-match disambiguation, deliberate output pacing and a clear distinction between navigation and local commands. Each of these had to be implemented from scratch in React state because a div with a monospaced font is not a terminal. The boot sequence uses staggered timeouts rather than CSS animation so each line appears after the previous one completes, which reads as sequential system output rather than a scripted effect.\n\nNavigation commands (whoiszac, about, projects, experience, skills, blog, contact, links) open the corresponding pages on isaacadjei.me in new tabs. Local commands include cv (downloads PDF), collaborate (opens mail client with pre-filled subject), status (shows build state) and clear (preserves the boot lines). Three hidden easter egg commands reward curious visitors. A ZenQuotes daily motivation quote is fetched via a Next.js server-side API route that proxies the public API to avoid CORS, refreshing every 30 minutes.\n\nMac-style window controls (close, minimise, maximise, new tab) are fully functional. The terminal uses a three-layer colour scheme: cyan prompt, green commands, amber output. A subtle yellow border glow gives depth, the scrollbar is styled to match the palette and terminal colours never change regardless of system light or dark mode. The site is deployed on Vercel with automatic deploys on push to main and Cloudflare DNS routing zacess.com and www.zacess.com.",
    technologies: ["Next.js 14", "TypeScript", "Tailwind CSS", "Vercel", "Cloudflare"],
    category: "web",
    featured: false,
    images: [
      "/images/projects/zacess-pages/main.webp",
      "/images/projects/zacess-pages/terminal.webp",
    ],
    github: "https://github.com/zaccesss/zacess-pages",
    demo: "https://zacess.com",
    date: "2024",
    highlights: [
      "Genuine terminal behaviour: ZacessOS boot sequence, blinking block cursor and line-by-line output with 20ms delay",
      "Command history (up/down arrows), tab autocomplete with multi-match listing and XSS-safe input echo",
      "Navigation commands open isaacadjei.me pages in new tabs; cv command downloads PDF directly",
      "ZenQuotes motivational quote fetched server-side via Next.js API route to avoid CORS, refreshed every 30 minutes",
      "Mac-style window controls: close, minimise, maximise and new tab session - all fully functional",
      "Suggest mode collects multi-line input and opens a pre-filled mailto link for visitor messages",
      "Three-layer colour scheme: cyan prompt, green commands, amber output - consistent regardless of system theme",
      "Three hidden easter egg commands and a collaborate command with pre-filled email subject and body",
    ],
  }

export default _zacess_pages
