"use client"

// Detects the user's OS and returns helpers for displaying keyboard shortcuts.
// On Mac: mod label is "⌘" and shortcut() returns e.g. "⌘H".
// On all other platforms: mod label is "Ctrl" and shortcut() returns "Ctrl+H".
// Uses useEffect so SSR never touches navigator - safe for Next.js App Router.

import { useEffect, useState } from "react"

export function useModKey() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(
      navigator.platform.toUpperCase().includes("MAC") ||
        /macintosh|mac os x/i.test(navigator.userAgent)
    )
  }, [])

  // Label for the modifier key alone (shown inside a <kbd> element)
  const modLabel = isMac ? "⌘" : "Ctrl"

  // Full shortcut string, e.g. shortcut("H") → "⌘H" or "Ctrl+H"
  const shortcut = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`)

  return { isMac, modLabel, shortcut }
}
