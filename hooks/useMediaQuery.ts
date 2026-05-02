"use client"

// SSR-safe media query hook using useSyncExternalStore.
// I can't just call window.matchMedia directly because Next.js renders pages on the server
// where window doesn't exist. useSyncExternalStore lets me provide a server-side fallback
// (always false) while still subscribing to real changes in the browser.

import { useSyncExternalStore } from "react"

// Takes any CSS media query string and returns whether it currently matches
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {}
    }

    const media = window.matchMedia(query)
    const listener = () => callback()
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }

  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(query).matches
  }

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

// Convenience wrapper - returns true when the viewport is 768px wide or narrower
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)")
}
