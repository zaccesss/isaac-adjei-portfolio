"use client"

import Link from "next/link"
import Image from "next/image"
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
        "sticky top-0 z-40 w-full transition-all duration-200 border-b",
        isScrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex flex-col items-center gap-0.5 group">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 group-hover:border-primary/70 transition-colors">
            <Image
              src="/images/avatar.png"
              alt="Isaac Adjei"
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="font-mono text-[10px] font-semibold tracking-tight text-muted-foreground group-hover:text-primary transition-colors leading-none">
            zaccess
          </span>
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
