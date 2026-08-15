"use client"

// Box-and-whisker plot and histogram, both hand-drawn as themed SVG (recharts has neither
// natively) but backed by d3-array's quantile/bin for the actual statistics rather than
// hand-rolled percentile maths, which is easy to get subtly wrong at the edges.
import { quantile, bin as d3bin, min as d3min, max as d3max } from "d3-array"

export interface BoxPlotGroup {
  name: string
  values: number[]
}

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25) ?? 0
  const median = quantile(sorted, 0.5) ?? 0
  const q3 = quantile(sorted, 0.75) ?? 0
  const iqr = q3 - q1
  const loFence = q1 - 1.5 * iqr
  const hiFence = q3 + 1.5 * iqr
  const whiskerLo = sorted.find((v) => v >= loFence) ?? sorted[0]
  const whiskerHi = [...sorted].reverse().find((v) => v <= hiFence) ?? sorted[sorted.length - 1]
  return { q1, median, q3, whiskerLo, whiskerHi }
}

export function BoxPlot({
  groups,
  height = 220,
  colour = "hsl(var(--primary))",
  valueFormatter,
}: {
  groups: BoxPlotGroup[]
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
}) {
  const withData = groups.filter((g) => g.values.length > 0)
  if (!withData.length) {
    return <p className="text-xs text-muted-foreground">No data for this period.</p>
  }
  const format = valueFormatter ?? ((v: number) => v.toFixed(1))
  const globalMin = d3min(withData.flatMap((g) => g.values)) ?? 0
  const globalMax = d3max(withData.flatMap((g) => g.values)) ?? 1
  const range = globalMax - globalMin || 1
  const padding = range * 0.08
  const lo = globalMin - padding
  const hi = globalMax + padding
  const toY = (v: number) => 100 - ((v - lo) / (hi - lo)) * 100

  const boxWidth = Math.min(60 / withData.length, 14)

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
        {withData.map((g, i) => {
          const s = stats(g.values)
          const x = ((i + 0.5) / withData.length) * 100
          return (
            <g key={g.name}>
              <line x1={x} x2={x} y1={toY(s.whiskerLo)} y2={toY(s.whiskerHi)} stroke={colour} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <rect
                x={x - boxWidth / 2}
                y={toY(s.q3)}
                width={boxWidth}
                height={Math.max(toY(s.q1) - toY(s.q3), 1)}
                fill={colour}
                fillOpacity={0.3}
                stroke={colour}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              >
                <title>{`${g.name}: median ${format(s.median)}, Q1 ${format(s.q1)}, Q3 ${format(s.q3)}`}</title>
              </rect>
              <line
                x1={x - boxWidth / 2}
                x2={x + boxWidth / 2}
                y1={toY(s.median)}
                y2={toY(s.median)}
                stroke={colour}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>
      <ul className="flex justify-around text-[10px] text-muted-foreground">
        {withData.map((g) => (
          <li key={g.name} className="truncate px-0.5">{g.name}</li>
        ))}
      </ul>
    </div>
  )
}

export function Histogram({
  values,
  height = 160,
  colour = "hsl(var(--primary))",
  thresholds = 10,
  valueFormatter,
}: {
  values: number[]
  height?: number
  colour?: string
  thresholds?: number
  valueFormatter?: (value: number) => string
}) {
  if (values.length === 0) {
    return <p className="text-xs text-muted-foreground">No data for this period.</p>
  }
  const format = valueFormatter ?? ((v: number) => v.toFixed(0))
  const bins = d3bin().thresholds(thresholds)(values)
  const maxCount = Math.max(...bins.map((b) => b.length), 1)

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {bins.map((b, i) => {
        const heightPct = (b.length / maxCount) * 100
        return (
          <div
            key={i}
            className="flex-1 min-w-[2px] rounded-t-sm"
            style={{ height: `${Math.max(heightPct, b.length > 0 ? 2 : 0)}%`, backgroundColor: colour }}
            title={`${format(b.x0 ?? 0)}-${format(b.x1 ?? 0)}: ${b.length}`}
          />
        )
      })}
    </div>
  )
}
