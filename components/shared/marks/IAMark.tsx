// The static IA mark (concept 12 "standby"): a lowercase "ia" with the i-dot as a blue
// accent. No animation here so it is safe as a persistent brand mark. Used as the
// dashboard sidebar home link, and reused with a pulse as the shared page loader.

import { cn } from "@/lib/utils"

export default function IAMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Isaac Adjei"
      className={cn("text-foreground", className)}
    >
      <line x1="31" y1="46" x2="31" y2="76" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <circle cx="57.5" cy="61" r="15" stroke="currentColor" strokeWidth="9" />
      <line x1="72.5" y1="46" x2="72.5" y2="76" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <circle cx="31" cy="29" r="5.4" fill="hsl(var(--primary))" />
    </svg>
  )
}
