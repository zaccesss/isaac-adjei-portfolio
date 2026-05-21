"use client"

// Mobile hamburger menu. It toggles a slide-down panel with a fixed backdrop
// that blocks interaction with the page while the menu is open.
// I use usePathname to highlight the link that matches the current URL.

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "@/lib/constants"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          {/* Backdrop sits at z-40 so the panel at z-50 always renders above it */}
          <div className="fixed inset-0 top-16 z-40 bg-black/60" onClick={() => setOpen(false)} />
          {/* Menu panel */}
          <div className="fixed inset-x-0 top-16 z-50 bg-background border-t shadow-xl">
            <nav className="container flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-md transition-colors hover:bg-accent",
                    pathname === link.href ? "bg-accent text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
