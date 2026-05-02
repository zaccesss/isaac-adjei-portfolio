"use client"

// Thin progress bar fixed to the very top of the viewport.
// It fills from left to right as the user scrolls down the page.
// The percentage comes from useScrollProgress which calculates scroll position
// relative to the total scrollable height.

import { useScrollProgress } from "@/hooks/useScrollPosition"

export default function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-border">
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
