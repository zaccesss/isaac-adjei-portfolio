"use client"
// A reusable page-number pager: first / prev / a small window of numbers / next / last, with an optional
// "Showing X-Y of Z" line. It works two ways so every list can share it - pass `onChange` for in-memory
// client lists (applications, blog analytics) or `baseHref` to render `?page=` links for server-paginated
// pages (the activity log). `baseHref` is a plain string, NOT a function, so it is safe to pass from a
// Server Component to this Client Component. Same visual language as the public blog pager.
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

type PaginationProps = {
  page: number
  totalPages: number
  onChange?: (page: number) => void
  baseHref?: string
  totalItems?: number
  pageSize?: number
  itemLabel?: string
  className?: string
}

const CTRL = "p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"

export function Pagination({ page, totalPages, onChange, baseHref, totalItems, pageSize, itemLabel = "items", className }: PaginationProps) {
  if (totalPages <= 1) return null
  const clamp = (p: number) => Math.min(totalPages, Math.max(1, p))
  const nums: number[] = []
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) nums.push(p)
  const hrefFor = baseHref ? (p: number) => `${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${p}` : null

  // Plain element factories (not nested components) so I can share button/link rendering without tripping
  // the "no components during render" rule.
  const nav = (key: string, to: number, disabled: boolean, label: string, icon: React.ReactNode) => {
    if (hrefFor) {
      return disabled ? (
        <span key={key} className={`${CTRL} opacity-40 pointer-events-none`} aria-label={label} aria-disabled>{icon}</span>
      ) : (
        <Link key={key} href={hrefFor(clamp(to))} className={CTRL} aria-label={label}>{icon}</Link>
      )
    }
    return (
      <button key={key} type="button" onClick={() => onChange?.(clamp(to))} disabled={disabled} className={`${CTRL} disabled:opacity-40 disabled:pointer-events-none`} aria-label={label}>
        {icon}
      </button>
    )
  }

  const numBtn = (p: number) => {
    const cls = `min-w-[2rem] h-8 px-2 rounded-lg border text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"}`
    return hrefFor ? (
      <Link key={p} href={hrefFor(p)} className={cls}>{p}</Link>
    ) : (
      <button key={p} type="button" onClick={() => onChange?.(p)} className={cls}>{p}</button>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <div className="flex items-center justify-center gap-1">
        {nav("first", 1, page === 1, "First page", <ChevronsLeft className="h-4 w-4" />)}
        {nav("prev", page - 1, page === 1, "Previous page", <ChevronLeft className="h-4 w-4" />)}
        {nums[0] > 1 && <span className="px-1 text-xs text-muted-foreground/50">…</span>}
        {nums.map((p) => numBtn(p))}
        {nums[nums.length - 1] < totalPages && <span className="px-1 text-xs text-muted-foreground/50">…</span>}
        {nav("next", page + 1, page === totalPages, "Next page", <ChevronRight className="h-4 w-4" />)}
        {nav("last", totalPages, page === totalPages, "Last page", <ChevronsRight className="h-4 w-4" />)}
      </div>
      {totalItems !== undefined && pageSize !== undefined && (
        <p className="text-xs text-muted-foreground">
          Showing {((page - 1) * pageSize + 1).toLocaleString()}-{Math.min(page * pageSize, totalItems).toLocaleString()} of {totalItems.toLocaleString()} {itemLabel}
        </p>
      )}
    </div>
  )
}
