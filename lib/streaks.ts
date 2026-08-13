// Generalises the current/longest streak math that used to live only in StreaksClient.tsx
// (calcCurrentStreak/calcLongestStreak) so habits and future Study/Faith sections, compute
// streaks the same way instead of re-deriving the date-walking logic per feature.

export type StreakLog = {
  date: string // ISO yyyy-mm-dd - avoid Date objects in state to dodge timezone offset bugs
  completed: boolean
}

// Walks backwards from today counting consecutive completed days until the first gap.
function calcCurrentStreak(dates: Set<string>, today: string): number {
  let streak = 0
  const d = new Date(today)
  while (true) {
    const ds = d.toISOString().split("T")[0] // re-slice each iteration since setDate mutates d in place
    if (dates.has(ds)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// Sorts completed dates ascending and finds the longest run of consecutive days.
function calcLongestStreak(dates: string[]): number {
  const sorted = [...dates].sort()
  if (!sorted.length) return 0
  let longest = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else if (diff > 1) {
      // Reset to 1 (not 0) because the date at index i starts a new potential streak.
      current = 1
    }
  }
  return longest
}

export function useStreak(logs: StreakLog[], today: string = new Date().toISOString().split("T")[0]): {
  current: number
  longest: number
} {
  const completedDates = logs.filter((l) => l.completed).map((l) => l.date)
  const dateSet = new Set(completedDates)
  return {
    current: calcCurrentStreak(dateSet, today),
    longest: calcLongestStreak(completedDates),
  }
}
