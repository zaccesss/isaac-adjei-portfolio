"use client"

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import {
  StatCard,
  ProgressBar,
  DEFAULT_CHART_COLOURS,
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  periodStartDate,
  Funnel,
  Composed,
} from "@/components/analytics"
import { normaliseStatus as normalise, STATUS_COLOURS, computeFunnelCounts } from "@/lib/application-status"
import { ApplicationsMap } from "@/components/analytics/ApplicationsMap"
import { BarChart2 } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  applied_date: string | null
  created_at: string
  location: string | null
  category: string | null
}

type Geocode = { location: string; lat: number | null; lng: number | null }

// Fallback for the rare row with no stored category. Returns the same full names the scraper and the
// re-categorise backfill use, so the breakdown never fragments into short synonyms.
function detectCat(company: string, role: string): string {
  const r = role.toLowerCase(), c = company.toLowerCase()
  const faang = ["google","meta","amazon","apple","microsoft","netflix","deepmind","openai","anthropic"]
  const quant = ["citadel","optiver","jane street","imc","jump","two sigma","susquehanna","virtu","drw","sig ","flow traders","akuna","hudson river","de shaw"]
  if (faang.some((f) => c.includes(f))) return "FAANG+"
  if (quant.some((q) => c.includes(q)) || r.includes("quant") || r.includes("trading")) return "Quant Developer"
  if (/\bai\b/i.test(r) || r.includes("machine learning") || r.includes("llm")) return "AI and Machine Learning"
  if (r.includes("data science") || r.includes("data analyst") || r.includes("data engineer")) return "Data Science"
  if (r.includes("hardware") || r.includes("electronics") || r.includes("circuit") || r.includes("pcb") || r.includes("chip")) return "Hardware"
  if (r.includes("embedded") || r.includes("firmware") || r.includes("fpga") || r.includes("rtos")) return "Embedded"
  if (r.includes("devops") || r.includes("cloud engineer") || r.includes("sre") || r.includes("platform engineer")) return "DevOps and Infrastructure"
  if (r.includes("security") || r.includes("cyber")) return "Cyber Security"
  if (r.includes("consult")) return "Tech Consulting"
  if (r.includes("it support") || r.includes("service desk") || r.includes("helpdesk")) return "IT"
  return "Software Engineering"
}

// Tooltip matching the shared analytics token set
function ThemedTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">{p.value}</p>
      ))}
    </div>
  )
}

