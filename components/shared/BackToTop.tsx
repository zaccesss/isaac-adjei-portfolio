"use client"

// Floating button that appears in the bottom-right corner once the user scrolls
// more than 300px down the page. Clicking it scrolls smoothly back to the top.
// I use translate-y and pointer-events-none to hide it without removing it from the DOM,
// which makes the show/hide transition smooth.

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { cn } from "@/lib/utils"

export default function BackToTop() {
  const scrollY = useScrollPosition()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-40 rounded-full transition-all duration-200",
        scrollY > 300 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  )
}
