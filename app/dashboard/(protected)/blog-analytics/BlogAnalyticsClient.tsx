"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import type { BlogReadFunnelRow } from "@/app/dashboard/actions"
import { StatCard, DEFAULT_CHART_COLOURS } from "@/components/analytics"

type SortKey = keyof BlogReadFunnelRow
type SortDir = "asc" | "desc"

export default function BlogAnalyticsClient({ rows }: { rows: BlogReadFunnelRow[] }) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("reached_25")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const totalPosts = rows.length
  const totalReads = rows.reduce((acc, r) => acc + r.reached_25, 0)
  const avgCompletion =
    rows.length === 0
      ? null
      : Math.round(
          (rows.reduce((acc, r) => acc + (r.completion_rate ?? 0), 0) / rows.length) * 100,
        )

  const filtered = rows
    .filter((r) => !search || r.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? 0
      const vb = b[sortKey] ?? 0
      const cmp = typeof va === "string" ? String(va).localeCompare(String(vb)) : (va as number) - (vb as number)
      return sortDir === "asc" ? cmp : -cmp
    })

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

  function funnelWidth(count: number, base: number) {
    if (base === 0) return "0%"
    return `${Math.round((count / base) * 100)}%`
  }

  const FUNNEL_COLOURS = [
    DEFAULT_CHART_COLOURS[1], // green
    DEFAULT_CHART_COLOURS[2], // amber
    DEFAULT_CHART_COLOURS[4], // purple
    DEFAULT_CHART_COLOURS[0], // primary
  ]

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold leading-tight">Blog Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scroll-depth funnel for every published post. Each row counts unique visitors per depth threshold.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Posts tracked" value={totalPosts} />
        <StatCard label="Total opens (25%+)" value={totalReads} />
        <StatCard label="Avg completion" value={avgCompletion !== null ? `${avgCompletion}%` : "-"} />
      </div>

      <input
        type="search"
        placeholder="Filter by slug…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-border rounded-md px-3 py-1.5 text-sm bg-background max-w-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground uppercase tracking-wide">
              <th
                className="px-3 py-2 cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("slug")}
              >
                Post slug{sortIndicator("slug")}
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
              <th className="px-3 py-2">Drop-off visualisation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground text-sm">
                  No read events recorded yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.slug} className="border-b border-border even:bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs max-w-[200px] truncate">
                    {row.slug}
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
                  <td className="px-3 py-2 min-w-[160px]">
                    <div className="flex flex-col gap-0.5">
                      {(["reached_25", "reached_50", "reached_75", "reached_100"] as const).map(
                        (key, idx) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: funnelWidth(row[key], row.reached_25),
                                  background: FUNNEL_COLOURS[idx],
                                }}
                              />
                            </div>
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
    </div>
  )
}
