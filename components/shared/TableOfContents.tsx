"use client"
// I use IntersectionObserver to track which heading is currently in view and
// highlight the matching TOC entry. rootMargin "-60% bottom" means a heading is
// considered "active" when it is in the top 40% of the viewport.
// I suppress the TOC entirely when there are fewer than 3 headings to avoid
// rendering a one-item list that adds more noise than value.

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  headings: TocHeading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  return (
    <nav className="hidden xl:block" aria-label="Table of contents">
      <div className="sticky top-24 space-y-1">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          Contents
        </p>
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
            }}
            className={cn(
              "block text-xs leading-relaxed py-0.5 transition-colors hover:text-foreground border-l-2 pl-3",
              h.level === 3 && "pl-5",
              active === h.id
                ? "text-foreground border-primary"
                : "text-muted-foreground/60 border-transparent hover:border-border"
            )}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  )
}
