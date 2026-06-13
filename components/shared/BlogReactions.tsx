"use client"

import { useEffect, useState } from "react"

type ReactionType = "thumbsup" | "fire" | "lightbulb" | "heart" | "thinking" | "surprised"

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "thumbsup",  emoji: "👍", label: "Good read"          },
  { type: "heart",     emoji: "❤️", label: "Love this"          },
  { type: "fire",      emoji: "🔥", label: "Insightful"         },
  { type: "lightbulb", emoji: "💡", label: "Learnt something"   },
  { type: "thinking",  emoji: "🤔", label: "Thought-provoking"  },
  { type: "surprised", emoji: "😮", label: "Surprised me"       },
]

type Counts = Record<ReactionType, number>

function storageKey(slug: string) { return `reactions:${slug}` }

function getReacted(slug: string): Set<ReactionType> {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    return raw ? new Set(JSON.parse(raw) as ReactionType[]) : new Set()
  } catch { return new Set() }
}

function saveReacted(slug: string, reacted: Set<ReactionType>) {
  try { localStorage.setItem(storageKey(slug), JSON.stringify([...reacted])) } catch {}
}

export default function BlogReactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Counts>({ thumbsup: 0, fire: 0, lightbulb: 0, heart: 0, thinking: 0, surprised: 0 })
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setReacted(getReacted(slug)), 0)
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: Counts) => { setCounts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  async function handleToggle(type: ReactionType) {
    const already = reacted.has(type)
    const action = already ? "unreact" : "react"

    // Optimistic update
    setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + (already ? -1 : 1)) }))
    setReacted((prev) => {
      const next = new Set(prev)
      already ? next.delete(type) : next.add(type)
      saveReacted(slug, next)
      return next
    })

    try {
      await fetch("/api/blog-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type, action }),
      })
    } catch {
      // Roll back optimistic update on failure
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + (already ? 1 : -1)) }))
      setReacted((prev) => {
        const next = new Set(prev)
        already ? next.add(type) : next.delete(type)
        saveReacted(slug, next)
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
        {REACTIONS.map(({ type, emoji, label }) => {
          const hasReacted = reacted.has(type)
          return (
            <button
              key={type}
              onClick={() => handleToggle(type)}
              title={label}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm
                transition-all select-none cursor-pointer
                ${hasReacted
                  ? "border-primary/40 bg-primary/10 text-primary scale-105"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:scale-105"
                }
              `}
            >
              <span className="text-base leading-none">{emoji}</span>
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
