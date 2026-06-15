"use client"

// I render a terminal-style 404 page with animated boot sequence and a live command
// prompt so visitors can type 'go <page>', 'ls' or 'help' to navigate from here.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const BOOT_LINES = [
  { text: "isaacadjei-lab v2.0.0", delay: 0 },
  { text: "resolving path...", delay: 60 },
  { text: "error: 404 — page not found", delay: 150, error: true },
  { text: "", delay: 210 },
  { text: "$ ls /pages", delay: 270, cmd: true },
  {
    text: "about  blog  changelog  contact  experience  lab  links  newsletter  now  projects  skills  uses",
    delay: 390,
    muted: true,
  },
  { text: "", delay: 430 },
  { text: "# click a shortcut below or type a command (try 'help')", delay: 490, tip: true },
  { text: "# go <page>  •  help  •  ls  •  whoami  •  clear", delay: 560, tip: true },
]

const PAGES = [
  { label: "home", href: "/" },
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
  { label: "experience", href: "/experience" },
  { label: "skills", href: "/skills" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
  { label: "lab", href: "/lab" },
  { label: "changelog", href: "/changelog" },
  { label: "newsletter", href: "/newsletter" },
  { label: "now", href: "/now" },
  { label: "uses", href: "/uses" },
  { label: "links", href: "/links" },
]

type HistoryLine = { text: string; error?: boolean; muted?: boolean; cmd?: boolean; tip?: boolean }

export default function NotFound() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [booted, setBooted] = useState(0)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<HistoryLine[]>([])

  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setBooted(i + 1), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, booted])

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return

    const echo: HistoryLine = { text: raw.trim(), cmd: true }

    const page = PAGES.find(
      (p) =>
        cmd === `go ${p.label}` ||
        cmd === p.label ||
        cmd === p.href ||
        cmd === p.href.replace("/", "")
    )

    if (page) {
      setHistory((h) => [...h, echo, { text: `→ navigating to ${page.href}...`, muted: true }])
      setTimeout(() => router.push(page.href), 350)
      return
    }

    if (cmd === "help") {
      setHistory((h) => [
        ...h,
        echo,
        { text: "available commands:", tip: true },
        { text: "  go <page>   navigate to a page  (e.g. go blog, go projects)", muted: true },
        { text: "  ls          list all available pages", muted: true },
        { text: "  whoami      find out who you are", muted: true },
        { text: "  clear       clear terminal history", muted: true },
        { text: "", muted: true },
        { text: "shortcut links above are also clickable — just click 'go home', 'go blog', etc.", tip: true },
      ])
      return
    }

    if (cmd === "ls" || cmd === "ls /pages" || cmd === "ls pages") {
      setHistory((h) => [
        ...h,
        echo,
        {
          text: "about  blog  changelog  contact  experience  lab  links  newsletter  now  projects  skills  uses",
          muted: true,
        },
      ])
      return
    }

    if (cmd === "whoami") {
      setHistory((h) => [...h, echo, { text: "visitor", muted: true }])
      return
    }

    if (cmd === "clear") {
      setHistory([])
      return
    }

    setHistory((h) => [
      ...h,
      echo,
      { text: `command not found: ${cmd}`, error: true },
      { text: "try 'help' to see available commands, or click one of the shortcuts above", tip: true },
    ])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
    setInput("")
  }

  const ready = booted >= BOOT_LINES.length

  const lineClass = (line: { error?: boolean; muted?: boolean; cmd?: boolean; tip?: boolean; text: string }, i: number) => {
    if (line.error) return "text-red-400"
    if (line.text === "") return "h-3"
    if (line.cmd) return "text-emerald-400"
    if (line.tip) return "text-amber-400/80"
    if (line.muted) return "text-zinc-500 pl-4"
    if (i < 2) return "text-zinc-500"
    return "text-zinc-300"
  }

  return (
    <div className="container max-w-2xl py-32">
      <div
        className="rounded-lg border border-border/60 bg-zinc-950 dark:bg-zinc-950 overflow-hidden font-mono cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 select-none">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-auto text-xs text-zinc-500">isaacadjei@portfolio — not-found</span>
        </div>

        {/* Boot output */}
        <div className="px-6 pt-6 pb-2 space-y-1 text-sm">
          {BOOT_LINES.slice(0, booted).map((line, i) => (
            <p key={i} className={lineClass(line, i)}>
              {line.cmd ? (
                <>
                  <span className="text-primary mr-2">$</span>
                  {line.text}
                </>
              ) : (
                line.text
              )}
            </p>
          ))}

          {/* Clickable shortcuts — shown after boot, with clear visual cue */}
          {ready && (
            <div className="pt-3 pb-1 space-y-0.5">
              {PAGES.slice(0, 8).map((page) => (
                <div key={page.href} className="flex items-center gap-2 group">
                  <span className="text-primary select-none">$</span>
                  <button
                    type="button"
                    onClick={() => router.push(page.href)}
                    className="text-cyan-400 hover:text-cyan-200 hover:underline transition-colors font-mono"
                  >
                    go {page.label}
                  </button>
                  <span className="text-zinc-600 text-xs">→ {page.href}</span>
                  <span className="text-zinc-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    ← click
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Command history */}
          {history.map((line, i) => (
            <p
              key={`h-${i}`}
              className={lineClass(line, i)}
            >
              {line.cmd ? (
                <>
                  <span className="text-primary mr-2">$</span>
                  {line.text}
                </>
              ) : (
                line.text
              )}
            </p>
          ))}

          {/* Input line */}
          {ready && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 pb-4">
              <span className="text-primary select-none">$</span>
              <input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none caret-amber-400"
                placeholder="type 'go blog', 'go home', 'help'..."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <span className="text-zinc-700 text-xs select-none shrink-0">press enter ↵</span>
            </form>
          )}

          <div ref={bottomRef} />
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
