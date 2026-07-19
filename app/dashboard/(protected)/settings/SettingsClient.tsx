"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  KeyRound, Shield, Clock, Lock, Trash2, Download, SlidersHorizontal,
} from "lucide-react"
import { clearAllJobs, clearAllApplications } from "@/app/dashboard/actions"

// Friendly sections mapped to the real table names, so I can export just one part (e.g. Applications)
// instead of the whole database. Table names must match the export route's EXPORT_TABLES.
const EXPORT_SECTIONS: { label: string; tables: string[] }[] = [
  { label: "Applications", tables: ["applications"] },
  { label: "Goals", tables: ["goals"] },
  { label: "Streaks", tables: ["streaks", "streak_logs"] },
  { label: "Habits", tables: ["habits", "habit_logs"] },
  { label: "Health", tables: ["health_sections", "health_workouts", "health_nutrition", "body_metrics"] },
  { label: "Faith", tables: ["faith_entries"] },
  { label: "Study", tables: ["study_sessions"] },
  { label: "University", tables: ["uni_modules", "uni_deadlines", "uni_submissions", "uni_notes", "uni_resources", "uni_library_books", "modules", "assessments"] },
  { label: "Calendar", tables: ["calendar_events"] },
  { label: "Notes", tables: ["notes"] },
  { label: "Diary", tables: ["diary"] },
  { label: "Vault", tables: ["vault"] },
  { label: "Contacts", tables: ["contacts"] },
  { label: "Wishlist", tables: ["wishlist"] },
  { label: "Inventory", tables: ["inventory_items"] },
  { label: "Open Source", tables: ["opensource_contributions"] },
  { label: "Files", tables: ["user_files"] },
  { label: "Coding", tables: ["wakatime_daily"] },
  { label: "Activity log", tables: ["activity_log"] },
]

