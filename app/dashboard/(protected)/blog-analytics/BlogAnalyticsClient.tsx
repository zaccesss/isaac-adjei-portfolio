"use client"

import { useMemo, useState } from "react"
import { BookOpen } from "lucide-react"
import type { BlogReadFunnelRow, BlogReadEvent } from "@/app/dashboard/actions"
import {
  StatCard,
  DEFAULT_CHART_COLOURS,
  BarChart,
  LineChart,
  PieChart,
  AnalyticsPeriodProvider,
  PeriodSelector,
  useAnalyticsPeriod,
  filterByPeriod,
} from "@/components/analytics"
import { Pagination } from "@/components/shared/Pagination"

const TABLE_PAGE_SIZE = 25

type SortKey = keyof BlogReadFunnelRow
type SortDir = "asc" | "desc"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}`)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const FUNNEL_COLOURS = [
  DEFAULT_CHART_COLOURS[1],
  DEFAULT_CHART_COLOURS[2],
  DEFAULT_CHART_COLOURS[4],
  DEFAULT_CHART_COLOURS[0],
]

const INTENSITY_CLASS = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
]

function intensityIndex(count: number, max: number) {
  if (max === 0 || count === 0) return 0
  const ratio = count / max
  if (ratio < 0.15) return 1
  if (ratio < 0.35) return 2
  if (ratio < 0.65) return 3
  return 4
}

function funnelWidth(count: number, base: number) {
  if (base === 0) return "0%"
  return `${Math.round((count / base) * 100)}%`
}

function fmt(n: number) {
  const h = Math.floor(n / 3600)
  const m = Math.floor((n % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function BlogAnalyticsClientInner({ events }: { events: BlogReadEvent[] }) {
  const { period } = useAnalyticsPeriod()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "til">("all")
  const [sortKey, setSortKey] = useState<SortKey>("reached_25")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  const periodEvents = useMemo(() => filterByPeriod(events, period, (e) => e.created_at), [events, period])

  // Per-post scroll-depth funnel rows, recomputed from the period's events so every chart below follows
  // the selector. The downstream charts and table all read from `rows`, so they need no other changes.
  const rows: BlogReadFunnelRow[] = useMemo(() => {
    const byPost = new Map<string, { slug: string; post_type: string; r25: number; r50: number; r75: number; r100: number }>()
    for (const e of periodEvents) {
      const key = `${e.post_type}:${e.slug}`
      let p = byPost.get(key)
      if (!p) {
        p = { slug: e.slug, post_type: e.post_type, r25: 0, r50: 0, r75: 0, r100: 0 }
        byPost.set(key, p)
      }
      if (e.depth === 25) p.r25++
      else if (e.depth === 50) p.r50++
      else if (e.depth === 75) p.r75++
      else if (e.depth === 100) p.r100++
    }
    return [...byPost.values()].map((p) => ({
      slug: p.slug,
      post_type: p.post_type,
      reached_25: p.r25,
      reached_50: p.r50,
      reached_75: p.r75,
      reached_100: p.r100,
      completion_rate: p.r25 === 0 ? null : p.r100 / p.r25,
    }))
  }, [periodEvents])

  const totalPosts = rows.length
  const totalReads = rows.reduce((acc, r) => acc + r.reached_25, 0)
  const avgCompletion =
    rows.length === 0
      ? null
      : Math.round((rows.reduce((acc, r) => acc + (r.completion_rate ?? 0), 0) / rows.length) * 100)
  const blogCount = rows.filter((r) => r.post_type === "blog").length
  const tilCount = rows.filter((r) => r.post_type === "til").length

  // 7 (Mon-Sun) × 24 (hours) heatmap, recomputed from the period's events.
  const weekdayHourMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
    for (const e of periodEvents) {
      const d = new Date(e.created_at)
      matrix[(d.getDay() + 6) % 7][d.getHours()]++
    }
    return matrix
  }, [periodEvents])

  const weekdayHourMax = useMemo(() => Math.max(0, ...weekdayHourMatrix.flat()), [weekdayHourMatrix])
  const hasHeatmapData = weekdayHourMax > 0

  // Opens (25% depth) over time, bucketed to follow the period.
  const readsOverTime = useMemo(() => {
    const gran = period === "90d" ? "week" : period === "1y" || period === "all" ? "month" : "day"
    const totals = new Map<string, number>()
    const labels = new Map<string, string>()
    for (const e of periodEvents) {
      if (e.depth !== 25) continue
      const d = new Date(e.created_at)
      let key: string
      let label: string
      if (gran === "day") {
        key = e.created_at.slice(0, 10)
        label = `${d.getDate()}/${d.getMonth() + 1}`
      } else if (gran === "week") {
        const m = new Date(d)
        m.setDate(d.getDate() - ((d.getDay() + 6) % 7))
        key = m.toISOString().slice(0, 10)
        label = `${m.getDate()}/${m.getMonth() + 1}`
      } else {
        key = e.created_at.slice(0, 7)
        label = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
      }
      totals.set(key, (totals.get(key) ?? 0) + 1)
      labels.set(key, label)
    }
    return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ name: labels.get(k) as string, reads: v }))
  }, [periodEvents, period])

  const funnelChartData = useMemo(() => {
    const visible = typeFilter === "all" ? rows : rows.filter((r) => r.post_type === typeFilter)
    return [
      { name: "25%", readers: visible.reduce((s, r) => s + r.reached_25, 0) },
      { name: "50%", readers: visible.reduce((s, r) => s + r.reached_50, 0) },
      { name: "75%", readers: visible.reduce((s, r) => s + r.reached_75, 0) },
      { name: "100%", readers: visible.reduce((s, r) => s + r.reached_100, 0) },
    ]
  }, [rows, typeFilter])

  const topPostsData = useMemo(() => {
    const visible = typeFilter === "all" ? rows : rows.filter((r) => r.post_type === typeFilter)
    return [...visible]
      .sort((a, b) => b.reached_25 - a.reached_25)
      .slice(0, 10)
      .map((r) => ({
        name: r.slug.length > 28 ? r.slug.slice(0, 28) + "…" : r.slug,
        readers: r.reached_25,
      }))
  }, [rows, typeFilter])

  const typeBreakdownData = useMemo(
    () => [
      { name: "Blog", value: blogCount },
      { name: "TIL", value: tilCount },
    ],
    [blogCount, tilCount],
  )

  // Opens (25% depth) split by weekday and by hour of day, so I can see which days and times posts get read.
  const readsByWeekday = useMemo(() => {
    const counts = new Array(7).fill(0)
    for (const e of periodEvents) if (e.depth === 25) counts[(new Date(e.created_at).getDay() + 6) % 7]++
    return DAYS.map((name, i) => ({ name, reads: counts[i] }))
  }, [periodEvents])

  const readsByHour = useMemo(() => {
    const counts = new Array(24).fill(0)
    for (const e of periodEvents) if (e.depth === 25) counts[new Date(e.created_at).getHours()]++
    return HOURS.map((h, i) => ({ name: `${h}h`, reads: counts[i] }))
  }, [periodEvents])

  // Depth retention: of everyone who opened a post (25%), what share made it to each deeper threshold.
  const retentionData = useMemo(() => {
    const base = funnelChartData[0]?.readers ?? 0
    return funnelChartData.map((d) => ({ name: d.name, retention: base === 0 ? 0 : Math.round((d.readers / base) * 100) }))
  }, [funnelChartData])

  const peakDay = useMemo(() => readsByWeekday.reduce((a, b) => (b.reads > a.reads ? b : a), readsByWeekday[0]), [readsByWeekday])
  const peakHour = useMemo(() => readsByHour.reduce((a, b) => (b.reads > a.reads ? b : a), readsByHour[0]), [readsByHour])

  const [tablePage, setTablePage] = useState(1)

  const filtered = rows
    .filter((r) => typeFilter === "all" || r.post_type === typeFilter)
    .filter((r) => !search || r.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? 0
      const vb = b[sortKey] ?? 0
      const cmp =
        typeof va === "string"
          ? String(va).localeCompare(String(vb))
          : (va as number) - (vb as number)
      return sortDir === "asc" ? cmp : -cmp
    })

  // Back to the first page whenever the filter, search, sort or period changes so I never land on an empty
  // page. I adjust during render (React's supported pattern) rather than in an effect, to avoid a cascade.
  const tableResetKey = `${search}|${typeFilter}|${sortKey}|${sortDir}|${period}`
  const [prevTableResetKey, setPrevTableResetKey] = useState(tableResetKey)
  if (tableResetKey !== prevTableResetKey) {
    setPrevTableResetKey(tableResetKey)
    setTablePage(1)
  }

  // The per-post table grows one row per post, so I page it. The charts above still read the full `rows`.
  const tableTotalPages = Math.max(1, Math.ceil(filtered.length / TABLE_PAGE_SIZE))
  const safeTablePage = Math.min(tablePage, tableTotalPages)
  const pageRows = filtered.slice((safeTablePage - 1) * TABLE_PAGE_SIZE, safeTablePage * TABLE_PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null
    return sortDir === "asc" ? " ↑" : " ↓"
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Posts Analytics</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scroll-depth funnel across all published posts (blog + TIL). Each visitor is counted once per depth threshold per post.
            </p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Posts tracked" value={totalPosts} />
        <StatCard label="Total opens (25%+)" value={totalReads} />
        <StatCard label="Avg completion" value={avgCompletion !== null ? `${avgCompletion}%` : "-"} />
        <StatCard label="Blog / TIL" value={`${blogCount} / ${tilCount}`} />
      </div>

      {/* Opens over time */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-xs font-medium text-muted-foreground mb-3">Opens over time</p>
        {readsOverTime.length > 1 ? (
          <LineChart data={readsOverTime} dataKey="reads" xKey="name" height={160} colour={DEFAULT_CHART_COLOURS[0]} valueFormatter={(v) => `${v} opens`} />
        ) : (
          <p className="text-xs text-muted-foreground py-10 text-center">Not enough data in this period.</p>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-3">Post type</p>
          {totalPosts > 0 ? (
            <PieChart
              data={typeBreakdownData}
              height={160}
              colours={[DEFAULT_CHART_COLOURS[0], DEFAULT_CHART_COLOURS[1]]}
            />
          ) : (
            <p className="text-xs text-muted-foreground pt-6 text-center">No data yet.</p>
          )}
        </div>

        <div className="border border-border rounded-lg p-4 bg-card col-span-1 sm:col-span-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Aggregate scroll-depth funnel</p>
          {totalReads > 0 ? (
            <BarChart
              data={funnelChartData}
              dataKey="readers"
              xKey="name"
              height={160}
              colour={DEFAULT_CHART_COLOURS[0]}
              valueFormatter={(v) => `${v} readers`}
            />
          ) : (
            <p className="text-xs text-muted-foreground pt-6 text-center">No read events recorded yet.</p>
          )}
        </div>
      </div>

      {topPostsData.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-3">Top posts by readers (25%+)</p>
          <BarChart
            data={topPostsData}
            dataKey="readers"
            xKey="name"
            height={180}
            colour={DEFAULT_CHART_COLOURS[1]}
            valueFormatter={(v) => `${v} readers`}
          />
        </div>
      )}

      {/* Depth retention + reads by weekday */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-3">Depth retention (share of openers reaching each depth)</p>
          {totalReads > 0 ? (
            <BarChart data={retentionData} dataKey="retention" xKey="name" height={160} colour={DEFAULT_CHART_COLOURS[2]} valueFormatter={(v) => `${v}%`} />
          ) : (
            <p className="text-xs text-muted-foreground pt-6 text-center">No read events recorded yet.</p>
          )}
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Opens by weekday{peakDay && peakDay.reads > 0 ? ` · busiest ${peakDay.name}` : ""}
          </p>
          {totalReads > 0 ? (
            <BarChart data={readsByWeekday} dataKey="reads" xKey="name" height={160} colour={DEFAULT_CHART_COLOURS[4]} valueFormatter={(v) => `${v} opens`} />
          ) : (
            <p className="text-xs text-muted-foreground pt-6 text-center">No read events recorded yet.</p>
          )}
        </div>
      </div>

      {/* Reads by hour of day */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          Opens by hour of day{peakHour && peakHour.reads > 0 ? ` · peak around ${peakHour.name}` : ""}
        </p>
        {totalReads > 0 ? (
          <BarChart data={readsByHour} dataKey="reads" xKey="name" height={160} colour={DEFAULT_CHART_COLOURS[0]} valueFormatter={(v) => `${v} opens`} />
        ) : (
          <p className="text-xs text-muted-foreground pt-6 text-center">No read events recorded yet.</p>
        )}
      </div>

      {/* When posts are read — hour × day heatmap */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <p className="text-xs font-medium text-muted-foreground mb-3">When posts are read</p>
        {hasHeatmapData ? (
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="flex gap-1 mb-1 ml-8">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 text-[9px] text-muted-foreground text-center">
                    {parseInt(h) % 4 === 0 ? `${h}h` : ""}
                  </div>
                ))}
              </div>
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-muted-foreground w-7 shrink-0">{day}</span>
                  {HOURS.map((_, hi) => {
                    const count = weekdayHourMatrix[di][hi]
                    const cls = INTENSITY_CLASS[intensityIndex(count, weekdayHourMax)]
                    const isHovered = hoveredCell?.day === di && hoveredCell?.hour === hi
                    return (
                      <div
                        key={hi}
                        className={`flex-1 h-4 rounded-[2px] cursor-default transition-opacity ${cls} ${isHovered ? "ring-1 ring-primary" : ""}`}
                        onMouseEnter={() => setHoveredCell({ day: di, hour: hi })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={count > 0 ? `${day} ${hi}:00 — ${count} read${count !== 1 ? "s" : ""}` : undefined}
                      />
                    )
                  })}
                </div>
              ))}
              {hoveredCell && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {DAYS[hoveredCell.day]} {hoveredCell.hour}:00 —{" "}
                  {weekdayHourMatrix[hoveredCell.day][hoveredCell.hour]} read
                  {weekdayHourMatrix[hoveredCell.day][hoveredCell.hour] !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Heatmap data will appear once read events are recorded.
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Filter by slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background max-w-sm"
        />
        <div className="flex gap-1">
          {(["all", "blog", "til"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {t === "all" ? "All" : t === "blog" ? "Blog" : "TIL"}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground uppercase tracking-wide">
              <th
                className="px-3 py-2 cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("slug")}
              >
                Post{sortIndicator("slug")}
              </th>
              <th
                className="px-3 py-2 cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("post_type")}
              >
                Type{sortIndicator("post_type")}
              </th>
              {(["reached_25", "reached_50", "reached_75", "reached_100"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => handleSort(col)}
                >
                  {col.replace("reached_", "")}%{sortIndicator(col)}
                </th>
              ))}
              <th
                className="px-3 py-2 cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                onClick={() => handleSort("completion_rate")}
              >
                Completion{sortIndicator("completion_rate")}
              </th>
              <th className="px-3 py-2">Drop-off</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground text-sm">
                  No read events recorded yet.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={`${row.post_type}/${row.slug}`}
                  className="border-b border-border even:bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-3 py-2 font-mono text-xs max-w-[200px] truncate">{row.slug}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        row.post_type === "til"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {row.post_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{row.reached_25}</td>
                  <td className="px-3 py-2 tabular-nums">{row.reached_50}</td>
                  <td className="px-3 py-2 tabular-nums">{row.reached_75}</td>
                  <td className="px-3 py-2 tabular-nums">{row.reached_100}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {row.completion_rate !== null
                      ? `${Math.round(row.completion_rate * 100)}%`
                      : "-"}
                  </td>
                  <td className="px-3 py-2 min-w-[120px]">
                    <div className="flex flex-col gap-0.5">
                      {(["reached_25", "reached_50", "reached_75", "reached_100"] as const).map(
                        (key, idx) => (
                          <div
                            key={key}
                            className="w-full h-1.5 bg-muted rounded-full overflow-hidden"
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: funnelWidth(row[key], row.reached_25),
                                background: FUNNEL_COLOURS[idx],
                              }}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={safeTablePage}
        totalPages={tableTotalPages}
        onChange={setTablePage}
        totalItems={filtered.length}
        pageSize={TABLE_PAGE_SIZE}
        itemLabel="posts"
      />
    </div>
  )
}

export default function BlogAnalyticsClient(props: { events: BlogReadEvent[] }) {
  return (
    <AnalyticsPeriodProvider defaultPeriod="1y">
      <BlogAnalyticsClientInner {...props} />
    </AnalyticsPeriodProvider>
  )
}
