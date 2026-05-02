"use client"

// Detects the user's OS and returns helpers for displaying keyboard shortcuts.
// On Mac: mod label is "⌘" and shortcut() returns e.g. "⌘H".
// On all other platforms: mod label is "Ctrl" and shortcut() returns "Ctrl+H".
//
// Uses a lazy useState initialiser instead of useEffect + setState.
// The lazy form runs only on the client (window/navigator are available) and
// avoids the "setState called synchronously inside an effect" ESLint error that
// the previous useEffect approach triggered (react-hooks/set-state-in-effect).
// The typeof window guard makes SSR safe - server always returns false (non-Mac).

import { useState } from "react"

export function useModKey() {
  const [isMac] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return (
      navigator.platform.toUpperCase().includes("MAC") ||
      /macintosh|mac os x/i.test(navigator.userAgent)
    )
  })

  // Label for the modifier key alone (shown inside a <kbd> element)
  const modLabel = isMac ? "⌘" : "Ctrl"

  // Full shortcut string, e.g. shortcut("H") → "⌘H" or "Ctrl+H"
  const shortcut = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`)

  return { isMac, modLabel, shortcut }
}
