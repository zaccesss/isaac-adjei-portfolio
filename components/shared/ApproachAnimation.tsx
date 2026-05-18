"use client"

// I drive the animation with refs for lineIdx and charIdx so the interval callback
// always reads the latest values without relying on stale closures.
// The state setter receives pre-computed snapshot values so React batching cannot
// mix up characters from different ticks.

import { useEffect, useRef, useState } from "react"

const LINES = [
  "// my approach",
  "bool struggling = true;",
  "bool failing    = true;",
  "while (struggling || failing) {",
  "    learn();      // Grow from the struggle",
  "    retry();      // Push through failure",
  "}",
  "thrive();         // Embrace growth",
  "succeed();        // Achieve the goal",
  'printf("Mission accomplished.\\n");  // Celebrate victory',
]

type Phase = "typing" | "holding" | "clearing" | "pausing"

function tokenise(line: string): { text: string; cls: string }[] {
  if (line.startsWith("//")) {
    return [{ text: line, cls: "text-muted-foreground" }]
  }

  const tokens: { text: string; cls: string }[] = []
  let remaining = line

  while (remaining.length > 0) {
    const commentIdx = remaining.indexOf("//")
    const strIdx = remaining.indexOf('"')

    if (commentIdx !== -1 && (strIdx === -1 || commentIdx < strIdx)) {
      if (commentIdx > 0) tokens.push(...tokenisePart(remaining.slice(0, commentIdx)))
      tokens.push({ text: remaining.slice(commentIdx), cls: "text-muted-foreground" })
      break
    }

    if (strIdx !== -1) {
      if (strIdx > 0) tokens.push(...tokenisePart(remaining.slice(0, strIdx)))
      const endStr = remaining.indexOf('"', strIdx + 1)
      if (endStr !== -1) {
        tokens.push({ text: remaining.slice(strIdx, endStr + 1), cls: "text-sky-600 dark:text-sky-300" })
        remaining = remaining.slice(endStr + 1)
      } else {
        tokens.push({ text: remaining, cls: "text-sky-600 dark:text-sky-300" })
        break
      }
      continue
    }

    tokens.push(...tokenisePart(remaining))
    break
  }

  return tokens
}

function tokenisePart(text: string): { text: string; cls: string }[] {
  const KEYWORDS = /\b(while|true|false|bool)\b/g
  const FUNCTIONS = /\b(learn|retry|thrive|succeed|printf)\b/g

  const parts: { text: string; cls: string }[] = []
  let last = 0
  const matches: { index: number; length: number; cls: string }[] = []

  let m: RegExpExecArray | null
  KEYWORDS.lastIndex = 0
  while ((m = KEYWORDS.exec(text)) !== null)
    matches.push({ index: m.index, length: m[0].length, cls: "text-primary" })
  FUNCTIONS.lastIndex = 0
  while ((m = FUNCTIONS.exec(text)) !== null)
    if (!matches.some((x) => x.index === m!.index))
      matches.push({ index: m.index, length: m[0].length, cls: "text-violet-500 dark:text-violet-400" })

  matches.sort((a, b) => a.index - b.index)
  for (const match of matches) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), cls: "text-foreground" })
    parts.push({ text: text.slice(match.index, match.index + match.length), cls: match.cls })
    last = match.index + match.length
  }
  if (last < text.length) parts.push({ text: text.slice(last), cls: "text-foreground" })
  return parts
}

export default function ApproachAnimation() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>("pausing")

  const lineIdxRef = useRef(0)
  const charIdxRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function clearTimers() {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    function startTyping() {
      clearTimers()
      lineIdxRef.current = 0
      charIdxRef.current = 0
      setDisplayedLines([])
      setPhase("typing")

      intervalRef.current = setInterval(() => {
        const li = lineIdxRef.current
        const ci = charIdxRef.current

        if (li >= LINES.length) {
          clearInterval(intervalRef.current!)
          setPhase("holding")
          timerRef.current = setTimeout(() => {
            setPhase("clearing")
            setDisplayedLines([])
            timerRef.current = setTimeout(startTyping, 500)
          }, 2500)
          return
        }

        const text = LINES[li].slice(0, ci + 1)
        setDisplayedLines((prev) => {
          const next = [...prev]
          next[li] = text
          return next
        })

        if (ci + 1 >= LINES[li].length) {
          lineIdxRef.current = li + 1
          charIdxRef.current = 0
        } else {
          charIdxRef.current = ci + 1
        }
      }, 60)
    }

    timerRef.current = setTimeout(startTyping, 500)
    return clearTimers
  }, [])

  const isCursorVisible = phase === "typing" || phase === "holding"

  return (
    <div
      className="rounded-xl border border-border/60 bg-muted/50 dark:bg-zinc-900/60 p-5 overflow-x-auto h-[240px] overflow-y-hidden"
      aria-label="My approach - a code philosophy"
    >
      <div className="font-mono text-xs leading-relaxed">
        {displayedLines.map((line, i) => {
          const isLast = i === displayedLines.length - 1
          const tokens = tokenise(line)
          return (
            <div key={i}>
              {tokens.map((t, j) => (
                <span key={j} className={t.cls}>{t.text}</span>
              ))}
              {isLast && isCursorVisible && (
                <span
                  className="inline-block w-[0.55em] h-[1em] bg-current ml-px align-middle animate-[blink_0.7s_step-end_infinite]"
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
        {displayedLines.length === 0 && (
          <span className="text-transparent select-none">{" "}</span>
        )}
      </div>
    </div>
  )
}
