"use client"

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"

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

const STATUS_COLOURS: Record<string, string> = {
  "Not Applied":             "#94a3b8",
  "Interested":              "#3b82f6",
  "Application Submitted":   "#6366f1",
  "Online Assessment":       "#8b5cf6",
  "Case Study":              "#a855f7",
  "HireVue":                 "#c026d3",
  "Telephone Interview":     "#f59e0b",
  "Video Interview":         "#f97316",
  "Face-to-face Interview":  "#ef4444",
  "Assessment Centre":       "#dc2626",
  "Offer Received":          "#22c55e",
  "Rejected":                "#64748b",
  "Not Interested":          "#475569",
}

function normalise(raw: string): string {
  const map: Record<string, string> = {
    scraped: "Not Applied", applied: "Application Submitted", oa: "Online Assessment",
    case_study: "Case Study", phone_screen: "Telephone Interview",
    face_to_face: "Face-to-face Interview", assessment_centre: "Assessment Centre",
    offer: "Offer Received", not_interested: "Not Interested",
    interested: "Interested", hirevue: "HireVue", rejected: "Rejected",
    video_interview: "Video Interview",
  }
  return map[raw] ?? raw
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

export default function ApplicationsAnalytics({ apps }: { apps: Application[] }) {
  // ── Status breakdown ────────────────────────────────────────────────────────
  const statusCounts: Record<string, number> = {}
  for (const a of apps) {
    const s = normalise(a.status)
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }
  const statusPie = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, colour: STATUS_COLOURS[name] ?? "#94a3b8" }))

  // ── Category breakdown ──────────────────────────────────────────────────────
  const catCounts: Record<string, number> = {}
  for (const a of apps) {
    const cat = (a.category && a.category !== "Software Engineering" ? a.category : null) ?? detectCat(a.company, a.role)
    catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const catBar = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  // ── Location breakdown ──────────────────────────────────────────────────────
  const locCounts: Record<string, number> = { London: 0, Birmingham: 0, Manchester: 0, "Remote / Hybrid": 0, Other: 0 }
  for (const a of apps) {
    const l = (a.location ?? "").toLowerCase()
    if (l.includes("london")) locCounts["London"]++
    else if (l.includes("birmingham")) locCounts["Birmingham"]++
    else if (l.includes("manchester")) locCounts["Manchester"]++
    else if (l.includes("remote") || l.includes("hybrid")) locCounts["Remote / Hybrid"]++
    else if (l) locCounts["Other"]++
  }
  const locBar = Object.entries(locCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))

  // ── Weekly trend — last 13 weeks ────────────────────────────────────────────
  const today = new Date()
  const weeklyBar: { name: string; value: number }[] = []
  for (let w = 12; w >= 0; w--) {
    const end = new Date(today)
    end.setDate(today.getDate() - w * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    const startIso = start.toISOString().slice(0, 10)
    const endIso = end.toISOString().slice(0, 10)
    const count = apps.filter((a) => a.applied_date && a.applied_date >= startIso && a.applied_date <= endIso).length
    weeklyBar.push({ name: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: count })
  }

  // ── Monthly trend ───────────────────────────────────────────────────────────
  const monthlyCounts: Record<string, number> = {}
  for (const a of apps) {
    if (!a.applied_date) continue
    const month = a.applied_date.slice(0, 7) // yyyy-mm
    monthlyCounts[month] = (monthlyCounts[month] ?? 0) + 1
  }
  const monthlyBar = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, value]) => ({
      name: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      value,
    }))

  // ── Summary stats ───────────────────────────────────────────────────────────
  const total = apps.length
  const applied = apps.filter((a) => !["Not Applied","Interested","Not Interested"].includes(normalise(a.status))).length
  const atOA = apps.filter((a) => ["Online Assessment","Case Study","HireVue"].includes(normalise(a.status))).length
  const atInterview = apps.filter((a) => ["Telephone Interview","Video Interview","Face-to-face Interview","Assessment Centre","Offer Received"].includes(normalise(a.status))).length
  const offers = apps.filter((a) => normalise(a.status) === "Offer Received").length
  const rejected = apps.filter((a) => normalise(a.status) === "Rejected").length
  const interviewRate = applied > 0 ? Math.round((atInterview / applied) * 100) : 0
  const offerRate = applied > 0 ? Math.round((offers / applied) * 100) : 0

  // ── Application funnel ──────────────────────────────────────────────────────
  const funnelData = [
    { name: "Applied",    value: applied,     colour: "#6366f1" },
    { name: "Assessment", value: atOA,        colour: "#8b5cf6" },
    { name: "Interview",  value: atInterview, colour: "#f59e0b" },
    { name: "Offer",      value: offers,      colour: "#22c55e" },
    { name: "Rejected",   value: rejected,    colour: "#64748b" },
  ]

  return (
    <div className="flex-1 overflow-auto min-h-0 p-4 space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: total, colour: "text-foreground" },
          { label: "Applied", value: applied, colour: "text-indigo-500" },
          { label: "Rejected", value: rejected, colour: "text-muted-foreground" },
          { label: "Offers", value: offers, colour: "text-green-500" },
          { label: "Interview rate", value: `${interviewRate}%`, colour: "text-amber-500" },
          { label: "Offer rate", value: `${offerRate}%`, colour: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="border border-border rounded-lg p-3 bg-card">
            <p className={`text-xl font-bold tabular-nums ${s.colour}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status pie + Category bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">Status breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" cx="40%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusPie.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-sm font-semibold mb-3">By category</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catBar} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={(v) => [`${v}`, "Applications"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-sm font-semibold mb-3">Application funnel</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={72} />
              <Tooltip formatter={(v) => [`${v}`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
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
        <p className="text-sm font-semibold mb-3">Weekly applications (last 13 weeks)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyBar} barSize={10} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v}`, "Applied"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v}`, "Applied"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {locBar.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm font-semibold mb-3">By location</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={locBar} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v}`, "Applications"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
