"use client"

// A circuit-board-styled isometric read of the same contribution data CalendarHeatmap renders
// flat - one extruded block per day, height and colour driven by the same relativeLevel() bucket
// the flat calendar uses, with the busiest days (level 4) lit like an LED on a real board. This
// file is dynamically imported without SSR by its caller, matching components/lab/PCBViewer.tsx's
// existing pattern for the only other three.js usage in this codebase.
import { useEffect, useMemo, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Bounds, Grid, Html, OrbitControls, useBounds } from "@react-three/drei"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { relativeLevel } from "./echarts-theme"
import type { CalendarHeatmapDatum } from "./CalendarHeatmap"

interface IsometricContributionCalendarProps {
  data: CalendarHeatmapDatum[]
  range?: [string, string]
  height?: number
  valueLabel?: string
  valueFormatter?: (value: number) => string
}

const CELL_SIZE = 0.82
const GAP = 0.18
const STEP = CELL_SIZE + GAP
const BASE_HEIGHT = 0.08
const LEVEL_HEIGHT_STEP = 0.32

// Two fixed PCB looks - a dark board for dark mode, a cream FR4-style board for light mode - rather
// than one permanently-dark board regardless of theme. A dark board sitting in an otherwise white
// light-mode page read as a jarring hole cut out of the page; a light board would equally have
// looked wrong dropped into dark mode. Neither ramp is derived from the site's own CSS custom
// properties (unlike the flat calendar's `useEChartsColours()`) - real circuit-board colours
// (FR4 green/cream, copper traces) don't map onto the site's blue-toned design tokens, so this
// stays its own small fixed palette, just doubled instead of singular.
const LIT_COLOUR = "#ffb020" // the busy-day LED glow reads well against either board, kept shared

interface IsometricPalette {
  board: string
  backdrop: string
  trace: string
  blocks: Record<0 | 1 | 2 | 3 | 4, string>
}

const PALETTES: Record<"light" | "dark", IsometricPalette> = {
  dark: {
    board: "#0b3d2e",
    backdrop: "#031510",
    trace: "#3f7a63",
    blocks: { 0: "#134e3f", 1: "#1f6f5c", 2: "#2f9c82", 3: "#4fd9c1", 4: LIT_COLOUR },
  },
  light: {
    board: "#e2dcc4",
    backdrop: "#f1ede0",
    trace: "#b7ab86",
    blocks: { 0: "#cde3d1", 1: "#9bcda9", 2: "#5eab7c", 3: "#2e8a56", 4: LIT_COLOUR },
  },
}

function useIsometricPalette(): IsometricPalette {
  const { resolvedTheme } = useTheme()
  // Defaults dark before the theme resolves client-side (matching this component's own pre-toggle
  // look up to now) rather than flashing the light board for one frame on every mount.
  return PALETTES[resolvedTheme === "light" ? "light" : "dark"]
}

// Reads local calendar fields directly instead of going through toISOString() (which converts to
// UTC first) - across a UK clock change, a local midnight can convert to the PREVIOUS UTC day,
// which made the day-by-day loop below emit the same date twice and silently skip another.
function toLocalDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function defaultRange(data: CalendarHeatmapDatum[]): [string, string] {
  const latest = data.length ? data.reduce((a, b) => (a.date > b.date ? a : b)).date : toLocalDateISO(new Date())
  const end = new Date(latest + "T00:00:00")
  const start = new Date(end)
  start.setDate(start.getDate() - 364)
  return [toLocalDateISO(start), toLocalDateISO(end)]
}

// Monday-first day index (0 = Monday ... 6 = Sunday), matching GridHeatmap's convention.
function mondayFirstDay(date: Date): number {
  return (date.getDay() + 6) % 7
}

interface Cell {
  date: string
  value: number
  level: 0 | 1 | 2 | 3 | 4
  week: number
  day: number
}

function buildCells(data: CalendarHeatmapDatum[], range: [string, string]): { cells: Cell[]; weeks: number } {
  const byDate = new Map(data.map((d) => [d.date, Number.isFinite(d.value) ? d.value : 0]))
  const max = Math.max(...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)), 1)

  const [startIso, endIso] = range
  const start = new Date(startIso + "T00:00:00")
  const end = new Date(endIso + "T00:00:00")
  // Back up to the Monday on/before start so week 0 always begins on a Monday.
  const gridStart = new Date(start)
  gridStart.setDate(gridStart.getDate() - mondayFirstDay(start))

  const cells: Cell[] = []
  const cursor = new Date(gridStart)
  let week = 0
  while (cursor <= end) {
    const iso = toLocalDateISO(cursor)
    if (cursor >= start) {
      const value = byDate.get(iso) ?? 0
      cells.push({ date: iso, value, level: relativeLevel(value, max), week, day: mondayFirstDay(cursor) })
    }
    if (mondayFirstDay(cursor) === 6) week++
    cursor.setDate(cursor.getDate() + 1)
  }
  return { cells, weeks: week + 1 }
}

