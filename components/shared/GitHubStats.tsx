"use client"

// I fetch and display GitHub profile stats and contribution data below the lab terminal.
// Contributions are scoped to the current calendar year via the GraphQL API.

import { useEffect, useState } from "react"
import { Github, Star, Users, BookOpen, ExternalLink, GitCommitHorizontal, GitPullRequest, CircleDot } from "lucide-react"
import type { GitHubStats, ContributionDay } from "@/app/api/github-stats/route"

function ContributionGrid({ days }: { days: ContributionDay[] }) {
  const max = Math.max(...days.map((d) => d.count), 1)

  function intensity(count: number): string {
    if (count === 0) return "bg-muted/40 dark:bg-zinc-800"
    const pct = count / max
    if (pct <= 0.25) return "bg-primary/25"
    if (pct <= 0.5) return "bg-primary/50"
    if (pct <= 0.75) return "bg-primary/75"
    return "bg-primary"
  }

  // Group into weeks
  const weeks: ContributionDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                className={`w-[10px] h-[10px] rounded-sm transition-colors ${intensity(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
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
          {/* Profile stats */}
          <div className="grid grid-cols-3 gap-3">
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

          {/* Contributions this year */}
          {stats.contributions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  contributions {new Date().getFullYear()}
                </p>
                <span className="text-xs font-semibold text-foreground">
                  {stats.contributions.total.toLocaleString()} total
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
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

              <ContributionGrid days={stats.contributions.days} />
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
    </div>
  )
}
