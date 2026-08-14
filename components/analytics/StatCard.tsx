// Small stat box: label + big number, optionally with a trend indicator. Replaces the
// hand-rolled "border rounded-lg p-4 bg-card" pattern duplicated across CodingClient,
// ApplicationsAnalytics and the dashboard home page.

import { TrendIndicator } from "./TrendIndicator"

// Compact, self-scaling (min-max normalised) sparkline - unlike LiveStatusCards' own Sparkline,
// which is fixed to a 0-100 percentage scale, a StatCard's series can be any unit (£, count,
// minutes), so it stretches to fill its own value range rather than assuming a known ceiling.
function StatCardSparkline({ data }: { data: number[] }) {
  const VW = 64
  const VH = 20
  const pts = data.length === 0 ? [0, 0] : data.length === 1 ? [data[0], data[0]] : data
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const step = VW / (pts.length - 1)
  const coords = pts.map((v, i) => [i * step, VH - ((v - min) / range) * VH] as const)
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(2)}`).join(" ")
  const area = `0,${VH} ${line} ${VW},${VH}`
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="block h-5 w-16 shrink-0 overflow-visible text-primary" aria-hidden>
      <polygon points={area} fill="currentColor" fillOpacity={0.15} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function StatCard({
  label,
  value,
  trend,
  accentClassName,
  scope,
  sparkline,
}: {
  label: string
  value: string | number
  trend?: { delta: number; label?: string }
  accentClassName?: string
  // Marks a card that does NOT follow the page's period selector - a wording choice like "Current
  // weight" or "Total habits" was the only signal before this, easy to miss beside cards that DO
  // move with the selector in the same grid. A small badge is a real visual distinguisher instead
  // of relying on every page remembering the right words.
  scope?: "all-time" | "current"
  // Optional period-over-period series (oldest first) rendered as a compact trend line beside the
  // value. Needs at least 2 points to read as a trend; a shorter/empty array is simply omitted.
  sparkline?: number[]
}) {
  return (
    <div className={`border border-border rounded-lg p-4 bg-card ${accentClassName ?? ""}`}>
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {scope && (
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 border border-border/50 rounded px-1 leading-tight">
            {scope}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && <TrendIndicator delta={trend.delta} label={trend.label} />}
        </div>
        {sparkline && sparkline.length >= 2 && <StatCardSparkline data={sparkline} />}
      </div>
    </div>
  )
}
