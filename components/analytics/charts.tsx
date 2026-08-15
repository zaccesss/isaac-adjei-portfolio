"use client"

// Thin recharts wrappers themed from the existing dashboard convention (hsl(var(--border))
// gridlines, hsl(var(--primary)) default series colour, hsl(var(--muted)) tooltip cursor) -
// see CodingClient.tsx for the pattern this mirrors. Sections migrating onto the shared
// analytics framework (Coding, Blog, Modules, Applications) use these instead of importing
// recharts primitives directly, so chart styling stays consistent in one place.

import * as React from "react"
import {
  LineChart as RLineChart, Line, BarChart as RBarChart, Bar,
  PieChart as RPieChart, Pie, Cell, Sector,
  Treemap as RTreemap, Sankey as RSankey,
  RadarChart as RRadarChart, Radar as RRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart as RComposedChart,
  ScatterChart as RScatterChart, Scatter, ZAxis,
  AreaChart as RAreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

// 16 swatches, chosen for real contrast against both the light and dark card backgrounds -
// verified pairwise distinguishable, not just individually legible. hsl(var(--primary)) stays
// first so single-series charts keep their existing default colour unchanged.
export const DEFAULT_CHART_COLOURS = [
  "hsl(var(--primary))",
  "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6",
  "#3b82f6", "#eab308", "#a855f7", "#10b981",
  "#f43f5e", "#0ea5e9", "#84cc16",
]

type ChartDatum = Record<string, string | number>

// Themed tooltip matching the dashboard card/border tokens
function ThemedTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: { name: string; value: number; color?: string }[]
  label?: string
  valueFormatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
      {label && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5 py-0.5">
          {p.color && (
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          )}
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">
            {valueFormatter && typeof p.value === "number" ? valueFormatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LineChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  valueFormatter,
  dots = false,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
  // Show a marker at every data point. Helps when there are only a few points so each one is
  // visible rather than reading as a bare line. The dots do not force every x label to render:
  // labels always preserve the first and last and thin the middle to a readable gap, so a dense
  // series (e.g. many activities) no longer crowds its labels into an unreadable strip.
  dots?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={dots ? 22 : 5} />
        <YAxis hide />
        <Tooltip
          content={({ active, payload, label }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p) => ({ name: String(p.name ?? dataKey), value: Number(p.value ?? 0), color: colour }))}
              label={String(label ?? "")}
              valueFormatter={valueFormatter}
            />
          )}
          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={colour} strokeWidth={2} dot={dots ? { r: 3, fill: colour, strokeWidth: 0 } : false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </RLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({
  data,
  dataKey,
  xKey = "name",
  height = 160,
  colour = "hsl(var(--primary))",
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
  interval = "preserveStartEnd",
  legend = false,
  name,
  hideXAxisTicks = false,
}: {
  data: ChartDatum[]
  dataKey: string
  xKey?: string
  height?: number
  colour?: string
  // Palette used when `legend` is on, so each category bar matches its slice in the paired pie.
  colours?: string[]
  valueFormatter?: (value: number) => string
  // XAxis tick strategy. Defaults to preserveStartEnd so the first and last category labels
  // always render; recharts' own default is preserveEnd, which silently drops the leading ones.
  interval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"
  // Colour each bar by category and show a matching legend, so a single-series bar reads like
  // the donut it sits next to. Off by default so the plain single-colour bars stay unchanged.
  legend?: boolean
  // Series label shown in the tooltip (falls back to the data key).
  name?: string
  // Hides the permanent X-axis category labels entirely, for charts with too many bars for any
  // label strategy to fit legibly. The tooltip still names each bar on hover, so nothing is lost.
  hideXAxisTicks?: boolean
}) {
  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} barSize={legend ? undefined : 6} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey={xKey} tick={hideXAxisTicks ? false : { fontSize: 10 }} tickLine={false} axisLine={false} interval={interval} />
          <YAxis hide />
          <Tooltip
            content={({ active, payload, label }) => (
              <ThemedTooltip
                active={active}
                payload={payload?.map((p, i) => ({ name: String(name ?? p.name ?? dataKey), value: Number(p.value ?? 0), color: legend ? colours[i % colours.length] : colour }))}
                label={String(label ?? "")}
                valueFormatter={valueFormatter}
              />
            )}
            cursor={{ fill: "hsl(var(--muted))", radius: 3 }}
          />
          <Bar dataKey={dataKey} fill={colour} radius={[3, 3, 0, 0]}>
            {legend && data.map((d, i) => <Cell key={String(d[xKey])} fill={colours[i % colours.length]} />)}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
      {/* When legend is on the bars are per-category colours, so a swatch list matching the
          neighbouring donut labels them the same way the pie's legend does. */}
      {legend && (
        <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {data.map((d, i) => (
            <li key={String(d[xKey])} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: colours[i % colours.length] }} />
              {String(d[xKey])}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Active slice shape - expands the hovered segment outward by 6px.
// Spread as `any` below because recharts v3 types do not declare activeIndex/activeShape
// on <Pie> even though both work at runtime.
// eslint-disable @typescript-eslint/no-explicit-any
function ActiveSlice(props: any) {
  return <Sector {...props} outerRadius={props.outerRadius + 6} />
}
type PieActiveProps = any
// eslint-enable @typescript-eslint/no-explicit-any

export function PieChart({
  data,
  height = 200,
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  data: { name: string; value: number; colour?: string }[]
  height?: number
  colours?: string[]
  valueFormatter?: (value: number) => string
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Pie
          {...({ activeIndex, activeShape: ActiveSlice } as PieActiveProps)}
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.colour ?? colours[i % colours.length]}
              opacity={activeIndex === undefined || activeIndex === i ? 1 : 0.45}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p, i) => ({
                name: String(p.name ?? ""),
                value: Number(p.value ?? 0),
                color: (p.payload as { colour?: string })?.colour ?? colours[i % colours.length],
              }))}
              valueFormatter={valueFormatter}
            />
          )}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>}
        />
      </RPieChart>
    </ResponsiveContainer>
  )
}

