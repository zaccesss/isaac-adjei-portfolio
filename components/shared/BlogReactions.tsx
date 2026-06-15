// I persist which reactions a visitor has already given in localStorage so the
// toggled state survives a page refresh without a server round-trip. The key is
// per-slug so reactions on different posts never bleed into each other.
// Custom (picker-selected) emojis are stored separately on the server so the GET
// response can discover and return them alongside the 8 pinned reactions.
"use client"

import { useEffect, useState } from "react"
import { SmilePlus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// 8 always-visible pinned reactions
const PINNED: { emoji: string; label: string }[] = [
  { emoji: "👍",  label: "Like"            },
  { emoji: "❤️",  label: "Love"            },
  { emoji: "🔥",  label: "Fire"            },
  { emoji: "💡",  label: "Insightful"      },
  { emoji: "🤯",  label: "Mind blown"      },
  { emoji: "🎉",  label: "Celebration"     },
  { emoji: "💯",  label: "100%"            },
  { emoji: "🎯",  label: "Spot on"         },
]

// All reactions available in the picker (includes pinned + extras)
const ALL_REACTIONS: { emoji: string; label: string }[] = [
  ...PINNED,
  { emoji: "👎",  label: "Disagree"        },
  { emoji: "😄",  label: "Laugh"           },
  { emoji: "😕",  label: "Confused"        },
  { emoji: "😢",  label: "Touching"        },
  { emoji: "🚀",  label: "Impressive"      },
  { emoji: "👀",  label: "Watching"        },
  { emoji: "🙌",  label: "Well done"       },
  { emoji: "😮",  label: "Surprised"       },
  { emoji: "💪",  label: "Strong"          },
  { emoji: "🧠",  label: "Smart"           },
  { emoji: "✨",  label: "Magic"           },
  { emoji: "🌟",  label: "Outstanding"     },
  { emoji: "🙏",  label: "Grateful"        },
  { emoji: "😍",  label: "Amazing"         },
  { emoji: "🤝",  label: "Agreed"          },
  { emoji: "😎",  label: "Cool"            },
  { emoji: "🫶",  label: "Care"            },
  { emoji: "🥹",  label: "Heartwarming"    },
  { emoji: "🫠",  label: "Melting"         },
  { emoji: "🤌",  label: "Chef's kiss"     },
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
    Object.fromEntries(ALL_REACTIONS.map((r) => [r.emoji, 0]))
  )
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setReacted(getReacted(slug)), 0)
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: { presets?: Counts; custom?: Counts }) => {
        setCounts((prev) => ({
          ...prev,
          ...(data.presets ?? {}),
          ...(data.custom ?? {}),
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  async function handleToggle(emoji: string) {
    const already = reacted.has(emoji)
    const delta = already ? -1 : 1

    setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 0) + delta) }))
    setReacted((prev) => {
      const next = new Set(prev)
      already ? next.delete(emoji) : next.add(emoji)
      saveReacted(slug, next)
      return next
    })

    try {
      await fetch("/api/blog-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: emoji, action: already ? "unreact" : "react" }),
      })
    } catch {
      setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 0) - delta) }))
      setReacted((prev) => {
        const next = new Set(prev)
        already ? next.add(emoji) : next.delete(emoji)
        saveReacted(slug, next)
        return next
      })
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  // Picker emojis that aren't pinned and have no count yet (hide used ones — they show in pinned area via extra pills)
  const extraReactions = ALL_REACTIONS.filter((r) => !PINNED.some((p) => p.emoji === r.emoji))

  // Non-pinned emojis that have been used — show as extra pills after the 8 pinned
  const usedExtras = extraReactions.filter((r) => (counts[r.emoji] ?? 0) > 0 || reacted.has(r.emoji))

  return (
    <div className={`flex flex-col items-center gap-3 transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}>
      {total > 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {total} reaction{total !== 1 ? "s" : ""}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* 8 pinned always-visible reactions */}
        {PINNED.map(({ emoji, label }) => {
          const count = counts[emoji] ?? 0
          const hasReacted = reacted.has(emoji)
          return (
            <ReactionButton
              key={emoji}
              emoji={emoji}
              label={label}
              count={count}
              hasReacted={hasReacted}
              faded={count === 0 && !hasReacted}
              onToggle={() => handleToggle(emoji)}
            />
          )
        })}

        {/* Extra pills for any picker emoji that's been used */}
        {usedExtras.map(({ emoji, label }) => (
          <ReactionButton
            key={emoji}
            emoji={emoji}
            label={label}
            count={counts[emoji] ?? 0}
            hasReacted={reacted.has(emoji)}
            faded={false}
            onToggle={() => handleToggle(emoji)}
          />
        ))}

        {/* SmilePlus picker */}
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Add reaction"
              className="inline-flex items-center justify-center rounded-md border border-border/50 p-1.5 text-muted-foreground transition-all hover:border-border hover:text-foreground hover:bg-muted/30 select-none cursor-pointer"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center" side="top">
            <p className="text-[10px] text-muted-foreground mb-2 px-1">Pick your reaction</p>
            <div className="grid grid-cols-7 gap-0.5">
              {ALL_REACTIONS.map(({ emoji, label }) => {
                const hasReacted = reacted.has(emoji)
                return (
                  <button
                    key={emoji}
                    type="button"
                    title={label}
                    onClick={() => { handleToggle(emoji); setPickerOpen(false) }}
                    className={`
                      flex items-center justify-center rounded p-1.5 text-lg transition-all hover:bg-muted/60 cursor-pointer
                      ${hasReacted ? "bg-primary/10 ring-1 ring-primary/40" : ""}
                    `}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function ReactionButton({
  emoji, label, count, hasReacted, faded, onToggle,
}: {
  emoji: string; label: string; count: number; hasReacted: boolean; faded: boolean; onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      className={`
        inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm
        transition-all select-none cursor-pointer
        ${hasReacted
          ? "border-primary/50 bg-primary/10 text-primary"
          : faded
            ? "border-border/30 bg-transparent text-muted-foreground/40 hover:border-border/50 hover:text-muted-foreground hover:bg-muted/20"
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
}
