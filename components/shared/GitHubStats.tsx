"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import TypingMotto from "@/components/shared/TypingMotto"
import { Github, Star, Users, BookOpen, ExternalLink, GitCommitHorizontal, GitPullRequest, CircleDot, GitBranch } from "lucide-react"
import type { GitHubStats } from "@/app/api/github-stats/route"
import { CalendarHeatmap, type CalendarHeatmapDatum } from "@/components/analytics"

// Dynamically imported without SSR (three.js/react-three-fiber need a real DOM+WebGL context),
// matching components/lab/PCBViewer.tsx's existing pattern for the only other three.js usage here.
const IsometricContributionCalendar = dynamic(() => import("@/components/analytics/IsometricContributionCalendar"), {
  ssr: false,
})

// Defers mounting the (WebGL-heavy) isometric panel until it actually scrolls into view, so a
// visitor who never scrolls this far never pays for the three.js bundle or a WebGL context at all.
function LazyIsometricCalendar({ data }: { data: CalendarHeatmapDatum[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : 320 }}>
      {visible && (
        <IsometricContributionCalendar data={data} valueLabel="contributions" height={320} />
      )}
    </div>
  )
}

interface LastPush {
  repo: string | null
  relativeTime: string | null
}

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [lastPush, setLastPush] = useState<LastPush | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // I fire both fetches together so the card doesn't render a loading shimmer twice as long as needed
    Promise.all([
      fetch("/api/github-stats").then((r) => r.json()).catch(() => null),
      fetch("/api/github-activity").then((r) => r.json()).catch(() => null),
    ]).then(([statsData, activityData]) => {
      if (statsData) setStats(statsData)
      if (activityData) setLastPush(activityData)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-muted-foreground" />
          <a
            href="https://github.com/zaccesss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            github / zaccesss
          </a>
        </div>
        <a
          href="https://github.com/zaccesss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open GitHub profile"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted/60 rounded animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !stats && (
        <p className="text-xs text-muted-foreground font-mono">could not load stats right now</p>
      )}

      {!loading && stats && (
        <>
          {/* Last pushed */}
          {lastPush?.repo && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground min-w-0">
                <span className="text-foreground font-medium">pushed</span>{" "}
                <span className="font-mono">{lastPush.repo}</span>
                {lastPush.relativeTime && (
                  <span className="text-muted-foreground/70"> · {lastPush.relativeTime}</span>
                )}
              </p>
            </div>
          )}

          {/* Profile stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: BookOpen, label: "repos", value: stats.publicRepos },
              { icon: Users, label: "followers", value: stats.followers },
              { icon: Star, label: "stars", value: stats.totalStars },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center space-y-1">
                <div className="flex justify-center"><Icon className="h-4 w-4 text-primary" /></div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">{label}</p>
              </div>
            ))}
          </div>

          {/* Contributions */}
          {stats.contributions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  contributions
                </p>
                <span className="text-xs font-semibold text-foreground">
                  {stats.contributions.allTimeTotal.toLocaleString()} total
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: GitCommitHorizontal, label: "commits", value: stats.contributions.commits },
                  { icon: GitPullRequest, label: "pull requests", value: stats.contributions.pullRequests },
                  { icon: CircleDot, label: "issues", value: stats.contributions.issues },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center space-y-0.5">
                    <div className="flex justify-center"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                    <p className="text-sm font-bold text-foreground">{value.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              <CalendarHeatmap
                data={stats.contributions.days.map((d) => ({ date: d.date, value: d.count }))}
                valueLabel="contributions"
                height={140}
                cellSize={10}
              />

              {/* A circuit-board-styled isometric read of the same data, for the fun of it -
                  lazy-mounted so it costs nothing until scrolled into view. */}
              <LazyIsometricCalendar
                data={stats.contributions.days.map((d) => ({ date: d.date, value: d.count }))}
              />
            </div>
          )}

          {/* Top languages */}
          {stats.topLanguages.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">top languages</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topLanguages.map((lang) => (
                  <span key={lang} className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top repos */}
          {stats.topRepos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">top repos</p>
              <div className="space-y-2">
                {stats.topRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 hover:border-primary/40 hover:bg-muted/30 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{repo.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{repo.description}</p>
                    </div>
                    {repo.stars > 0 && (
                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span className="text-[11px] font-mono">{repo.stars}</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <TypingMotto text="git push origin career --force" delay={600} />
    </div>
  )
}
