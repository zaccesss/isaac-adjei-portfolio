"use client"

// Two hooks for tracking the user's scroll state.
// I use the passive event listener flag to avoid blocking the browser's scroll thread.

import { useState, useEffect } from "react"

// Returns the current vertical scroll offset in pixels
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollY
}

// Returns how far the user has scrolled as a percentage (0-100) of the full page height
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setProgress(totalHeight > 0 ? (current / totalHeight) * 100 : 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return progress
}