function Block({
  cell,
  palette,
  valueLabel,
  valueFormatter,
  onHover,
}: {
  cell: Cell
  palette: IsometricPalette
  valueLabel?: string
  valueFormatter?: (value: number) => string
  onHover: (cell: Cell | null) => void
}) {
  const [hovered, setHovered] = useState(false)
  const blockHeight = BASE_HEIGHT + cell.level * LEVEL_HEIGHT_STEP
  const isLit = cell.level === 4
  // The busiest days get a distinct warm base colour instead of the ramp, so the emissive glow
  // added below reads as a clean lit LED rather than diffuse-plus-emissive fighting each other into
  // a muddy peach.
  const colour = isLit ? LIT_COLOUR : palette.blocks[cell.level]

  return (
    <mesh
      position={[cell.week * STEP, blockHeight / 2, cell.day * STEP]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHover(cell)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        onHover(null)
      }}
    >
      <boxGeometry args={[CELL_SIZE, blockHeight, CELL_SIZE]} />
      <meshStandardMaterial
        color={colour}
        emissive={isLit ? new THREE.Color(LIT_COLOUR) : new THREE.Color("#000000")}
        emissiveIntensity={isLit ? (hovered ? 1.4 : 0.9) : 0}
        roughness={0.45}
        metalness={0.15}
      />
      {hovered && (
        <Html position={[0, blockHeight / 2 + 0.35, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
          <div className="rounded-md border border-border bg-card px-2 py-1 text-[11px] whitespace-nowrap shadow-md">
            <div className="text-foreground font-medium">{cell.date}</div>
            <div className="text-muted-foreground">
              {valueFormatter ? valueFormatter(cell.value) : cell.value.toLocaleString()}
              {valueLabel ? ` ${valueLabel}` : ""}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  )
}

interface CamView {
  pos: [number, number, number]
  up?: [number, number, number]
  trigger: number
}

function Scene({
  data,
  range,
  valueLabel,
  valueFormatter,
  camView,
  controlsReady,
}: Omit<IsometricContributionCalendarProps, "height"> & { camView: CamView; controlsReady: boolean }) {
  const palette = useIsometricPalette()
  const resolvedRange = range ?? defaultRange(data)
  const { cells, weeks } = useMemo(() => buildCells(data, resolvedRange), [data, resolvedRange])
  const [, setActiveCell] = useState<Cell | null>(null)

  const width = weeks * STEP
  const depth = 7 * STEP
  const center: [number, number, number] = [width / 2 - STEP / 2, 0, depth / 2 - STEP / 2]
  // Grid's fade is measured from the scene origin in world units - fadeDistance needs to scale
  // with the actual board size, not a fixed guess, or a small board fades to invisible near its own
  // centre while a large one never fades at all.
  const boardSpan = Math.max(width, depth)

  return (
    <>
      <color attach="background" args={[palette.backdrop]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={1.3} />
      <directionalLight position={[-6, 4, -6]} intensity={0.4} />
      {/* makeDefault registers these as the R3F store's `controls`, which Bounds itself checks for
          and cooperates with (see its own `clip()`/drag-hijack-prevention code) - this is drei's
          documented pairing, not a workaround. enablePan stays off so a user can't drag the board
          off-centre and lose it. Free rotation (no azimuth/polar clamp), matching PCBViewer.tsx's
          own OrbitControls - an earlier attempt to clamp the angle range to avoid an unhelpful
          near-edge-on view of this long, thin board backfired and froze rotation almost entirely
          (min/max angles measured from an assumed 45°/54.7° starting angle that didn't match
          three.js's own internal convention). Guiding users to good angles is handled by the view
          presets below instead of restricting the drag itself. Deliberately no `enableDamping`: with
          it on, OrbitControls keeps rotating on inertia for a moment AFTER its own "end" event fires,
          so RefitOnInteractionEnd's bounds.fit() below was computing zoom for an angle the camera had
          already drifted past by the time it actually settled - confirmed live, even a moderate drag
          reliably went blank because the fitted zoom no longer matched the final resting angle.
          Without damping the camera stops exactly where the drag ends, so "end" fires at the true
          final angle and the refit is accurate immediately. */}
      <OrbitControls makeDefault enabled={controlsReady} enablePan={false} minZoom={8} maxZoom={200} />
      {/* Bounds fits the (orthographic) camera's zoom to whatever is actually inside it, instead
          of a fixed guessed zoom that clipped the tallest, most recent blocks off the edge of the
          canvas once real data (much taller peak blocks than the synthetic sample) was used.
          Deliberately no `observe`: the cell geometry never changes after mount, only local hover
          state does (each Block's own `hovered` toggling its <Html> tooltip in and out) - with
          `observe` on, that DOM-portal mount/unmount was read as a scene change and triggered a
          mid-hover refit, blanking the whole canvas for a frame while the camera bounds recomputed.
          maxDuration shortened from Bounds' 1s default: its own mount-time fit/reset animation runs
          for the full duration regardless of user input, and a drag that started before it settled
          fought the animation for camera.position/zoom every frame - confirmed live, reproducing as
          a reliably blank canvas. OrbitControls itself stays disabled (controlsReady below) until
          safely past this window, so the two can no longer race even with the shorter duration. */}
      <Bounds fit clip margin={1.03} maxDuration={0.6}>
        <CameraView pos={camView.pos} up={camView.up} trigger={camView.trigger} />
        <RefitOnInteractionEnd />
        <group position={[-center[0], 0, -center[2]]}>
          <mesh position={[center[0], -0.06, center[2]]} receiveShadow>
            <boxGeometry args={[width + STEP, 0.12, depth + STEP]} />
            <meshStandardMaterial color={palette.board} roughness={0.8} metalness={0.1} />
          </mesh>
          <Grid
            position={[center[0], 0.02, center[2]]}
            args={[width + STEP, depth + STEP]}
            cellSize={STEP}
            cellThickness={1.1}
            cellColor={palette.trace}
            sectionThickness={0}
            fadeDistance={boardSpan * 1.5}
            fadeStrength={1}
            infiniteGrid={false}
          />
          {cells.map((cell) => (
            <Block
              key={cell.date}
              cell={cell}
              palette={palette}
              valueLabel={valueLabel}
              valueFormatter={valueFormatter}
              onHover={setActiveCell}
            />
          ))}
        </group>
      </Bounds>
    </>
  )
}

// True isometric is the (1,1,1) camera direction - equal x/y/z - which is what produces the
// classic 3-face, no-perspective-distortion look.
const DEFAULT_CAM_POS: [number, number, number] = [22, 22, 22]

// A few distinct, deliberately-chosen angles for this board's actual shape (a long 53-week strip
// only 7 days deep) rather than PCBViewer.tsx's generic front/back/left/right cube presets, which
// wouldn't read well on something this elongated - "top" gives a true bird's-eye read of the whole
// year at once, "profile" is a low grazing shot down the long axis that emphasises the extruded
// block heights like a skyline. The .01 offsets on "top" avoid three.js's camera-up gimbal
// ambiguity at a perfectly vertical look direction, matching PCBViewer.tsx's own convention.
// "top" needs its own `up` vector: looking almost straight down means the default (0,1,0) up is
// nearly parallel to the view direction, which is a gimbal-ambiguous case - the camera's on-screen
// "roll" becomes arbitrary, which is what made the board render as a rotated diamond rather than a
// clean aligned grid (confirmed live). Pointing up along -Z instead orients the long (week) axis
// horizontally and the day axis vertically, matching every other view. A third "profile" preset
// (looking straight down the long axis) was tried and dropped: with an orthographic camera looking
// end-on down 53 weeks of depth, every week's block along a given day-of-week projects onto the
// same screen position, so nearer (fully-drawn, depth-tested) blocks simply hide farther ones -
// the result reads as a handful of muddled colour bands, not a meaningful view of the data.
const VIEW_PRESETS: { label: string; pos: [number, number, number]; up?: [number, number, number] }[] = [
  { label: "isometric", pos: DEFAULT_CAM_POS },
  { label: "top", pos: [0.01, 40, 0.01], up: [0, 0, -1] },
]

// Matches PCBViewer.tsx's own camera-reset pattern (CameraView): sets the camera to a fixed pose
// imperatively via a trigger counter, since OrbitControls owns camera position/target once mounted
// and a plain prop change on <Canvas camera={...}> only applies on first mount, not on every
// subsequent render.
function CameraView({ pos, up = [0, 1, 0], trigger }: { pos: [number, number, number]; up?: [number, number, number]; trigger: number }) {
  const { camera, controls } = useThree()
  const bounds = useBounds()
  const [px, py, pz] = pos
  const [ux, uy, uz] = up
  useEffect(() => {
    if (trigger === 0) return
    camera.position.set(px, py, pz)
    camera.up.set(ux, uy, uz)
    camera.lookAt(0, 0, 0)
    const c = controls as any
    if (c?.target) {
      c.target.set(0, 0, 0)
      c.object?.up?.set(ux, uy, uz)
      c.update?.()
    }
    // Re-fit zoom for the now-restored angle - a plain camera.position reset alone would keep
    // whatever zoom the user last scrolled to, not the board-fitted default for that view.
    bounds.refresh().fit()
  }, [trigger, px, py, pz, ux, uy, uz, camera, controls, bounds])
  return null
}

// Presets explicitly re-fit the camera after moving it, which is what makes them work; a plain
// mouse drag never did, and reproduced live as the exact same blank/degenerate view free rotation
// hit before the angle clamp was even added - the clamp wasn't the actual fix, this is. Re-fitting
// on every drag/zoom RELEASE (not continuously - fit() is a discrete jump, not something to run on
// every frame of a drag) keeps zoom/clip valid for whatever angle the user actually lands on.
function RefitOnInteractionEnd() {
  const { controls } = useThree()
  const bounds = useBounds()
  useEffect(() => {
    const c = controls as any
    if (!c?.addEventListener) return
    const handler = () => bounds.refresh().fit()
    c.addEventListener("end", handler)
    return () => c.removeEventListener("end", handler)
  }, [controls, bounds])
  return null
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

// The same Less-to-More reading as GitHub's own legend, swatched from the active theme's own
// block ramp so it never drifts out of sync with the board (kept as a plain DOM row rather than
// a 3D element - legends don't need an isometric read, and it's far simpler to style with Tailwind).
function Legend({ palette }: { palette: IsometricPalette }) {
  return (
    <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
      <span>Less</span>
      {([0, 1, 2, 3, 4] as const).map((level) => (
        <span key={level} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette.blocks[level] }} />
      ))}
      <span>More</span>
    </div>
  )
}

export default function IsometricContributionCalendar({
  data,
  range,
  height = 320,
  valueLabel,
  valueFormatter,
}: IsometricContributionCalendarProps) {
  const [webglOk] = useState(hasWebGL)
  const [camView, setCamView] = useState<CamView>({ pos: DEFAULT_CAM_POS, trigger: 0 })
  const [controlsReady, setControlsReady] = useState(false)
  const palette = useIsometricPalette()

  // Blocks drag/zoom input until safely past Bounds' own (shortened, 0.6s) mount-time fit
  // animation - starting a drag while it's still running let OrbitControls and that animation
  // fight over camera position/zoom on the same frames, reliably corrupting into a blank canvas.
  useEffect(() => {
    const t = setTimeout(() => setControlsReady(true), 700)
    return () => clearTimeout(t)
  }, [])

  const goTo = (pos: [number, number, number], up?: [number, number, number]) =>
    setCamView((v) => ({ pos, up, trigger: v.trigger + 1 }))

  if (!webglOk) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border text-xs text-muted-foreground"
        style={{ height }}
      >
        3D view isn&apos;t available in this browser
      </div>
    )
  }

  return (
    <div>
      <div style={{ height }}>
        {/* True isometric is the (1,1,1) camera direction - equal x/y/z - which is what produces
            the classic 3-face, no-perspective-distortion look. This is now only the DEFAULT pose:
            OrbitControls lets a visitor drag to rotate and scroll to zoom, matching PCBViewer.tsx's
            own drag/scroll convention for the other three.js view in this codebase. */}
        <Canvas orthographic camera={{ position: DEFAULT_CAM_POS, zoom: 34, near: 0.1, far: 200 }} dpr={[1, 1.5]}>
          <Scene
            data={data}
            range={range}
            valueLabel={valueLabel}
            valueFormatter={valueFormatter}
            camView={camView}
            controlsReady={controlsReady}
          />
        </Canvas>
      </div>
      {/* Controls live below the canvas, not overlaid on top of it - matching PCBViewer.tsx's own
          hint-text-plus-preset-row convention for its 3D model card. */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/40 shrink-0">drag · scroll to zoom</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {VIEW_PRESETS.map(({ label, pos, up }) => {
            // Reference equality against the stable VIEW_PRESETS array works here since goTo()
            // always stores the exact preset.pos it was given, matching PCBViewer.tsx's toggleBtn
            // active-state convention (filled primary background) for its own preset buttons.
            const active = camView.pos === pos
            return (
              <button
                key={label}
                type="button"
                disabled={!controlsReady}
                onClick={() => goTo(pos, up)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <Legend palette={palette} />
    </div>
  )
}
