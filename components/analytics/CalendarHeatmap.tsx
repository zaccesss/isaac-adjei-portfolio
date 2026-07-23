"use client"

// A GitHub-style day-cell calendar heatmap, shared by every "one box per day" visualisation
// (GitHub contributions, Wakatime's daily activity calendar, Strava's activity calendar) so each
// stops hand-rolling its own div grid with its own intensity-class lookup and tooltip state.

import ReactECharts from "echarts-for-react"
import { useEChartsColours, intensityScale, relativeLevel } from "./echarts-theme"

export interface CalendarHeatmapDatum {
  date: string // "YYYY-MM-DD"
  value: number
}

interface CalendarHeatmapProps {
  data: CalendarHeatmapDatum[]
  // Inclusive ["YYYY-MM-DD", "YYYY-MM-DD"] range to render. Defaults to the last 365 days ending
  // on the latest date present in `data` (or today, if `data` is empty).
  range?: [string, string]
  height?: number
  cellSize?: number
  valueLabel?: string
  valueFormatter?: (value: number) => string
  colourScale?: string[]
}

function defaultRange(data: CalendarHeatmapDatum[]): [string, string] {
  const latest = data.length ? data.reduce((a, b) => (a.date > b.date ? a : b)).date : new Date().toISOString().slice(0, 10)
  const end = new Date(latest)
  const start = new Date(end)
  start.setDate(start.getDate() - 364)
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
}

export function CalendarHeatmap({
  data,
  range,
  height = 180,
  cellSize = 12,
  valueLabel = "",
  valueFormatter,
  colourScale,
}: CalendarHeatmapProps) {
  const colours = useEChartsColours()
  const scale = colourScale ?? intensityScale(colours)
  const [start, end] = range ?? defaultRange(data)
  // Defends against NaN/null reaching ECharts (e.g. a sparse upstream array with a missing day) -
  // an unmappable value renders as a solid, uncoloured block instead of quietly becoming 0.
  const safe = data.map((d) => ({ ...d, value: Number.isFinite(d.value) ? d.value : 0 }))
  const max = Math.max(...safe.map((d) => d.value), 1)

  const option = {
    tooltip: {
      formatter: (p: { data: { value: [string, number]; raw: number } }) => {
        const [date] = p.data.value
        const formatted = valueFormatter ? valueFormatter(p.data.raw) : p.data.raw.toLocaleString()
        return `${date}<br/>${formatted}${valueLabel ? ` ${valueLabel}` : ""}`
      },
      backgroundColor: colours.card,
      borderColor: colours.border,
      textStyle: { color: colours.foreground, fontSize: 11 },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 4,
      calculable: false,
      inRange: { color: scale },
    },
    calendar: {
      range: [start, end],
      cellSize: [cellSize, cellSize],
      splitLine: { show: false },
      itemStyle: { borderWidth: 2, borderColor: colours.card, color: colours.border },
      yearLabel: { show: false },
      monthLabel: { color: colours.mutedForeground, fontSize: 10 },
      dayLabel: { color: colours.mutedForeground, fontSize: 10, firstDay: 1, nameMap: "en" },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        // Coloured by a 0-4 bucket relative to this calendar's own max, not the raw value on a
        // linear scale - one outlier day would otherwise compress every other real day into the
        // bottom sliver of the range, reading as "basically empty" everywhere except the peak.
        data: safe.map((d) => ({ value: [d.date, relativeLevel(d.value, max)], raw: d.value })),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
}
