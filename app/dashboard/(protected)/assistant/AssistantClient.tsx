"use client"
// The chat UI for my read-only dashboard assistant. I manage the input myself (AI SDK v6 no longer
// owns it) and send the chosen model with each message so the switcher takes effect immediately. The
// assistant only ever renders text - it has no power to change my data.

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Sparkles, Bot, User } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"

const MODELS = [
  { id: "gemini", label: "Gemini (Google)" },
  { id: "groq", label: "Groq Llama 3.3 70B" },
  { id: "openrouter:deepseek/deepseek-r1:free", label: "DeepSeek R1" },
  { id: "openrouter:deepseek/deepseek-chat:free", label: "DeepSeek V3" },
  { id: "openrouter:meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
]

const SUGGESTIONS = [
  "Summarise my week",
  "What should I focus on today?",
  "How many minutes have I coded today?",
  "Which applications are still pending?",
]

export default function AssistantClient({ configured }: { configured: boolean }) {
  const [model, setModel] = useState("gemini")
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dashboard/assistant" }),
  })
  const busy = status === "submitted" || status === "streaming"

  function submit(text: string) {
    const t = text.trim()
    if (!t || busy) return
    setInput("")
    sendMessage({ text: t }, { body: { model } })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Assistant</h1>
            <p className="text-xs text-muted-foreground">Read-only - it can answer and draft, never change your data.</p>
          </div>
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Model"
          className="text-xs border border-border rounded-md px-2 py-1.5 bg-background"
        >
          {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Bot className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Ask me about your week, applications, coding or goals.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="text-xs border border-border rounded-full px-3 py-1.5 hover:border-primary/40 hover:bg-muted/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`rounded-2xl px-3.5 py-2 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.parts.map((part, i) =>
                part.type === "text"
                  ? (m.role === "user"
                      ? <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      : <MarkdownContent key={i} compact>{part.text}</MarkdownContent>)
                  : null,
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-destructive text-center">Something went wrong - try another model from the dropdown.</p>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(input) }} className="flex items-center gap-2 pt-3 border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={configured ? "Ask anything..." : "Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel to enable"}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
