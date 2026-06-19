"use client"

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import {
  StatCard,
  DEFAULT_CHART_COLOURS,
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  periodStartDate,
} from "@/components/analytics"
import { normaliseStatus as normalise, STATUS_COLOURS, computeFunnelCounts } from "@/lib/application-status"
import { BarChart2 } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  type: string
  status: string
  applied_date: string | null
  location: string | null
  category: string | null
}

function detectCat(company: string, role: string): string {
  const r = role.toLowerCase(), c = company.toLowerCase()
  const faang = ["google","meta","amazon","apple","microsoft","netflix","deepmind","openai","anthropic"]
  const quant = ["citadel","optiver","jane street","imc","jump","two sigma","susquehanna","virtu","drw","sig ","flow traders","akuna","hudson river","de shaw"]
  if (faang.some((f) => c.includes(f))) return "FAANG+"
  if (quant.some((q) => c.includes(q)) || r.includes("quant") || r.includes("trading")) return "Quant"
  if (/\bai\b/i.test(r) || r.includes("machine learning") || r.includes("llm")) return "AI / ML"
  if (r.includes("data science") || r.includes("data analyst")) return "Data"
  if (r.includes("embedded") || r.includes("firmware") || r.includes("fpga")) return "Embedded"
  if (r.includes("devops") || r.includes("cloud engineer") || r.includes("sre")) return "DevOps"
  if (r.includes("security") || r.includes("cyber")) return "Security"
  if (r.includes("consult")) return "Consulting"
  return "Software"
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

function ApplicationsAnalyticsInner({ apps }: { apps: Application[] }) {
  const { period } = useAnalyticsPeriod()

  const cutoff = periodStartDate(period)
  const filtered = cutoff
    ? apps.filter((a) => a.applied_date && a.applied_date >= cutoff.toISOString().slice(0, 10))
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
    const cat = (a.category && a.category !== "Software Engineering" ? a.category : null) ?? detectCat(a.company, a.role)
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

  // Weekly trend — number of weeks driven by period
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
    const count = apps.filter((a) => a.applied_date && a.applied_date >= startIso && a.applied_date <= endIso).length
    weeklyBar.push({ name: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: count })
  }

  // Monthly trend (all time, last 12 months)
  const monthlyCounts: Record<string, number> = {}
  for (const a of apps) {
    if (!a.applied_date) continue
    const month = a.applied_date.slice(0, 7)
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

  // Funnel
  const funnelData = [
    { name: "Applied",    value: applied,     colour: "#6366f1" },
    { name: "Assessment", value: atOA,        colour: DEFAULT_CHART_COLOURS[4] },
    { name: "Interview",  value: atInterview, colour: DEFAULT_CHART_COLOURS[2] },
    { name: "Offer",      value: offers,      colour: DEFAULT_CHART_COLOURS[1] },
    { name: "Rejected",   value: rejected,    colour: "#64748b" },
  ]

  const periodLabel = period === "24h" ? "Today" : period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : period === "90d" ? "Last 90 days" : period === "1y" ? "This year" : "All time"

  return (
    <div className="flex-1 overflow-auto min-h-0 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-base font-semibold leading-tight">Applications Analytics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} application{filtered.length !== 1 ? "s" : ""} in view — {periodLabel}
            </p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={total} />
        <StatCard label="Applied" value={applied} />
        <StatCard label="Rejected" value={rejected} />
        <StatCard label="Offers" value={offers} />
        <StatCard label="Interview rate" value={`${interviewRate}%`} />
        <StatCard label="Offer rate" value={`${offerRate}%`} />
      </div>

      {/* Status pie + Category bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Status breakdown</p>
          {statusPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="40%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={72} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                    <p className="font-medium">{String(label)}</p>
                    <p className="text-muted-foreground">{payload[0].value}</p>
                  </div>
                )
              }} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5">
            {funnelData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.colour }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span className="font-medium">{entry.value}</span>
                  {applied > 0 && entry.name !== "Applied" && (
                    <span className="text-muted-foreground">{Math.round((entry.value / applied) * 100)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
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
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
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

export default function ApplicationsAnalytics({ apps }: { apps: Application[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="all">
      <ApplicationsAnalyticsInner apps={apps} />
    </AnalyticsPeriodProvider>
  )
}
