"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

const ROUTES: Record<string, string> = {
  d: "/dashboard/diary",
  n: "/dashboard/notes",
  g: "/dashboard/goals",
  a: "/dashboard/applications",
  h: "/dashboard/habits",
  s: "/dashboard/streaks",
  v: "/dashboard/vault",
  x: "/dashboard/settings",
}

// I ignore shortcuts when the user is typing in a form field
function isTyping() {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === "input" || tag === "textarea" || el.getAttribute("contenteditable") === "true"
}

export function useDashboardShortcuts(onHelp: () => void) {
  const router = useRouter()
  const pendingG = useRef(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (isTyping()) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    const key = e.key.toLowerCase()

    if (pendingG.current) {
      pendingG.current = false
      if (timeout.current) clearTimeout(timeout.current)
      const route = ROUTES[key]
      // I treat g+g as "go to goals" rather than triggering the g prefix twice
      if (route) { e.preventDefault(); router.push(route) }
      return
    }

    if (key === "g") {
      e.preventDefault()
      pendingG.current = true
      timeout.current = setTimeout(() => { pendingG.current = false }, 500)
      return
    }

    if (e.key === "?") {
      e.preventDefault()
      onHelp()
    }
  }, [router, onHelp])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [handleKey])
}
