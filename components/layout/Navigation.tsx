"use client"

// Desktop navigation bar. Hidden on mobile (md:flex is used in the parent).
// usePathname lets me compare each link's href to the current URL and apply
// the active styling to the matching item.

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "@/lib/constants"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-5">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href
        return (
          <div key={link.href} className="relative flex flex-col items-center">
            <Link
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground pb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-4/5 rounded-full bg-primary" />
            )}
          </div>
        )
      })}
    </nav>
  )
}