// Recharts renders the Treemap's own wrapping root as depth 0 with no real name/value - only
// its children (depth 1) are the actual leaf boxes this chart is meant to show, so depth 0 is
// skipped entirely rather than drawn as an empty outer rectangle.
function TreemapCell(props: { depth?: number; x?: number; y?: number; width?: number; height?: number; name?: string; value?: number; index?: number; colours: string[]; valueFormatter?: (v: number) => string; payload?: { value?: number } }) {
  const { depth, x = 0, y = 0, width = 0, height = 0, name, value: sizedValue, payload, index = 0, colours, valueFormatter } = props
  // The real (untransformed) value lives on payload.value when a caller sizes cells on a
  // transformed scale (e.g. Treemap's own sqrt scaling below) - fall back to the raw `value` prop
  // for callers that pass real values directly.
  const value = payload?.value ?? sizedValue
  if (!depth) return null
  const fill = colours[index % colours.length]
  const showLabel = width > 46 && height > 22
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="hsl(var(--card))" strokeWidth={2} rx={3} />
      {showLabel && (
        <>
          <text x={x + 6} y={y + 15} fontSize={11} fontWeight={600} fill="#fff">
            {name}
          </text>
          {height > 38 && (
            <text x={x + 6} y={y + 29} fontSize={10} fill="rgba(255,255,255,0.8)">
              {valueFormatter && typeof value === "number" ? valueFormatter(value) : value}
            </text>
          )}
        </>
      )}
    </g>
  )
}

export function Treemap({
  data,
  height = 240,
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  data: { name: string; value: number }[]
  height?: number
  colours?: string[]
  valueFormatter?: (value: number) => string
}) {
  // Cells are sized on a square-root scale rather than the raw value: real-world grouped counts
  // here (e.g. runs per repo) can be dominated by one or two very high-frequency jobs living
  // alongside many low-frequency ones, which on a linear scale draws one cell that swallows
  // nearly the whole chart and leaves everything else an unreadable sliver. sqrt keeps the
  // ordering and "meaningfully bigger" signal while compressing that skew into a readable layout.
  // The real value is untouched for the label and tooltip - only the layout math is transformed.
  const sized = data.map((d) => ({ ...d, sqrtValue: Math.sqrt(Math.max(d.value, 0)) }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RTreemap
        data={sized}
        dataKey="sqrtValue"
        nameKey="name"
        aspectRatio={4 / 3}
        isAnimationActive={false}
        content={(props) => <TreemapCell {...(props as { value?: number; payload?: { value?: number } })} value={(props as { payload?: { value?: number } }).payload?.value} colours={colours} valueFormatter={valueFormatter} />}
      >
        <Tooltip
          content={({ active, payload }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p, i) => ({ name: String(p.payload?.name ?? ""), value: Number(p.payload?.value ?? 0), color: colours[i % colours.length] }))}
              valueFormatter={valueFormatter}
            />
          )}
        />
      </RTreemap>
    </ResponsiveContainer>
  )
}

