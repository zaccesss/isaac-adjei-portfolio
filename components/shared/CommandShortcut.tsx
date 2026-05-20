"use client"

import { useModKey } from "@/hooks/useModKey"

export function CommandShortcut() {
  const { shortcut } = useModKey()
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">
      {shortcut("I")}
    </kbd>
  )
}
