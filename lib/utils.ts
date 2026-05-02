// Utility helpers used throughout the project.

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() merges Tailwind class names safely.
// I use this whenever I need to conditionally apply classes - it prevents duplicates
// and handles conflicts automatically (e.g. two padding values where only the last should win).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
