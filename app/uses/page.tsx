// My /uses page - all the hardware, software and tools I use day to day.
// Inspired by uses.tech. I update this when my setup changes.

import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Monitor, Code2, Terminal, Wrench, Globe, Gamepad2, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Uses",
  description: "The hardware, software and tools Isaac Adjei uses day to day.",
  alternates: {
    canonical: "https://www.isaacadjei.me/uses",
  },
  openGraph: {
    images: ["/api/og?title=Uses&description=The%20hardware%2C%20software%20and%20tools%20Isaac%20Adjei%20uses%20day%20to%20day%2E"],
  },
}

// CDN shorthand constants - same sources as the skills page
const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons"
const TSG = "https://techstack-generator.vercel.app"
const SKI = "https://skillicons.dev/icons?i"
const WIKI = "https://upload.wikimedia.org/wikipedia/commons"
const SI = "https://cdn.simpleicons.org"

type UsesItem = {
  name: string
  detail: string
  icon?: string
  href?: string
}

// I define each section as a list so the page stays easy to update
const sections: Array<{
  icon: React.ComponentType<{ className?: string }>
  heading: string
  items: UsesItem[]
}> = [
  {
    icon: Monitor,
    heading: "Hardware",
    items: [
      {
        name: "Gaming PC (ZACCESS-GPC)",
        icon: `${SI}/nvidia`,
        detail: "Custom Windows desktop with an NVIDIA GeForce RTX 4060 and Intel CPU. My main machine for development, gaming and compute-heavy work. It runs a background Python daemon that monitors GPU utilisation via pynvml, CPU load via psutil and active game detection, all streamed live to the notes page on this site.",
      },
      {
        name: "MacBook (ZACCESS-MBK)",
        icon: `${DEV}/apple/apple-original.svg`,
        detail: "My portable development machine. Runs a launchd-managed Python daemon (mac-daemon.py) that writes battery level, charging state, timezone and weather to Redis every 30 seconds, powering the live status widget on the notes page.",
      },
      {
        name: "Lenovo Laptop (ZACCESS-LNV)",
        detail: "Windows laptop used as a secondary machine. Runs its own NSSM-managed Python daemon that feeds live battery and charging state data to the site alongside the GPC and MacBook.",
      },
      {
        name: "ATmega644P development board",
        icon: "/images/atmelavr.png",
        href: "https://www.microchip.com/en-us/product/atmega644p",
        detail: "The microcontroller at the heart of the avr-zac project. I use it to practise bare metal AVR C: GPIO, interrupts, PWM, ADC, UART and a nine-mode state machine, all written directly against the datasheet with no RTOS or HAL.",
      },
      {
        name: "ESP32 and STM32",
        detail: "Both used in Phaemos, my predictive maintenance platform. The ESP32 handles WiFi, MQTT and sensor polling using the Arduino framework. The STM32 runs lower-level firmware for data acquisition. Two very different programming models on one project.",
      },
    ],
  },
  {
    icon: Code2,
    heading: "Development",
    items: [
      {
        name: "VS Code",
        icon: `${DEV}/vscode/vscode-original.svg`,
        href: "https://code.visualstudio.com",
        detail: "My primary editor across nearly every project. Key extensions: Claude Code for AI-assisted development, GitLens for blame and history, Prettier for formatting and the C/C++ extension for embedded work. Most of this site was built inside VS Code.",
      },
      {
        name: "JetBrains IDEs",
        icon: "https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg",
        href: "https://www.jetbrains.com",
        detail: "IntelliJ IDEA for Java coursework, PyCharm for Python projects including the Phaemos FastAPI backend and system daemons and CLion for C/C++ embedded development. I switch between VS Code and JetBrains based on what the project needs.",
      },
      {
        name: "Next.js with TypeScript",
        icon: `${SKI}=nextjs`,
        href: "https://nextjs.org",
        detail: "The framework this entire site is built on. App Router, React Server Components, API routes and middleware. I use strict TypeScript throughout. Every blog post, project and skill is typed data, not markdown. The result is fast, type-safe and easy to extend.",
      },
      {
        name: "Tailwind CSS with shadcn/ui",
        icon: `${SKI}=tailwind`,
        href: "https://tailwindcss.com",
        detail: "Utility-first CSS combined with unstyled, accessible shadcn components. The design system for this site is built entirely on these two. I rarely write custom CSS. When I do it is usually for animations like the theme crossfade or skill grid layout.",
      },
      {
        name: "Python",
        icon: `${TSG}/python-icon.svg`,
        href: "https://python.org",
        detail: "Used across several distinct contexts: FastAPI for the Phaemos backend REST API, scikit-learn and pandas for the Isolation Forest anomaly detection pipeline and psutil plus pynvml for the three device daemons (Mac, Lenovo, GPC) that power the live status widget.",
      },
      {
        name: "C / AVR-GCC",
        icon: `${DEV}/c/c-original.svg`,
        href: "https://gcc.gnu.org/wiki/avr-gcc",
        detail: "Bare metal microcontroller programming. No Arduino, no HAL. Direct register manipulation and datasheet-driven development. Everything in the avr-zac project is written this way: interrupts, timers, PWM, ADC and UART all configured from scratch.",
      },
      {
        name: "Arduino framework",
        icon: `${DEV}/arduino/arduino-original.svg`,
        href: "https://www.arduino.cc",
        detail: "Used where development speed matters more than low-level control. The ESP32 in Phaemos runs the Arduino framework for WiFi connectivity and MQTT communication with the FastAPI backend. Good tool for the right job.",
      },
      {
        name: "Git and GitHub",
        icon: `${SKI}=github`,
        href: "https://github.com",
        detail: "Version control for everything I build. Branch protection on main, pull requests with CI checks before any merge, Dependabot for dependency updates with auto-merge on green and Gitleaks in CI to prevent secrets ever reaching the repo.",
      },
    ],
  },
  {
    icon: Terminal,
    heading: "Terminal and shell",
    items: [
      {
        name: "PowerShell",
        icon: `${WIKI}/2/2f/PowerShell_5.0_icon.png`,
        href: "https://learn.microsoft.com/en-us/powershell",
        detail: "Default shell on both the GPC and Lenovo. I use it for NSSM service management, setting up Python virtual environments, running builds and general scripting. Most of the daemon setup and service registration was done in PowerShell.",
      },
      {
        name: "Bash / zsh",
        icon: `${DEV}/bash/bash-original.svg`,
        detail: "Shell of choice on the MacBook and any Linux environment. zsh with a minimal setup. I do not use heavy frameworks, just a clean prompt and a few aliases.",
      },
      {
        name: "NSSM",
        href: "https://nssm.cc",
        detail: "Non-Sucking Service Manager. I use it to register Python daemon scripts as proper Windows services on the GPC and Lenovo so they start on boot, restart on crash and run in the background without a terminal window.",
      },
    ],
  },
  {
    icon: Globe,
    heading: "Services and infrastructure",
    items: [
      {
        name: "Vercel",
        icon: `${SKI}=vercel`,
        href: "https://vercel.com",
        detail: "Deployment platform for this site. Every pull request gets an automatic preview deployment. Production deploys on merge to main. Zero config for Next.js. It just works.",
      },
      {
        name: "Upstash Redis",
        icon: `${DEV}/redis/redis-original.svg`,
        href: "https://upstash.com",
        detail: "Serverless Redis that powers several live features on this site: device status from the three daemons, Spotify now-playing with progress bar, blog post reactions, Beehiiv newsletter cache and contact form rate limiting. All in one Redis instance.",
      },
      {
        name: "Cloudflare",
        icon: `${SKI}=cloudflare`,
        href: "https://cloudflare.com",
        detail: "DNS and CDN in front of Vercel for isaacadjei.me. Handles DDoS protection, caching and the canonical host redirect that ensures all traffic goes to the www subdomain.",
      },
      {
        name: "Spotify API",
        icon: `${SI}/spotify`,
        href: "https://developer.spotify.com",
        detail: "Powers the currently-playing card on the notes page: track title, artist, album art and a real-time progress bar. OAuth token refresh is handled server-side via a Next.js API route so the client never touches credentials.",
      },
      {
        name: "GitHub API (GraphQL)",
        icon: `${SKI}=github`,
        href: "https://docs.github.com/en/graphql",
        detail: "Used to pull contribution heatmap data, commit counts, pull request counts, top languages and last push timestamp for the GitHub stats card on the lab page. GraphQL means I fetch exactly what I need in one request.",
      },
      {
        name: "Beehiiv",
        href: "https://beehiiv.com",
        detail: "Newsletter platform for the isaacadjei.me newsletter. Subscription is handled via the Beehiiv API from a server action. Past issues are fetched and cached in Redis so the newsletter page loads instantly.",
      },
      {
        name: "Cloudflare Turnstile",
        icon: `${SKI}=cloudflare`,
        href: "https://developers.cloudflare.com/turnstile",
        detail: "Bot protection on the contact form. A privacy-friendly alternative to reCAPTCHA. It validates the request server-side before the form submission is processed.",
      },
    ],
  },
  {
    icon: Wrench,
    heading: "Hardware lab",
    items: [
      {
        name: "Oscilloscope",
        detail: "Essential for embedded work. I use it to verify signal timing, debug UART and SPI communication, check PWM duty cycles and measure ADC input waveforms on the ATmega644P and ESP32 projects.",
      },
      {
        name: "Function generator and bench power supply",
        detail: "Standard bench setup for electronics prototyping. The function generator is useful for feeding known signals into ADC inputs during avr-zac testing. The power supply gives clean, stable voltage rails.",
      },
      {
        name: "Soldering station",
        detail: "Used for through-hole and SMD work. Most of the custom boards and sensor connections for Phaemos were hand-soldered.",
      },
      {
        name: "KiCad",
        icon: `${WIKI}/5/59/KiCad-Logo.svg`,
        href: "https://www.kicad.org",
        detail: "My PCB design tool of choice. I use it for schematic capture, PCB layout and Gerber export for fabrication. Open source and more than capable for the complexity of boards I work with.",
      },
      {
        name: "Proteus",
        icon: "/images/proteus.jpg",
        href: "https://www.labcenter.com",
        detail: "Circuit simulation and microcontroller firmware simulation. Useful for validating circuit behaviour and testing firmware logic before committing to hardware, especially helpful for timing-critical embedded code.",
      },
      {
        name: "Logic analyser",
        detail: "A cheap USB logic analyser with PulseView. Invaluable for capturing and decoding SPI, I2C and UART protocol traces when the oscilloscope alone is not enough.",
      },
    ],
  },
  {
    icon: BookOpen,
    heading: "Creative and productivity",
    items: [
      {
        name: "Notion",
        icon: `${DEV}/notion/notion-original.svg`,
        href: "https://notion.so",
        detail: "Personal workspace for notes, project planning and research. Anything that does not belong in a codebase or a blog post lives in Notion: meeting notes, research threads, project briefs and learning logs.",
      },
      {
        name: "Obsidian",
        icon: `${WIKI}/1/10/2023_Obsidian_logo.svg`,
        href: "https://obsidian.md",
        detail: "My second brain for long-form notes and personal knowledge management. I use it for deep technical research, learning logs for new topics and anything I want to keep in plain Markdown files I actually own. The local vault and bidirectional linking between notes makes it easy to build context over time.",
      },
      {
        name: "Figma",
        icon: `${DEV}/figma/figma-original.svg`,
        href: "https://figma.com",
        detail: "UI design and wireframing before I write a line of frontend code. I used it to sketch the layout of this site before building it. Not a full design system workflow, just enough to think visually before committing.",
      },
      {
        name: "Adobe Creative Cloud",
        icon: `${SI}/adobecreativecloud`,
        href: "https://www.adobe.com/uk/creativecloud.html",
        detail: "Photoshop for photo editing, Illustrator for vector work and Premiere Pro plus After Effects for video production. I do not reach for these daily but they are the right tools when design or video output quality matters.",
      },
      {
        name: "Canva",
        icon: `${DEV}/canva/canva-original.svg`,
        href: "https://canva.com",
        detail: "Quick design tool for social assets, presentations and visual content. Faster than Photoshop when the output does not need precision. Good for event flyers, mockups and branded graphics.",
      },
      {
        name: "DaVinci Resolve",
        icon: `${SI}/davinciresolve`,
        href: "https://www.blackmagicdesign.com/products/davinciresolve",
        detail: "My main video editing and colour grading tool. Used for cutting and grading footage on the GPC. The free version is extraordinarily capable. I use it for personal projects and any video content that needs proper colour work.",
      },
      {
        name: "Postman",
        icon: `${DEV}/postman/postman-original.svg`,
        href: "https://www.postman.com",
        detail: "API testing and development. I use it when building and debugging REST endpoints for Phaemos and this site, especially useful for testing the FastAPI backend and verifying API route behaviour before wiring up the frontend.",
      },
      {
        name: "Puppeteer",
        href: "https://pptr.dev",
        detail: "Used on this site to generate the downloadable CV PDF server-side. A headless browser renders the CV page and exports it to PDF via a Next.js API route. No manual PDF export needed.",
      },
      {
        name: "MATLAB",
        icon: `${DEV}/matlab/matlab-original.svg`,
        href: "https://www.mathworks.com/products/matlab.html",
        detail: "Used for signal processing, Fourier analysis and control systems work at university. Most of the lab reports and coursework involving DSP were done in MATLAB.",
      },
      {
        name: "Zotero",
        icon: `${SI}/zotero`,
        href: "https://www.zotero.org",
        detail: "Reference manager for academic research. I use it to collect, organise and cite sources for lab reports, project writeups and literature research at university. The browser plugin captures papers from journals automatically.",
      },
    ],
  },
  {
    icon: Gamepad2,
    heading: "Games",
    items: [
      {
        name: "EA Sports FC 26",
        icon: `${SI}/ea`,
        href: "https://www.ea.com/games/ea-sports-fc",
        detail: "Ultimate Team is the main mode. The GPC handles it well at high settings. The RTX 4060 does not break a sweat.",
      },
      {
        name: "Fortnite",
        icon: `${SI}/epicgames`,
        href: "https://www.fortnite.com",
        detail: "Chapter by chapter. The GPU monitoring daemon on the GPC was partly motivated by wanting to see actual utilisation numbers while playing this.",
      },
      {
        name: "Call of Duty",
        href: "https://www.callofduty.com",
        detail: "Warzone and multiplayer depending on the mood. High frame rate, low latency. The GPC is built for it.",
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Uses</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The hardware, software and tools I use day to day. Updated when my setup changes.
          Inspired by{" "}
          <a
            href="https://uses.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            uses.tech
          </a>
          .
        </p>
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
              {items.map(({ name, detail, icon, href }) => (
                <li key={name} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={icon}
                        alt=""
                        aria-hidden="true"
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain shrink-0"
                        loading="lazy"
                      />
                    )}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                      >
                        {name}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{name}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ))}
    </div>
  )
}
