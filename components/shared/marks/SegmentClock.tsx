// Segment clock (concept 17): the IA glyph as a pair of seven-segment digits reading
// I:A, with an accent colon blinking the seconds like a bedside clock. A mark that
// spells the name and keeps time. Pure CSS, reduced-motion safe. Used on the dashboard.

import { cn } from "@/lib/utils"

type Seg = "a" | "b" | "c" | "d" | "e" | "f" | "g"
const SEG: Record<Seg, [number, number, number, number]> = {
  a: [3, 0, 17, 0], b: [20, 3, 20, 17], c: [20, 23, 20, 37],
  d: [3, 40, 17, 40], e: [0, 23, 0, 37], f: [0, 3, 0, 17], g: [3, 20, 17, 20],
}
const ORDER: Seg[] = ["a", "b", "c", "d", "e", "f", "g"]

function Digit({ x, y, lit, accentG }: { x: number; y: number; lit: Seg[]; accentG?: boolean }) {
  let di = 0
  return (
    <>
      {ORDER.map((k) => {
        const [x1, y1, x2, y2] = SEG[k]
        const on = lit.includes(k)
        const cls = ["sg-seg", on ? "sg-lit" : "", on && accentG && k === "g" ? "sg-g" : ""].filter(Boolean).join(" ")
        const style = on ? ({ "--d": `${(0.15 + di++ * 0.14).toFixed(2)}s` } as React.CSSProperties) : undefined
        return <line key={k} className={cls} x1={x + x1} y1={y + y1} x2={x + x2} y2={y + y2} style={style} />
      })}
    </>
  )
}

export default function SegmentClock({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size * 1.15}
      height={size}
      viewBox="0 0 100 90"
      fill="none"
      role="img"
      aria-label="Isaac Adjei"
      className={cn("ia-segment text-foreground", className)}
    >
      <g transform="skewX(-4) translate(5 12)">
        <Digit x={20} y={17} lit={["b", "c"]} />
        <Digit x={60} y={17} lit={["a", "b", "c", "e", "f", "g"]} accentG />
        <circle className="sg-col" cx="50" cy="29.5" r="3" />
        <circle className="sg-col" cx="50" cy="44.5" r="3" />
      </g>
    </svg>
  )
}