// Recharts requires each node/link to reference the other by array index rather than accepting
// arbitrary keyed data (unlike every other chart here) - the caller builds { nodes, links } once
// and this just themes and sizes the result.
export interface SankeyChartData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

export function Sankey({
  data,
  height = 280,
  nodeColours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  data: SankeyChartData
  height?: number
  nodeColours?: string[]
  valueFormatter?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RSankey
        data={data}
        nodePadding={14}
        nodeWidth={10}
        // Generous left/right margin, since node labels render outside the node rects (source
        // labels to the left of the chart, terminal labels to the right) rather than inside them -
        // the nodes themselves are only 10px wide, nowhere near enough to hold a name.
        margin={{ top: 8, right: 90, bottom: 8, left: 90 }}
        link={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.25 }}
        node={(props) => {
          const p = props as any
          // A node with no outgoing links is a terminal (rightmost) node, so its label goes on the
          // left instead - otherwise every terminal label would run off the right edge of the
          // chart. sourceLinks/targetLinks come from recharts' own computed Sankey layout, not
          // something this component builds itself.
          const isTerminal = (p.payload?.sourceLinks?.length ?? 0) === 0
          return (
            <g>
              <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={nodeColours[p.index % nodeColours.length]} rx={2} />
              <text
                x={isTerminal ? p.x - 6 : p.x + p.width + 6}
                y={p.y + p.height / 2}
                dy="0.32em"
                textAnchor={isTerminal ? "end" : "start"}
                fontSize={11}
                fill="hsl(var(--foreground))"
              >
                {p.payload?.name}
              </text>
            </g>
          )
        }}
      >
        <Tooltip
          content={({ active, payload }) => {
            const entry = payload?.[0]?.payload as any
            if (!active || !entry) return null
            const isLink = entry.source !== undefined && entry.target !== undefined
            const label = isLink ? `${entry.source.name} -> ${entry.target.name}` : entry.name
            const value = isLink ? entry.value : entry.value
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-muted-foreground">{valueFormatter ? valueFormatter(value) : value}</p>
              </div>
            )
          }}
        />
      </RSankey>
    </ResponsiveContainer>
  )
}

export function Radar({
  data,
  dataKey,
  nameKey = "name",
  height = 240,
  colour = "hsl(var(--primary))",
  valueFormatter,
  max,
}: {
  data: ChartDatum[]
  dataKey: string
  nameKey?: string
  height?: number
  colour?: string
  valueFormatter?: (value: number) => string
  // Radius axis max. Defaults to recharts' own auto-scale ("auto") when omitted - pass a fixed
  // value (e.g. 100 for a percentage) so multiple radars on the same page share one scale.
  max?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RRadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
        <PolarRadiusAxis domain={max != null ? [0, max] : undefined} tick={false} axisLine={false} />
        <RRadar dataKey={dataKey} stroke={colour} fill={colour} fillOpacity={0.35} />
        <Tooltip
          content={({ active, payload, label }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p) => ({ name: String(p.payload?.[nameKey] ?? label ?? dataKey), value: Number(p.value ?? 0), color: colour }))}
              label={String(label ?? "")}
              valueFormatter={valueFormatter}
            />
          )}
        />
      </RRadarChart>
    </ResponsiveContainer>
  )
}
export function Composed({
  data,
  xKey = "name",
  barKey,
  lineKey,
  height = 200,
  barColour = "hsl(var(--primary))",
  lineColour = "#f59e0b",
  valueFormatter,
  barValueFormatter,
  lineValueFormatter,
  barName,
  lineName,
}: {
  data: ChartDatum[]
  xKey?: string
  barKey: string
  lineKey: string
  height?: number
  barColour?: string
  lineColour?: string
  valueFormatter?: (value: number) => string
  barValueFormatter?: (value: number) => string
  lineValueFormatter?: (value: number) => string
  barName?: string
  lineName?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RComposedChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis yAxisId="bar" hide />
        <YAxis yAxisId="line" orientation="right" hide />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs">
                {label && <p className="mb-1.5 font-medium text-foreground">{String(label)}</p>}
                {payload.map((p) => {
                  const isBar = p.dataKey === barKey
                  const value = Number(p.value ?? 0)
                  const format = isBar ? (barValueFormatter ?? valueFormatter) : (lineValueFormatter ?? valueFormatter)
                  return (
                    <div key={String(p.dataKey)} className="flex items-center gap-1.5 py-0.5">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: isBar ? barColour : lineColour }} />
                      <span className="text-muted-foreground">{isBar ? (barName ?? barKey) : (lineName ?? lineKey)}:</span>
                      <span className="font-medium text-foreground">{format ? format(value) : value}</span>
                    </div>
                  )
                })}
              </div>
            )
          }}
          cursor={{ fill: "hsl(var(--muted))", radius: 3 }}
        />
        <Bar yAxisId="bar" dataKey={barKey} fill={barColour} radius={[3, 3, 0, 0]} barSize={10} />
        <Line yAxisId="line" type="monotone" dataKey={lineKey} stroke={lineColour} strokeWidth={2} dot={false} />
      </RComposedChart>
    </ResponsiveContainer>
  )
}