function ApplicationsAnalyticsInner({ apps, geocodes }: { apps: Application[]; geocodes: Geocode[] }) {
  const { period } = useAnalyticsPeriod()

  // applied_date is unset on almost every row, so I fall back to created_at as the date basis -
  // otherwise every period except "All" would filter down to nothing.
  const appDate = (a: Application) => a.applied_date ?? a.created_at.slice(0, 10)
  const cutoff = periodStartDate(period)
  const filtered = cutoff
    ? apps.filter((a) => appDate(a) >= cutoff.toISOString().slice(0, 10))
    : apps

  // Status breakdown
  const statusCounts: Record<string, number> = {}
  for (const a of filtered) {
    const s = normalise(a.status)
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }
  const statusPie = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, colour: STATUS_COLOURS[name] ?? "#94a3b8" }))

  // Category breakdown
  const catCounts: Record<string, number> = {}
  for (const a of filtered) {
    const cat = a.category || detectCat(a.company, a.role)
    catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const catBar = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  // Location breakdown
  const locCounts: Record<string, number> = { London: 0, Birmingham: 0, Manchester: 0, "Remote / Hybrid": 0, Other: 0 }
  for (const a of filtered) {
    const l = (a.location ?? "").toLowerCase()
    if (l.includes("london")) locCounts["London"]++
    else if (l.includes("birmingham")) locCounts["Birmingham"]++
    else if (l.includes("manchester")) locCounts["Manchester"]++
    else if (l.includes("remote") || l.includes("hybrid")) locCounts["Remote / Hybrid"]++
    else if (l) locCounts["Other"]++
  }
  const locBar = Object.entries(locCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))

  // Weekly trend - number of weeks driven by period
  const today = new Date()
  const numWeeks = period === "7d" ? 4 : period === "30d" ? 8 : period === "90d" ? 13 : period === "1y" ? 26 : period === "24h" ? 1 : 52
  const weeklyBar: { name: string; value: number }[] = []
  for (let w = numWeeks - 1; w >= 0; w--) {
    const end = new Date(today)
    end.setDate(today.getDate() - w * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    const startIso = start.toISOString().slice(0, 10)
    const endIso = end.toISOString().slice(0, 10)
    const count = apps.filter((a) => appDate(a) >= startIso && appDate(a) <= endIso).length
    weeklyBar.push({ name: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: count })
  }

  // Monthly trend, following the selected period (capped to the last 12 months on wider spans)
  const monthlyCounts: Record<string, number> = {}
  for (const a of filtered) {
    const month = appDate(a).slice(0, 7)
    monthlyCounts[month] = (monthlyCounts[month] ?? 0) + 1
  }
  const monthlyBar = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, value]) => ({
      name: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      value,
    }))

  // Summary stats (period-filtered)
  const total = filtered.length
  const { applied, assessment: atOA, interview: atInterview } = computeFunnelCounts(filtered.map((a) => a.status))
  const offers = filtered.filter((a) => normalise(a.status) === "Offer Received").length
  const rejected = filtered.filter((a) => normalise(a.status) === "Rejected").length
  const interviewRate = applied > 0 ? Math.round((atInterview / applied) * 100) : 0
  const offerRate = applied > 0 ? Math.round((offers / applied) * 100) : 0

  // Previous equal-length period, so the stat cards show a trend arrow against the selected period.
  let prevTotal = 0
  let prevApplied = 0
  if (cutoff) {
    const span = today.getTime() - cutoff.getTime()
    const prevStartIso = new Date(cutoff.getTime() - span).toISOString().slice(0, 10)
    const prevEndIso = cutoff.toISOString().slice(0, 10)
    const prev = apps.filter((a) => appDate(a) >= prevStartIso && appDate(a) < prevEndIso)
    prevTotal = prev.length
    prevApplied = computeFunnelCounts(prev.map((a) => a.status)).applied
  }
  const pctDelta = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null)
  const totalDelta = pctDelta(total, prevTotal)
  const appliedDelta = pctDelta(applied, prevApplied)

  // Funnel
  const funnelData = [
    { name: "Applied",    value: applied,     colour: "#6366f1" },
    { name: "Assessment", value: atOA,        colour: DEFAULT_CHART_COLOURS[4] },
    { name: "Interview",  value: atInterview, colour: DEFAULT_CHART_COLOURS[2] },
    { name: "Offer",      value: offers,      colour: DEFAULT_CHART_COLOURS[1] },
    { name: "Rejected",   value: rejected,    colour: "#64748b" },
  ]

  const periodLabel = period === "24h" ? "Today" : period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : period === "90d" ? "Last 90 days" : period === "1y" ? "This year" : "All time"

  // Pareto of rejections by company - which companies account for most of my rejections, read as
  // cumulative share so the "handful of companies driving most of it" pattern is visible at a glance.
  const rejectionsByCompany = new Map<string, number>()
  for (const a of filtered) {
    if (normalise(a.status) !== "Rejected") continue
    rejectionsByCompany.set(a.company, (rejectionsByCompany.get(a.company) ?? 0) + 1)
  }
  const rejectionRows = [...rejectionsByCompany.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  const rejectionTotal = rejectionRows.reduce((s, [, c]) => s + c, 0)
  const rejectionRunningTotals = rejectionRows.reduce<number[]>((acc, [, count]) => [...acc, (acc[acc.length - 1] ?? 0) + count], [])
  const rejectionPareto = rejectionRows.map(([company, count], i) => ({
    name: company,
    rejections: count,
    cumulativePct: rejectionTotal > 0 ? Math.round((rejectionRunningTotals[i] / rejectionTotal) * 100) : 0,
  }))

  return (
    <div className="flex-1 overflow-auto min-h-0 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-base font-semibold leading-tight">Applications Analytics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} application{filtered.length !== 1 ? "s" : ""} in view - {periodLabel}
            </p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={total} trend={totalDelta !== null ? { delta: totalDelta } : undefined} sparkline={weeklyBar.map((w) => w.value)} />
        <StatCard label="Applied" value={applied} trend={appliedDelta !== null ? { delta: appliedDelta } : undefined} />
        <StatCard label="Rejected" value={rejected} />
        <StatCard label="Offers" value={offers} />
        <StatCard label="Interview rate" value={`${interviewRate}%`} />
        <StatCard label="Offer rate" value={`${offerRate}%`} />
      </div>

      {/* Conversion progress from applied */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Conversion from applied</h3>
        <div className="flex flex-col gap-2.5">
          <ProgressBar label="Assessment" value={atOA} max={applied || 1} colorClassName="bg-violet-500" />
          <ProgressBar label="Interview" value={atInterview} max={applied || 1} colorClassName="bg-amber-500" />
          <ProgressBar label="Offer" value={offers} max={applied || 1} colorClassName="bg-green-500" />
        </div>
      </div>

      {/* Status pie + Category bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Status breakdown</p>
          {statusPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusPie.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                      <p className="font-medium">{String(d.name)}</p>
                      <p className="text-muted-foreground">{d.value} application{d.value !== 1 ? "s" : ""}</p>
                    </div>
                  )
                }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">No applications in this period.</p>
          )}
        </div>

        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">By category</p>
          {catBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catBar} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                      <p className="font-medium">{String(label)}</p>
                      <p className="text-muted-foreground">{payload[0].value} application{payload[0].value !== 1 ? "s" : ""}</p>
                    </div>
                  )
                }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">No applications in this period.</p>
          )}
        </div>
      </div>

      {/* Funnel */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Application funnel</p>
        <Funnel
          stages={funnelData.filter((d) => d.name !== "Rejected").map((d) => ({ name: d.name, value: d.value }))}
          colours={funnelData.map((d) => d.colour)}
        />
        {rejected > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {rejected} rejected this period{applied > 0 ? ` (${Math.round((rejected / applied) * 100)}% of applied)` : ""} - not shown above, since rejection can happen at any stage rather than being the funnel&apos;s next step.
          </p>
        )}
      </div>

      {/* Map */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Application locations</p>
        <ApplicationsMap
          apps={filtered.map((a) => ({ id: a.id, company: a.company, role: a.role, status: a.status, location: a.location, created_at: a.created_at }))}
          geocodes={geocodes}
        />
      </div>

      {rejectionPareto.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Rejections by company - Pareto</p>
          <Composed
            data={rejectionPareto}
            barKey="rejections"
            lineKey="cumulativePct"
            barName="Rejections"
            lineName="Cumulative %"
            barColour="#64748b"
            lineValueFormatter={(v) => `${v}%`}
          />
        </div>
      )}

      {/* Weekly trend */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Weekly applications (last {numWeeks} week{numWeeks !== 1 ? "s" : ""})</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyBar} barSize={10} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(numWeeks / 8) - 1)} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const v = payload[0].value as number
              return (
                <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                  <p className="font-medium">w/e {String(label)}</p>
                  <p className="text-muted-foreground">{v} application{v !== 1 ? "s" : ""}</p>
                </div>
              )
            }} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" fill={DEFAULT_CHART_COLOURS[0]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend + Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {monthlyBar.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm font-semibold mb-3">Applications over time (monthly)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyBar} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const v = payload[0].value as number
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                      <p className="font-medium">{String(label)}</p>
                      <p className="text-muted-foreground">{v} application{v !== 1 ? "s" : ""}</p>
                    </div>
                  )
                }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" fill={DEFAULT_CHART_COLOURS[0]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {locBar.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm font-semibold mb-3">By location</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={locBar} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const v = payload[0].value as number
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                      <p className="font-medium">{String(label)}</p>
                      <p className="text-muted-foreground">{v} application{v !== 1 ? "s" : ""}</p>
                    </div>
                  )
                }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" fill={DEFAULT_CHART_COLOURS[1]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsAnalytics({ apps, geocodes }: { apps: Application[]; geocodes: Geocode[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="all">
      <ApplicationsAnalyticsInner apps={apps} geocodes={geocodes} />
    </AnalyticsPeriodProvider>
  )
}
