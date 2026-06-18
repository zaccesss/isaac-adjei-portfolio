"use client"

// I filter the tag cloud as the user types, without a full page reload.

import { useState } from "react"
import Link from "next/link"
import { Search, Tag } from "lucide-react"
import { fieldScore } from "@/lib/search"

interface TagItem {
  slug: string
  display: string
  count: number
}

export default function TagsClient({ tags }: { tags: TagItem[] }) {
  const [filter, setFilter] = useState("")

  const visible = filter.trim()
    ? tags
        .filter((t) => t.display.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => {
          const diff = fieldScore(b.display, filter) - fieldScore(a.display, filter)
          return diff !== 0 ? diff : b.count - a.count
        })
    : tags

  return (
    <div className="container max-w-2xl py-24 space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Tags</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          All topics across blog posts, TIL entries, projects and publications.{" "}
          {tags.length} tags total.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Filter tags..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visible.map(({ slug, display, count }) => (
            <Link
              key={slug}
              href={`/tags/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-sm hover:bg-muted hover:border-border/80 transition-colors"
            >
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span>{display}</span>
              <span className="text-muted-foreground text-xs">({count})</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No tags match <span className="text-foreground font-medium">&ldquo;{filter}&rdquo;</span>.
        </p>
      )}
    </div>
  )
}
