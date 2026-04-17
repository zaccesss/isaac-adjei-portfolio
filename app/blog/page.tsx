"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { posts } from "@/data/blog"

// ── Types ─────────────────────────────────────────────────────────────────────
type WindowState = "normal" | "minimized" | "maximized" | "closed"
type LineType = "system" | "cmd-echo" | "output" | "error" | "info" | "blank"

interface Line {
  type: LineType
  text: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HOST = "zacess@portfolio:~/blog"

const TYPE_LABEL: Record<string, string> = {
  blog: "blog",
  journal: "journal",
  research: "research",
  notes: "notes",
}

const BOOT: Line[] = [
  { type: "system", text: "zacess-blog v0.1.0-alpha" },
  { type: "system", text: "kernel: loading writing module..." },
  { type: "system", text: "checking drafts......" },
  { type: "system", text: "environment: ready" },
  { type: "blank", text: "" },
]

const NAV_COMMANDS: Record<string, string> = {
  about: "https://isaacadjei.me/about",
  projects: "https://isaacadjei.me/projects",
  skills: "https://isaacadjei.me/skills",
  contact: "https://isaacadjei.me/contact",
  links: "https://isaacadjei.me/links",
  cv: "https://isaacadjei.me/cv",
}

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    { type: "info", text: "blog terminal commands:" },
    { type: "blank", text: "" },
    { type: "output", text: "  help      -  list available commands" },
    { type: "output", text: "  about     -  open about page" },
    { type: "output", text: "  projects  -  open projects page" },
    { type: "output", text: "  skills    -  open skills page" },
    { type: "output", text: "  contact   -  open contact page" },
    { type: "output", text: "  links     -  open links page" },
    { type: "output", text: "  cv        -  open CV page" },
    { type: "output", text: "  posts     -  all writing entries" },
    { type: "output", text: "  live      -  published posts with slugs" },
    { type: "output", text: "  drafts    -  works in progress" },
    { type: "output", text: "  topics    -  active tags and themes" },
    { type: "output", text: "  now       -  what is being written right now" },
    { type: "output", text: "  motto     -  quick motivation" },
    { type: "output", text: "  status    -  blog build status" },
    { type: "output", text: "  zac       -  easter egg" },
    { type: "output", text: "  sudo      -  definitely do not run this" },
    { type: "output", text: "  whoami    -  identity check" },
    { type: "output", text: "  clear     -  clear the terminal" },
  ],

  posts: () => [
    { type: "info", text: `writing queue  (${posts.length} entries):` },
    { type: "blank", text: "" },
    ...posts.map((p) => ({
      type: "output" as LineType,
      text: `  [${TYPE_LABEL[p.type]}]  ${p.title}${p.published ? "  ● live" : "  • draft"}`,
    })),
    { type: "blank", text: "" },
    { type: "output", text: "  tip: run 'live' to get direct post slugs" },
  ],

  live: () => {
    const published = posts.filter((p) => p.published)
    return [
      { type: "info", text: `published now  (${published.length}):` },
      { type: "blank", text: "" },
      ...published.map((p) => ({
        type: "output" as LineType,
        text: `  → /blog/${p.slug}`,
      })),
    ]
  },

  drafts: () => {
    const draft = posts.filter((p) => !p.published)
    return [
      { type: "info", text: `draft pipeline  (${draft.length}):` },
      { type: "blank", text: "" },
      ...draft.map((p) => ({
        type: "output" as LineType,
        text: `  [${TYPE_LABEL[p.type]}]  ${p.title}`,
      })),
      { type: "blank", text: "" },
      { type: "output", text: "  more posts are in progress - watch this space" },
    ]
  },

  topics: () => {
    const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) =>
      a.localeCompare(b)
    )
    return [
      { type: "info", text: `active tags  (${tags.length}):` },
      { type: "blank", text: "" },
      { type: "output", text: `  ${tags.join("  ·  ")}` },
    ]
  },

  now: () => [
    { type: "info", text: "writing now:" },
    { type: "blank", text: "" },
    { type: "output", text: "  → journal entries from uni + placements" },
    { type: "output", text: "  → practical engineering write-ups" },
    { type: "output", text: "  → quick notes from labs and projects" },
    { type: "output", text: "  → reflections from virtual experiences" },
  ],

  about: () => [
    { type: "info", text: "opening: isaacadjei.me/about" },
    { type: "output", text: "launching in new tab..." },
  ],

  projects: () => [
    { type: "info", text: "opening: isaacadjei.me/projects" },
    { type: "output", text: "launching in new tab..." },
  ],

  skills: () => [
    { type: "info", text: "opening: isaacadjei.me/skills" },
    { type: "output", text: "launching in new tab..." },
  ],

  contact: () => [
    { type: "info", text: "opening: isaacadjei.me/contact" },
    { type: "output", text: "launching in new tab..." },
  ],

  links: () => [
    { type: "info", text: "opening: isaacadjei.me/links" },
    { type: "output", text: "launching in new tab..." },
  ],

  cv: () => [
    { type: "info", text: "opening: isaacadjei.me/cv" },
    { type: "output", text: "launching in new tab..." },
  ],

  motto: () => [
    { type: "blank", text: "" },
    { type: "info", text: '  "The people who are crazy enough to think they' },
    { type: "info", text: '   can change the world are the ones who do."' },
    { type: "blank", text: "" },
    { type: "output", text: "                                        - Steve Jobs" },
    { type: "blank", text: "" },
  ],

  zac: () => [
    { type: "info", text: "ACCESS GRANTED." },
    { type: "blank", text: "" },
    { type: "output", text: "  success unlocked. welcome to writer mode." },
    { type: "output", text: "  hidden perk: your curiosity stat increased +1" },
  ],

  sudo: () => [
    { type: "error", text: "permission denied: this terminal respects least privilege" },
    { type: "blank", text: "" },
    { type: "output", text: "  tip: try 'help' or 'posts' instead" },
  ],

  whoami: () => [
    { type: "info", text: "you are a curious reader in /blog" },
    { type: "blank", text: "" },
    { type: "output", text: "  role: terminal operator" },
    { type: "output", text: "  mission: discover live posts + hidden commands" },
  ],

  status: () => [
    { type: "info", text: "system:  ZacessOS v1.0-beta" },
    { type: "output", text: "build:   blog v0.1.0-alpha - in progress" },
    { type: "blank", text: "" },
    { type: "info", text: "ready now:" },
    { type: "output", text: "  → portfolio at isaacadjei.me" },
    { type: "output", text: "  → CV available for download  (try: cv)" },
    { type: "output", text: "  → contact via contact@zacess.com" },
    { type: "blank", text: "" },
    { type: "info", text: "coming soon:" },
    { type: "output", text: "  → blog posts and engineering write-ups" },
    { type: "output", text: "  → journal entries from uni and work" },
    { type: "output", text: "  → research notes and papers" },
  ],
}

