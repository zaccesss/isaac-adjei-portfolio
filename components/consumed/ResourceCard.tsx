// I render a resource card.
// The title and "Notes" link go to the internal subpage; the external icon links directly to the resource.
import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { RESOURCE_CHIP, MONTH_CHIP, type ResourceEntry } from "@/data/consumed"
import { consumedSlug, normTag } from "@/lib/tags"

export function ResourceCard({ resource }: { resource: ResourceEntry }) {
  const chip = RESOURCE_CHIP[resource.category]
  const slug = consumedSlug(resource.title)
  const subpageHref = `/consumed/resources/${slug}`
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <Link
            href={subpageHref}
            className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-1 block"
          >
            {resource.title}
          </Link>
          <p className="text-[10px] text-muted-foreground truncate">{resource.url.replace(/^https?:\/\//, "")}</p>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${resource.title}`}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{resource.description}</p>
      <div className="flex items-center gap-2">
        <Link
          href={`/tags/${normTag(resource.category)}`}
          className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium hover:opacity-80 transition-opacity", chip)}
        >
          {resource.category}
        </Link>
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[resource.month])}>
          {resource.month.slice(0, 3)}
        </span>
        <Link
          href={subpageHref}
          className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary hover:underline underline-offset-2"
        >
          <FileText className="h-3 w-3" />
          Notes
        </Link>
      </div>
    </div>
  )
}
