import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { publicApiLimiter, checkRateLimit, getIp } from "@/lib/ratelimit"

// AI assistant tools whose time counts in totals but are grouped as "Other" in the
// editors breakdown rather than listed individually - same list as CodingClient.tsx.
const AI_EDITORS = new Set([
  "Claude Code",
  "Codex", "OpenAI",
  "Cursor",
  "GitHub Copilot", "Copilot",
  "Codeium", "Windsurf",
  "Tabnine",
  "Amazon Q", "Amazon Q Developer",
  "Gemini", "Gemini Code Assist",
  "Cody",
  "Continue",
  "Supermaven",
  "Aider",
  "Cline", "Roo Code", "Roo-Code",
  "JetBrains AI", "JetBrains AI Assistant",
  "Avante",
  "Replit AI", "Ghostwriter",
])

type WakatimeRow = {
  date: string
  total_seconds: number
  languages: { name: string; total_seconds: number }[]
  projects: { name: string; total_seconds: number }[]
  editors: { name: string; total_seconds: number }[]
  operating_systems: { name: string; total_seconds: number }[] | null
  hours: number[] | null
}

function periodCutoff(period: string): string | null {
  const d = new Date()
  if (period === "24h") { d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) }
  if (period === "7d")  { d.setDate(d.getDate() - 7);   return d.toISOString().slice(0, 10) }
  if (period === "30d") { d.setDate(d.getDate() - 30);  return d.toISOString().slice(0, 10) }
  if (period === "90d") { d.setDate(d.getDate() - 90);  return d.toISOString().slice(0, 10) }
  if (period === "1y")  { d.setDate(d.getDate() - 365); return d.toISOString().slice(0, 10) }
  return null // all time
}

export async function GET(req: Request) {
  if (!await checkRateLimit(publicApiLimiter, getIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") ?? "30d"
  const cutoff = periodCutoff(period)

  // Period rows for charts
  let query = supabase
    .from("wakatime_daily")
    .select("date, total_seconds, languages, projects, editors, operating_systems, hours")
    .order("date", { ascending: true })
  if (cutoff) query = query.gte("date", cutoff)

  const { data: rows, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const days = (rows ?? []) as WakatimeRow[]

  // Streak - always computed from all data going backwards from today
  const { data: allRows } = await supabase
    .from("wakatime_daily")
    .select("date, total_seconds")
    .order("date", { ascending: false })
  const allDays = (allRows ?? []) as { date: string; total_seconds: number }[]
  let codingStreak = 0
  const today = new Date().toISOString().slice(0, 10)
  const activeDates = new Set(allDays.filter((d) => d.total_seconds > 0).map((d) => d.date))
  const cur = new Date(today)
  while (true) {
    const ds = cur.toISOString().slice(0, 10)
    if (activeDates.has(ds)) { codingStreak++; cur.setDate(cur.getDate() - 1) }
    else break
  }

  // Aggregate period data
  let totalSeconds = 0
  let bestDaySeconds = 0
  let bestDayDate = ""
  const langMap: Record<string, number> = {}
  const projMap: Record<string, number> = {}
  const editorMap: Record<string, number> = {}
  const osMap: Record<string, number> = {}
  const weekdayMap: number[] = [0, 0, 0, 0, 0, 0, 0] // Sun=0
  const hourMap: number[] = Array(24).fill(0)
  const heatmapMap: Record<string, number> = {}
  const dailyTrend: { date: string; seconds: number }[] = []

  for (const row of days) {
    totalSeconds += row.total_seconds
    if (row.total_seconds > bestDaySeconds) {
      bestDaySeconds = row.total_seconds
      bestDayDate = row.date
    }
    const dow = new Date(row.date).getDay()
    weekdayMap[dow] += row.total_seconds

    for (const l of row.languages ?? []) langMap[l.name] = (langMap[l.name] ?? 0) + l.total_seconds
    for (const p of row.projects ?? []) {
      if (!p.name || p.name === "Unknown Project") continue
      projMap[p.name] = (projMap[p.name] ?? 0) + p.total_seconds
    }
    for (const e of row.editors ?? []) {
      const key = AI_EDITORS.has(e.name) ? "Other" : e.name
      editorMap[key] = (editorMap[key] ?? 0) + e.total_seconds
    }
    for (const o of row.operating_systems ?? []) osMap[o.name] = (osMap[o.name] ?? 0) + o.total_seconds

    if (Array.isArray(row.hours) && row.hours.length === 24) {
      for (let h = 0; h < 24; h++) {
        const secs = row.hours[h] ?? 0
        hourMap[h] += secs
        const key = `${dow}:${h}`
        heatmapMap[key] = (heatmapMap[key] ?? 0) + secs
      }
    }

    dailyTrend.push({ date: row.date, seconds: row.total_seconds })
  }

  const activeDays = days.filter((d) => d.total_seconds > 0).length
  const dailyAvgSeconds = activeDays > 0 ? Math.round(totalSeconds / activeDays) : 0

  const toSorted = (map: Record<string, number>, limit = 8) =>
    Object.entries(map)
      .map(([name, total_seconds]) => ({ name, total_seconds }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .slice(0, limit)

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weekdayTotals = weekdayMap.map((seconds, i) => ({ day: DAY_NAMES[i], seconds }))

  const hourlyTotals = hourMap.map((seconds, hour) => ({ hour, seconds }))

  const heatmap = Object.entries(heatmapMap).map(([key, seconds]) => {
    const [dow, hour] = key.split(":").map(Number)
    return { dow, hour, seconds }
  })

  return NextResponse.json(
    {
      totalSeconds,
      dailyAvgSeconds,
      activeDays,
      bestDaySeconds,
      bestDayDate,
      codingStreak,
      languages: toSorted(langMap),
      projects: toSorted(projMap),
      editors: toSorted(editorMap),
      operatingSystems: toSorted(osMap, 5),
      dailyTrend,
      weekdayTotals,
      hourlyTotals,
      heatmap,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  )
}