// ── Line renderer ─────────────────────────────────────────────────────────────
function renderLine(line: Line, i: number) {
  if (line.type === "blank") return <div key={i} className="h-2" />

  if (line.type === "cmd-echo") {
    return (
      <div key={i} className="flex items-baseline gap-1.5 font-mono text-xs mt-1">
        <span className="text-cyan-400 shrink-0">{HOST}</span>
        <span className="text-green-400 shrink-0">$</span>
        <span className="text-green-300">{line.text}</span>
      </div>
    )
  }

  const cls =
    line.type === "system"
      ? "text-zinc-500"
      : line.type === "info"
        ? "text-blue-400"
        : line.type === "error"
          ? "text-red-400"
          : "text-zinc-300"

  // Split on → to colour arrows cyan; split on ● live to colour green
  const parts = line.text.split(/(→|● live)/)
  return (
    <div key={i} className={`font-mono text-xs leading-relaxed ${cls}`}>
      {parts.map((part, j) =>
        part === "→" ? (
          <span key={j} className="text-cyan-400">
            →
          </span>
        ) : part === "● live" ? (
          <span key={j} className="text-green-400">
            ● live
          </span>
        ) : (
          <span key={j}>{part}</span>
        )
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [booted, setBooted] = useState(false)
  const [inputVal, setInputVal] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [winState, setWinState] = useState<WindowState>("normal")

  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Fetch quote on mount and refresh every 30 minutes
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("/api/quote")
        const data = await res.json()
        setQuote(data)
      } catch {
        // silently keep previous quote
      }
    }
    fetchQuote()
    const interval = setInterval(fetchQuote, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Boot sequence then show a short hint (no command dump)
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT.length) {
        const line = BOOT[i]
        i++
        setLines((prev) => [...prev, line])
      } else {
        clearInterval(timer)
        setTimeout(() => {
          setBooted(true)
          setLines((prev) => [
            ...prev,
            { type: "info", text: "session initialised" },
            { type: "output", text: "type 'help' for a list of commands" },
            { type: "output", text: "try: posts, live, drafts, topics" },
            { type: "blank", text: "" },
          ])
        }, 350)
      }
    }, 110)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, inputVal])

  const execCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()

    if (!cmd) {
      setLines((prev) => [...prev, { type: "blank", text: "" }])
      return
    }

    setCmdHistory((prev) => [raw.trim(), ...prev])
    setHistIdx(-1)

    if (cmd === "clear") {
      setLines([])
      setInputVal("")
      return
    }

    const output: Line[] = COMMANDS[cmd]
      ? COMMANDS[cmd]()
      : [
          { type: "error", text: `bash: ${cmd}: command not found` },
          { type: "output", text: "type 'help' to see available commands" },
        ]

    const redirectUrl = NAV_COMMANDS[cmd]
    if (redirectUrl) {
      window.open(redirectUrl, "_blank", "noopener,noreferrer")
    }

    setLines((prev) => [
      ...prev,
      { type: "cmd-echo", text: raw.trim() },
      ...output,
      { type: "blank", text: "" },
    ])
    setInputVal("")
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execCommand(inputVal)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(idx)
      if (cmdHistory[idx] !== undefined) setInputVal(cmdHistory[idx])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInputVal(idx === -1 ? "" : cmdHistory[idx])
    }
  }

  const isMaximized = winState === "maximized"
  const isMinimized = winState === "minimized"
  const isClosed = winState === "closed"

  return (
    <div className="container max-w-3xl py-24 space-y-8">
      {/* Banner + GIF - hidden when maximised or closed */}
      {!isMaximized && !isClosed && (
        <>
          <div className="text-center space-y-1">
            <p className="font-mono text-sm font-semibold tracking-widest uppercase text-yellow-500">
              ⚠️ blog // under construction ⚠️
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              writing module is being built - check back soon
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Image
                src="/Media/giphy.gif"
                alt="Under construction"
                width={320}
                height={200}
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </>
      )}

      {/* ── Terminal ───────────────────────────────────────── */}
      {!isClosed ? (
        <div
          className={
            isMaximized
              ? "fixed inset-0 z-50 flex flex-col font-mono"
              : "rounded-lg border border-zinc-700 overflow-hidden shadow-xl font-mono"
          }
        >
          {/* Title bar - always dark */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title="Close"
                onClick={() => setWinState("closed")}
                className="h-3 w-3 rounded-full bg-red-500 hover:brightness-125 transition-all cursor-pointer"
              />
              <button
                type="button"
                title="Minimise"
                onClick={() => setWinState(isMinimized ? "normal" : "minimized")}
                className="h-3 w-3 rounded-full bg-yellow-400 hover:brightness-125 transition-all cursor-pointer"
              />
              <button
                type="button"
                title="Maximise"
                onClick={() => setWinState(isMaximized ? "normal" : "maximized")}
                className="h-3 w-3 rounded-full bg-green-500 hover:brightness-125 transition-all cursor-pointer"
              />
            </div>
            <span className="text-xs text-zinc-400">zacess@portfolio - blog - 80x24</span>
            <span className="w-14" />
          </div>

          {/* Body - always dark, collapses when minimised */}
          {!isMinimized && (
            <div
              ref={bodyRef}
              onClick={() => inputRef.current?.focus()}
              className={`bg-zinc-950 px-5 py-4 overflow-y-auto cursor-text select-text ${
                isMaximized ? "flex-1" : "min-h-[420px] max-h-[580px]"
              }`}
            >
              {lines.map((line, i) => renderLine(line, i))}

              {/* Interactive prompt */}
              {booted && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-cyan-400 font-mono text-xs shrink-0">{HOST}</span>
                  <span className="text-green-400 font-mono text-xs shrink-0">$</span>
                  <div className="relative flex items-center flex-1 min-w-0">
                    {/* Hidden real input captures keystrokes */}
                    <input
                      ref={inputRef}
                      type="text"
                      aria-label="Terminal input"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="absolute inset-0 opacity-0 w-full bg-transparent outline-none"
                    />
                    {/* Visual mirror */}
                    <span className="text-green-300 font-mono text-xs whitespace-pre">
                      {inputVal}
                    </span>
                    <span className="inline-block w-[7px] h-[13px] bg-zinc-300 ml-px shrink-0 animate-[blink_1s_step-end_infinite]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => setWinState("normal")}
            className="font-mono text-xs text-muted-foreground hover:text-foreground border border-border rounded px-4 py-2 transition-colors"
          >
            restore terminal ↩
          </button>
        </div>
      )}

      {/* Motivation - below terminal, hidden when maximised */}
      {!isMaximized && (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-primary uppercase tracking-widest">motivation</p>
            <button
              type="button"
              onClick={async () => {
                setQuote(null)
                const res = await fetch("/api/quote")
                const data = await res.json()
                setQuote(data)
              }}
              className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              refresh ↻
            </button>
          </div>
          {quote ? (
            <>
              <p className="text-base font-medium leading-relaxed">&ldquo;{quote.quote}&rdquo;</p>
              <p className="text-xs text-muted-foreground">- {quote.author}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground font-mono animate-pulse">
              loading quote...
            </p>
          )}
        </div>
      )}

      {/* Footer hint */}
      {!isMaximized && (
        <p className="text-center text-xs text-muted-foreground font-mono">
          writing is being rebuilt - use{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          + <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">I</kbd>{" "}
          to navigate the rest of the site
        </p>
      )}
    </div>
  )
}
