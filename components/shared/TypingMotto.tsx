"use client"

import { useEffect, useRef, useState } from "react"

interface TypingMottoProps {
  text: string
  delay?: number
  speed?: number
  pauseAfter?: number
  className?: string
}

export default function TypingMotto({
  text,
  delay = 400,
  speed = 42,
  pauseAfter = 9000,
  className,
}: TypingMottoProps) {
  const [displayed, setDisplayed] = useState("")
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced.current) {
      setDisplayed(text)
      return
    }

    function runCycle(initialDelay: number) {
      startRef.current = setTimeout(() => {
        let i = 0
        setDisplayed("")
        tickRef.current = setInterval(() => {
          i++
          setDisplayed(text.slice(0, i))
          if (i >= text.length) {
            clearInterval(tickRef.current!)
            tickRef.current = null
            // pause then loop
            startRef.current = setTimeout(() => runCycle(0), pauseAfter)
          }
        }, speed)
      }, initialDelay)
    }

    runCycle(delay)

    return () => {
      clearTimeout(startRef.current!)
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [text, delay, speed, pauseAfter])

  const done = displayed.length >= text.length

  return (
    <p className={`font-mono text-xs flex items-center gap-1.5 ${className ?? ""}`}>
      <span className="text-primary font-semibold shrink-0">$</span>
      <span className="text-foreground/75">{displayed}</span>
      {!done && (
        <span
          className="inline-block w-[0.5em] h-[0.85em] bg-primary/60 shrink-0 animate-[blink_0.7s_step-end_infinite]"
          aria-hidden="true"
        />
      )}
    </p>
  )
}
