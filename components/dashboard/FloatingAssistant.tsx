"use client"
// ZACCESS - my personal read-only assistant in a quick popover. It has no floating icon of its own; it
// opens when I pick "ZACCESS" from the + quick menu (which dispatches a "zaccess:open" event), so there is
// only one floating button on the page. It only mounts on the pages whose data the assistant can read
// (ZACCESS_PAGES), so it never appears on my private pages. For the full experience (model switcher,
// saved chats, file upload) I open the dedicated /dashboard/assistant page.

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Sparkles, X, Send, Square } from "lucide-react"
import Link from "next/link"
import MarkdownContent from "@/components/shared/MarkdownContent"

// Pages where the assistant has data and may appear. Anything not listed (private sections) gets nothing.
export const ZACCESS_PAGES = [
  "/dashboard/applications",
  "/dashboard/analytics",
  "/dashboard/coding",
  "/dashboard/streaks",
  "/dashboard/habits",
  "/dashboard/goals",
  "/dashboard/faith",
  "/dashboard/study",
  "/dashboard/opensource",
  "/dashboard/post-analytics",
  "/dashboard/university",
  "/dashboard/course",
  "/dashboard/modules",
  "/dashboard/calendar",
  "/dashboard/inventory",
  "/dashboard/wishlist",
]

export function isZaccessPage(pathname: string): boolean {
  return ZACCESS_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export default function FloatingAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dashboard/assistant" }),
  })
  const busy = status === "submitted" || status === "streaming"
  const show = isZaccessPage(pathname)

  // I listen for the open event from the + quick menu, only while on a page the assistant is allowed on.
  useEffect(() => {
    if (!show) return
    const handler = () => setOpen(true)
    window.addEventListener("zaccess:open", handler)
    return () => window.removeEventListener("zaccess:open", handler)
  }, [show])

  if (!show || !open) return null

  function submit() {
    const t = input.trim()
    if (!t || busy) return
    setInput("")
    // Defaults to Gemini 2.5 Flash - free, fast and the most accurate free model at sticking to my data.
    sendMessage({ text: t }, { body: { model: "gemini" } })
  }

  return (
    <div className="fixed bottom-[5.5rem] right-6 z-50 w-[min(22rem,calc(100vw-2rem))] h-[26rem] max-h-[70vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">ZACCESS</p>
            <p className="text-[10px] text-muted-foreground">read-only - reads my data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/assistant" className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2">Full assistant</Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pr-2 flex flex-col gap-3 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground m-auto text-center px-2">Ask me a quick question about this page or anything else. I never change your data.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded-2xl px-3 py-1.5 max-w-[88%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.parts.map((p, i) =>
                p.type === "text"
                  ? m.role === "user"
                    ? <span key={i} className="whitespace-pre-wrap">{p.text}</span>
                    : <MarkdownContent key={i} compact>{p.text}</MarkdownContent>
                  : null,
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-destructive text-center break-words">{error.message || "That model is busy - try again."}</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex items-center gap-2 p-2 border-t border-border shrink-0">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          autoFocus
          className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {busy ? (
          <button type="button" onClick={() => stop()} aria-label="Stop" className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 hover:bg-muted/70"><Square className="h-3 w-3" /></button>
        ) : (
          <button type="submit" disabled={!input.trim()} aria-label="Send" className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 shrink-0"><Send className="h-3.5 w-3.5" /></button>
        )}
      </form>
    </div>
  )
}
