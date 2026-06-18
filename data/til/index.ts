// I store short "Today I Learned" entries for the /til page.
// Each entry is a single discovery: from a sentence to a few paragraphs with optional code blocks.

export type TILBlock =
  | { type: "p"; text: string }
  | { type: "code"; lang: string; code: string; caption?: string }
  | { type: "h2"; text: string }
  | { type: "note"; text: string }
  | { type: "embed"; url: string; caption?: string; variant?: "spotify" }
  | { type: "link"; url: string; label: string; description?: string }

export interface TILEntry {
  id: string
  title: string
  date: string
  category: string
  published: boolean
  body: string
  detail?: TILBlock[]
  tags?: string[]
  source?: { label: string; url: string }
  relatedPost?: string
}

// I return only published entries whose date has passed so future entries stay hidden in prod.
export function getPublishedTILEntries(): TILEntry[] {
  const now = new Date()
  return tilEntries.filter(e => {
    if (!e.published) return false
    return process.env.NODE_ENV === "development" || new Date(e.date) <= now
  })
}

// I look up a single entry by id without date filtering so slug pages can always find it in dev.
export function getTILBySlug(slug: string): TILEntry | undefined {
  return tilEntries.find(e => e.id === slug)
}

// Auto-generated: one file per entry
import _0 from "./entries/next-parallel-routes"
import _1 from "./entries/piano-learning-approach"
import _2 from "./entries/what-a-pipe-really-is"
import _3 from "./entries/ghanaian-naming-conventions"
import _4 from "./entries/css-logical-properties-rtl"
import _5 from "./entries/amd-developer-cloud"
import _6 from "./entries/cooking-ghanaian-spice-depth"
import _7 from "./entries/bash-dotfile-loading-order"
import _8 from "./entries/oop-encapsulation-vs-abstraction"
import _9 from "./entries/how-https-handshake-works"
import _10 from "./entries/claude-mythos-restricted-model"
import _11 from "./entries/ga-twi-language-difference"
import _12 from "./entries/vhdl-process-sensitivity-list"
import _13 from "./entries/heap-fragmentation-mcu"
import _14 from "./entries/gpio-open-drain-wired-and"
import _15 from "./entries/python-bytecode-cpython"
import _16 from "./entries/how-text-messages-work"
import _17 from "./entries/format-string-exploit-ctf"
import _18 from "./entries/bypass-capacitor-placement"
import _19 from "./entries/strace-system-calls"
import _20 from "./entries/branch-prediction-sorted-arrays"
import _21 from "./entries/adc-reference-voltage-quality"
import _22 from "./entries/segment-tree-lazy-propagation"
import _23 from "./entries/faith-prayer-shapes-focus"
import _24 from "./entries/dp-tabulation-vs-memoisation"
import _25 from "./entries/how-gps-works"
import _26 from "./entries/git-rebase-onto"
import _27 from "./entries/python-how-it-runs"
import _28 from "./entries/tracking-progressive-overload"
import _29 from "./entries/edge-vs-serverless-cold-start"
import _30 from "./entries/explain-analyze-postgres"
import _31 from "./entries/i2c-clock-stretching"
import _32 from "./entries/cpu-pipeline-raw-hazard"
import _33 from "./entries/git-worktree"
import _34 from "./entries/sky-celebration-day"
import _35 from "./entries/birthday-reflection-2026"
import _36 from "./entries/feynman-technique"
import _37 from "./entries/typescript-satisfies"
import _38 from "./entries/git-bisect-run"
import _39 from "./entries/css-animation-fill-mode"
import _40 from "./entries/tls-1-3-vs-1-2"
import _41 from "./entries/uart-printf-retargeting"
import _42 from "./entries/freertos-pdms-to-ticks"
import _43 from "./entries/numpy-broadcasting"
import _44 from "./entries/csrf-double-submit-cookie"
import _45 from "./entries/how-grep-works-internally"
import _46 from "./entries/aes-gcm-vs-cbc"
import _47 from "./entries/lru-cache-implementation"
import _48 from "./entries/typescript-template-literal-types"
import _49 from "./entries/spi-cpol-cpha"
import _50 from "./entries/how-cd-works"
import _51 from "./entries/volatile-in-c"
import _52 from "./entries/pwm-timer-maths"
import _53 from "./entries/debounce-vs-throttle"
import _54 from "./entries/format-string-vulnerability-c"
import _55 from "./entries/static-local-var-scope"
import _56 from "./entries/binary-search-on-answer"
import _57 from "./entries/freertos-stack-overflow-detection"
import _58 from "./entries/git-log-follow"
import _59 from "./entries/ga-proverb-systems-thinking"

export const tilEntries: TILEntry[] = [
  _0,
  _1,
  _2,
  _3,
  _4,
  _5,
  _6,
  _7,
  _8,
  _9,
  _10,
  _11,
  _12,
  _13,
  _14,
  _15,
  _16,
  _17,
  _18,
  _19,
  _20,
  _21,
  _22,
  _23,
  _24,
  _25,
  _26,
  _27,
  _28,
  _29,
  _30,
  _31,
  _32,
  _33,
  _34,
  _35,
  _36,
  _37,
  _38,
  _39,
  _40,
  _41,
  _42,
  _43,
  _44,
  _45,
  _46,
  _47,
  _48,
  _49,
  _50,
  _51,
  _52,
  _53,
  _54,
  _55,
  _56,
  _57,
  _58,
  _59,
]
