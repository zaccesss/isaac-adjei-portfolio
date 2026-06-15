// I render the public newsletter landing page with topic cards, a subscribe form and recent issues.
// I am a server component so the metadata and OG image are available for crawlers without JS.
import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Book, Mail, Zap, BookOpen, Cpu, Globe, Lightbulb, ExternalLink, Clock, FlaskConical, Info, Wrench, Play } from "lucide-react"
import NewsletterForm from "@/components/shared/NewsletterForm"
import PastIssues from "@/components/shared/PastIssues"
import AuthorCard from "@/components/blog/AuthorCard"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to my newsletter: engineering write-ups, project breakdowns, tech reflections and things I am building and learning. Written by Isaac Adjei.",
  alternates: {
    canonical: "https://www.isaacadjei.me/newsletter",
  },
  openGraph: {
    images: ["/api/og?title=Newsletter&description=Engineering%20write-ups%2C%20project%20breakdowns%20and%20things%20I%20am%20building%2E"],
  },
}

const topics = [
  {
    icon: Cpu,
    title: "Engineering and embedded systems",
    description:
      "Bare metal C, microcontrollers, PCB design, circuit analysis and the messier side of hardware that tutorials skip over. Real field engineering, not just theory.",
  },
  {
    icon: Globe,
    title: "Full-stack software",
    description:
      "Next.js, FastAPI, databases, APIs and deployment. Project breakdowns from concept to shipped product, including what actually went wrong along the way.",
  },
  {
    icon: BookOpen,
    title: "University and learning",
    description:
      "What studying BEng Electronic Engineering and Computer Science at Aston actually looks like, the good and the hard parts. Honest notes from someone living it.",
  },
  {
    icon: Zap,
    title: "Projects and builds",
    description:
      "Detailed write-ups on everything I build: what worked, what broke and what I would do differently next time. From PCBs to platforms.",
  },
  {
    icon: Lightbulb,
    title: "General thoughts and ideas",
    description:
      "Not everything fits a category. Observations on technology, productivity, career, creativity and whatever else is worth thinking about. No filler, just honest takes.",
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
        <div className="flex items-start gap-2">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Engineering, hardware and software. Straight to your inbox.
          </h1>
        </div>
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

      <AuthorCard />

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
          Every issue includes a one-click unsubscribe link at the bottom. No questions asked.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Already subscribed?</span>
          <a
            href="https://newsletter.isaacadjei.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Browse all issues on Beehiiv
          </a>
        </div>
      </section>

      <Separator />

      <PastIssues />

      <Separator />

      {/* Cross-links */}
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          While you wait, explore the rest of the site.
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
            <Book className="h-4 w-4 text-primary" />
            See my notes
          </Link>
          <Link
            href="/now"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Clock className="h-4 w-4 text-primary" />
            What I am up to now
          </Link>
          <Link
            href="/consumed"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Play className="h-4 w-4 text-primary" />
            Consumed
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <FlaskConical className="h-4 w-4 text-primary" />
            Lab
          </Link>
          <Link
            href="/colophon"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Info className="h-4 w-4 text-primary" />
            Colophon
          </Link>
          <Link
            href="/uses"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Wrench className="h-4 w-4 text-primary" />
            Uses
          </Link>
        </div>
      </section>

    </div>
  )
}
