"use client"

import { useState } from "react"
import { useDashboardShortcuts } from "@/hooks/useDashboardShortcuts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

const SHORTCUTS = [
  { keys: ["g", "d"], label: "Diary" },
  { keys: ["g", "n"], label: "Notes" },
  { keys: ["g", "g"], label: "Goals" },
  { keys: ["g", "a"], label: "Applications" },
  { keys: ["g", "h"], label: "Habits" },
  { keys: ["g", "s"], label: "Streaks" },
  { keys: ["g", "v"], label: "Vault" },
  { keys: ["g", "x"], label: "Settings" },
  { keys: ["?"], label: "Show shortcuts" },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded min-w-[22px]">
      {children}
    </kbd>
  )
}

export default function ShortcutHelp() {
  const [open, setOpen] = useState(false)
  useDashboardShortcuts(() => setOpen(true))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-1">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Kbd>{k}</Kbd>
                    {i < s.keys.length - 1 && <span className="text-xs text-muted-foreground">then</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
