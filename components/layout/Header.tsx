"use client"

// Sticky site header with a blur backdrop that appears once the user scrolls down.
// I use the useScrollPosition hook to detect scroll and swap Tailwind classes accordingly.
// On mobile I use flex + justify-between so the controls stay pinned to the far right
// even when the desktop Navigation is hidden. On md+ a three-zone grid centres the nav.

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { cn } from "@/lib/utils"
import Navigation from "./Navigation"
import MobileNav from "./MobileNav"
import ThemeToggle from "@/components/shared/ThemeToggle"

export default function Header() {
  const scrollY = useScrollPosition()
  const pathname = usePathname()
  const isScrolled = scrollY > 10
  const isHome = pathname === "/"

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200 border-b",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent"
      )}
    >
      {/* flex on mobile keeps controls pinned to the right; grid on md+ centres the nav */}
      <div className="container flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" title="Home" className="flex flex-col items-center gap-0.5 group w-fit">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 group-hover:border-primary/70 transition-colors">
            <Image
              src="/images/avatar.png"
              alt="Isaac Adjei"
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
          <span className={cn("font-mono text-[10px] font-semibold tracking-tight transition-colors leading-none", isHome ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>
            zaccess
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
