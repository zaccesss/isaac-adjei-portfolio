"use client"
// I render the /consumed/podcasts subpage with Spotify embeds and month filtering.
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Headphones, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { podcasts, MONTHS, MONTH_CHIP, isMonthAvailable, type Month } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"

export default function PodcastsContent() {
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "1"
  const [activeMonth, setActiveMonth] = useState<string>("all")

  const availableMonths = MONTHS.filter((m) => isMonthAvailable(m, preview))
  const filtered = podcasts
    .filter((p) => isMonthAvailable(p.month, preview))
    .filter((p) => activeMonth === "all" || p.month === activeMonth)

  return (
    <div className="container py-24 space-y-10">
      <div className="space-y-4 max-w-2xl">
        <Link
          href="/consumed"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Consumed
        </Link>
        <div className="flex items-center gap-3">
          <Headphones className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Audio</h1>
          <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Podcast episodes and shows listened to this year. Play them directly here where possible. Spans a wide range of topics: engineering, technology, culture, faith and long-form conversation.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-medium">2026</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMonth("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeMonth === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {availableMonths.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setActiveMonth(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeMonth === m
                  ? cn("border-current", MONTH_CHIP[m])
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No audio for this month yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <div key={p.spotifyId} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-0.5">
                  <Link
                    href={`/consumed/podcasts/${consumedSlug(p.title)}`}
                    className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors block"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.show}</p>
                  {p.description && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-0.5">{p.description}</p>
                  )}
                  <Link
                    href={`/consumed/podcasts/${consumedSlug(p.title)}`}
                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2 pt-0.5"
                  >
                    <FileText className="h-3 w-3" />
                    Notes
                  </Link>
                </div>
                <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[p.month])}>
                  {p.month.slice(0, 3)}
                </span>
              </div>
              <iframe
                src={`https://open.spotify.com/embed/${p.embedType}/${p.spotifyId}?utm_source=generator`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
                title={p.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
