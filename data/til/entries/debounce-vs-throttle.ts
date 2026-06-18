import type { TILEntry } from "../index"

const _debounce_vs_throttle: TILEntry = {
    id: "debounce-vs-throttle",
    title: "Debounce waits for inactivity; throttle limits to one call per interval",
    date: "2026-05-13",
    category: "Web",
    published: true,
    body: "Both debounce and throttle reduce how often a function runs, but they solve different problems. Debounce delays execution until the event stops firing: if the user keeps typing, the function never fires until there is a pause. Throttle guarantees the function fires at most once per time window regardless of how many events arrive. Debounce is right for search-as-you-type (fire when the user stops). Throttle is right for scroll handlers or resize (fire consistently during the event stream, not just at the end).",
    detail: [
      {
        type: "code",
        lang: "typescript",
        code: `// Debounce: I wait for ms of silence before calling fn
function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// Throttle: I call fn at most once per ms
function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let lastCall = 0
  return (...args: T) => {
    const now = Date.now()
    if (now - lastCall < ms) return
    lastCall = now
    fn(...args)
  }
}

const onSearch = debounce((q: string) => fetchResults(q), 300)
const onScroll = throttle(() => updatePosition(), 100)`,
        caption: "Debounce delays until quiet; throttle caps frequency during continuous events",
      },
    ],
    tags: ["web", "JavaScript", "performance", "patterns"],
  }

export default _debounce_vs_throttle
