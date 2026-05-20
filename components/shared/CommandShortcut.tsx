"use client"

import { useModKey } from "@/hooks/useModKey"

export function CommandShortcut() {
  const { isMac } = useModKey()
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-sm font-mono">
      {isMac ? "⌘+I" : "Ctrl+I"}
    </kbd>
  )
}
