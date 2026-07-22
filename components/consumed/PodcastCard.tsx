// I render a podcast card, matching the pattern VideoCard/ResourceCard/LinkCard already use.
// The title and "Notes" link go to the internal subpage. PodcastEntry has no genre/tag field yet,
// so unlike the other cards there is nothing here to link into /tags.
import Link from "next/link"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_CHIP, type PodcastEntry } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"

export function PodcastCard({ podcast, compact = false }: { podcast: PodcastEntry; compact?: boolean }) {
  const subpageHref = `/consumed/podcasts/${consumedSlug(podcast.title)}`
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <Link
            href={subpageHref}
            className="text-xs font-medium text-foreground line-clamp-1 hover:text-primary transition-colors block"
          >
            {podcast.title}
          </Link>
          <p className="text-[10px] text-muted-foreground">{podcast.show}</p>
          {!compact && podcast.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed pt-0.5">{podcast.description}</p>
          )}
          <Link
            href={subpageHref}
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2 pt-0.5"
          >
            <FileText className="h-3 w-3" />
            Notes
          </Link>
        </div>
        <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[podcast.month])}>
          {podcast.month.slice(0, 3)}
        </span>
      </div>
      <iframe
        src={`https://open.spotify.com/embed/${podcast.embedType}/${podcast.spotifyId}?utm_source=generator`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
        title={podcast.title}
      />
    </div>
  )
}
