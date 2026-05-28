"use client"

import { useState, useRef } from "react"
import { updateNowStatus } from "../../actions"

type NowStatus = {
  building?: string
  studying?: string
  focused_on?: string
  listening_to?: string
}

const FIELDS: { key: keyof NowStatus; label: string; placeholder: string }[] = [
  { key: "building",     label: "Building",     placeholder: "What are you building?" },
  { key: "studying",     label: "Studying",     placeholder: "What are you studying?" },
  { key: "focused_on",   label: "Focused on",   placeholder: "What's the priority right now?" },
  { key: "listening_to", label: "Listening to", placeholder: "What's on?" },
]

export default function NotesNowCard({ initial }: { initial: NowStatus }) {
  const [status, setStatus] = useState<NowStatus>(initial)
  const [saving, setSaving] = useState<keyof NowStatus | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  function handleChange(key: keyof NowStatus, value: string) {
    const next = { ...status, [key]: value }
    setStatus(next)

    // I debounce saves so each keystroke does not fire a server action
    if (timerRef.current) clearTimeout(timerRef.current)
    setSaving(key)
    timerRef.current = setTimeout(async () => {
      await updateNowStatus(next)
      setSaving(null)
    }, 800)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Now</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-0.5">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
              type="text"
              value={status[key] ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 border-b border-border/50 focus:border-foreground/40 outline-none py-0.5 transition-colors"
            />
            {saving === key && (
              <span className="text-xs text-muted-foreground/50">saving...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
