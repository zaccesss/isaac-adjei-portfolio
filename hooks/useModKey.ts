"use client"

// I detect the OS after mount so the correct modifier key label renders on the client.
// Starting with false (non-Mac) matches the SSR output and avoids hydration mismatches.

import { useState, useEffect } from "react"

export function useModKey() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(
      navigator.platform.toUpperCase().includes("MAC") ||
        /macintosh|mac os x/i.test(navigator.userAgent)
    )
  }, [])

  const modLabel = isMac ? "⌘" : "Ctrl"
  const shortcut = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`)

  return { isMac, modLabel, shortcut }
}
