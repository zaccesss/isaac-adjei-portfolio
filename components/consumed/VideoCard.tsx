"use client"
import Link from "next/link"
import { Play, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_CHIP, type VideoEntry } from "@/data/consumed"
import { consumedSlug, normTag } from "@/lib/tags"

export function VideoCard({
  video,
  active,
  onActivate,
  compact = false,
}: {
  video: VideoEntry
  active: boolean
  onActivate: () => void
  compact?: boolean
}) {
  const subpageHref = `/consumed/videos/${consumedSlug(video.title)}`

  if (video.isPlaylist) {
    return (
      <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors">
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${video.id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium">Playlist</span>
              </div>
              <Link
                href={subpageHref}
                className="text-xs font-medium text-foreground leading-snug line-clamp-2 block hover:text-primary transition-colors"
              >
                {video.title}
              </Link>
            </div>
            <a
              href={`https://www.youtube.com/playlist?list=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open playlist on YouTube"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{video.channel}</p>
          {!compact && video.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">{video.description}</p>
          )}
          <div className="flex flex-wrap gap-1 items-center">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[video.month])}>
              {video.month.slice(0, 3)}
            </span>
            {(compact ? video.tags.slice(0, 1) : video.tags).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${normTag(tag)}`}
                className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {tag}
              </Link>
            ))}
            <Link
              href={subpageHref}
              className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2"
            >
              <FileText className="h-3 w-3" />
              Notes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-colors">
      <div className="relative aspect-video bg-zinc-900">
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={onActivate}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 w-full h-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 text-zinc-900 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={subpageHref}
            className="text-xs font-medium text-foreground leading-snug line-clamp-2 flex-1 hover:text-primary transition-colors"
          >
            {video.title}
          </Link>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open on YouTube"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">{video.channel}</p>
        {!compact && video.description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed">{video.description}</p>
        )}
        <div className="flex flex-wrap gap-1 items-center">
          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[video.month])}>
            {video.month.slice(0, 3)}
          </span>
          {(compact ? video.tags.slice(0, 1) : video.tags).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${normTag(tag)}`}
              className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              {tag}
            </Link>
          ))}
          <Link
            href={subpageHref}
            className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2"
          >
            <FileText className="h-3 w-3" />
            Notes
          </Link>
        </div>
      </div>
    </div>
  )
}
