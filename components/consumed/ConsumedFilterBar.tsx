"use client"

// Shared Year + Month + Search filter bar for the consumed hub and every category subpage, so
// filtering behaves identically everywhere instead of six slightly different hand-rolled copies.

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_CHIP, type Month } from "@/data/consumed"

interface ConsumedFilterBarProps {
  years: number[]
  activeYear: string
  onYearChange: (year: string) => void
  months: Month[]
  activeMonth: string
  onMonthChange: (month: string) => void
  search: string
  onSearchChange: (search: string) => void
  searchPlaceholder?: string
}

export function ConsumedFilterBar({
  years,
  activeYear,
  onYearChange,
  months,
  activeMonth,
  onMonthChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search by title...",
}: ConsumedFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Year</span>
          <button
            type="button"
            onClick={() => onYearChange("all")}
            className={cn(
              "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
              activeYear === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {years.map((y) => (
            <button
              type="button"
              key={y}
              onClick={() => onYearChange(String(y))}
              className={cn(
                "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                activeYear === String(y)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Month</span>
          <button
            type="button"
            onClick={() => onMonthChange("all")}
            className={cn(
              "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
              activeMonth === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            All
          </button>
          {months.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => onMonthChange(m)}
              className={cn(
                "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                activeMonth === m
                  ? cn("border-current", MONTH_CHIP[m])
                  : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full sm:w-[28rem] mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border border-primary/40 bg-background pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  )
}
