"use client"

import { useState, useEffect, useRef } from "react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  KeyRound, Shield, Cpu, Clock, CheckCircle2, XCircle,
  RefreshCw, Lock, Sun, Moon, Palette, Mail, MessageSquare, FileText, Activity, Trash2, Plug, GraduationCap, Briefcase, Download
} from "lucide-react"
import { SiSpotify } from "react-icons/si"
import { setConfig, clearAllJobs, clearAllApplications, bulkSyncDeadlinesToLinear, bulkSyncApplicationsToLinear } from "@/app/dashboard/actions"

type ScraperStatus = {
  lastRun: string | null
  status: "success" | "failure" | "unknown"
  hasToken: boolean
}

type WorkflowStatus = {
  lastRun: string | null
  status: "success" | "failure" | "unknown"
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

function StatusBadge({ status, lastRun }: { status: "success" | "failure" | "unknown"; lastRun: string | null }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        {status === "success" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        ) : status === "failure" ? (
          <XCircle className="h-4 w-4 text-destructive shrink-0" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm capitalize">{status}</span>
      </div>
      {lastRun ? (
        <span className="text-xs text-muted-foreground">Last run: {relativeTime(lastRun)}</span>
      ) : (
        <span className="text-xs text-muted-foreground">No runs recorded</span>
      )}
    </div>
  )
}

function ExportImportPanel() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setMessage(null)
    try {
      const text = await file.text()
      const bundle = JSON.parse(text) as unknown
      const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bundle) })
      const result = await res.json() as { total?: number; error?: string }
      if (!res.ok || result.error) {
        setMessage({ text: result.error ?? "Import failed.", ok: false })
      } else {
        setMessage({ text: `Imported ${result.total ?? 0} records successfully.`, ok: true })
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
        <a href="/api/export" download className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-background hover:bg-muted transition-colors">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </a>
      </div>
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
      {message && <span className={`text-xs ${message.ok ? "text-green-600" : "text-destructive"}`}>{message.text}</span>}
    </div>
  )
}

