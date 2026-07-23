"use client"

// An hour-of-day x day-of-week grid heatmap, shared by every "when during the week" visualisation
// (Wakatime's coding-hours matrix, the blog's read-time matrix) so each stops hand-rolling its own
// 7x24 div grid with its own intensity-class lookup and manual hover/tooltip state.

import ReactECharts from "echarts-for-react"
import { useEChartsColours, intensityScale, relativeLevel } from "./echarts-theme"

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
// ECharts renders a category y-axis with data[0] at the BOTTOM and data[length-1] at the TOP (the
// opposite of a category x-axis), so a Monday-first array put Sunday at the top of the grid. This
// is Monday-first read top-to-bottom instead.
const Y_AXIS_DAY_LABELS = [...DAY_LABELS].reverse()
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => (h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`))

export interface GridHeatmapDatum {
  day: number // 0 = Monday .. 6 = Sunday
  hour: number // 0-23
  value: number
}

interface GridHeatmapProps {
  data: GridHeatmapDatum[]
  height?: number
  valueLabel?: string
  valueFormatter?: (value: number) => string
  colourScale?: string[]
}

export function GridHeatmap({
  data,
  height = 220,
  valueLabel = "",
  valueFormatter,
  colourScale,
}: GridHeatmapProps) {
  const colours = useEChartsColours()
  const scale = colourScale ?? intensityScale(colours)
  // Defends against NaN/null reaching ECharts (e.g. a sparse upstream array with a missing hour) -
  // an unmappable value renders as a solid, uncoloured block instead of quietly becoming 0.
  const safe = data.map((d) => ({ ...d, value: Number.isFinite(d.value) ? d.value : 0 }))
  const max = Math.max(...safe.map((d) => d.value), 1)

  const option = {
    tooltip: {
      formatter: (p: { data: { value: [number, number, number]; raw: number } }) => {
        const [hour, yPos] = p.data.value
        const formatted = valueFormatter ? valueFormatter(p.data.raw) : p.data.raw.toLocaleString()
        return `${DAY_LABELS[6 - yPos]} ${HOUR_LABELS[hour]}<br/>${formatted}${valueLabel ? ` ${valueLabel}` : ""}`
      },
      backgroundColor: colours.card,
      borderColor: colours.border,
      textStyle: { color: colours.foreground, fontSize: 11 },
    },
    grid: { height: "70%", top: "5%", left: "8%", right: "2%" },
    xAxis: {
      type: "category",
      data: HOUR_LABELS,
      splitArea: { show: true, areaStyle: { color: [colours.card, colours.muted] } },
      axisLabel: { color: colours.mutedForeground, fontSize: 9, interval: 2 },
      axisLine: { lineStyle: { color: colours.border } },
    },
    yAxis: {
      type: "category",
      data: Y_AXIS_DAY_LABELS,
      splitArea: { show: true, areaStyle: { color: [colours.card, colours.muted] } },
      axisLabel: { color: colours.mutedForeground, fontSize: 10 },
      axisLine: { lineStyle: { color: colours.border } },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 4,
      calculable: false,
      inRange: { color: scale },
    },
    series: [
      {
        type: "heatmap",
        // Coloured by a 0-4 bucket relative to this grid's own max, not the raw value on a linear
        // scale - one outlier hour would otherwise compress every other real value into the
        // bottom sliver of the range, reading as "basically empty" everywhere except the peak.
        data: safe.map((d) => ({ value: [d.hour, 6 - d.day, relativeLevel(d.value, max)], raw: d.value })),
        itemStyle: { borderWidth: 2, borderColor: colours.card },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
}
