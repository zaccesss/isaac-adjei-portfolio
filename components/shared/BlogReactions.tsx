"use client"

import { useEffect, useState } from "react"

// GitHub-standard 8 reactions — matches giscus style
const REACTIONS: { type: string; emoji: string; label: string }[] = [
  { type: "thumbsup",   emoji: "👍", label: "+1"        },
  { type: "thumbsdown", emoji: "👎", label: "-1"        },
  { type: "laugh",      emoji: "😄", label: "Laugh"     },
  { type: "hooray",     emoji: "🎉", label: "Hooray"    },
  { type: "confused",   emoji: "😕", label: "Confused"  },
  { type: "heart",      emoji: "❤️", label: "Heart"     },
  { type: "rocket",     emoji: "🚀", label: "Rocket"    },
  { type: "eyes",       emoji: "👀", label: "Eyes"      },
]

type Counts = Record<string, number>

function storageKey(slug: string) { return `reactions:${slug}` }

function getReacted(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}

function saveReacted(slug: string, reacted: Set<string>) {
  try { localStorage.setItem(storageKey(slug), JSON.stringify([...reacted])) } catch {}
}

export default function BlogReactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Counts>(
    Object.fromEntries(REACTIONS.map((r) => [r.type, 0]))
  )
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setReacted(getReacted(slug)), 0)
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: { presets?: Counts }) => {
        if (data.presets) setCounts((prev) => ({ ...prev, ...data.presets }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  async function handleToggle(type: string) {
    const already = reacted.has(type)
    const delta = already ? -1 : 1

    setCounts((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) + delta) }))
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
        body: JSON.stringify({ slug, type, action: already ? "unreact" : "react" }),
      })
    } catch {
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) - delta) }))
      setReacted((prev) => {
        const next = new Set(prev)
        already ? next.add(type) : next.delete(type)
        saveReacted(slug, next)
        return next
      })
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col items-center gap-3">
      {total > 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {total} reaction{total !== 1 ? "s" : ""}
        </p>
      )}
      <div className={`flex items-center gap-1.5 flex-wrap justify-center transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}>
        {REACTIONS.map(({ type, emoji, label }) => {
          const count = counts[type] ?? 0
          const hasReacted = reacted.has(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleToggle(type)}
              title={label}
              className={`
                inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm
                transition-all select-none cursor-pointer
                ${hasReacted
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30"
                }
              `}
            >
              <span className="text-base leading-none">{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-mono tabular-nums">{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
