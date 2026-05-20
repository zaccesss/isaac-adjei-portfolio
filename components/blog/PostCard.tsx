// Blog post preview card used in the blog listing page.
// TYPE_STYLES and TYPE_LABELS map the PostType string to its display colour and label.
// formatDate converts the ISO date string to a readable UK date (e.g. 1 January 2025).

import Link from "next/link"
import { ArrowRight, BookMarked, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BlogPost, PostType } from "@/data/blog"
import { SERIES_LABELS } from "@/data/blog"

const TYPE_STYLES: Record<PostType, string> = {
  blog: "bg-primary/10 text-primary border-primary/20",
  journal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  research: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  notes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  report: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  article: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  resources: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
}

const TYPE_LABELS: Record<PostType, string> = {
  blog: "Blog",
  journal: "Journal",
  research: "Research",
  notes: "Notes",
  report: "Report",
  article: "Article",
  resources: "Resources",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface PostCardProps {
  post: BlogPost
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex flex-col gap-3">
        {/* Top row: type badge + optional series tag + date */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[post.type]}`}
            >
              {TYPE_LABELS[post.type]}
            </span>
            {post.series && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary/70">
                <BookMarked className="h-2.5 w-2.5" />
                {SERIES_LABELS[post.series] ?? post.series}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{formatDate(post.date)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {/* Footer: tags + reading time */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{post.readingTime} min</span>
            <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
