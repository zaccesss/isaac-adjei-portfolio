// I render a book card, matching the pattern VideoCard/ResourceCard/LinkCard already use.
// The title and "Notes" link go to the internal subpage; the genre chip links into /tags.
import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_CHIP, type BookEntry } from "@/data/consumed"
import { consumedSlug, normTag } from "@/lib/tags"

export function BookCard({ book }: { book: BookEntry }) {
  const subpageHref = `/consumed/books/${consumedSlug(book.title)}`
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <Link
            href={subpageHref}
            className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2 block"
          >
            {book.title}
          </Link>
          <p className="text-[10px] text-muted-foreground">{book.author}</p>
        </div>
        <span className={cn("shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", MONTH_CHIP[book.month])}>
          {book.month.slice(0, 3)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{book.note}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/tags/${normTag(book.genre)}`}
          className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium hover:opacity-80 transition-opacity", book.genreColor)}
        >
          {book.genre}
        </Link>
        {book.link && (
          <a
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {book.link.includes("amazon") ? "Amazon" : "Free resource"}
          </a>
        )}
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
