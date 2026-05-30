"use client"

// I only render this on screens below the md breakpoint (768px). The dismissed
// state is local so it resets on page reload - no persistence needed for a soft hint.

import { useState } from "react"
import { Monitor, X } from "lucide-react"

export default function MobileBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-muted/80 border-b text-xs text-foreground">
      <Monitor className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">This site is best experienced on a laptop or desktop.</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
