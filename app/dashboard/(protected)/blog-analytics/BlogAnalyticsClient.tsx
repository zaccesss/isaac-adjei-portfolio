"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import type { BlogReadFunnelRow } from "@/app/dashboard/actions"

// I define the sort keys the user can cycle through in the table header.
type SortKey = keyof BlogReadFunnelRow
type SortDir = "asc" | "desc"

export default function BlogAnalyticsClient({ rows }: { rows: BlogReadFunnelRow[] }) {
  // I keep search and sort as controlled state for instant client-side filtering.
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("reached_25")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // I compute three summary stats over all posts for the header cards.
  const totalPosts = rows.length
  const totalReads = rows.reduce((acc, r) => acc + r.reached_25, 0)
  const avgCompletion =
    rows.length === 0
      ? null
      : Math.round(
          (rows.reduce((acc, r) => acc + (r.completion_rate ?? 0), 0) / rows.length) * 100,
        )

  // I apply search then sort for the visible table rows.
  const filtered = rows
    .filter((r) => !search || r.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? 0
      const vb = b[sortKey] ?? 0
      const cmp = typeof va === "string" ? String(va).localeCompare(String(vb)) : (va as number) - (vb as number)
      return sortDir === "asc" ? cmp : -cmp
    })

  function handleSort(key: SortKey) {
    // I toggle direction when clicking the same column, otherwise default to desc.
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

  // I colour each funnel bar proportionally to the 25% reach count so the
  // visual width makes the drop-off immediately obvious.
  function funnelWidth(count: number, base: number) {
    if (base === 0) return "0%"
    return `${Math.round((count / base) * 100)}%`
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold leading-tight">Blog Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scroll-depth funnel for every published post. Each row counts unique visitors per depth threshold.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Posts tracked</p>
          <p className="text-2xl font-bold mt-1">{totalPosts}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total opens (25%+)</p>
          <p className="text-2xl font-bold mt-1">{totalReads}</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Avg completion</p>
          <p className="text-2xl font-bold mt-1">
            {avgCompletion !== null ? `${avgCompletion}%` : "-"}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Filter by slug…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-border rounded-md px-3 py-1.5 text-sm bg-background max-w-sm"
      />

      {/* Funnel table */}
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
                  {/* I draw four stacked bars that shrink proportionally to visualise drop-off */}
                  <td className="px-3 py-2 min-w-[160px]">
                    <div className="flex flex-col gap-0.5">
                      {(["reached_25", "reached_50", "reached_75", "reached_100"] as const).map(
                        (key, idx) => {
                          const colours = [
                            "bg-blue-400",
                            "bg-green-400",
                            "bg-yellow-400",
                            "bg-primary",
                          ]
                          return (
                            <div key={key} className="flex items-center gap-1.5">
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${colours[idx]}`}
                                  style={{ width: funnelWidth(row[key], row.reached_25) }}
                                />
                              </div>
                            </div>
                          )
                        },
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
