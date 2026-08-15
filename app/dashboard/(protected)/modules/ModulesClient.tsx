"use client"
// I export the Assessment and Module types from here so ModulesYearClient and other
// sub-components can share the same definitions without a separate types file.
// YEAR_ORDER is explicit so the accordion always renders 1-2-3-4 regardless of DB insertion order.

import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// I keep the Assessment and Module types here because they are shared with ModulesYearClient
export type Assessment = {
  id: string
  name: string
  type: string | null
  weight_percent: number | null  // null for pass/fail assessments which have no percentage weight
  mark_achieved: number | null   // null when the result has not yet been released
  mark_max: number | null
  target_mark: number | null
  date: string | null
  week: string | null            // free-text week label e.g. "Week 6" - I store this separately from the date
  is_pass_fail: boolean
  my_notes: string | null
}

export type Module = {
  id: string
  code: string | null
  name: string
  credits: number | null
  year: number | null
  semester: number | null
  status: string
  summary: string | null
  rules: string | null
  assessments: Assessment[]     // I nest assessments on the module rather than fetching them separately
}

// I define year order explicitly so it is always 1→2→3→4 regardless of insertion order in the DB
const YEAR_ORDER = [1, 2, 3, 4]

const YEAR_LABELS: Record<number, string> = {
  1: "Year 1 - Stage 1 (Level 4)",
  2: "Year 2 - Stage 2 (Level 5)",
  3: "Placement Year (Optional)",
  4: "Final Year - Stage F (Level 6)",
}

const YEAR_SLUGS: Record<number, string> = {
  1: "year-1",
  2: "year-2",
  3: "placement",
  4: "final-year",
}

// I compute the weighted mark purely from the assessments array in local state
// so any edits are reflected instantly without a DB round trip
export function calcMark(assessments: Pick<Assessment, "is_pass_fail" | "mark_achieved" | "weight_percent" | "mark_max">[]): number | null {
  // I exclude pass/fail assessments because they do not contribute to the module percentage mark
  const graded = assessments.filter((a) => !a.is_pass_fail && a.mark_achieved != null && a.weight_percent != null && a.mark_max != null)
  if (!graded.length) return null
  // I calculate weighted average: for each assessment (mark / max) * weight, then sum
  const total = graded.reduce((s, a) => s + (a.mark_achieved! / a.mark_max!) * a.weight_percent!, 0)
  return Math.round(total * 100) / 100
}

// I map raw marks to UK classification labels so the display is meaningful at a glance
export function classLabel(mark: number | null): string {
  if (mark == null) return "-"
  if (mark >= 80) return "First"
  if (mark >= 60) return "2:1"
  if (mark >= 40) return "2:2"
  return "Fail"
}

// I use Tailwind colour classes to make the grade obvious without reading the number
export function markColour(mark: number | null): string {
  if (mark == null) return "text-muted-foreground"
  if (mark >= 80) return "text-green-600 dark:text-green-400"
  if (mark >= 60) return "text-blue-600 dark:text-blue-400"
  if (mark >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

// I keep badge colours in a separate function from markColour because badges need background + text
export function classBadge(mark: number | null): string {
  if (mark == null) return "bg-muted text-muted-foreground"
  if (mark >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  if (mark >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  if (mark >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
}

// I abstract the stats grid into a reusable component because it appears at both the module and year level
export function StatsBar({ label, stats }: { label: string; stats: { label: string; value: string; colour?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label: l, value, colour }) => (
          <div key={l} className="border border-border rounded-lg p-3 bg-card flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{l}</span>
            <span className={`font-semibold text-sm ${colour ?? ""}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// I compute year-level stats here rather than in YearCard so the logic is in one place
function yearStats(mods: Module[]) {
  const completed = mods.filter((m) => m.status === "complete")
  // I filter out null marks before averaging so incomplete modules do not drag the average down to zero
  const marks = completed.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  if (!marks.length) return null
  const avg = parseFloat((marks.reduce((s, x) => s + x, 0) / marks.length).toFixed(2))
  const credits = completed.reduce((s, m) => s + (m.credits ?? 0), 0)
  const totalCredits = mods.reduce((s, m) => s + (m.credits ?? 0), 0)
  return { avg, credits, totalCredits, done: completed.length, total: mods.length }
}

function YearCard({ year, mods }: { year: number; mods: Module[] }) {
  const ys = yearStats(mods)
  const label = YEAR_LABELS[year] ?? `Year ${year}`
  const slug = YEAR_SLUGS[year]

  // I link to the year sub-page so modules and assessments have their own route
  return (
    <Link
      href={`/dashboard/modules/${slug}`}
      className="block border border-border rounded-xl p-5 bg-card hover:shadow-md transition-all"
    >
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{mods.length} module{mods.length !== 1 ? "s" : ""}</p>
      {ys ? (
        // I show the key numbers inline so I can compare years at a glance without drilling in
        <div className="mt-3 flex gap-4 text-xs flex-wrap">
          <span className={`font-semibold ${markColour(ys.avg)}`}>{ys.avg}%</span>
          <span className="text-muted-foreground">{classLabel(ys.avg)}</span>
          <span className="text-muted-foreground">{ys.credits}/{ys.totalCredits} credits</span>
          <span className="text-muted-foreground">{ys.done}/{ys.total} done</span>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No completed modules yet</p>
      )}
    </Link>
  )
}

export default function ModulesClient({ modules }: { modules: Module[] }) {
  // I filter to only years that have at least one module so empty year cards never appear
  const yearsPresent = YEAR_ORDER.filter((y) => modules.some((m) => m.year === y))

  // I compute master stats across all completed modules for the overview banner
  const allCompleted = modules.filter((m) => m.status === "complete")
  const allMarks = allCompleted.map((m) => calcMark(m.assessments)).filter((x): x is number => x != null)
  const masterAvg = allMarks.length ? parseFloat((allMarks.reduce((s, x) => s + x, 0) / allMarks.length).toFixed(2)) : null
  const masterCredits = allCompleted.reduce((s, m) => s + (m.credits ?? 0), 0)
  const totalCredits = modules.reduce((s, m) => s + (m.credits ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <h1 className="text-xl font-semibold">Modules</h1>

      {/* I only show the master stats bar when there is at least one completed module with a mark */}
      {masterAvg != null && (
        <StatsBar label="Overall" stats={[
          { label: "Overall average", value: `${masterAvg}%`, colour: markColour(masterAvg) },
          { label: "Classification", value: classLabel(masterAvg) },
          { label: "Total credits", value: `${masterCredits} / ${totalCredits}` },
          { label: "Modules done", value: `${allCompleted.length} / ${modules.length}` },
        ]} />
      )}

      <div className="flex flex-col gap-3">
        {yearsPresent.map((year) => (
          <YearCard key={year} year={year} mods={modules.filter((m) => m.year === year)} />
        ))}
        {/* I always show a placeholder for year 3 (placement) so I remember to track it when the time comes */}
        {!yearsPresent.includes(3) && (
          <div className="border border-dashed border-border rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground">Placement Year - not started</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add modules with year 3 to track your placement</p>
          </div>
        )}
      </div>
    </div>
  )
}

// I export this so ModulesYearClient can use the same Badge import without re-importing
export { Badge }
