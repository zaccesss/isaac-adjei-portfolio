import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Terminal, Lightbulb, Wrench, CalendarDays } from "lucide-react"
import NewsletterForm from "@/components/shared/NewsletterForm"

export const metadata: Metadata = {
  title: "Notes",
  description: "A public notebook. What I am building, thinking about and planning.",
  alternates: {
    canonical: "https://www.isaacadjei.me/notes",
  },
}

export default function NotesPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A public notebook. Not polished posts, just honest notes on what I am building, thinking
          about and planning. Updated as things change.
        </p>
      </section>

      <Separator />

      {/* Currently building */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Currently Building</h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">Phaemos</p>
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                Ongoing
              </span>
            </div>
            <p className="text-sm">
              Full-stack predictive maintenance platform. FastAPI backend, Isolation Forest anomaly
              detection, Next.js live dashboard, ESP32 and STM32 firmware. Actively adding features,
              improving the ML pipeline and working towards a production deployment.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">avr-zac</p>
            <p className="text-sm">
              Bare metal AVR C project on an ATmega644P. Working through a structured curriculum
              from basic GPIO to a nine-mode state machine with interrupts, PWM, ADC and a Tetris
              melody. Sessions are documented with notes and lab files.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">ba-from-data-to-decisions</p>
            <p className="text-sm">
              A structured learning site built alongside working through an executive education
              business analytics course. Covers probability, statistics, Python, descriptive
              analytics, machine learning and prescriptive optimisation. Publishing notes and
              interactive tools module by module.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">This portfolio</p>
            <p className="text-sm">
              Ongoing. Blog posts being published, newsletter live, pages being refined. The site
              itself is a living project.
            </p>
          </div>
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
              <span>Start the World Cup AI predictor project (see below)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>
                Begin deep research into retinoblastoma, ocular prosthetics and bio-integrated
                health technology
              </span>
            </li>
          </ul>
        </div>
      </section>

      <Separator />

      {/* Future project ideas */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Future Project Ideas</h2>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-3">
            <h3 className="font-semibold">World Cup 2026 AI Predictor</h3>
            <p className="text-sm text-muted-foreground">
              The FIFA World Cup 2026 is hosted across the USA, Canada and Mexico. I want to build
              an AI system that predicts match outcomes based on every World Cup result in history,
              team statistics, player data and tournament context. The goal is to predict group
              stage results, knockout outcomes and the eventual winner.
            </p>
            <p className="text-sm text-muted-foreground">
              Stack: Python, machine learning models trained on historical data, deployed as a web
              app so anyone can interact with the predictions. This is a large project and will take
              the whole summer to build properly.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Python", "ML", "Football", "Data Science", "Web App"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-3">
            <h3 className="font-semibold">Prosthetics and Health Technology Research</h3>
            <p className="text-sm text-muted-foreground">
              I lost the sight in my right eye to retinoblastoma at age two. I have lived with
              monocular vision my entire life. I want to do serious research into where the science
              and engineering of prosthetics actually stands, particularly for ocular prosthetics and
              bio-integrated electronics.
            </p>
            <p className="text-sm text-muted-foreground">
              This is not just a research interest. It is personal. The goal is to understand what
              has been achieved, what the current limitations are and where the engineering
              challenges lie. I would like this to eventually inform a real project or contribution
              to the field.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Prosthetics", "Health Tech", "Research", "Bioelectronics", "IoT"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Newsletter */}
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-3">
        <p className="text-xs font-mono text-primary uppercase tracking-widest">newsletter</p>
        <p className="text-sm font-medium">Get updates in your inbox</p>
        <p className="text-xs text-muted-foreground">
          Notes on tech, projects and more. No spam. Unsubscribe anytime.
        </p>
        <NewsletterForm variant="compact" />
      </div>

      <Separator />

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
              type commands to explore the site and find out more — click to open
            </p>
          </div>
          <Terminal className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors ml-auto shrink-0" />
        </div>
      </Link>
    </div>
  )
}
