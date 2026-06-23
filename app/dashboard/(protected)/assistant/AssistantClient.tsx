"use client"
// The chat UI for my read-only dashboard assistant. I manage the input myself (AI SDK v6 no longer
// owns it) and send the chosen model with each message. The assistant reads an allow-list of my data
// and only ever returns text - it cannot change anything. Chats are ephemeral by default; saving is
// opt-in (the Save button), and saved chats can be reloaded or deleted individually.

import { useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Sparkles, Bot, User, Paperclip, Plus, X, Save, Trash2, PanelLeft } from "lucide-react"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { saveAiChat, getAiChat, deleteAiChat } from "@/app/dashboard/actions"

type SavedChat = { id: string; title: string; created_at: string }

const MODELS = [
  { id: "gemini", label: "Gemini 2.5 Flash (free, fast)" },
  { id: "google:gemini-2.5-pro", label: "Gemini 2.5 Pro (free)" },
  { id: "groq", label: "Groq Llama 3.3 (free, fastest)" },
  { id: "groq:openai/gpt-oss-120b", label: "GPT-OSS 120B (free)" },
  { id: "openrouter:qwen/qwen3-next-80b-a3b-instruct:free", label: "Qwen3 80B (free)" },
  { id: "openrouter:qwen/qwen3-coder:free", label: "Qwen3 Coder (free)" },
  { id: "openrouter:meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)" },
  { id: "openrouter:google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)" },
  // Claude - activate by adding ANTHROPIC_API_KEY in Vercel (paid).
  { id: "anthropic:claude-opus-4-8", label: "Claude Opus 4.8 (needs key)" },
  { id: "anthropic:claude-sonnet-4-6", label: "Claude Sonnet 4.6 (needs key)" },
  { id: "anthropic:claude-fable-5", label: "Claude Fable 5 (needs key)" },
  { id: "anthropic:claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (needs key)" },
  // OpenAI - activate by adding OPENAI_API_KEY in Vercel (paid).
  { id: "openai:gpt-5", label: "GPT-5 (needs key)" },
  { id: "openai:gpt-4.1", label: "GPT-4.1 (needs key)" },
  { id: "openai:gpt-4o", label: "GPT-4o (needs key)" },
  // Frontier open models - activate by adding their key (free signup credits, then paid).
  { id: "deepseek:deepseek-chat", label: "DeepSeek V4 (needs key)" },
  { id: "deepseek:deepseek-reasoner", label: "DeepSeek R1 (needs key)" },
  { id: "kimi:kimi-k2.6", label: "Kimi K2.6 (needs key)" },
  { id: "glm:glm-4.6", label: "GLM-4.6 (needs key)" },
  { id: "github:openai/gpt-4o", label: "GPT-4o via GitHub (free, needs token)" },
  { id: "github:openai/o1", label: "o1 via GitHub (free, needs token)" },
  { id: "minimax:MiniMax-M3", label: "MiniMax M3 (needs key)" },
]

const SUGGESTIONS = [
  "Summarise my week",
  "What should I focus on today?",
  "How many hours have I coded this month?",
  "Which applications are still pending?",
  "Suggest a Bible passage I haven't read recently",
]

