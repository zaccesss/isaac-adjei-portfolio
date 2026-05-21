"use client"

import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

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

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"]
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [])

  return null
}
