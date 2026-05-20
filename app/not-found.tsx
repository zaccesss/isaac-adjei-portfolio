"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const LINES = [
  { text: "isaacadjei-lab v1.0.0", delay: 0 },
  { text: "kernel: loading...", delay: 120 },
  { text: "resolving path...", delay: 240 },
  { text: "error: 404 - directory not found", delay: 420, error: true },
  { text: "", delay: 560 },
  { text: "the page you are looking for does not exist.", delay: 640 },
  { text: "try one of these instead:", delay: 800 },
]

export default function NotFound() {
  const router = useRouter()
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisible(i + 1), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const links = [
    { label: "home", href: "/" },
    { label: "blog", href: "/blog" },
    { label: "projects", href: "/projects" },
    { label: "lab", href: "/lab" },
  ]

  return (
    <div className="container max-w-2xl py-32">
      <div className="rounded-lg border border-border/60 bg-zinc-950 dark:bg-zinc-950 overflow-hidden font-mono">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-auto text-xs text-zinc-500">isaacadjei@portfolio - not-found</span>
        </div>

        {/* Output */}
        <div className="p-6 space-y-1 text-sm min-h-[240px]">
          {LINES.slice(0, visible).map((line, i) => (
            <p
              key={i}
              className={
                line.error
                  ? "text-red-400"
                  : line.text === ""
                  ? "h-3"
                  : i < 3
                  ? "text-zinc-500"
                  : "text-zinc-300"
              }
            >
              {line.text}
            </p>
          ))}

          {visible >= LINES.length && (
            <div className="pt-4 space-y-1">
              {links.map((link) => (
                <div key={link.href} className="flex items-center gap-2">
                  <span className="text-primary">$</span>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                  >
                    go {link.label}
                  </button>
                  <span className="text-zinc-600 text-xs">→ {link.href}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-primary">$</span>
                <span className="inline-block w-2 h-4 bg-amber-400 animate-[blink_1s_step-end_infinite]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Lost?{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Go home
        </Link>
      </p>
    </div>
  )
}
