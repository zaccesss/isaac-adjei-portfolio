"use client"

// Two hooks for tracking the user's scroll state.
// I use the passive event listener flag to avoid blocking the browser's scroll thread.

import { useState, useLayoutEffect } from "react"

// I return the current vertical scroll offset in pixels
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  // useLayoutEffect runs synchronously before paint so the header background
  // is correct on the first frame even when the browser restores scroll position.
  // rAF throttling collapses many scroll events per frame into a single setState,
  // preventing repeated compositor repaints on the backdrop-blur header on iOS WebKit.
  useLayoutEffect(() => {
    let rafId = 0
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY))
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return scrollY
}

// I return how far the user has scrolled as a percentage (0-100) of the full page height
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useLayoutEffect(() => {
    let rafId = 0
    const calc = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setProgress(totalHeight > 0 ? (current / totalHeight) * 100 : 0)
    }
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(calc)
    }
    calc()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return progress
}
