import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Mail, Zap, BookOpen, Cpu, Globe, Rss } from "lucide-react"
import NewsletterForm from "@/components/shared/NewsletterForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to my newsletter: engineering write-ups, project breakdowns, tech reflections and things I am building and learning. Written by Isaac Adjei.",
  alternates: {
    canonical: "https://www.isaacadjei.me/newsletter",
  },
}

const topics = [
  {
    icon: Cpu,
    title: "Engineering and embedded systems",
    description:
      "Bare metal C, microcontrollers, PCB design, circuit analysis and the messier side of hardware that tutorials skip over.",
  },
  {
    icon: Globe,
    title: "Full-stack software",
    description:
      "Next.js, FastAPI, databases, APIs and deployment. Project breakdowns from concept to shipped product.",
  },
  {
    icon: BookOpen,
    title: "University and learning",
    description:
      "What studying BEng Electronic Engineering and Computer Science at Aston actually looks like, the good and the hard parts.",
  },
  {
    icon: Zap,
    title: "Projects and builds",
    description:
      "Detailed write-ups on everything I build: what worked, what broke and what I would do differently next time.",
  },
]

export default function NewsletterPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-16">

      {/* Hero */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <p className="text-xs font-mono text-primary uppercase tracking-widest">newsletter</p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          Engineering, hardware and software. Straight to your inbox.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          I write about the things I am building and learning: embedded systems, full-stack software,
          university projects and the ideas behind them. No filler, no clickbait. Just honest
          write-ups from someone who spends most of their time at the intersection of hardware and
          software.
        </p>
      </section>

      <Separator />

      {/* What you get */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">What you will read</h2>
        <div className="grid gap-4">
          {topics.map((topic) => (
            <div key={topic.title} className="flex gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="shrink-0 mt-0.5">
                <topic.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{topic.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Subscribe form */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Subscribe</h2>
          <p className="text-muted-foreground">
            Join the list. Free, always. No spam, no tracking beyond what Beehiiv collects by
            default. Unsubscribe with one click, any time.
          </p>
        </div>
        <NewsletterForm />
        <p className="text-xs text-muted-foreground">
          Already subscribed?{" "}
          <a
            href="https://newsletter.isaacadjei.me"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Read past issues on Beehiiv
          </a>
        </p>
      </section>

      <Separator />

      {/* Past issues placeholder */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Past issues</h2>
        </div>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-6 py-8 text-center space-y-2">
          <p className="text-sm font-medium">No issues published yet</p>
          <p className="text-xs text-muted-foreground">
            Subscribe above to be first when the first issue goes out.
          </p>
        </div>
      </section>

      <Separator />

      {/* Cross-links */}
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          While you wait, read some of the write-ups on the blog or check the notes page to see
          what I am currently working on.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Read the blog
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Zap className="h-4 w-4 text-primary" />
            See my notes
          </Link>
        </div>
      </section>

    </div>
  )
}