export function Bubble({
  data,
  xKey,
  yKey,
  zKey,
  height = 220,
  colour = "hsl(var(--primary))",
  xFormatter,
  yFormatter,
  zFormatter,
  xLabel,
  yLabel,
}: {
  data: ChartDatum[]
  xKey: string
  yKey: string
  // Drives bubble size - omit for a plain scatter with uniform-sized points.
  zKey?: string
  height?: number
  colour?: string
  xFormatter?: (value: number) => string
  yFormatter?: (value: number) => string
  zFormatter?: (value: number) => string
  xLabel?: string
  yLabel?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          dataKey={xKey}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          name={xLabel}
          tickFormatter={xFormatter ? (v) => xFormatter(Number(v)) : undefined}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          name={yLabel}
          tickFormatter={yFormatter ? (v) => yFormatter(Number(v)) : undefined}
        />
        {zKey && <ZAxis type="number" dataKey={zKey} range={[40, 400]} name={zKey} />}
        <Tooltip
          content={({ active, payload }) => {
            const p = payload?.[0]?.payload as ChartDatum | undefined
            if (!active || !p) return null
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-md text-xs space-y-0.5">
                <p className="text-muted-foreground">
                  {xLabel ?? xKey}: <span className="font-medium text-foreground">{xFormatter ? xFormatter(Number(p[xKey])) : p[xKey]}</span>
                </p>
                <p className="text-muted-foreground">
                  {yLabel ?? yKey}: <span className="font-medium text-foreground">{yFormatter ? yFormatter(Number(p[yKey])) : p[yKey]}</span>
                </p>
                {zKey && (
                  <p className="text-muted-foreground">
                    {zKey}: <span className="font-medium text-foreground">{zFormatter ? zFormatter(Number(p[zKey])) : p[zKey]}</span>
                  </p>
                )}
              </div>
            )
          }}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter data={data} fill={colour} fillOpacity={0.65} />
      </RScatterChart>
    </ResponsiveContainer>
  )
}

export function StackedArea({
  data,
  xKey = "name",
  series,
  height = 220,
  colours = DEFAULT_CHART_COLOURS,
  valueFormatter,
}: {
  data: ChartDatum[]
  xKey?: string
  // Each series' own dataKey + display name, stacked bottom to top in the order given.
  series: { key: string; name: string }[]
  height?: number
  colours?: string[]
  valueFormatter?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis hide />
        <Tooltip
          content={({ active, payload, label }) => (
            <ThemedTooltip
              active={active}
              payload={payload?.map((p) => {
                const s = series.find((s) => s.key === p.dataKey)
                const i = series.findIndex((s) => s.key === p.dataKey)
                return { name: s?.name ?? String(p.dataKey), value: Number(p.value ?? 0), color: colours[i % colours.length] }
              })}
              label={String(label ?? "")}
              valueFormatter={valueFormatter}
            />
          )}
        />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stackId="1"
            stroke={colours[i % colours.length]}
            fill={colours[i % colours.length]}
            fillOpacity={0.55}
          />
        ))}
      </RAreaChart>
    </ResponsiveContainer>
  )
}
