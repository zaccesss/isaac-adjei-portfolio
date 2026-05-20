"use client"

// Reaction bar shown at the bottom of each blog post.
// I fetch the current counts on mount and optimistically update the UI on click
// so it feels instant. localStorage tracks which reactions the user has already
// left so repeat clicks don't spam the counter.

import { useEffect, useState } from "react"
import { ThumbsUp, Flame, Lightbulb, Heart } from "lucide-react"

type ReactionType = "thumbsup" | "fire" | "lightbulb" | "heart"

const REACTIONS: { type: ReactionType; icon: React.ElementType; label: string }[] = [
  { type: "thumbsup",  icon: ThumbsUp,  label: "Good read"  },
  { type: "fire",      icon: Flame,     label: "Insightful" },
  { type: "lightbulb", icon: Lightbulb, label: "Learnt something" },
  { type: "heart",     icon: Heart,     label: "Love this"  },
]

// I store reaction state in localStorage under this key so I can grey out
// reactions the user has already left without requiring a login.
function storageKey(slug: string) {
  return `reactions:${slug}`
}

function getReacted(slug: string): Set<ReactionType> {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as ReactionType[])
  } catch {
    return new Set()
  }
}

function markReacted(slug: string, type: ReactionType) {
  try {
    const reacted = getReacted(slug)
    reacted.add(type)
    localStorage.setItem(storageKey(slug), JSON.stringify([...reacted]))
  } catch {}
}

type Counts = Record<ReactionType, number>

export default function BlogReactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Counts>({ thumbsup: 0, fire: 0, lightbulb: 0, heart: 0 })
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setReacted(getReacted(slug)), 0)
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: Counts) => {
        setCounts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  async function handleReact(type: ReactionType) {
    if (reacted.has(type)) return

    // I update the UI immediately so there's no delay
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }))
    setReacted((prev) => new Set([...prev, type]))
    markReacted(slug, type)

    try {
      await fetch("/api/blog-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      })
    } catch {
      // I roll back the optimistic update if the request fails
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))
      setReacted((prev) => {
        const next = new Set(prev)
        next.delete(type)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
        React to this post
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ type, icon: Icon, label }) => {
          const hasReacted = reacted.has(type)
          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={hasReacted}
              title={label}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm
                transition-all select-none
                ${hasReacted
                  ? "border-primary/40 bg-primary/10 text-primary cursor-default"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className={`font-mono text-xs tabular-nums ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}>
                {counts[type]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
