"use client"

// A GitHub-style day-cell calendar heatmap, shared by every "one box per day" visualisation
// (GitHub contributions, Wakatime's daily activity calendar, Strava's activity calendar) so each
// stops hand-rolling its own div grid with its own intensity-class lookup and tooltip state.

import { useRef, useEffect } from "react"
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

  // A fixed pixel width sized to the real number of weeks in range, not "100%": at cellSize=12 a
  // full year is ~53 weeks * 13px ≈ 690px, wider than most phones. Squashing that into 100% width
  // (the old behaviour) shrinks every cell below a tappable, readable size on mobile. GitHub's own
  // calendar instead stays at its real size and scrolls horizontally, so this does the same - the
  // wrapping div below carries the scroll, this chart just reports its true content width.
  const weeks = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (7 * 86400000)) + 1
  const chartWidth = weeks * (cellSize + 1) + 40

  // A scroll container defaults to its start (oldest day) on mount, but the most recent day is
  // what actually matters at a glance - GitHub's own mobile calendar opens already scrolled to
  // today for the same reason. Scrolling to the end covers both a container narrower than the
  // chart (real scrolling) and one already as wide as the chart (a harmless no-op).
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [chartWidth])

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

  return (
    <div>
      {/* Horizontally scrollable at the chart's real content width, not squashed to the card's
          width - a full year of 12px cells only fits most phones by scrolling, the same way
          GitHub's own contribution graph behaves on mobile. Stays within whichever padding the
          caller's own card uses (that varies, p-3 through p-5 across callers) rather than trying
          to bleed to the card edge, which would misalign against a caller using different padding. */}
      <div ref={scrollRef} className="overflow-x-auto">
        <ReactECharts
          option={option}
          style={{ height, width: chartWidth }}
          opts={{ renderer: "svg" }}
          notMerge
        />
      </div>
      {/* ECharts' own visualMap legend is deliberately hidden above (show: false) since its default
          layout doesn't fit this card style, which left every calendar on the site with no way to
          tell what a colour actually means. Swatched straight from `scale`, the same array the
          chart itself colours by, so a custom scale (Strava's orange) never drifts out of sync
          with what this shows. Kept outside the scroll container since it is a static legend, not
          tied to any specific day cell. */}
      <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {scale.map((c, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
