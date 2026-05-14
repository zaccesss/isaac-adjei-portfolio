"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPublishedPosts, POST_TYPES, type PostType } from "@/data/blog"
import NewsletterForm from "@/components/shared/NewsletterForm"

const TYPE_STYLES: Record<PostType, string> = {
  blog: "bg-primary/10 text-primary border-primary/20",
  journal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  research: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  notes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  report: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  article: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  resources: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function BlogPage() {
  const [activeType, setActiveType] = useState<PostType | "all">("all")
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null)
  const [bible, setBible] = useState<{ verse: string; reference: string } | null>(null)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("/api/quote")
        const data = await res.json()
        setQuote(data)
      } catch {}
    }
    fetchQuote()
    const interval = setInterval(fetchQuote, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch("/api/bible-verse")
        const data = await res.json()
        setBible(data)
      } catch {}
    }
    fetchVerse()
    const interval = setInterval(fetchVerse, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const allPosts = getPublishedPosts().sort((a, b) => {
    // Pin journey post to top always
    if (a.slug === "my-journey-so-far") return -1
    if (b.slug === "my-journey-so-far") return 1
    // Pin week-1-aston to bottom always
    if (a.slug === "week-1-aston") return 1
    if (b.slug === "week-1-aston") return -1
    // Then sort by date descending
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  const filtered =
    activeType === "all" ? allPosts : allPosts.filter((p) => p.type === activeType)

  return (
    <div className="container max-w-4xl py-24 space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Writing</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Engineering write-ups, project breakdowns, journal entries and research notes. Everything
          I build, learn and think about.
        </p>
      </section>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveType(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeType === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/60 hover:border-border transition-all px-6 py-5 space-y-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[post.type]}`}
                >
                  {POST_TYPES.find((t) => t.value === post.type)?.label ?? post.type}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 p-12 text-center space-y-2">
          <p className="text-sm font-medium">No posts in this category yet.</p>
          <p className="text-xs text-muted-foreground">Check back soon.</p>
        </div>
      )}

      <Separator />

      {/* Motivation */}
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-primary uppercase tracking-widest">motivation</p>
          <button
            type="button"
            onClick={async () => {
              setQuote(null)
              const res = await fetch("/api/quote")
              const data = await res.json()
              setQuote(data)
            }}
            className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            refresh ↻
          </button>
        </div>
        {quote ? (
          <>
            <p className="text-base font-medium leading-relaxed">&ldquo;{quote.quote}&rdquo;</p>
            <p className="text-xs text-muted-foreground">- {quote.author}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground font-mono animate-pulse">loading quote...</p>
        )}
      </div>

      {/* Scripture */}
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-primary uppercase tracking-widest">scripture</p>
          <button
            type="button"
            onClick={async () => {
              setBible(null)
              const res = await fetch("/api/bible-verse")
              const data = await res.json()
              setBible(data)
            }}
            className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            refresh ↻
          </button>
        </div>
        {bible ? (
          <>
            <p className="text-base font-medium leading-relaxed">&ldquo;{bible.verse}&rdquo;</p>
            <p className="text-xs text-muted-foreground">- {bible.reference}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground font-mono animate-pulse">loading verse...</p>
        )}
      </div>

      {/* Lab link */}
      <Link
        href="/lab"
        className="group block rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-2 h-4 bg-primary shrink-0 animate-[blink_1s_step-end_infinite]"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="font-mono text-sm text-primary font-medium">
              prefer a terminal? try /lab
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              type commands to explore the site and find out more - click to open
            </p>
          </div>
          <Terminal className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors ml-auto shrink-0" />
        </div>
      </Link>

      <Separator />

      {/* Newsletter */}
      <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-3">
        <p className="text-xs font-mono text-primary uppercase tracking-widest">newsletter</p>
        <p className="text-sm font-medium">Get new posts in your inbox</p>
        <p className="text-xs text-muted-foreground">
          Notes on tech, projects and more. No spam. Unsubscribe anytime.
        </p>
        <NewsletterForm variant="compact" />
      </div>
    </div>
  )
}
