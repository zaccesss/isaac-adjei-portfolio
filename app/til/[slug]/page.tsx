// I render a single TIL entry. Future-dated entries get noindex; unpublished entries 404 in prod.
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import {
  tilEntries,
  getTILBySlug,
  getPublishedTILEntries,
  type TILBlock,
} from "@/data/til"
import CodeBlock from "@/components/shared/CodeBlock"
import ShareButton from "@/components/shared/ShareButton"
import TableOfContents, { type TocHeading } from "@/components/shared/TableOfContents"
import { CATEGORY_STYLES } from "@/components/til/TILList"
import { cn } from "@/lib/utils"

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      const isExternal = match[2].startsWith("http")
      return (
        <a
          key={i}
          href={match[2]}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {match[1]}
        </a>
      )
    }
    return part
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export async function generateStaticParams() {
  return tilEntries.map((e) => ({ slug: e.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getTILBySlug(slug)
  if (!entry) return {}

  const isFuture = new Date(entry.date) > new Date()

  return {
    title: `TIL: ${entry.title}`,
    description: entry.body,
    ...(isFuture && {
      robots: { index: false, follow: false },
    }),
    openGraph: {
      title: `TIL: ${entry.title}`,
      description: entry.body,
    },
  }
}

function renderBlock(block: TILBlock, i: number): React.ReactNode {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} id={block.text.toLowerCase().replace(/\s+/g, "-")} className="text-base font-semibold mt-6 mb-2">
          {block.text}
        </h2>
      )
    case "p":
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {renderInline(block.text)}
        </p>
      )
    case "code":
      return (
        <div key={i} className="space-y-1">
          <CodeBlock lang={block.lang} text={block.code} />
          {block.caption && (
            <p className="text-xs text-muted-foreground text-center font-mono">{block.caption}</p>
          )}
        </div>
      )
    case "note":
      return (
        <div key={i} className="border-l-4 border-primary/30 pl-4 py-1 bg-primary/5 rounded-r-md">
          <p className="text-sm text-muted-foreground leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    case "embed":
      return (
        <div key={i} className="space-y-1">
          <div className={cn(
            "w-full rounded-lg overflow-hidden border border-border",
            block.variant === "spotify" ? "h-[232px]" : "aspect-video"
          )}>
            <iframe
              src={block.url}
              className="w-full h-full"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={block.caption ?? "Embedded content"}
            />
          </div>
          {block.caption && (
            <p className="text-xs text-muted-foreground text-center">{block.caption}</p>
          )}
        </div>
      )
    case "link":
      return (
        <a
          key={i}
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{block.label}</p>
            {block.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{block.description}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-1 font-mono truncate">{block.url}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </a>
      )
    default:
      return null
  }
}

export default async function TILSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = getTILBySlug(slug)

  if (!entry) notFound()

  // Unpublished entries are invisible in production
  if (!entry.published && process.env.NODE_ENV !== "development") notFound()

  const isFuture = new Date(entry.date) > new Date()
  const catClass = CATEGORY_STYLES[entry.category] ?? "bg-primary/10 text-primary"

  // Build prev/next from published visible entries sorted by date
  const sorted = getPublishedTILEntries().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const idx = sorted.findIndex((e) => e.id === entry.id)
  const prev = idx > 0 ? sorted[idx - 1] : null
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null

  // Only show ToC when the entry has 3 or more h2 detail blocks
  const tocHeadings: TocHeading[] = (entry.detail ?? [])
    .filter((b): b is Extract<TILBlock, { type: "h2" }> => b.type === "h2")
    .map((b) => ({
      id: b.text.toLowerCase().replace(/\s+/g, "-"),
      text: b.text,
      level: 2,
    }))
  const showToC = tocHeadings.length >= 3

  return (
    <div className={cn("container py-24", showToC ? "max-w-2xl xl:max-w-5xl" : "max-w-2xl")}>
      {/* Future-dated banner (dev only) */}
      {isFuture && (
        <div className="rounded-md border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 mb-8">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-mono">
            Scheduled: publishes {formatDate(entry.date)}. Not yet indexed.
          </p>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/til"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to TIL
      </Link>

      {/* Content + ToC */}
      <div className={cn(showToC && "xl:grid xl:grid-cols-[1fr_220px] xl:gap-12 xl:items-start")}>
        <div className="space-y-8">
          {/* Meta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", catClass)}>
                {entry.category}
              </span>
              <time dateTime={entry.date} className="text-xs text-muted-foreground font-mono">
                {formatDate(entry.date)}
              </time>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight leading-snug">{entry.title}</h1>
              <ShareButton title={`TIL: ${entry.title}`} />
            </div>
          </div>

          {/* Lead body */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {renderInline(entry.body)}
          </p>

          {/* Detail blocks */}
          {entry.detail && entry.detail.length > 0 && (
            <div className="space-y-4">
              {entry.detail.map((block, i) => renderBlock(block, i))}
            </div>
          )}

          {/* Tags + source */}
          {((entry.tags && entry.tags.length > 0) || entry.source) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {entry.tags?.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
              {entry.source && (
                <a
                  href={entry.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
                >
                  {entry.source.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Related post link */}
          {entry.relatedPost && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                This turned into a full post:{" "}
                <Link href={`/blog/${entry.relatedPost}`} className="text-primary hover:underline">
                  Read the full post
                </Link>
              </p>
            </div>
          )}

          {/* Prev / next */}
          {(prev || next) && (
            <>
              <hr className="border-border" />
              <nav className="flex items-start justify-between gap-4 text-sm">
                {prev ? (
                  <Link href={`/til/${prev.id}`} className="flex flex-col gap-1 group max-w-[45%]">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3" /> Previous
                    </span>
                    <span className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link href={`/til/${next.id}`} className="flex flex-col gap-1 group items-end text-right max-w-[45%] ml-auto">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Next <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>
            </>
          )}
        </div>

        {showToC && <TableOfContents headings={tocHeadings} />}
      </div>
    </div>
  )
}
