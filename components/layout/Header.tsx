"use client"

import Link from "next/link"
import { useScrollPosition } from "@/hooks/useScrollPosition"
import { cn } from "@/lib/utils"
import Navigation from "./Navigation"
import MobileNav from "./MobileNav"
import ThemeToggle from "@/components/shared/ThemeToggle"

export default function Header() {
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 10

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight hover:text-primary transition-colors">
          zaccess
        </Link>
        <div className="flex items-center gap-4">
          <Navigation />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