export default function AssistantClient({ configured, initialChats }: { configured: boolean; initialChats: SavedChat[] }) {
  const [model, setModel] = useState("gemini")
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [chats, setChats] = useState<SavedChat[]>(initialChats)
  const [saving, setSaving] = useState(false)
  const [showChats, setShowChats] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dashboard/assistant" }),
  })
  const busy = status === "submitted" || status === "streaming"

  function submit(text: string) {
    const t = text.trim()
    if ((!t && !files?.length) || busy) return
    setInput("")
    sendMessage({ text: t, files: files ?? undefined }, { body: { model } })
    setFiles(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSave() {
    if (messages.length === 0 || saving) return
    setSaving(true)
    const firstUser = messages.find((m) => m.role === "user")?.parts.find((p) => p.type === "text")
    const title = (firstUser && "text" in firstUser ? firstUser.text : "").slice(0, 80) || "Saved chat"
    try {
      const row = await saveAiChat(title, messages)
      if (row && typeof row === "object" && "id" in row) setChats((c) => [row as SavedChat, ...c])
    } finally {
      setSaving(false)
    }
  }

  async function loadChat(id: string) {
    const msgs = await getAiChat(id)
    if (Array.isArray(msgs)) setMessages(msgs as typeof messages)
  }

  async function removeChat(id: string) {
    setChats((c) => c.filter((x) => x.id !== id))
    await deleteAiChat(id)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {showChats && (
        <aside className="hidden sm:flex flex-col w-52 shrink-0 border-r border-border pr-3 gap-2">
        <button type="button" onClick={() => setMessages([])} className="flex items-center gap-1.5 text-sm border border-border rounded-md px-2.5 py-1.5 hover:bg-muted w-full">
          <Plus className="h-4 w-4" />New chat
        </button>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mt-1">Saved chats</p>
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          {chats.length === 0 && <p className="text-xs text-muted-foreground px-1 py-2">Nothing saved yet</p>}
          {chats.map((c) => (
            <div key={c.id} className="group flex items-center gap-1 rounded-md hover:bg-muted/60 px-1.5 py-1">
              <button type="button" onClick={() => loadChat(c.id)} className="flex-1 text-left text-xs truncate" title={c.title}>{c.title}</button>
              <button type="button" onClick={() => removeChat(c.id)} aria-label="Delete chat" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" onClick={() => setShowChats((s) => !s)} aria-label="Toggle saved chats" title="Toggle saved chats" className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted shrink-0">
              <PanelLeft className="h-4 w-4" />
            </button>
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">Assistant</h1>
              <p className="text-xs text-muted-foreground truncate">Read-only - reads your data to answer, never changes it. Not saved unless you save it.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleSave} disabled={messages.length === 0 || saving} className="flex items-center gap-1 text-xs border border-border rounded-md px-2 py-1.5 hover:bg-muted disabled:opacity-40" title="Save this chat">
              <Save className="h-3.5 w-3.5" />{saving ? "Saving" : "Save"}
            </button>
            <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model" className="text-xs border border-border rounded-md px-2 py-1.5 bg-background">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Bot className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Ask me about your week, applications, coding, faith, health or goals.</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => submit(s)} className="text-xs border border-border rounded-full px-3 py-1.5 hover:border-primary/40 hover:bg-muted/50 transition-colors">{s}</button>
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
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return m.role === "user"
                      ? <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      : <MarkdownContent key={i} compact>{part.text}</MarkdownContent>
                  }
                  if (part.type === "file") {
                    if (part.mediaType?.startsWith("image/")) {
                      // eslint-disable-next-line @next/next/no-img-element
                      return <img key={i} src={part.url} alt="attachment" className="rounded-lg max-h-48 mt-1" />
                    }
                    return <div key={i} className="text-xs opacity-80 mt-1">📎 {part.filename ?? "file"}</div>
                  }
                  return null
                })}
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-destructive text-center break-words">{error.message || "That model is unavailable - pick another from the dropdown and try again."}</p>}
        </div>

        {files && files.length > 0 && (
          <div className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" />
            {files.length} file{files.length !== 1 ? "s" : ""} attached (analysed with Gemini)
            <button type="button" onClick={() => { setFiles(null); if (fileInputRef.current) fileInputRef.current.value = "" }} aria-label="Remove attachments"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit(input) }} className="flex items-center gap-2 pt-3 border-t border-border">
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple aria-label="Attach files" className="hidden" onChange={(e) => setFiles(e.target.files)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach image or PDF" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={configured ? "Ask anything, or attach an image/PDF..." : "Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel to enable"}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button type="submit" disabled={busy || (!input.trim() && !files?.length)} aria-label="Send" className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
