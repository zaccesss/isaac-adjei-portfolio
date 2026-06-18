// I collect small utility helpers here so every file can import from one place.

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() merges Tailwind class names safely.
// I use this whenever I need to conditionally apply classes - it prevents duplicates
// and handles conflicts automatically (e.g. two padding values where only the last should win).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// I estimate reading time from an array of content blocks at 200 wpm, minimum 1 minute.
export function computeReadingTime(blocks: { type: string; text?: string; code?: string; items?: (string | { text: string })[] }[]): number {
  const words = blocks.reduce((acc, block) => {
    if (block.text) return acc + block.text.split(/\s+/).filter(Boolean).length
    if (block.code) return acc + block.code.split(/\s+/).filter(Boolean).length
    if (block.items) {
      const flat = block.items.map((i) => (typeof i === "string" ? i : i.text)).join(" ")
      return acc + flat.split(/\s+/).filter(Boolean).length
    }
    return acc
  }, 0)
  return Math.max(1, Math.round(words / 200))
}
