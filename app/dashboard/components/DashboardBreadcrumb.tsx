"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

type Crumb = {
  label: string
  href?: string
}

// I render the last crumb without an href as bold plain text - clicking the current page is a no-op
// and treating it as a non-link makes the current location visually distinct from navigable ancestors
export default function DashboardBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
