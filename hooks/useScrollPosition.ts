"use client"

// Two hooks for tracking the user's scroll state.
// I use the passive event listener flag to avoid blocking the browser's scroll thread.

import { useState, useLayoutEffect } from "react"

// I return the current vertical scroll offset in pixels
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  // useLayoutEffect runs synchronously before paint so the header background
  // is correct on the first frame even when the browser restores scroll position
  useLayoutEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollY
}

// I return how far the user has scrolled as a percentage (0-100) of the full page height
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useLayoutEffect(() => {
    const calc = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setProgress(totalHeight > 0 ? (current / totalHeight) * 100 : 0)
    }
    calc()
    window.addEventListener("scroll", calc, { passive: true })
    return () => window.removeEventListener("scroll", calc)
  }, [])

  return progress
}
