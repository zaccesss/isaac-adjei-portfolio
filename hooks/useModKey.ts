"use client"

// I use useSyncExternalStore so the server snapshot (false = non-Mac) is used during SSR
// and the real client snapshot runs after hydration without triggering setState-in-effect lint errors.

import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return (
    navigator.platform.toUpperCase().includes("MAC") ||
    /macintosh|mac os x/i.test(navigator.userAgent)
  )
}

function getServerSnapshot() {
  return false
}

export function useModKey() {
  const isMac = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const modLabel = isMac ? "⌘" : "Ctrl"
  const shortcut = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`)

  return { isMac, modLabel, shortcut }
}
