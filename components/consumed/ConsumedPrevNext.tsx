// Prev/next navigation between items in the same category, in the same newest-first order the
// listing pages use - so paging through never contradicts how the item was found.
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface ConsumedPrevNextItem {
  title: string
  href: string
}

export function ConsumedPrevNext({
  prev,
  next,
  prevLabel = "Newer",
  nextLabel = "Older",
}: {
  prev: ConsumedPrevNextItem | null
  next: ConsumedPrevNextItem | null
  prevLabel?: string
  nextLabel?: string
}) {
  if (!prev && !next) return null

  return (
    <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-6">
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="group flex flex-col gap-1 rounded-xl border border-border/60 bg-card p-3 hover:border-border transition-colors"
          >
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              <ArrowLeft className="h-3 w-3" />
              {prevLabel}
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={next.href}
            className="group flex flex-col items-end gap-1 rounded-xl border border-border/60 bg-card p-3 hover:border-border transition-colors text-right"
          >
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              {nextLabel}
              <ArrowRight className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
