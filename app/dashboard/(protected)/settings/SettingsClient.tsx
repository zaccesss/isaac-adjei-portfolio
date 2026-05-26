"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { dashboardPage } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  KeyRound, Shield, Cpu, Clock, CheckCircle2, XCircle,
  RefreshCw, Lock, Sun, Moon, Palette, Mail
} from "lucide-react"
import { setConfig } from "@/app/dashboard/actions"

type ScraperStatus = {
  lastRun: string | null
  status: "success" | "failure" | "unknown"
  hasToken: boolean
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

export default function SettingsClient() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // PIN section state
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinMessage, setPinMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  // Scraper section state
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null)
  const [scraperLoading, setScraperLoading] = useState(false)
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [triggerMessage, setTriggerMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // Weekly digest section state
  const [digestLoading, setDigestLoading] = useState(false)
  const [digestMessage, setDigestMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // I fetch scraper status once on mount so the settings page shows live data
  useEffect(() => {
    async function loadStatus() {
      setScraperLoading(true)
      try {
        const res = await fetch("/api/dashboard/scraper-status")
        if (res.ok) {
          const data = await res.json() as ScraperStatus
          setScraperStatus(data)
        }
      } catch {
        // Silent fail - the section will just show no data
      } finally {
        setScraperLoading(false)
      }
    }
    void loadStatus()
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

  async function handleTriggerScraper() {
    setTriggerLoading(true)
    setTriggerMessage(null)
    try {
      const res = await fetch("/api/dashboard/trigger-scraper", { method: "POST" })
      // I read the body regardless of status so I can surface the specific
      // error message returned by the route rather than a generic fallback.
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

  return (
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

      {/* Security section */}
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

      {/* Job scraper section */}
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {scraperStatus.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : scraperStatus.status === "failure" ? (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm capitalize">{scraperStatus.status}</span>
              </div>
              {scraperStatus.lastRun && (
                <span className="text-xs text-muted-foreground">
                  Last run: {relativeTime(scraperStatus.lastRun)}
                </span>
              )}
              {!scraperStatus.lastRun && (
                <span className="text-xs text-muted-foreground">No runs recorded</span>
              )}
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

      {/* Session section */}
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
            <span className="font-medium">Course, Modules, Diary, Notes and Vault</span>
          </div>
        </div>
      </section>

      {/* Preferences section */}
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
          {/* I use the same icon transition pattern as ThemeToggle.tsx in the public site */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark"
              setTheme(next)
              // I also persist to Supabase so the preference is restored on other browsers and devices
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

      {/* Weekly digest section */}
      <section className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Weekly Digest</h2>
        </div>
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
    </motion.div>
  )
}
