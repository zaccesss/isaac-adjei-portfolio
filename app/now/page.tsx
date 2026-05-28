// My /now page - a snapshot of what I am doing in my life right now.
// Inspired by Derek Sivers' nownownow.com movement. I update this manually
// whenever something meaningful changes, rather than trying to keep it live.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import LiveStatusCards from "@/components/shared/LiveStatusCards"
import {
  BookOpen,
  Code2,
  GraduationCap,
  Headphones,
  MapPin,
  Wrench,
  Dumbbell,
  ArrowUpRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Now",
  description: "What Isaac Adjei is doing right now - studying, building and thinking about.",
  alternates: {
    canonical: "https://www.isaacadjei.me/now",
  },
  openGraph: {
    images: ["/api/og?title=Now&description=What%20Isaac%20Adjei%20is%20doing%20right%20now%20-%20studying%2C%20building%20and%20thinking%20about%2E"],
  },
}

// I update this date manually every time I change anything on this page
const LAST_UPDATED = "May 2026"

export default function NowPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          Updated live &middot; Last updated {LAST_UPDATED}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Now</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A snapshot of what I am doing in my life at this moment. Inspired by{" "}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Derek Sivers
          </a>
          .
        </p>
        <LiveStatusCards />
      </section>

      <Separator />

      {/* Location */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Where I am</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Based in Birmingham, UK, studying Electronic Engineering and Computer Science at Aston University,
          working towards a First Class BEng. This academic year is coming to a close and I am already
          preparing for what comes next. I split my time between Birmingham for uni and London, where
          most of my family is based.
        </p>
      </section>

      <Separator />

      {/* Studying */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Studying</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            The academic year has wrapped up. I am spending the summer going deeper into the areas I enjoyed most:
            embedded systems, signals and machine learning.
          </p>
          <p>
            I am also working through a business analytics course independently, covering probability,
            statistics, Python, descriptive analytics, ML and prescriptive optimisation. Publishing
            notes and interactive tools{" "}
            <a
              href="https://github.com/zaccesss/ba-from-data-to-decisions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              as I go
            </a>
            .
          </p>
        </div>
      </section>

      <Separator />

      {/* Building */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Wrench className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Building</h2>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              <Link href="/projects/phaemos" className="hover:text-primary transition-colors">
                Phaemos
              </Link>
            </p>
            <p className="leading-relaxed">
              A full-stack predictive maintenance platform. FastAPI backend, Isolation Forest anomaly detection,
              Next.js live dashboard, ESP32 and STM32 firmware. Actively improving the ML pipeline
              and working towards a production deployment.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              <Link href="/projects/avr-zac" className="hover:text-primary transition-colors">
                avr-zac
              </Link>
            </p>
            <p className="leading-relaxed">
              Bare metal AVR C on an ATmega644P. Working through a structured curriculum
              from basic GPIO up to a nine-mode state machine with interrupts, PWM, ADC and a Tetris
              melody. Each session is documented as I go.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">This site</p>
            <p className="leading-relaxed">
              Always iterating. Right now adding new pages, a live multi-device status widget and
              improving how the site feels to navigate.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Reading and learning */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Reading</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dipping in and out of technical papers on retinoblastoma and ocular prosthetics. It is a
          personal research interest that has shaped a lot of how I think about accessible and
          bio-integrated technology.
          I keep a running log of books and content on the{" "}
          <Link href="/consumed" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            /consumed
          </Link>{" "}
          page.
        </p>
      </section>

      <Separator />

      {/* Thinking about */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Code2 className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Thinking about</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            How embedded AI at the edge differs in practice from what is taught in courses. Most
            ML curricula assume cloud inference. I am interested in what it takes to run useful
            models on microcontrollers with tight memory and power constraints.
          </p>
          <p>
            Also thinking about what an internship in this space actually looks like and which
            companies are genuinely doing interesting low-level work rather than wrapping LLM APIs.
          </p>
        </div>
      </section>

      <Separator />

      {/* Outside of work */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Outside of work</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Back at the gym consistently. Playing piano when I need to step away from screens.
          Cooking more, eating out less. Cycling when the weather allows, which in Birmingham is
          less often than I would like.
        </p>
      </section>

      <Separator />

      {/* Listening */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Headphones className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base font-semibold">Listening</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Whatever Spotify decides I need that day. Heavy rotation of Afrobeats and Afropop at the
          moment. You can see what I am playing right now on the{" "}
          <Link href="/notes" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            notes page
          </Link>
          .
        </p>
      </section>

      <Separator />

      <p className="text-xs text-muted-foreground font-mono">
        Want to reach me?{" "}
        <Link href="/contact" className="text-foreground hover:text-primary transition-colors underline underline-offset-4">
          Contact page
        </Link>{" "}
        or{" "}
        <a
          href="https://www.linkedin.com/in/isaacadjei"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          LinkedIn
          <ArrowUpRight className="h-3 w-3" />
        </a>
        .
      </p>
    </div>
  )
}
