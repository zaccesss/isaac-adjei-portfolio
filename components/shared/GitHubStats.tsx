"use client"

// I fetch and display GitHub profile stats below the lab terminal.
// Pulls from /api/github-stats which caches results for 10 minutes.

import { useEffect, useState } from "react"
import { Github, Star, Users, BookOpen, ExternalLink } from "lucide-react"
import type { GitHubStats } from "@/app/api/github-stats/route"

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
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
        <p className="text-xs text-muted-foreground font-mono">
          could not load stats right now
        </p>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center space-y-1">
              <div className="flex justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">{stats.publicRepos}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">repos</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center space-y-1">
              <div className="flex justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">{stats.followers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">followers</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center space-y-1">
              <div className="flex justify-center">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">{stats.totalStars}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">stars</p>
            </div>
          </div>

          {stats.topLanguages.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                top languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.topRepos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                top repos
              </p>
              <div className="space-y-2">
                {stats.topRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 hover:border-primary/40 hover:bg-muted/30 transition-all group"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {repo.name}
                      </p>
                      {repo.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {repo.description}
                        </p>
                      )}
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
