// I render the notes hub with links to research topics, active projects and public writing outside the main blog.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Terminal, Lightbulb, Wrench, CalendarDays, Github, ExternalLink, ArrowRight } from "lucide-react"
import InspirationWidget from "@/components/shared/InspirationWidget"
import { notes } from "@/data/notes"

export const metadata: Metadata = {
  title: "Notes",
  description: "A public notebook. What I am building, thinking about and planning.",
  alternates: {
    canonical: "https://www.isaacadjei.me/notes",
  },
  openGraph: {
    images: ["/api/og?title=Notes&description=A%20public%20notebook%2E%20What%20I%20am%20building%2C%20thinking%20about%20and%20planning%2E"],
  },
}

const currentProjects = [
  {
    name: "Phaemos",
    badge: "Ongoing",
    description:
      "Full-stack predictive maintenance platform. Four hardware nodes: ESP32 primary (11 sensors), STM32 Black Pill (100Hz FFT vibration in HAL C), Arduino Nano (secondary sensors) and Raspberry Pi Pico 2W (MicroPython ambient node). FastAPI backend, Isolation Forest anomaly detection, Next.js live dashboard. Actively building the hardware layer and firmware.",
    projectHref: "/projects/phaemos",
    websiteHref: "https://phaemos.com",
    githubHref: "https://github.com/zaccesss/phaemos",
  },
  {
    name: "avr-zac",
    badge: "Ongoing",
    description:
      "Bare metal AVR C project on an ATmega644P. Working through a structured curriculum from basic GPIO to a nine-mode state machine with interrupts, PWM, ADC and a Tetris melody. Sessions are documented with notes and lab files. Still actively being extended.",
    projectHref: "/projects/avr-zac",
    githubHref: "https://github.com/zaccesss/avr-zac",
  },
  {
    name: "Business Website",
    badge: "Ongoing",
    description:
      "A terminal-style personal site that will evolve into a business presence. The direction is not fully set yet - it will likely serve whatever venture comes next. Keeping the terminal aesthetic for now and using it as a playground for ideas. Suggestions welcome via the contact form or by typing 'suggest' in the lab terminal.",
    projectHref: "/projects/zacess-pages",
    websiteHref: "https://zacess.com",
    githubHref: "https://github.com/zaccesss/zacess-pages",
  },
]

export default function NotesPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A public notebook. Not polished posts, just honest notes on what I am building, thinking
          about and planning. Updated as things change.
        </p>
        {/* I replaced the full live status cards with a slim teaser that links to /now
            to keep the notes page focused on content rather than a dashboard */}
        <Link
          href="/til"
          className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 hover:border-primary/40 transition-colors w-fit"
        >
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Shorter, faster notes live on the <span className="text-primary font-medium">TIL page</span>: snippets from things I discover day to day.
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
        <Link
          href="/now"
          className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-primary/30 transition-colors w-fit"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            See what I&apos;m doing right now
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </section>

      <Separator />

      {/* Currently building */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Currently Building</h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          {currentProjects.map((p) => (
            <div key={p.name} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{p.name}</p>
                {p.badge && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                    {p.badge}
                  </span>
                )}
                {p.projectHref && (
                  <Link
                    href={p.projectHref}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Project page
                  </Link>
                )}
                {p.websiteHref && (
                  <a
                    href={p.websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </a>
                )}
                {p.githubHref && (
                  <a
                    href={p.githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-3 w-3" />
                    GitHub
                  </a>
                )}
              </div>
              <p className="text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Future project ideas */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Upcoming Projects</h2>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              className="group block rounded-lg border border-border/60 bg-muted/20 px-6 py-5 hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{note.lead}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      {/* Summer 2026 plans */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Summer 2026 Plans</h2>
        </div>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            Summer 2026 is about building things that matter and documenting them properly. The
            plan:
          </p>
          <ul className="space-y-2 list-none">
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Prepare for next academic year - reviewing modules, getting ahead on coursework and sharpening fundamentals</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Learn FPGA development and VHDL - starting from scratch and working up to real hardware designs</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Get serious about competitive programming - consistent Codeforces practice and improving my rating</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>
                Publish the remaining blog posts and keep the newsletter active with regular issues
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Complete the avr-zac state machine project and document it fully</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Get the multi-sport AI predictor properly shipped, starting with football (see above)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>
                Begin deep research into retinoblastoma, ocular prosthetics and bio-integrated
                health technology
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>Study fields outside engineering and tech - business, psychology, economics and anything else worth understanding</span>
            </li>
          </ul>
        </div>
      </section>

      <InspirationWidget />

      {/* Lab link */}
      <Link
        href="/lab"
        className="group block rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-4 bg-primary shrink-0 animate-[blink_1s_step-end_infinite]"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="font-mono text-sm text-primary font-medium">
              explore the lab terminal
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              type commands to explore the site and find out more - click to open
            </p>
          </div>
          <Terminal className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors ml-auto shrink-0" />
        </div>
      </Link>

      <p className="text-xs text-muted-foreground font-mono text-center">
        Last updated July 2026
      </p>

    </div>
  )
}
