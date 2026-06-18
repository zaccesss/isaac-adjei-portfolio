// I render a card for both articles and others.
// The title and "Notes" link go to the internal subpage; the external icon links to the original source.
import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_CHIP, type LinkEntry } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"

export function LinkCard({ item, category }: { item: LinkEntry; category: "articles" | "others" }) {
  const slug = consumedSlug(item.title)
  const subpageHref = `/consumed/${category}/${slug}`
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <Link
            href={subpageHref}
            className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2 block"
          >
            {item.title}
          </Link>
          <p className="text-[10px] text-muted-foreground">{item.source}</p>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${item.title} at source`}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.description}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[item.month])}>
          {item.month.slice(0, 3)}
        </span>
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tag}
          </span>
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
  )
}
