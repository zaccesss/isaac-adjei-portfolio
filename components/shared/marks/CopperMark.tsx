// Copper mark (concept 11): the IA glyph routed as PCB traces with vias at the pads.
// The traces power up, current runs the net and branches at the junction and the
// output via glows as each pulse lands. Pure CSS, reduced-motion safe. Used as the
// /lab loading mark, where "powering up" fits the terminal boot.

import { cn } from "@/lib/utils"

export default function CopperMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Isaac Adjei"
      className={cn("ia-copper text-foreground", className)}
    >
      <line className="cp-tr" x1="33" y1="69.3" x2="33" y2="30.7" pathLength={100} style={{ "--d": "0.2s" } as React.CSSProperties} />
      <line className="cp-tr" x1="36.67" y1="29.62" x2="63.33" y2="70.38" pathLength={100} style={{ "--d": "0.65s" } as React.CSSProperties} />
      <line className="cp-tr cp-xb" x1="33" y1="55" x2="46.6" y2="55" pathLength={100} style={{ "--d": "0.8s" } as React.CSSProperties} />
      <circle className="cp-via" cx="33" cy="76" r="4.2" style={{ "--d": "0.12s" } as React.CSSProperties} />
      <circle className="cp-via" cx="33" cy="24" r="4.2" style={{ "--d": "0.6s" } as React.CSSProperties} />
      <circle className="cp-via" cx="67" cy="76" r="4.2" style={{ "--d": "1.15s" } as React.CSSProperties} />
      <circle className="cp-via cp-vac" cx="53.3" cy="55" r="4.2" style={{ "--d": "1.1s" } as React.CSSProperties} />
      <circle className="cp-j" cx="33" cy="55" r="2.9" style={{ "--d": "0.75s" } as React.CSSProperties} />
      <circle className="cp-glow" cx="53.3" cy="55" r="4.2" />
      <circle className="cp-cur" r="2.1" />
      <circle className="cp-cur2" r="2.1" />
    </svg>
  )
}