function ExportImportPanel() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(EXPORT_SECTIONS.map((s) => s.label)))
  const { confirm, dialog } = useConfirmDialog()

  function toggleSection(label: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // The export is fetched rather than a plain anchor download so a PIN or auth rejection shows a
  // message instead of silently saving the error JSON as if it were the backup.
  async function downloadExport(url: string, filename?: string) {
    setMessage(null)
    try {
      const res = await fetch(url)
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; tables?: Record<string, string> }
        // Name the failing tables so a broken export is diagnosable from the message alone.
        const failed = Object.keys(body.tables ?? {})
        const text =
          res.status === 403
            ? "Unlock the PIN first, then export."
            : failed.length > 0
            ? `Export failed for: ${failed.join(", ")}.`
            : body.error ?? "Export failed."
        setMessage({ text, ok: false })
        return
      }
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = href
      a.download = filename ?? `dashboard-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
    } catch {
      setMessage({ text: "Export failed.", ok: false })
    }
  }

  function exportSelected() {
    const tables = EXPORT_SECTIONS.filter((s) => selected.has(s.label)).flatMap((s) => s.tables)
    if (tables.length === 0) return
    void downloadExport(`/api/export?tables=${encodeURIComponent(tables.join(","))}`)
  }

  // Deliberately separate from the normal backup: this downloads the vault in the clear for moving
  // into a password manager, so it demands a typed confirmation on top of the PIN the route enforces.
  async function exportVaultDecrypted() {
    const ok = await confirm({
      title: "Export the vault decrypted?",
      description: "This downloads every vault secret in the clear as a JSON file, only for importing into a password manager. Anyone who opens the file can read my passwords. Keep it offline then delete it once imported.",
      confirmLabel: "Export decrypted",
      destructive: true,
      typedConfirmation: "export decrypted",
    })
    if (!ok) return
    void downloadExport("/api/export?vault=decrypt", `vault-decrypted-${new Date().toISOString().slice(0, 10)}.json`)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setMessage(null)
    try {
      const text = await file.text()
      const bundle = JSON.parse(text) as unknown
      const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bundle) })
      const result = await res.json() as { total?: number; error?: string; tables?: Record<string, { imported: number; error?: string }> }
      if (res.status === 403) {
        setMessage({ text: "Unlock the PIN first, then import.", ok: false })
      } else if (!res.ok && res.status !== 207) {
        setMessage({ text: result.error ?? "Import failed.", ok: false })
      } else {
        // A 207 means some tables imported and others failed - name them rather than claiming success.
        const failed = Object.entries(result.tables ?? {}).filter(([, r]) => r.error).map(([t]) => t)
        if (failed.length > 0) {
          setMessage({ text: `Imported ${result.total ?? 0} records; these tables failed: ${failed.join(", ")}.`, ok: false })
        } else {
          setMessage({ text: `Imported ${result.total ?? 0} records successfully.`, ok: true })
        }
      }
    } catch {
      setMessage({ text: "Failed to parse file. Make sure it is a valid dashboard export.", ok: false })
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Export all data</p>
          <p className="text-xs text-muted-foreground">Downloads every table as a single JSON file.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void downloadExport("/api/export")} className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </Button>
      </div>

      <details className="rounded-md border border-border/60 bg-background/40">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium select-none">Export specific sections</summary>
        <div className="px-3 pb-3 flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {EXPORT_SECTIONS.map((s) => (
              <label key={s.label} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={selected.has(s.label)} onChange={() => toggleSection(s.label)} className="rounded" />
                {s.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setSelected(new Set(EXPORT_SECTIONS.map((x) => x.label)))}>All</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setSelected(new Set())}>None</Button>
            <Button type="button" size="sm" onClick={exportSelected} disabled={selected.size === 0} className="ml-auto gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export selected
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Importing a partial file only restores the sections it contains, so this doubles as selective import.</p>
        </div>
      </details>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Import from backup</p>
          <p className="text-xs text-muted-foreground">Restores from a previously exported JSON file. Existing records with matching IDs are overwritten.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".json,application/json" aria-label="Import JSON backup" className="hidden" onChange={handleImport} />
          <Button size="sm" variant="outline" disabled={importing} onClick={() => fileRef.current?.click()}>
            {importing ? "Importing..." : "Import JSON"}
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-destructive" /> Export vault for a password manager</p>
          <p className="text-xs text-muted-foreground mt-0.5">Downloads only the vault, decrypted, as a separate file so I can move my secrets into a password manager. The normal backup above keeps the vault encrypted. Behind the PIN plus a typed confirmation.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void exportVaultDecrypted()} className="gap-1.5 shrink-0 border-destructive/50 text-destructive hover:text-destructive">
          <Download className="h-3.5 w-3.5" /> Export decrypted
        </Button>
      </div>

      {message && <span className={`text-xs ${message.ok ? "text-green-600" : "text-destructive"}`}>{message.text}</span>}
      {dialog}
    </div>
  )
}

export default function SettingsClient() {
  const router = useRouter()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinMessage, setPinMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  const [dataMessage, setDataMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  async function handleChangePin() {
    if (!currentPin || !newPin || !confirmPin) return
    if (newPin !== confirmPin) {
      setPinMessage({ text: "New PIN and confirmation do not match.", ok: false })
      return
    }
    if (newPin.length < 4) {
      setPinMessage({ text: "New PIN must be at least 4 characters.", ok: false })
      return
    }
    setPinLoading(true)
    setPinMessage(null)
    try {
      const res = await fetch("/api/dashboard/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (res.ok) {
        setPinMessage({ text: "PIN changed successfully.", ok: true })
        setCurrentPin("")
        setNewPin("")
        setConfirmPin("")
      } else {
        setPinMessage({ text: data.error ?? "Failed to change PIN.", ok: false })
      }
    } catch {
      setPinMessage({ text: "Something went wrong. Try again.", ok: false })
    } finally {
      setPinLoading(false)
    }
  }

  async function handleLockAll() {
    await fetch("/api/dashboard/verify-pin", { method: "DELETE" })
    router.push("/dashboard")
  }

  async function handleClearJobs() {
    const confirmed = await showConfirm({
      title: "Clear all scraped jobs?",
      description: "This permanently deletes every listing the scraper added. Anything you've applied to, interviewed for, been offered, rejected from or saved is kept - your real applications and analytics are never touched. The scraper refills current openings on its next run.",
      confirmLabel: "Clear jobs",
      destructive: true,
    })
    if (!confirmed) return
    setDataLoading(true)
    setDataMessage(null)
    try {
      await clearAllJobs()
      setDataMessage({ text: "All scraped jobs cleared.", ok: true })
    } catch {
      setDataMessage({ text: "Failed to clear jobs.", ok: false })
    } finally {
      setDataLoading(false)
    }
  }

  async function handleClearApplications() {
    const confirmed = await showConfirm({
      title: "Clear all applications?",
      description: "Every tracked application will be moved to Trash (recoverable). This cannot be undone from this screen.",
      typedConfirmation: "clear applications",
      destructive: true,
    })
    if (!confirmed) return
    setDataLoading(true)
    setDataMessage(null)
    try {
      await clearAllApplications()
      setDataMessage({ text: "All tracked applications moved to trash.", ok: true })
    } catch {
      setDataMessage({ text: "Failed to clear applications.", ok: false })
    } finally {
      setDataLoading(false)
    }
  }

  return (
    <>
    <motion.div
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 max-w-2xl"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage security and dashboard preferences.</p>
      </div>

      {/* Security */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Security</h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Change PIN</span>
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder="Current PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              type="password"
              placeholder="New PIN (min 4 characters)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              minLength={4}
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Confirm new PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              autoComplete="new-password"
              onKeyDown={(e) => { if (e.key === "Enter") void handleChangePin() }}
            />
          </div>
          {pinMessage && (
            <p className={`text-sm ${pinMessage.ok ? "text-green-600" : "text-destructive"}`}>
              {pinMessage.text}
            </p>
          )}
          <Button
            onClick={() => void handleChangePin()}
            disabled={pinLoading || !currentPin || !newPin || !confirmPin}
            size="sm"
            className="self-start"
          >
            {pinLoading ? "Saving..." : "Change PIN"}
          </Button>
        </div>

        <hr className="border-border" />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Lock all protected pages</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Clears your PIN session cookie immediately.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void handleLockAll()}>
            Lock now
          </Button>
        </div>
      </section>

      {/* Session */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Session</h2>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">Inactivity timeout</span>
            <span className="font-medium">1 hour</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">PIN-protected pages</span>
            <span className="font-medium">Modules, Diary and Vault</span>
          </div>
        </div>
      </section>

      {/* Everything operational moved to the control page */}
      <Link
        href="/dashboard/control"
        className="flex items-center gap-3 border border-border rounded-xl p-5 bg-card hover:bg-muted/30 transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Automation controls have moved</span>
          <p className="text-xs text-muted-foreground">
            Job triggers, Linear and Strava syncs, integrations and maintenance mode now live on the Control page.
          </p>
        </div>
      </Link>

      {/* Data Export / Import */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Data Export & Import</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Export all your data as a single JSON file. Import restores from a previously exported file - existing records with matching IDs are overwritten.
        </p>
        <ExportImportPanel />
      </section>

      {/* Data Management */}
      <section className="flex flex-col gap-4 border border-destructive/30 rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-destructive">Data Management</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          These actions are irreversible. Items moved to trash can be recovered for 7 days.
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear scraped jobs</p>
              <p className="text-xs text-muted-foreground">Permanently remove every listing the scraper added. Applications you&apos;ve applied to, saved or changed the status of are kept.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearJobs}
              disabled={dataLoading}
            >
              Clear all jobs
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear tracked applications</p>
              <p className="text-xs text-muted-foreground">Delete all manually tracked job applications.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearApplications}
              disabled={dataLoading}
            >
              Clear all
            </Button>
          </div>
        </div>
        {dataMessage && (
          <span className={`text-xs ${dataMessage.ok ? "text-green-600" : "text-destructive"}`}>
            {dataMessage.text}
          </span>
        )}
      </section>
    </motion.div>
    {confirmDialogNode}
    </>
  )
}
