"use client"

import { useEffect, useRef, useState } from "react"
import { SmilePlus } from "lucide-react"

type PresetType = "thumbsup" | "heart" | "fire" | "lightbulb" | "thinking" | "surprised"

const PRESETS: { type: PresetType; emoji: string; label: string }[] = [
  { type: "thumbsup",  emoji: "👍", label: "Good read"         },
  { type: "heart",     emoji: "❤️", label: "Love this"         },
  { type: "fire",      emoji: "🔥", label: "Insightful"        },
  { type: "lightbulb", emoji: "💡", label: "Learnt something"  },
  { type: "thinking",  emoji: "🤔", label: "Thought-provoking" },
  { type: "surprised", emoji: "😮", label: "Surprised me"      },
]

// Popular emojis shown in the picker grid (excludes presets)
const PICKER_EMOJIS = [
  "😂","😍","🤩","🎉","👏","💯","🙌","🥹","💪",
  "🙏","👀","🤣","😭","🤑","👎","💔","🫶","😤",
  "🙃","😎","🤓","😏","🥳","💀","🤮","✨","🚀",
  "🫡","😱","🤯","🤝","🫠","🥲",
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
  const [presets, setPresets] = useState<Counts>(
    Object.fromEntries(PRESETS.map((p) => [p.type, 0]))
  )
  const [custom, setCustom] = useState<Counts>({})
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setReacted(getReacted(slug)), 0)
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: { presets?: Counts; custom?: Counts }) => {
        if (data.presets) setPresets(data.presets)
        if (data.custom) setCustom(data.custom)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  // Close picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    if (pickerOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [pickerOpen])

  async function handleToggle(type: string) {
    const isPreset = PRESETS.some((p) => p.type === type)
    const already = reacted.has(type)
    const action = already ? "unreact" : "react"
    const delta = already ? -1 : 1

    // Optimistic update
    if (isPreset) {
      setPresets((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) + delta) }))
    } else {
      setCustom((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) + delta) }))
    }
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
      // Roll back
      if (isPreset) {
        setPresets((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) - delta) }))
      } else {
        setCustom((prev) => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) - delta) }))
      }
      setReacted((prev) => {
        const next = new Set(prev)
        already ? next.add(type) : next.delete(type)
        saveReacted(slug, next)
        return next
      })
    }

    setPickerOpen(false)
  }

  const customWithCount = Object.entries(custom).filter(([, c]) => c > 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
        React to this post
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* Preset reactions */}
        {PRESETS.map(({ type, emoji, label }) => {
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
                {presets[type] ?? 0}
              </span>
            </button>
          )
        })}

        {/* Custom emoji reactions (non-zero) */}
        {customWithCount.map(([emoji, count]) => {
          const hasReacted = reacted.has(emoji)
          return (
            <button
              key={emoji}
              onClick={() => handleToggle(emoji)}
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
              <span className="font-mono text-xs tabular-nums">{count}</span>
            </button>
          )
        })}

        {/* Emoji picker button */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            title="Add reaction"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
          >
            <SmilePlus className="h-4 w-4" />
          </button>

          {pickerOpen && (
            <div className="absolute bottom-full mb-2 left-0 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 w-52">
              <div className="grid grid-cols-6 gap-0.5">
                {PICKER_EMOJIS.map((emoji) => {
                  const alreadyReacted = reacted.has(emoji)
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleToggle(emoji)}
                      className={`text-xl p-1 rounded hover:bg-muted transition-colors leading-none
                        ${alreadyReacted ? "bg-primary/10 ring-1 ring-primary/30" : ""}
                      `}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
