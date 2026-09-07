// The /stats hub - a public, no-auth landing page linking into each domain's dedicated stats
// sub-page. Everything here is either already public (GitHub activity), my own explicit choice to
// publish (listening history, coding stats), or reduced to a genuinely anonymous aggregate first
// (applications by city, never a company, status, role or date).
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Github, Music2, Code2, MapPinned, Gamepad2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Stats",
  description: "Live and historical stats from isaacadjei.me - GitHub activity, coding hours, listening history, application geography and gaming status.",
  alternates: {
    canonical: "https://www.isaacadjei.me/stats",
  },
  openGraph: {
    images: ["/api/og?title=Stats&description=Live%20and%20historical%20stats%20from%20isaacadjei.me."],
  },
}

const SECTIONS = [
  { href: "/stats/github", icon: Github, label: "GitHub", description: "Contribution history, top languages and repos" },
  { href: "/stats/coding", icon: Code2, label: "Coding", description: "WakaTime hours, languages, projects and editors" },
  { href: "/stats/music", icon: Music2, label: "Music", description: "Top tracks and artists, listening history by day and hour" },
  { href: "/stats/applications", icon: MapPinned, label: "Applications", description: "Where my job search has reached, by city" },
  { href: "/stats/gaming", icon: Gamepad2, label: "Gaming", description: "Live PS5 and gaming PC status" },
]

export default function StatsPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Stats</h1>
        <p className="text-lg text-muted-foreground">
          Live and historical numbers pulled straight from my own dashboard - what I code, what I
          listen to, where my applications have gone and what I am playing right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
          >
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold text-foreground">{label}</h2>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
