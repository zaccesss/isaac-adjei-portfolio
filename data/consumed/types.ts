// I define all shared types and month utilities for the consumed section.

export type Month =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December"

export const MONTH_NUMBER: Record<Month, number> = {
  January: 0, February: 1, March: 2,    April: 3,
  May: 4,     June: 5,     July: 6,     August: 7,
  September: 8, October: 9, November: 10, December: 11,
}

export function isMonthAvailable(month: Month, preview: boolean): boolean {
  if (preview) return true
  const now = new Date()
  return now >= new Date(2026, MONTH_NUMBER[month], 1)
}

export const MONTH_CHIP: Record<Month, string> = {
  January:   "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  February:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  March:     "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  April:     "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  May:       "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  June:      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  July:      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  August:    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  September: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  October:   "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  November:  "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
  December:  "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

export const MONTHS: Month[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// ── Entry types ───────────────────────────────────────────────────────────────

export type VideoEntry = {
  id: string
  title: string
  channel: string
  month: Month
  uploaded: string
  tags: string[]
  description?: string
  isPlaylist?: true
}

export type PodcastEntry = {
  spotifyId: string
  embedType: "episode" | "show"
  title: string
  show: string
  month: Month
  description?: string
}

export type BookEntry = {
  title: string
  author: string
  genre: string
  genreColor: string
  month: Month
  note: string
  link?: string
}

export type ResourceEntry = {
  title: string
  description: string
  url: string
  category: "Docs" | "Course" | "Tool" | "Blog" | "Reference"
  categoryColor: string
  month: Month
}

// I use this type for both articles and the catch-all others category.
export type LinkEntry = {
  title: string
  source: string
  url: string
  description: string
  month: Month
  tags: string[]
}

export const RESOURCE_CHIP: Record<ResourceEntry["category"], string> = {
  Docs:      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  Course:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Tool:      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Blog:      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Reference: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
}
