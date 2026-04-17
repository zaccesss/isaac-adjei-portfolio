"use client"

import { useSyncExternalStore } from "react"

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

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)")
}
