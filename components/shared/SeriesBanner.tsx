// Series banner shown at the top of any post that belongs to a series.
// I list all parts with links so readers can jump to any entry in the series.
// The current post is highlighted and not a link.

import Link from "next/link"
import { BookMarked } from "lucide-react"

interface SeriesPost {
  slug: string
  title: string
  seriesPart?: number
}

interface SeriesBannerProps {
  seriesLabel: string
  posts: SeriesPost[]
  currentSlug: string
}

export default function SeriesBanner({ seriesLabel, posts, currentSlug }: SeriesBannerProps) {
  if (posts.length < 2) return null

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 space-y-3 mb-10">
      <div className="flex items-center gap-2 text-xs font-mono text-primary">
        <BookMarked className="h-3.5 w-3.5 shrink-0" />
        <span>Part of the &ldquo;{seriesLabel}&rdquo; series</span>
      </div>
      <ol className="space-y-1.5">
        {posts.map(({ slug, title, seriesPart }) => {
          const isCurrent = slug === currentSlug
          return (
            <li key={slug} className="flex items-start gap-2.5 text-sm">
              <span className="font-mono text-xs text-primary/60 shrink-0 mt-0.5 w-5 text-right">
                {seriesPart ?? "·"}
              </span>
              {isCurrent ? (
                <span className="font-medium text-foreground leading-snug">{title}</span>
              ) : (
                <Link
                  href={`/blog/${slug}`}
                  className="text-muted-foreground hover:text-primary transition-colors leading-snug"
                >
                  {title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
