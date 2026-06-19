"use client"

import { useState, useMemo } from "react"
import { DollarSign } from "lucide-react"
import { statusTextClass, classifyFunnelStage } from "@/lib/application-status"

type App = {
  id: string
  company: string
  role: string
  status: string
  salary_range: string | null
  work_mode: string | null
  location: string | null
  type: string
}

// Parse a free-text salary_range string into a midpoint annual figure (null if unparseable)
function parseSalary(raw: string | null): number | null {
  if (!raw) return null
  const s = raw.toLowerCase().replace(/[,£$€]/g, "")
  const nums: number[] = []
  // Match "40k"-style entries and plain 4+-digit numbers
  for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*k\b/g)) {
    const n = parseFloat(m[1]) * 1000
    if (n >= 5000 && n <= 2_000_000) nums.push(n)
  }
  for (const m of s.matchAll(/\b(\d{4,})\b/g)) {
    const n = parseFloat(m[1])
    if (n >= 5000 && n <= 2_000_000) nums.push(n)
  }
  if (nums.length === 0) return null
  // Use midpoint of min and max found
  return (Math.min(...nums) + Math.max(...nums)) / 2
}

function formatSalaryLabel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toFixed(0)
}

type SortKey = "salary_desc" | "salary_asc" | "company"

export default function SalaryComparisonView({ apps }: { apps: App[] }) {
  const [filterStage, setFilterStage] = useState<"all" | "active">("all")
  const [sort, setSort] = useState<SortKey>("salary_desc")

  const staged = useMemo(() => {
    if (filterStage === "active") {
      return apps.filter((a) => {
        const s = classifyFunnelStage(a.status)
        return s === "interview" || s === "offer"
      })
    }
    return apps
  }, [apps, filterStage])

  const withSalary = useMemo(() => {
    const parsed = staged
      .map((a) => ({ ...a, parsed: parseSalary(a.salary_range) }))
      .filter((a) => a.parsed !== null) as (App & { parsed: number })[]

    if (sort === "salary_desc") return [...parsed].sort((a, b) => b.parsed - a.parsed)
    if (sort === "salary_asc") return [...parsed].sort((a, b) => a.parsed - b.parsed)
    return [...parsed].sort((a, b) => a.company.localeCompare(b.company))
  }, [staged, sort])

  const withoutSalary = useMemo(
    () => staged.filter((a) => parseSalary(a.salary_range) === null),
    [staged]
  )

  const maxSalary = withSalary.length > 0 ? Math.max(...withSalary.map((a) => a.parsed)) : 1

  if (staged.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
        <DollarSign className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">No applications to compare</p>
        <p className="text-xs mt-1">
          {filterStage === "active" ? "No applications at interview or offer stage." : "Add applications to see salary comparisons."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-3 flex-1 overflow-auto min-h-0">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setFilterStage("all")}
            className={`px-2.5 py-1 transition-colors ${filterStage === "all" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterStage("active")}
            className={`px-2.5 py-1 transition-colors ${filterStage === "active" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Interview and offer
          </button>
        </div>

        <div className="flex rounded-md border border-border overflow-hidden text-xs ml-auto">
          <button
            type="button"
            onClick={() => setSort("salary_desc")}
            title="Sort highest first"
            className={`px-2.5 py-1 transition-colors ${sort === "salary_desc" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Highest first
          </button>
          <button
            type="button"
            onClick={() => setSort("salary_asc")}
            title="Sort lowest first"
            className={`px-2.5 py-1 transition-colors ${sort === "salary_asc" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Lowest first
          </button>
          <button
            type="button"
            onClick={() => setSort("company")}
            title="Sort alphabetically"
            className={`px-2.5 py-1 transition-colors ${sort === "company" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            A to Z
          </button>
        </div>
      </div>

      {/* Ranked list */}
      {withSalary.length > 0 && (
        <div className="flex flex-col gap-2">
          {withSalary.map((app, i) => {
            const pct = Math.round((app.parsed / maxSalary) * 100)
            const stage = classifyFunnelStage(app.status)
            const isTop = sort === "salary_desc" ? i === 0 : sort === "salary_asc" ? i === withSalary.length - 1 : false
            return (
              <div key={app.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{app.company}</span>
                      {isTop && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Top offer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{app.role}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className={`text-xs font-semibold ${statusTextClass(app.status)}`}>{app.status}</span>
                    <span className="text-[11px] font-medium text-foreground tabular-nums">{app.salary_range}</span>
                  </div>
                </div>

                {/* Salary bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stage === "offer" ? "bg-emerald-500" : stage === "interview" ? "bg-blue-500" : "bg-muted-foreground/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
                    {formatSalaryLabel(app.parsed)}
                  </span>
                </div>

                {/* Meta */}
                {(app.location || app.work_mode) && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {app.location && <span>{app.location}</span>}
                    {app.location && app.work_mode && <span>·</span>}
                    {app.work_mode && <span>{app.work_mode}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Apps without salary info */}
      {withoutSalary.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            No salary listed ({withoutSalary.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {withoutSalary.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground">{app.company}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{app.role}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.salary_range && (
                    <span className="text-[10px] italic text-muted-foreground">{app.salary_range}</span>
                  )}
                  <span className={`text-[10px] ${statusTextClass(app.status)}`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {withSalary.length === 0 && withoutSalary.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          No salary figures could be parsed. Add salary ranges to your applications to see comparisons.
        </p>
      )}
    </div>
  )
}
