"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { posts } from "@/data/blog"

// ── Types ─────────────────────────────────────────────────────────────────────
type WindowState = "normal" | "minimized" | "maximized" | "closed"
type LineType    = "system" | "cmd-echo" | "output" | "error" | "info" | "blank"

interface Line { type: LineType; text: string }

// ── Constants ─────────────────────────────────────────────────────────────────
const HOST = "zacess@portfolio:~/blog"

const TYPE_LABEL: Record<string, string> = {
  blog: "blog", journal: "journal", research: "research", notes: "notes",
}

const BOOT: Line[] = [
  { type: "system", text: "zacess-blog v0.1.0-alpha" },
  { type: "system", text: "kernel: loading writing module..." },
  { type: "system", text: "checking drafts......" },
  { type: "system", text: "environment: ready" },
  { type: "blank",  text: "" },
]

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    { type: "info",   text: "available commands:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  help      -  list available commands" },
    { type: "output", text: "  about     -  who is isaac adjei" },
    { type: "output", text: "  blog      -  upcoming posts and drafts" },
    { type: "output", text: "  projects  -  featured engineering work" },
    { type: "output", text: "  skills    -  technical stack overview" },
    { type: "output", text: "  contact   -  how to get in touch" },
    { type: "output", text: "  links     -  social and professional links" },
    { type: "output", text: "  cv        -  curriculum vitae" },
    { type: "output", text: "  motto     -  a word of motivation" },
    { type: "output", text: "  status    -  blog build status" },
    { type: "output", text: "  clear     -  clear the terminal" },
  ],

  about: () => [
    { type: "info",   text: "user:" },
    { type: "output", text: "  name:    Isaac (Zac) Adjei" },
    { type: "output", text: "  role:    Electronic Engineering & CS Student" },
    { type: "output", text: "  school:  Aston University, Birmingham, UK" },
    { type: "output", text: "  grade:   Predicted First Class" },
    { type: "blank",  text: "" },
    { type: "info",   text: "focus:" },
    { type: "output", text: "  → Embedded Systems & Microcontrollers" },
    { type: "output", text: "  → PCB Design & Circuit Theory" },
    { type: "output", text: "  → IoT & Smart Systems" },
    { type: "output", text: "  → AI / ML & Data" },
    { type: "output", text: "  → Web Development" },
    { type: "output", text: "  → Accessible Technology" },
  ],

  blog: () => [
    { type: "info",  text: `draft queue  (${posts.length} posts):` },
    { type: "blank", text: "" },
    ...posts.map((p) => ({
      type: "output" as LineType,
      text: `  [${TYPE_LABEL[p.type]}]  ${p.title}${p.published ? "  ● live" : ""}`,
    })),
    { type: "blank",  text: "" },
    { type: "output", text: "  blog is under construction - posts coming soon" },
  ],

  projects: () => [
    { type: "info",   text: "featured projects:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  [embedded]     4x4x4 NeoPixel LED Cube" },
    { type: "output", text: "                 Arduino · C++ · WS2812B" },
    { type: "blank",  text: "" },
    { type: "output", text: "  [open-source]  git-unlocked - complete Git course" },
    { type: "output", text: "                 Git · GitHub · GitLab · Markdown" },
    { type: "blank",  text: "" },
    { type: "output", text: "  [web]          AstonCV - full-stack CV database" },
    { type: "output", text: "                 PHP 8.2 · MySQL · CSS · Apache" },
    { type: "blank",  text: "" },
    { type: "output", text: "  → view all at /projects" },
  ],

  skills: () => [
    { type: "info",   text: "technical stack:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  languages:  C · C++ · Python · Java · TypeScript · PHP" },
    { type: "output", text: "  embedded:   Arduino · STM32 · ESP32 · Raspberry Pi · AVR" },
    { type: "output", text: "  hardware:   KiCad · Proteus · Oscilloscope · PCB Layout" },
    { type: "output", text: "  web:        Next.js · React · Node.js · Tailwind CSS" },
    { type: "output", text: "  ai / ml:    TensorFlow · PyTorch · NumPy · Pandas" },
    { type: "output", text: "  cloud:      AWS · Azure · Vercel · Docker · Cloudflare" },
    { type: "output", text: "  tools:      Git · GitHub · VS Code · JetBrains" },
    { type: "blank",  text: "" },
    { type: "output", text: "  → full list at /skills" },
  ],

  contact: () => [
    { type: "info",   text: "contact:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  email:     contact@zacess.com" },
    { type: "output", text: "  linkedin:  linkedin.com/in/isaacadjei" },
    { type: "output", text: "  github:    github.com/zaccesss" },
    { type: "blank",  text: "" },
    { type: "output", text: "  open to internships, placements & professional" },
    { type: "output", text: "  roles in engineering and tech" },
    { type: "output", text: "  response within 24-48 hours" },
  ],

  links: () => [
    { type: "info",   text: "links:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  portfolio:  isaacadjei.me" },
    { type: "output", text: "  github:     github.com/zaccessss" },
    { type: "output", text: "  linkedin:   linkedin.com/in/isaacadjei" },
    { type: "output", text: "  youtube:    youtube.com/@zaccess" },
    { type: "output", text: "  discord:    discord.gg/habvhrGX4s" },
    { type: "output", text: "  x:          x.com/zaccessss" },
    { type: "output", text: "  substack:   substack.com/@zaccess" },
  ],

  cv: () => [
    { type: "info",   text: "curriculum vitae:" },
    { type: "blank",  text: "" },
    { type: "output", text: "  → download: /resume/Isaac_Adjei_CV.pdf" },
    { type: "blank",  text: "" },
    { type: "output", text: "  includes:  education · experience · skills · projects" },
    { type: "output", text: "  last updated: 2025" },
  ],

  motto: () => [
    { type: "blank",  text: "" },
    { type: "info",   text: '  "The people who are crazy enough to think they' },
    { type: "info",   text: '   can change the world are the ones who do."' },
    { type: "blank",  text: "" },
    { type: "output", text: "                                        - Steve Jobs" },
    { type: "blank",  text: "" },
  ],

  status: () => [
    { type: "info",   text: "system:  ZacessOS v1.0-beta" },
    { type: "output", text: "build:   blog v0.1.0-alpha - in progress" },
    { type: "blank",  text: "" },
    { type: "info",   text: "ready now:" },
    { type: "output", text: "  → portfolio at isaacadjei.me" },
    { type: "output", text: "  → CV available for download  (try: cv)" },
    { type: "output", text: "  → contact via contact@zacess.com" },
    { type: "blank",  text: "" },
    { type: "info",   text: "coming soon:" },
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
    line.type === "system" ? "text-zinc-500"
    : line.type === "info"   ? "text-blue-400"
    : line.type === "error"  ? "text-red-400"
    :                          "text-zinc-300"

  // Split on → to colour arrows cyan; split on ● live to colour green
  const parts = line.text.split(/(→|● live)/)
  return (
    <div key={i} className={`font-mono text-xs leading-relaxed ${cls}`}>
      {parts.map((part, j) =>
        part === "→"      ? <span key={j} className="text-cyan-400">→</span>
        : part === "● live" ? <span key={j} className="text-green-400">● live</span>
        :                     <span key={j}>{part}</span>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [lines,      setLines]      = useState<Line[]>([])
  const [booted,     setBooted]     = useState(false)
  const [inputVal,   setInputVal]   = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx,    setHistIdx]    = useState(-1)
  const [winState,   setWinState]   = useState<WindowState>("normal")

  const inputRef  = useRef<HTMLInputElement>(null)
  const bodyRef   = useRef<HTMLDivElement>(null)

  // Boot sequence then auto-run help
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < BOOT.length) {
        const line = BOOT[i]
        i++
        setLines(prev => [...prev, line])
      } else {
        clearInterval(timer)
        setTimeout(() => {
          setBooted(true)
          setLines(prev => [
            ...prev,
            ...COMMANDS.help(),
            { type: "blank", text: "" },
          ])
        }, 350)
      }
    }, 110)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, inputVal])

  const execCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()

    if (!cmd) {
      setLines(prev => [...prev, { type: "blank", text: "" }])
      return
    }

    setCmdHistory(prev => [raw.trim(), ...prev])
    setHistIdx(-1)

    if (cmd === "clear") {
      setLines([])
      setInputVal("")
      return
    }

    const output: Line[] = COMMANDS[cmd]
      ? COMMANDS[cmd]()
      : [
          { type: "error",  text: `bash: ${cmd}: command not found` },
          { type: "output", text: "type 'help' to see available commands" },
        ]

    setLines(prev => [
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
  const isClosed    = winState === "closed"

  return (
    <div className="container max-w-3xl py-24 space-y-8">

      {/* Banner + GIF - hidden when maximised or closed */}
      {!isMaximized && !isClosed && (
        <>
          <div className="text-center space-y-1">
            <p className="font-mono text-sm font-semibold tracking-widest uppercase text-yellow-500">
              ⚠️ blog // under construction ⚠️
            </p>
            <p className="font-mono text-xs text-muted-foreground">writing module is being built - check back soon</p>
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
              <button type="button" title="Close"
                onClick={() => setWinState("closed")}
                className="h-3 w-3 rounded-full bg-red-500 hover:brightness-125 transition-all cursor-pointer" />
              <button type="button" title="Minimise"
                onClick={() => setWinState(isMinimized ? "normal" : "minimized")}
                className="h-3 w-3 rounded-full bg-yellow-400 hover:brightness-125 transition-all cursor-pointer" />
              <button type="button" title="Maximise"
                onClick={() => setWinState(isMaximized ? "normal" : "maximized")}
                className="h-3 w-3 rounded-full bg-green-500 hover:brightness-125 transition-all cursor-pointer" />
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
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="absolute inset-0 opacity-0 w-full bg-transparent outline-none"
                    />
                    {/* Visual mirror */}
                    <span className="text-green-300 font-mono text-xs whitespace-pre">{inputVal}</span>
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
          <p className="text-xs font-mono text-primary uppercase tracking-widest">motivation</p>
          <p className="text-base font-medium leading-relaxed">
            &ldquo;The people who are crazy enough to think they can change the world are the ones who do.&rdquo;
          </p>
          <p className="text-xs text-muted-foreground">— Steve Jobs</p>
        </div>
      )}

      {/* Footer hint */}
      {!isMaximized && (
        <p className="text-center text-xs text-muted-foreground font-mono">
          writing is being rebuilt - use{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          {" "}+{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">I</kbd>
          {" "}to navigate the rest of the site
        </p>
      )}
    </div>
  )
}
