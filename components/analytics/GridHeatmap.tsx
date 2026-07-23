"use client"

// An hour-of-day x day-of-week grid heatmap, shared by every "when during the week" visualisation
// (Wakatime's coding-hours matrix, the blog's read-time matrix) so each stops hand-rolling its own
// 7x24 div grid with its own intensity-class lookup and manual hover/tooltip state.

import ReactECharts from "echarts-for-react"
import { useEChartsColours, intensityScale } from "./echarts-theme"

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
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
  const max = Math.max(...data.map((d) => d.value), 1)

  const option = {
    tooltip: {
      formatter: (p: { data: [number, number, number] }) => {
        const [hour, day, value] = p.data
        const formatted = valueFormatter ? valueFormatter(value) : value.toLocaleString()
        return `${DAY_LABELS[day]} ${HOUR_LABELS[hour]}<br/>${formatted}${valueLabel ? ` ${valueLabel}` : ""}`
      },
      backgroundColor: colours.card,
      borderColor: colours.border,
      textStyle: { color: colours.foreground, fontSize: 11 },
    },
    grid: { height: "70%", top: "5%", left: "8%", right: "2%" },
    xAxis: {
      type: "category",
      data: HOUR_LABELS,
      splitArea: { show: true },
      axisLabel: { color: colours.mutedForeground, fontSize: 9, interval: 2 },
      axisLine: { lineStyle: { color: colours.border } },
    },
    yAxis: {
      type: "category",
      data: DAY_LABELS,
      splitArea: { show: true },
      axisLabel: { color: colours.mutedForeground, fontSize: 10 },
      axisLine: { lineStyle: { color: colours.border } },
    },
    visualMap: {
      show: false,
      min: 0,
      max,
      calculable: false,
      inRange: { color: scale },
    },
    series: [
      {
        type: "heatmap",
        data: data.map((d) => [d.hour, d.day, d.value]),
        itemStyle: { borderWidth: 2, borderColor: colours.background },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
}
