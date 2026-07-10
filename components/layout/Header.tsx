"use client"

// Sticky site header with a blur backdrop that appears once the user scrolls down.
// I use the useScrollPosition hook to detect scroll and swap Tailwind classes accordingly.
// On mobile I use flex + justify-between so the controls stay pinned to the far right
// even when the desktop Navigation is hidden. On md+ a three-zone grid centres the nav.

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { cn } from "@/lib/utils"
import Navigation from "./Navigation"
import MobileNav from "./MobileNav"
import ThemeToggle from "@/components/shared/ThemeToggle"
import ScriptMark from "@/components/shared/ScriptMark"

const WORDMARK = "isaac adjei"
const RESIGN_MS = 5 * 60 * 1000

// Header identity behaviour:
//  - First visit in a session: the name types itself in, then the signature signs on top.
//  - Every later page navigation and every 5 minutes: the signature re-signs (the name
//    stays put), a quiet "the site is live" heartbeat.
//  - Reduced motion or a repeat visit: the settled signature and full name, no typing.
// signKey drives the re-sign: bumping it remounts ScriptMark's drawn group so the CSS
// draw animation restarts. All state changes run from timers so nothing is set
// synchronously inside an effect body.
function useHeaderIdentity(pathname: string) {
  const [shown, setShown] = useState(WORDMARK)
  const [typing, setTyping] = useState(false)
  const [signKey, setSignKey] = useState(0)
  const firstNav = useRef(true)

  // Entrance: type on the very first session visit, otherwise just sign once.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const greeted = sessionStorage.getItem("ia-greeted")

    if (reduce) return
    if (greeted) {
      const t = window.setTimeout(() => setSignKey((k) => k + 1), 0)
      return () => window.clearTimeout(t)
    }

    sessionStorage.setItem("ia-greeted", "1")
    let interval: number | undefined
    const start = window.setTimeout(() => {
      setShown("")
      setTyping(true)
      let i = 0
      interval = window.setInterval(() => {
        i += 1
        setShown(WORDMARK.slice(0, i))
        if (i >= WORDMARK.length) {
          window.clearInterval(interval)
          setTyping(false)
          setSignKey((k) => k + 1)
        }
      }, 80)
    }, 0)

    return () => {
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [])

  // Re-sign on client-side navigation (skip the first render, the entrance covers it).
  useEffect(() => {
    if (firstNav.current) {
      firstNav.current = false
      return
    }
    const t = window.setTimeout(() => setSignKey((k) => k + 1), 0)
    return () => window.clearTimeout(t)
  }, [pathname])

  // Re-sign every few minutes so the mark feels live even on a page left open.
  useEffect(() => {
    const id = window.setInterval(() => setSignKey((k) => k + 1), RESIGN_MS)
    return () => window.clearInterval(id)
  }, [])

  return { shown, typing, signKey }
}

export default function Header() {
  const scrollY = useScrollPosition()
  const pathname = usePathname()
  const isScrolled = scrollY > 10
  const isHome = pathname === "/"
  const { shown, typing, signKey } = useHeaderIdentity(pathname)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200 border-b",
        // backdrop-blur is one of the most GPU-expensive compositing features on
        // mobile WebKit/Blink - desktop only gets the blur, mobile gets a plain
        // opaque background so the sticky header doesn't repaint a blur layer
        // on every scroll frame
        isScrolled
          ? "bg-background/95 sm:backdrop-blur sm:supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent"
      )}
    >
      {/* flex on mobile keeps controls pinned to the right; grid on md+ centres the nav */}
      <div className="container flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          title="Home"
          aria-label="Isaac Adjei, home"
          className="flex flex-col items-center gap-1 group w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ScriptMark
            signKey={signKey}
            size={30}
            className={cn("transition-colors", isHome ? "text-foreground" : "text-foreground/90 group-hover:text-foreground")}
          />
          <span
            className={cn(
              "font-mono text-[10px] font-semibold tracking-tight transition-colors leading-none min-h-[10px]",
              isHome ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )}
          >
            {shown}
            {typing && <span className="ml-px inline-block w-[1px] h-[9px] align-middle bg-primary animate-pulse" />}
          </span>
        </Link>
        <Navigation />
        <div className="flex items-center gap-4 justify-end">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
