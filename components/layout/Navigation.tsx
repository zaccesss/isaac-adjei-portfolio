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
    <nav className="hidden md:flex items-center gap-6">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname === link.href ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
