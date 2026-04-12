"use client"

import { useEffect, useCallback } from "react"

export function useCommandMenuShortcut(onToggle: () => void) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
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
