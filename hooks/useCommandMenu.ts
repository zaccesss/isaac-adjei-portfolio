"use client"

// This hook listens for the Ctrl+I (or Cmd+I on Mac) keyboard shortcut and calls
// the provided callback to open or close the command menu.
// I wrap the handler in useCallback so the reference stays stable between renders,
// which prevents the effect from re-running unnecessarily.

import { useEffect, useCallback } from "react"

export function useCommandMenuShortcut(onToggle: () => void) {
  // Memoised handler - only recreated if onToggle changes
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle]
  )

  useEffect(() => {
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [handler])
}
