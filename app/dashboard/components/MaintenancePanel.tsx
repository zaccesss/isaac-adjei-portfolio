"use client"

// The public maintenance-mode toggle and message editor, moved out of Settings so it can live on
// the control page with the rest of the operational switches.

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function MaintenancePanel() {
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/maintenance")
      .then((r) => r.json())
      .then((d: { enabled?: boolean; message?: string }) => {
        setEnabled(Boolean(d.enabled))
        setMessage(typeof d.message === "string" ? d.message : "")
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  async function save(next: { enabled: boolean; message: string }) {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch("/api/dashboard/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
      if (!res.ok) throw new Error()
      setStatus({ text: next.enabled ? "Maintenance is ON - logged-out visitors see the maintenance page." : "Maintenance is OFF.", ok: true })
    } catch {
      setStatus({ text: "Could not save. Try again.", ok: false })
    } finally {
      setSaving(false)
    }
  }

  function toggle() {
    const next = !enabled
    setEnabled(next)
    void save({ enabled: next, message })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Public maintenance mode</p>
          <p className="text-xs text-muted-foreground">When on, logged-out visitors see a maintenance page. You always keep full access to the site and dashboard.</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={!loaded || saving}
          aria-label="Toggle maintenance mode"
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Custom message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Fixing something, back soon..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-3">
          <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => save({ enabled, message })}>Save message</Button>
          <a href={`/maintenance${message ? `?preview=${encodeURIComponent(message)}` : ""}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">Preview page</a>
        </div>
      </div>
      {status && <span className={`text-xs ${status.ok ? "text-green-600" : "text-destructive"}`}>{status.text}</span>}
    </div>
  )
}
