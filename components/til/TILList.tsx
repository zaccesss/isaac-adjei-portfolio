"use client"
// I handle search, category filter and 10-per-page pagination for the TIL index.
// Each card is a preview only: title links to the full entry subpage.

import { useState, useMemo } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { cn, computeReadingTime } from "@/lib/utils"
import type { TILEntry } from "@/data/til"
import { relevanceScore } from "@/lib/search"

function tilReadingTime(entry: TILEntry): number {
  const blocks: { type: string; text?: string; code?: string }[] = [
    { type: "p", text: entry.body },
    ...(entry.detail ?? []).map((b) => ({
      type: b.type,
      text: "text" in b ? (b as { text: string }).text : undefined,
      code: "code" in b ? (b as { code: string }).code : undefined,
    })),
  ]
  return computeReadingTime(blocks)
}

const ITEMS_PER_PAGE = 10

export const CATEGORY_STYLES: Record<string, string> = {
  "C":                          "bg-[#00599C]/10 text-[#00599C] dark:text-[#60a5fa]",
  "Embedded":                   "bg-[#16a34a]/10 text-[#16a34a] dark:text-[#4ade80]",
  "Git":                        "bg-[#F05032]/10 text-[#F05032] dark:text-[#fb923c]",
  "CSS":                        "bg-[#1572B6]/10 text-[#1572B6] dark:text-[#38bdf8]",
  "Next.js":                    "bg-gray-900/10 text-gray-800 dark:text-gray-200",
  "TypeScript":                 "bg-[#3178C6]/10 text-[#3178C6] dark:text-[#93c5fd]",
  "Algorithms & Data Structures": "bg-violet-600/10 text-violet-600 dark:text-violet-400",
  "Security":                   "bg-red-600/10 text-red-600 dark:text-red-400",
  "Hardware":                   "bg-amber-600/10 text-amber-600 dark:text-amber-400",
  "AI/ML":                      "bg-purple-600/10 text-purple-600 dark:text-purple-400",
  "Python":                     "bg-[#f59e0b]/10 text-[#f59e0b] dark:text-[#fcd34d]",
  "Linux":                      "bg-yellow-400/10 text-[#b45309] dark:text-[#fde68a]",
  "Architecture":               "bg-orange-600/10 text-orange-600 dark:text-orange-400",
  "Database":                   "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  "Web":                        "bg-sky-600/10 text-sky-600 dark:text-sky-400",
  "Music":                      "bg-pink-600/10 text-pink-600 dark:text-pink-400",
  "Fitness":                    "bg-teal-600/10 text-teal-600 dark:text-teal-400",
  "Cooking":                    "bg-rose-600/10 text-rose-600 dark:text-rose-400",
  "Faith":                      "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  "Life":                       "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400",
  "OOP":                        "bg-cyan-600/10 text-cyan-600 dark:text-cyan-400",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface Props {
  entries: TILEntry[]
}

// I strip [label](url) markdown links so the preview shows plain text only.
function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

// I count how many times a query term appears in a string, case-insensitively.
function countMatches(text: string, q: string): number {
  if (!q) return 0
  let count = 0
  let pos = 0
  const lower = text.toLowerCase()
  while ((pos = lower.indexOf(q, pos)) !== -1) { count++; pos++ }
  return count
}

// I highlight all occurrences of q inside text, returning React nodes.
function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="bg-primary/20 text-foreground rounded-[2px] px-[1px]">{part}</mark>
      : part
  )
}

export default function TILList({ entries }: Props) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    entries.forEach(e => seen.add(e.category))
    return Array.from(seen).sort()
  }, [entries])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const matches = entries.filter(e => {
      if (category !== "all" && e.category !== category) return false
      if (q) {
        const plain = stripLinks(e.body)
        return e.title.toLowerCase().includes(q) || plain.toLowerCase().includes(q)
      }
      return true
    })
    if (!q) return matches
    return matches.slice().sort(
      (a, b) => relevanceScore(b.title, stripLinks(b.body), q) - relevanceScore(a.title, stripLinks(a.body), q)
    )
  }, [entries, search, category])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function setFilter(next: { search?: string; category?: string }) {
    if (next.search !== undefined) setSearch(next.search)
    if (next.category !== undefined) setCategory(next.category)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Search entries…"
          value={search}
          onChange={e => setFilter({ search: e.target.value })}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter({ category: "all" })}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            category === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter({ category: cat })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              category === cat
                ? (CATEGORY_STYLES[cat] ?? "bg-primary/10 text-primary") + " ring-1 ring-current"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground font-mono">
        {filtered.length} of {entries.length} {entries.length === 1 ? "entry" : "entries"}
      </p>

      {/* Entry cards */}
      <div className="space-y-0 divide-y divide-border">
        {paginated.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No entries match.</p>
        ) : (
          paginated.map(entry => {
            const catClass = CATEGORY_STYLES[entry.category] ?? "bg-primary/10 text-primary"
            const q = search.toLowerCase().trim()
            const plainBody = stripLinks(entry.body)
            return (
              <div key={entry.id} className="py-5 space-y-2">
                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", catClass)}>
                    {entry.category}
                  </span>
                  <time dateTime={entry.date} className="text-xs text-muted-foreground font-mono">
                    {formatDate(entry.date)}
                  </time>
                  <span className="text-xs text-muted-foreground font-mono">{tilReadingTime(entry)} min read</span>
                </div>

                {/* Title: links to subpage, matched term highlighted */}
                <Link
                  href={`/til/${entry.id}`}
                  className="block text-sm font-semibold leading-snug hover:text-primary transition-colors"
                >
                  {highlight(entry.title, q)}
                </Link>

                {/* Body preview: 2 lines max, markdown links stripped, matched term highlighted */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {highlight(plainBody, q)}
                </p>

                {/* Tags + source */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {entry.tags?.map(tag => (
                    <span key={tag} className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
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
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="First page"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              type="button"
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors",
                p === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      )}
    </div>
  )
}
