"use client"

import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

// I use 1 hour so the session survives a long reading session without forcing a re-login mid-task
const TIMEOUT_MS = 60 * 60 * 1000 // 1 hour

export default function InactivityGuard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        await signOut({ callbackUrl: "/dashboard/login" })
      }, TIMEOUT_MS)
    }

    // I listen to these five events to cover both desktop and mobile activity
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"]
    // I use passive listeners so they never block scrolling performance
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [])

  // I render nothing - this component exists purely for its side-effect
  return null
}
