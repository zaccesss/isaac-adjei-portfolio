"use client"

// My Strava training analytics. Everything renders from rows already synced into strava_activities, so
// the page is instant and offline-safe; "Sync" pulls fresh activities on demand and "Disconnect" forgets
// my tokens. The period selector drives the stat cards and charts; the heatmap is always a fixed 52-week
// view (GitHub-contributions style) because a year-at-a-glance is the point of it.

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Activity, RefreshCw, Plug, Unplug, Timer, Mountain, Route, CalendarDays, Gauge, Trophy, TrendingUp, Clock } from "lucide-react"
import {
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  filterByPeriod,
  periodStartDate,
  type AnalyticsPeriod,
  StatCard,
  ProgressBar,
  BarChart,
  LineChart,
  PieChart,
  CalendarHeatmap,
  useEChartsColours,
  Bubble,
  BoxPlot,
} from "@/components/analytics"
import type { StravaActivity } from "@/lib/strava"

// ─── Formatting helpers ─────────────────────────────────────────────────────

const km = (m: number | null) => (m ?? 0) / 1000
const fmtKm = (m: number) => `${(m / 1000).toFixed(m / 1000 >= 100 ? 0 : 1)} km`
function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function fmtPace(distanceM: number | null, movingS: number | null): string {
  if (!distanceM || !movingS || distanceM < 100) return "-"
  return fmtPaceSec(movingS / (distanceM / 1000))
}
function fmtPaceSec(secPerKm: number): string {
  if (!secPerKm) return "-"
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, "0")} /km`
}
const dayISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const distanceGranularity = (period: AnalyticsPeriod): "day" | "week" | "month" =>
  period === "90d" ? "week" : period === "1y" || period === "all" ? "month" : "day"

// Distance bucketed at a granularity that suits the selected period, so the bar chart always follows the
// period selector and stays readable: by day for short ranges, by week for 90 days, by month for a year+.
function bucketDistance(acts: StravaActivity[], period: AnalyticsPeriod): { name: string; distance: number }[] {
  const gran = distanceGranularity(period)
  const totals = new Map<string, number>()
  const labels = new Map<string, string>()
  for (const a of acts) {
    if (!a.start_date) continue
    const d = new Date(a.start_date)
    let key: string
    let label: string
    if (gran === "day") {
      key = a.start_date.slice(0, 10)
      label = `${d.getDate()}/${d.getMonth() + 1}`
    } else if (gran === "week") {
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      key = dayISO(monday)
      label = `${monday.getDate()}/${monday.getMonth() + 1}`
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      label = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    }
    totals.set(key, (totals.get(key) ?? 0) + km(a.distance_m))
    labels.set(key, label)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ name: labels.get(k) as string, distance: Math.round(v * 10) / 10 }))
}

// ─── 52-week training heatmap ───────────────────────────────────────────────

function Heatmap({ activities, now }: { activities: StravaActivity[]; now: number }) {
  const byDay = new Map<string, number>()
  for (const a of activities) {
    if (!a.start_date) continue
    const key = a.start_date.slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + km(a.distance_m))
  }

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - 52 * 7)

  const data = [...byDay.entries()].map(([date, value]) => ({ date, value: Math.round(value * 10) / 10 }))

  const colours = useEChartsColours()

  return (
    <CalendarHeatmap
      data={data}
      range={[dayISO(start), dayISO(today)]}
      valueLabel="km"
      valueFormatter={(v) => v.toFixed(1)}
      colourScale={[colours.border, "#fed7aa", "#fdba74", "#fb923c", "#FC4C02"]}
    />
  )
}

// ─── Connect / sync controls ────────────────────────────────────────────────

function Controls({ connected }: { connected: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState<"sync" | "disconnect" | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function sync() {
    setBusy("sync")
    setMsg(null)
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" })
      const data = (await res.json().catch(() => ({}))) as { synced?: number; error?: string }
      setMsg(res.ok ? `Synced ${data.synced ?? 0} activities.` : data.error === "strava_unreachable" ? "Could not reach Strava, try again." : "Sync failed.")
      if (res.ok) router.refresh()
    } finally {
      setBusy(null)
    }
  }

  async function disconnect() {
    setBusy("disconnect")
    setMsg(null)
    try {
      await fetch("/api/strava/sync", { method: "DELETE" })
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      {connected ? (
        <>
          <button
            type="button"
            onClick={sync}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy === "sync" ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            type="button"
            onClick={disconnect}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-50"
          >
            <Unplug className="h-3.5 w-3.5" />
            Disconnect
          </button>
        </>
      ) : (
        <a
          href="/api/strava/auth"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FC4C02] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e34402] transition-colors"
        >
          <Plug className="h-3.5 w-3.5" />
          Connect Strava
        </a>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StravaAnalyticsClient({ activities, connected }: { activities: StravaActivity[]; connected: boolean }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="1y">
      <Suspense fallback={null}>
        <Inner activities={activities} connected={connected} />
      </Suspense>
    </AnalyticsPeriodProvider>
  )
}

function Inner({ activities, connected }: { activities: StravaActivity[]; connected: boolean }) {
  const { period } = useAnalyticsPeriod()
  const params = useSearchParams()
  const justConnected = params.get("strava") === "connected"
  // Capture "now" once so the date maths below stay pure and stable across re-renders.
  const [now] = useState(() => Date.now())

  const filtered = filterByPeriod(activities, period, (a) => a.start_date)

  // Current-period totals
  const totalDistance = filtered.reduce((s, a) => s + (a.distance_m ?? 0), 0)
  const totalMoving = filtered.reduce((s, a) => s + (a.moving_time_s ?? 0), 0)
  const totalElevation = filtered.reduce((s, a) => s + (a.total_elevation_gain_m ?? 0), 0)

  // Previous equal-length period, for trend deltas
  const start = periodStartDate(period)
  let prevDistance = 0
  let prevCount = 0
  if (start) {
    const span = now - start.getTime()
    const prevStart = new Date(start.getTime() - span).toISOString()
    const prevEnd = start.toISOString()
    for (const a of activities) {
      if (a.start_date && a.start_date >= prevStart && a.start_date < prevEnd) {
        prevDistance += a.distance_m ?? 0
        prevCount += 1
      }
    }
  }
  const pct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null)
  const distTrend = pct(totalDistance, prevDistance)
  const countTrend = pct(filtered.length, prevCount)

  // Distance over the selected period, bucketed by day/week/month so the bars follow the selector.
  const distanceBuckets = bucketDistance(filtered, period)

  // Heart-rate trend (activities with HR, oldest to newest, within period)
  const hrSeries = [...filtered]
    .filter((a) => a.average_heartrate && a.start_date)
    .reverse()
    .map((a) => ({ name: (a.start_date ?? "").slice(5, 10), hr: Math.round(a.average_heartrate as number) }))

  // Sport split (by activity count) + distance share for the progress bars
  const sportCount = new Map<string, number>()
  const sportDistance = new Map<string, number>()
  for (const a of filtered) {
    const sport = a.sport_type ?? "Other"
    sportCount.set(sport, (sportCount.get(sport) ?? 0) + 1)
    sportDistance.set(sport, (sportDistance.get(sport) ?? 0) + km(a.distance_m))
  }
  const sportPie = [...sportCount.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  const sportBars = [...sportDistance.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  const maxSportDist = Math.max(1, ...sportBars.map((s) => s.value))

  // Personal bests within the selected period
  const longestRun = filtered.reduce((m, a) => Math.max(m, a.distance_m ?? 0), 0)
  const longestTime = filtered.reduce((m, a) => Math.max(m, a.moving_time_s ?? 0), 0)
  const mostElevation = filtered.reduce((m, a) => Math.max(m, a.total_elevation_gain_m ?? 0), 0)
  const paces = filtered
    .filter((a) => (a.distance_m ?? 0) >= 1000 && (a.moving_time_s ?? 0) > 0)
    .map((a) => (a.moving_time_s as number) / ((a.distance_m as number) / 1000))
  const fastestPace = paces.length ? Math.min(...paces) : 0
  const dayKm = new Map<string, number>()
  for (const a of filtered) {
    if (!a.start_date) continue
    const d = a.start_date.slice(0, 10)
    dayKm.set(d, (dayKm.get(d) ?? 0) + km(a.distance_m))
  }
  const biggestDay = Math.max(0, ...dayKm.values())

  // Training by day of week (distance, Mon..Sun)
  const dow = [0, 0, 0, 0, 0, 0, 0]
  for (const a of filtered) {
    if (!a.start_date) continue
    dow[(new Date(a.start_date).getDay() + 6) % 7] += km(a.distance_m)
  }
  const dowBars = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name, i) => ({ name, distance: Math.round(dow[i] * 10) / 10 }))

  // Pace trend (runs only, oldest to newest) - seconds per km
  const paceSeries = [...filtered]
    .filter((a) => (a.sport_type ?? "").toLowerCase().includes("run") && (a.distance_m ?? 0) >= 1000 && (a.moving_time_s ?? 0) > 0)
    .reverse()
    .map((a) => ({ name: (a.start_date ?? "").slice(5, 10), pace: Math.round((a.moving_time_s as number) / ((a.distance_m as number) / 1000)) }))

  // Bubble: distance vs pace for runs, sized by duration - every run already carries all three
  // fields, so this reads real training-load shape without collecting anything new.
  const paceBubbles = filtered
    .filter((a) => (a.sport_type ?? "").toLowerCase().includes("run") && (a.distance_m ?? 0) >= 1000 && (a.moving_time_s ?? 0) > 0)
    .map((a) => ({
      distanceKm: Math.round(km(a.distance_m) * 10) / 10,
      pace: Math.round((a.moving_time_s as number) / (km(a.distance_m))),
      durationMin: Math.round((a.moving_time_s as number) / 60),
    }))

  // Pace by month - box plot of the same runs, grouped into calendar months so a longer period
  // (6mo/1y) reads as a real distribution trend rather than one noisy per-run line.
  const paceByMonthMap = new Map<string, number[]>()
  for (const a of filtered) {
    if (!(a.sport_type ?? "").toLowerCase().includes("run")) continue
    if ((a.distance_m ?? 0) < 1000 || (a.moving_time_s ?? 0) <= 0) continue
    const d = new Date(a.start_date ?? "")
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.toLocaleString("en-GB", { month: "short" })} '${String(d.getFullYear()).slice(2)}`
    const pace = (a.moving_time_s as number) / km(a.distance_m)
    paceByMonthMap.set(key, [...(paceByMonthMap.get(key) ?? []), pace])
  }
  const paceByMonth = [...paceByMonthMap.entries()].map(([name, values]) => ({ name, values }))

  // Cumulative distance - running total across the period's buckets (built functionally so it stays pure).
  const cumulativeDistance = distanceBuckets.reduce<{ name: string; total: number }[]>((acc, b) => {
    const total = (acc.length > 0 ? acc[acc.length - 1].total : 0) + b.distance
    return [...acc, { name: b.name, total: Math.round(total * 10) / 10 }]
  }, [])

  // Time of day - activities grouped by part of day.
  const tod = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
  for (const a of filtered) {
    if (!a.start_date) continue
    const h = new Date(a.start_date).getHours()
    if (h >= 5 && h < 12) tod.Morning++
    else if (h >= 12 && h < 17) tod.Afternoon++
    else if (h >= 17 && h < 21) tod.Evening++
    else tod.Night++
  }
  const timeOfDay = [
    { name: "Morning", count: tod.Morning },
    { name: "Afternoon", count: tod.Afternoon },
    { name: "Evening", count: tod.Evening },
    { name: "Night", count: tod.Night },
  ]

  // Recent activities follow the selector; capped so a long history can never lag the page.
  const recent = filtered.slice(0, 50)

  // ── Not connected: hero ──
  if (!connected && activities.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl">
        <Header connected={connected} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Activity className="h-8 w-8 text-[#FC4C02]" />
          <div>
            <p className="font-semibold">Connect Strava to see your training analytics</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              I pull your runs and rides into a private heatmap, distance, pace and heart-rate trends. Nothing is shared publicly.
            </p>
          </div>
          <a
            href="/api/strava/auth"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FC4C02] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e34402] transition-colors"
          >
            <Plug className="h-4 w-4" />
            Connect Strava
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <Header connected={connected} />

      {justConnected && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-400">
          Strava connected and your activities are synced.
        </div>
      )}

      {connected && activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Connected, but nothing synced yet. Press <span className="font-medium text-foreground">Sync</span> to pull your activities.
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Activities" value={filtered.length} trend={countTrend !== null ? { delta: countTrend } : undefined} />
            <StatCard label="Distance" value={fmtKm(totalDistance)} trend={distTrend !== null ? { delta: distTrend } : undefined} sparkline={distanceBuckets.map((b) => b.distance)} />
            <StatCard label="Moving time" value={fmtDuration(totalMoving)} />
            <StatCard label="Elevation" value={`${Math.round(totalElevation).toLocaleString()} m`} />
          </div>

          {/* Personal bests */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal bests in this period</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label="Longest" value={longestRun ? fmtKm(longestRun) : "-"} />
              <StatCard label="Fastest pace" value={fmtPaceSec(fastestPace)} />
              <StatCard label="Longest time" value={longestTime ? fmtDuration(longestTime) : "-"} />
              <StatCard label="Most climb" value={`${Math.round(mostElevation)} m`} />
              <StatCard label="Biggest day" value={biggestDay ? `${biggestDay.toFixed(1)} km` : "-"} />
            </div>
          </section>

          {/* Heatmap */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-[#FC4C02]" />
              <h2 className="text-sm font-semibold">Training heatmap</h2>
              <span className="text-xs text-muted-foreground">last 52 weeks, by daily distance</span>
            </div>
            <Heatmap activities={activities} now={now} />
          </section>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Row 1: Distance + Distance by sport */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Distance</h2>
                <span className="text-xs text-muted-foreground">by {distanceGranularity(period)}</span>
              </div>
              {distanceBuckets.length > 0 ? (
                <BarChart data={distanceBuckets} dataKey="distance" colour="#FC4C02" valueFormatter={(v) => `${v} km`} />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No activities in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Route className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Distance by sport</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {sportBars.length > 0 ? (
                  sportBars.map((s) => (
                    <ProgressBar key={s.name} label={s.name} value={s.value} max={maxSportDist} colorClassName="bg-[#FC4C02]" />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">No activities in this period.</p>
                )}
              </div>
            </section>

            {/* Row 2: Heart-rate + Pace trend */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Heart-rate trend</h2>
                <span className="text-xs text-muted-foreground">avg bpm per activity</span>
              </div>
              {hrSeries.length > 1 ? (
                <LineChart data={hrSeries} dataKey="hr" colour="#ef4444" valueFormatter={(v) => `${v} bpm`} dots />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No heart-rate data in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Pace trend</h2>
                <span className="text-xs text-muted-foreground">runs, min/km (lower is faster)</span>
              </div>
              {paceSeries.length > 1 ? (
                <LineChart data={paceSeries} dataKey="pace" colour="#FC4C02" valueFormatter={fmtPaceSec} dots />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">Not enough runs in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Distance vs pace</h2>
                <span className="text-xs text-muted-foreground">runs, bubble size = duration</span>
              </div>
              {paceBubbles.length > 1 ? (
                <Bubble
                  data={paceBubbles}
                  xKey="distanceKm"
                  yKey="pace"
                  zKey="durationMin"
                  xLabel="Distance (km)"
                  yLabel="Pace"
                  xFormatter={(v) => `${v} km`}
                  yFormatter={fmtPaceSec}
                  zFormatter={(v) => `${v} min`}
                  colour="#FC4C02"
                />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">Not enough runs in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Pace distribution by month</h2>
                <span className="text-xs text-muted-foreground">runs, min/km (lower is faster)</span>
              </div>
              {paceByMonth.length > 0 ? (
                <BoxPlot groups={paceByMonth} valueFormatter={(v) => fmtPaceSec(v)} colour="#FC4C02" />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">Not enough runs in this period.</p>
              )}
            </section>

            {/* Row 3: Training by day + Sport split */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Training by day</h2>
                <span className="text-xs text-muted-foreground">distance by weekday</span>
              </div>
              {dowBars.some((d) => d.distance > 0) ? (
                <BarChart data={dowBars} dataKey="distance" colour="#FC4C02" valueFormatter={(v) => `${v} km`} />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No activities in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Sport split</h2>
                <span className="text-xs text-muted-foreground">by activity count</span>
              </div>
              {sportPie.length > 0 ? (
                <PieChart data={sportPie} />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No activities in this period.</p>
              )}
            </section>

            {/* Row 4: Cumulative distance + Time of day */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Cumulative distance</h2>
                <span className="text-xs text-muted-foreground">running total this period</span>
              </div>
              {cumulativeDistance.length > 1 ? (
                <LineChart data={cumulativeDistance} dataKey="total" colour="#FC4C02" valueFormatter={(v) => `${v} km`} dots />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No activities in this period.</p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Time of day</h2>
                <span className="text-xs text-muted-foreground">activities by part of day</span>
              </div>
              {filtered.length > 0 ? (
                <BarChart data={timeOfDay} dataKey="count" colour="#FC4C02" valueFormatter={(v) => `${v}`} />
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No activities in this period.</p>
              )}
            </section>
          </div>

          {/* Recent activities */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-sm font-semibold">Recent activities</h2>
              <span className="text-xs text-muted-foreground">{recent.length} of {filtered.length} in this period</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left font-medium py-1.5 pr-3">Activity</th>
                    <th className="text-left font-medium py-1.5 pr-3">Sport</th>
                    <th className="text-left font-medium py-1.5 pr-3">Date</th>
                    <th className="text-right font-medium py-1.5 pr-3">Distance</th>
                    <th className="text-right font-medium py-1.5 pr-3">Time</th>
                    <th className="text-right font-medium py-1.5 pr-3">Pace</th>
                    <th className="text-right font-medium py-1.5">Avg HR</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 pr-3 font-medium max-w-[14rem] truncate">{a.name ?? "Activity"}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{a.sport_type ?? "-"}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{a.start_date ? a.start_date.slice(0, 10) : "-"}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{a.distance_m ? fmtKm(a.distance_m) : "-"}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{a.moving_time_s ? fmtDuration(a.moving_time_s) : "-"}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{fmtPace(a.distance_m, a.moving_time_s)}</td>
                      <td className="py-1.5 text-right tabular-nums">{a.average_heartrate ? Math.round(a.average_heartrate) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function Header({ connected }: { connected: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">Activity Analytics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">My Strava training, synced privately</p>
      </div>
      <div className="flex items-center gap-2">
        <PeriodSelector />
        <Controls connected={connected} />
      </div>
    </div>
  )
}
