"use client"

import { useState, useTransition } from "react"
import { updateApplication } from "../../actions"
import { ExternalLink } from "lucide-react"
import { normaliseStatus, isTrackedApplication, KANBAN_COLUMNS as COLUMNS } from "@/lib/application-status"

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  url: string | null
  location: string | null
  starred: boolean
}

const COLUMN_COLOURS: Record<string, string> = {
  wishlist:    "border-t-yellow-400",   // Interested = yellow
  applied:     "border-t-blue-400",     // Application Submitted = blue
  assessment:  "border-t-violet-400",   // Online Assessment = violet
  interview:   "border-t-amber-400",    // Telephone Interview = amber
  final_round: "border-t-rose-400",     // Final Round = rose
  offer:       "border-t-green-400",    // Offer Received = green
  negotiating: "border-t-teal-400",     // Negotiating = teal
  accepted:    "border-t-emerald-500",  // Accepted = emerald
  closed:      "border-t-slate-400",    // Rejected/Ghosted/Withdrawn = slate
}

export default function ApplicationsKanban({ applications: initial }: { applications: Application[] }) {
  // Filter on the raw (pre-normalised) status first, so the auto-scraped Jobs tab and untouched
  // scraped rows never reach the board - matching pre-normalised data is the actual fix here.
  const [apps, setApps] = useState<Application[]>(
    initial.filter(isTrackedApplication).map((a) => ({ ...a, status: normaliseStatus(a.status) }))
  )
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragging(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }

  function handleDrop(e: React.DragEvent, columnId: string) {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    const col = COLUMNS.find((c) => c.id === columnId)
    if (!col || !id) return
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: col.targetStatus } : a))
    startTransition(() => void updateApplication(id, { status: col.targetStatus }))
    setDragging(null)
    setOver(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const cards = apps.filter((a) => (col.statuses as string[]).includes(a.status))
        const isOver = over === col.id
        return (
          <div
            key={col.id}
            className={`flex flex-col gap-2 w-52 shrink-0 rounded-xl border-t-2 border border-border bg-muted/20 p-3 transition-colors ${COLUMN_COLOURS[col.id]} ${isOver ? "bg-muted/50" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(col.id) }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{col.label}</p>
              <span className="text-xs text-muted-foreground/60 tabular-nums">{cards.length}</span>
            </div>

            {cards.map((app) => (
              <div
                key={app.id}
                draggable
                onDragStart={(e) => handleDragStart(e, app.id)}
                onDragEnd={() => { setDragging(null); setOver(null) }}
                className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-opacity hover:shadow-sm ${dragging === app.id ? "opacity-40" : ""}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-medium text-xs leading-snug line-clamp-2">{app.company}</p>
                  {app.url && (
                    <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label="Open posting" onClick={(e) => e.stopPropagation()} className="text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 mt-0.5">
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{app.role}</p>
                {app.location && (
                  <p className="text-xs text-muted-foreground/50 mt-1 truncate">{app.location}</p>
                )}
              </div>
            ))}

            {cards.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/30 text-center py-4">Drop here</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