export default function SettingsClient() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { confirm: showConfirm, dialog: confirmDialogNode } = useConfirmDialog()

  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinMessage, setPinMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null)
  const [scraperLoading, setScraperLoading] = useState(false)
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [triggerMessage, setTriggerMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [wakatimeStatus, setWakatimeStatus] = useState<WorkflowStatus | null>(null)
  const [wakatimeStatusLoading, setWakatimeStatusLoading] = useState(false)
  const [wakatimeLoading, setWakatimeLoading] = useState(false)
  const [wakatimeMessage, setWakatimeMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [cvStatus, setCvStatus] = useState<WorkflowStatus | null>(null)
  const [cvStatusLoading, setCvStatusLoading] = useState(false)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvMessage, setCvMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [weeklyDigestStatus, setWeeklyDigestStatus] = useState<{ sentAt: string | null; status: "success" | "failure" | "unknown" } | null>(null)
  const [discordDigestStatus, setDiscordDigestStatus] = useState<{ sentAt: string | null; status: "success" | "failure" | "unknown" } | null>(null)
  const [digestLoading, setDigestLoading] = useState(false)
  const [digestMessage, setDigestMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [discordDigestLoading, setDiscordDigestLoading] = useState(false)
  const [discordDigestMessage, setDiscordDigestMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [dataMessage, setDataMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  const [integrationStatus, setIntegrationStatus] = useState<{
    spotify: boolean; wakatime: boolean; linearCareers: boolean; linearUniversity: boolean
  } | null>(null)
  const [linearSyncLoading, setLinearSyncLoading] = useState(false)
  const [linearSyncMessage, setLinearSyncMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [linearAppSyncLoading, setLinearAppSyncLoading] = useState(false)
  const [linearAppSyncMessage, setLinearAppSyncMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // I use Promise.allSettled rather than Promise.all so a single failing status endpoint
  // does not prevent the others from rendering - each section degrades independently
  useEffect(() => {
    async function loadStatuses() {
      setScraperLoading(true)
      setWakatimeStatusLoading(true)
      setCvStatusLoading(true)

      const [scraperRes, wakatimeRes, cvRes, digestRes, integrationRes] = await Promise.allSettled([
        fetch("/api/dashboard/scraper-status"),
        fetch("/api/dashboard/workflow-status?workflow=wakatime-sync.yml"),
        fetch("/api/dashboard/workflow-status?workflow=cv-pdf.yml"),
        fetch("/api/dashboard/digest-status"),
        fetch("/api/dashboard/integration-status"),
      ])

      if (scraperRes.status === "fulfilled" && scraperRes.value.ok) {
        const data = await scraperRes.value.json() as ScraperStatus
        setScraperStatus(data)
      }
      if (wakatimeRes.status === "fulfilled" && wakatimeRes.value.ok) {
        const data = await wakatimeRes.value.json() as WorkflowStatus
        setWakatimeStatus(data)
      }
      if (cvRes.status === "fulfilled" && cvRes.value.ok) {
        const data = await cvRes.value.json() as WorkflowStatus
        setCvStatus(data)
      }
      if (digestRes.status === "fulfilled" && digestRes.value.ok) {
        const data = await digestRes.value.json() as {
          weekly: { sentAt: string | null; status: "success" | "failure" | "unknown" }
          discord: { sentAt: string | null; status: "success" | "failure" | "unknown" }
        }
        setWeeklyDigestStatus(data.weekly)
        setDiscordDigestStatus(data.discord)
      }
      if (integrationRes.status === "fulfilled" && integrationRes.value.ok) {
        const data = await integrationRes.value.json() as { spotify: boolean; wakatime: boolean; linearCareers: boolean; linearUniversity: boolean }
        setIntegrationStatus(data)
      }

      setScraperLoading(false)
      setWakatimeStatusLoading(false)
      setCvStatusLoading(false)
    }
    void loadStatuses()
  }, [])

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

  async function handleTriggerScraper() {
    setTriggerLoading(true)
    setTriggerMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-scraper", { method: "POST" })
      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string }
      if (res.ok) {
        setTriggerMessage({ text: "Scraper triggered successfully.", ok: true })
      } else {
        setTriggerMessage({ text: data.error ?? "Failed to trigger scraper.", ok: false })
      }
    } catch {
      setTriggerMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setTriggerLoading(false)
    }
  }

  async function handleTriggerWakatime() {
    setWakatimeLoading(true)
    setWakatimeMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-wakatime", { method: "POST" })
      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string }
      if (res.ok) {
        setWakatimeMessage({ text: "WakaTime sync triggered. Data will appear in the coding heatmap shortly.", ok: true })
      } else {
        setWakatimeMessage({ text: data.error ?? "Failed to trigger WakaTime sync.", ok: false })
      }
    } catch {
      setWakatimeMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setWakatimeLoading(false)
    }
  }

  async function handleTriggerDigest() {
    setDigestLoading(true)
    setDigestMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-digest", { method: "POST" })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (res.ok) {
        setDigestMessage({ text: "Digest sent to your email.", ok: true })
      } else {
        setDigestMessage({ text: data.error ?? "Failed to send digest.", ok: false })
      }
    } catch {
      setDigestMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setDigestLoading(false)
    }
  }

  async function handleTriggerCv() {
    setCvLoading(true)
    setCvMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-cv", { method: "POST" })
      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string }
      if (res.ok) {
        setCvMessage({ text: "CV regeneration triggered. Check GitHub Actions for progress.", ok: true })
      } else {
        setCvMessage({ text: data.error ?? "Failed to trigger CV generation.", ok: false })
      }
    } catch {
      setCvMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setCvLoading(false)
    }
  }

  async function handleTriggerDiscordDigest() {
    setDiscordDigestLoading(true)
    setDiscordDigestMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-discord-digest", { method: "POST" })
      const data = await res.json().catch(() => ({})) as { error?: string; skipped?: boolean }
      if (res.ok) {
        setDiscordDigestMessage({
          text: data.skipped ? "No Discord webhook configured." : "Digest sent to Discord.",
          ok: !data.skipped,
        })
      } else {
        setDiscordDigestMessage({ text: data.error ?? "Failed to send digest.", ok: false })
      }
    } catch {
      setDiscordDigestMessage({ text: "Something went wrong.", ok: false })
    } finally {
      setDiscordDigestLoading(false)
    }
  }

  async function handleLinearSync() {
    setLinearSyncLoading(true)
    setLinearSyncMessage(null)
    try {
      const result = await bulkSyncDeadlinesToLinear()
      setLinearSyncMessage({ text: `${result.synced} deadline${result.synced === 1 ? "" : "s"} synced to Linear. ${result.skipped > 0 ? `${result.skipped} skipped (already synced).` : ""}`, ok: true })
    } catch {
      setLinearSyncMessage({ text: "Sync failed. Check LINEAR_API_KEY and LINEAR_UNI_TEAM_ID in Vercel.", ok: false })
    } finally {
      setLinearSyncLoading(false)
    }
  }

  async function handleLinearAppSync() {
    setLinearAppSyncLoading(true)
    setLinearAppSyncMessage(null)
    try {
      const result = await bulkSyncApplicationsToLinear()
      setLinearAppSyncMessage({ text: `${result.synced} application${result.synced === 1 ? "" : "s"} synced to Linear. ${result.skipped > 0 ? `${result.skipped} skipped (already synced).` : ""}`, ok: true })
    } catch {
      setLinearAppSyncMessage({ text: "Sync failed. Check LINEAR_API_KEY and LINEAR_TEAM_ID in Vercel.", ok: false })
    } finally {
      setLinearAppSyncLoading(false)
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

      {/* Preferences */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Preferences</h2>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm font-medium">Appearance</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">Toggle between light and dark mode</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark"
              setTheme(next)
              void setConfig("theme_preference", next)
            }}
            className="flex items-center gap-2"
          >
            <div className="relative h-4 w-4 shrink-0">
              <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute inset-0" />
              <Moon className="h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute inset-0" />
            </div>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </section>

      {/* Job Scraper */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Job Scraper</h2>
        </div>

        {scraperLoading && (
          <p className="text-sm text-muted-foreground">Loading status...</p>
        )}

        {!scraperLoading && scraperStatus && (
          <div className="flex flex-col gap-3">
            <StatusBadge status={scraperStatus.status} lastRun={scraperStatus.lastRun} />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Run job scraper</span>
              <p className="text-xs text-muted-foreground">
                Triggers the job-scraper workflow: scrapes new listings and syncs them to the applications table
              </p>
            </div>
            {scraperStatus.hasToken ? (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleTriggerScraper()}
                  disabled={triggerLoading}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${triggerLoading ? "animate-spin" : ""}`} />
                  {triggerLoading ? "Triggering..." : "Run now"}
                </Button>
                {triggerMessage && (
                  <span className={`text-xs ${triggerMessage.ok ? "text-green-600" : "text-destructive"}`}>
                    {triggerMessage.text}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Set up GH_PAT in Vercel to enable manual triggers.
              </p>
            )}
          </div>
        )}
      </section>

      {/* WakaTime Sync */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">WakaTime Sync</h2>
        </div>

        {wakatimeStatusLoading && (
          <p className="text-sm text-muted-foreground">Loading status...</p>
        )}
        {!wakatimeStatusLoading && wakatimeStatus && (
          <StatusBadge status={wakatimeStatus.status} lastRun={wakatimeStatus.lastRun} />
        )}

        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Sync coding activity</span>
          <p className="text-xs text-muted-foreground">
            Triggers the wakatime-sync.yml workflow: pulls the last 7 days of coding data into the heatmap
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleTriggerWakatime()}
            disabled={wakatimeLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${wakatimeLoading ? "animate-spin" : ""}`} />
            {wakatimeLoading ? "Triggering..." : "Sync now"}
          </Button>
          {wakatimeMessage && (
            <span className={`text-xs ${wakatimeMessage.ok ? "text-green-600" : "text-destructive"}`}>
              {wakatimeMessage.text}
            </span>
          )}
        </div>
      </section>

      {/* CV Generation */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">CV Generation</h2>
        </div>

        {cvStatusLoading && (
          <p className="text-sm text-muted-foreground">Loading status...</p>
        )}
        {!cvStatusLoading && cvStatus && (
          <StatusBadge status={cvStatus.status} lastRun={cvStatus.lastRun} />
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Regenerate all CVs</span>
            <p className="text-xs text-muted-foreground">
              Triggers the cv-pdf.yml workflow: rebuilds all 7 role PDFs and DOCX files from the HTML source
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleTriggerCv()}
              disabled={cvLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${cvLoading ? "animate-spin" : ""}`} />
              {cvLoading ? "Triggering..." : "Regenerate"}
            </Button>
            {cvMessage && (
              <span className={`text-xs ${cvMessage.ok ? "text-green-600" : "text-destructive"}`}>
                {cvMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Weekly Digest */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Weekly Digest</h2>
        </div>
        {weeklyDigestStatus && weeklyDigestStatus.sentAt && (
          <StatusBadge status={weeklyDigestStatus.status} lastRun={weeklyDigestStatus.sentAt} />
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Send test now</span>
            <p className="text-xs text-muted-foreground">Trigger the weekly digest email immediately</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleTriggerDigest()}
              disabled={digestLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${digestLoading ? "animate-spin" : ""}`} />
              {digestLoading ? "Sending..." : "Send test"}
            </Button>
            {digestMessage && (
              <span className={`text-xs ${digestMessage.ok ? "text-green-600" : "text-destructive"}`}>
                {digestMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Discord Digest */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Discord Digest</h2>
        </div>
        {discordDigestStatus && discordDigestStatus.sentAt && (
          <StatusBadge status={discordDigestStatus.status} lastRun={discordDigestStatus.sentAt} />
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Send now</span>
            <p className="text-xs text-muted-foreground">Send today&apos;s dashboard summary to Discord immediately</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleTriggerDiscordDigest()}
              disabled={discordDigestLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${discordDigestLoading ? "animate-spin" : ""}`} />
              {discordDigestLoading ? "Sending..." : "Send now"}
            </Button>
            {discordDigestMessage && (
              <span className={`text-xs ${discordDigestMessage.ok ? "text-green-600" : "text-destructive"}`}>
                {discordDigestMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>
      {/* Integrations */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Integrations</h2>
        </div>

        {integrationStatus && (
          <div className="flex flex-col gap-2">
            {[
              { label: "Spotify", connected: integrationStatus.spotify, icon: <SiSpotify className="h-3.5 w-3.5 shrink-0" /> },
              { label: "WakaTime", connected: integrationStatus.wakatime, icon: <Activity className="h-3.5 w-3.5 shrink-0" /> },
              { label: "Linear (Careers)", connected: integrationStatus.linearCareers, icon: <Plug className="h-3.5 w-3.5 shrink-0" /> },
              { label: "Linear (University)", connected: integrationStatus.linearUniversity, icon: <GraduationCap className="h-3.5 w-3.5 shrink-0" /> },
            ].map(({ label, connected, icon }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{icon}</span>
                  <span>{label}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-green-600" : "text-muted-foreground"}`}>
                  <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                  {connected ? "Connected" : "Not configured"}
                </div>
              </div>
            ))}
          </div>
        )}

        {!integrationStatus && <p className="text-sm text-muted-foreground">Loading...</p>}

        <hr className="border-border" />

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Sync applications to Linear (Careers)</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Creates a Linear issue for each application not yet synced. Requires <code className="font-mono">LINEAR_TEAM_ID</code> in Vercel.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLinearAppSync()}
              disabled={linearAppSyncLoading || !integrationStatus?.linearCareers}
              className="flex items-center gap-1.5"
              title={!integrationStatus?.linearCareers ? "Set LINEAR_TEAM_ID in Vercel to enable" : undefined}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${linearAppSyncLoading ? "animate-spin" : ""}`} />
              {linearAppSyncLoading ? "Syncing..." : "Sync applications"}
            </Button>
            {linearAppSyncMessage && (
              <span className={`text-xs ${linearAppSyncMessage.ok ? "text-green-600" : "text-destructive"}`}>
                {linearAppSyncMessage.text}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Sync university deadlines to Linear</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Creates a Linear issue for each deadline not yet synced. Requires <code className="font-mono">LINEAR_UNI_TEAM_ID</code> in Vercel.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLinearSync()}
              disabled={linearSyncLoading || !integrationStatus?.linearUniversity}
              className="flex items-center gap-1.5"
              title={!integrationStatus?.linearUniversity ? "Set LINEAR_UNI_TEAM_ID in Vercel to enable" : undefined}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${linearSyncLoading ? "animate-spin" : ""}`} />
              {linearSyncLoading ? "Syncing..." : "Sync deadlines"}
            </Button>
            {linearSyncMessage && (
              <span className={`text-xs ${linearSyncMessage.ok ? "text-green-600" : "text-destructive"}`}>
                {linearSyncMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>

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
