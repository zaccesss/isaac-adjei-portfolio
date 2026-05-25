"use client"

// I built this small EntryMenu component as a single source of truth for the
// 3-dot dropdown that appears on Diary, Notes and Vault entries. It wraps a
// Radix Popover so I do not have to install a separate dropdown-menu package
// and so the open/close behaviour stays consistent across the dashboard.

import * as Popover from "@radix-ui/react-popover"
import { MoreVertical } from "lucide-react"
import { ReactNode } from "react"

export type EntryMenuItem = {
  label: string
  icon: ReactNode
  onClick: () => void
  // I use the "destructive" tone for delete actions so they render in red.
  tone?: "default" | "destructive"
}

export function EntryMenu({ items, ariaLabel = "Open menu" }: {
  items: EntryMenuItem[]
  ariaLabel?: string
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          // I use the same spacing and colour treatment as the old icon buttons
          // so swapping in the menu does not cause a visual regression.
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[10rem] rounded-lg border border-border bg-popover p-1 shadow-md outline-none animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex flex-col">
            {items.map((item, i) => (
              <Popover.Close key={i} asChild>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={
                    "flex items-center gap-2 px-2.5 py-1.5 text-left text-sm rounded-md transition-colors " +
                    (item.tone === "destructive"
                      ? "text-destructive hover:bg-destructive/10"
                      : "hover:bg-muted")
                  }
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-4 h-4">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </Popover.Close>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
