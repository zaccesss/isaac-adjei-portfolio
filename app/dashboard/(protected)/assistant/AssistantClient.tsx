"use client"
// The chat UI for my read-only dashboard assistant. I manage the input myself (AI SDK v6 no longer
// owns it) and send the chosen model with each message. The assistant reads an allow-list of my data
// and only ever returns text - it cannot change anything. Chats are ephemeral by default; saving is
// opt-in (the Save button) and saved chats can be reloaded or deleted individually.

import { useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Sparkles, Bot, User, Paperclip, Plus, X, Save, Trash2, PanelLeft, Square } from "lucide-react"
import { toast } from "sonner"
import MarkdownContent from "@/components/shared/MarkdownContent"
import { saveAiChat, getAiChat, deleteAiChat } from "@/app/dashboard/actions"

type SavedChat = { id: string; title: string; created_at: string }

// Each model carries its provider so the dropdown can show a live "add key" hint from the server's view
// of which keys are actually set, rather than a static label. Tier wording (free / rate-limited / trial /
// paid) stays in the label so I know what to expect before I pick one.
const MODELS = [
  // Free and reliable - no spend, work right now
  { id: "gemini", label: "Gemini 3.6 Flash (free, fast)", provider: "google" },
  { id: "groq", label: "Groq Llama 3.3 (free, fastest)", provider: "groq" },
  { id: "groq:openai/gpt-oss-120b", label: "GPT-OSS 120B (free)", provider: "groq" },
  { id: "groq:openai/gpt-oss-20b", label: "GPT-OSS 20B (free, fastest)", provider: "groq" },
  // Preview tier on Groq, not production, but still fully callable - confirmed live against
  // console.groq.com/docs/models. No Llama 4 on Groq at all as of this check, despite it existing
  // elsewhere - checked twice before ruling it out rather than guessing a plausible-looking id.
  { id: "groq:qwen/qwen3.6-27b", label: "Qwen3.6 27B (free, preview)", provider: "groq" },
  // Free tier but rate-limited - may be busy or slow. Every previous pick here (Qwen3, Llama 3.3,
  // Gemma 4) has since been pulled from OpenRouter's free tier entirely - confirmed live against
  // openrouter.ai/api/v1/models before swapping to what is actually free there now. GitHub Models
  // (the free github: provider entries this used to carry) was fully retired 2026-07-30 - removed
  // outright rather than left pointing at a dead endpoint.
  { id: "openrouter:nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra 550B (free, rate-limited)", provider: "openrouter" },
  { id: "openrouter:inclusionai/ling-3.0-flash:free", label: "Ling 3.0 Flash (free, rate-limited)", provider: "openrouter" },
  { id: "openrouter:poolside/laguna-s-2.1:free", label: "Laguna S 2.1, coding (free, rate-limited)", provider: "openrouter" },
  { id: "openrouter:poolside/laguna-xs-2.1:free", label: "Laguna XS 2.1, coding (free, rate-limited)", provider: "openrouter" },
  // Trial signup credits, then paid
  { id: "deepseek:deepseek-v4-flash", label: "DeepSeek V4 Flash (trial credit)", provider: "deepseek" },
  { id: "deepseek:deepseek-v4-pro", label: "DeepSeek V4 Pro (trial credit)", provider: "deepseek" },
  { id: "kimi:kimi-k2.6", label: "Kimi K2.6 (trial credit)", provider: "moonshot" },
  { id: "glm:glm-5.2", label: "GLM-5.2 (trial credit)", provider: "zai" },
  // Paid - need a funded plan even once the key is set
  { id: "google:gemini-3.5-flash", label: "Gemini 3.5 Flash, agentic/coding (paid Google plan)", provider: "google" },
  { id: "google:gemini-2.5-pro", label: "Gemini 2.5 Pro (paid Google plan)", provider: "google" },
  { id: "anthropic:claude-opus-5", label: "Claude Opus 5 (paid)", provider: "anthropic" },
  { id: "anthropic:claude-sonnet-5", label: "Claude Sonnet 5 (paid)", provider: "anthropic" },
  { id: "anthropic:claude-fable-5", label: "Claude Fable 5 (paid)", provider: "anthropic" },
  { id: "anthropic:claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (paid)", provider: "anthropic" },
  { id: "openai:gpt-5", label: "GPT-5 (paid)", provider: "openai" },
  { id: "openai:gpt-4.1", label: "GPT-4.1 (paid)", provider: "openai" },
  { id: "openai:gpt-4o", label: "GPT-4o (paid)", provider: "openai" },
  { id: "minimax:MiniMax-M3", label: "MiniMax M3 (paid)", provider: "minimax" },
]

const SUGGESTIONS = [
  "Summarise my week",
  "What should I focus on today?",
  "How many hours have I coded this month?",
  "Which applications are still pending?",
  "Suggest a Bible passage I haven't read recently",
]

// Vercel caps a serverless request body at 4.5MB and base64 inflates a file by ~1.37x, so a phone photo
// blows past it. I downscale images to <=1568px (what vision models use internally anyway) and re-encode
// as JPEG before sending and reject any non-image file that is still too large rather than let Vercel
// bounce it with an opaque error.
const MAX_DIM = 1568
const MAX_BYTES = 3_000_000

async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= MAX_BYTES) return file
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file
  } catch {
    return file
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function AssistantClient({ configured, initialChats, providers }: { configured: boolean; initialChats: SavedChat[]; providers: Record<string, boolean> }) {
  const [model, setModel] = useState("gemini")
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [chats, setChats] = useState<SavedChat[]>(initialChats)
  const [saving, setSaving] = useState(false)
  const [showChats, setShowChats] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dashboard/assistant" }),
  })
  const busy = status === "submitted" || status === "streaming"

  async function submit(text: string) {
    const t = text.trim()
    if ((!t && !files?.length) || busy) return
    let parts: { type: "file"; mediaType: string; filename: string; url: string }[] | undefined
    if (files?.length) {
      const processed = await Promise.all(Array.from(files).map(shrinkImage))
      const totalBytes = processed.reduce((sum, f) => sum + f.size, 0)
      if (totalBytes > MAX_BYTES) {
        toast.error(`Those files total about ${(totalBytes / 1e6).toFixed(1)}MB. Vercel caps a request at 4.5MB, so attach fewer or smaller files (images shrink automatically).`)
        return
      }
      parts = await Promise.all(
        processed.map(async (f) => ({ type: "file" as const, mediaType: f.type, filename: f.name, url: await readAsDataURL(f) })),
      )
    }
    setInput("")
    sendMessage({ text: t, files: parts }, { body: { model } })
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

      <div className="flex-1 flex flex-col min-w-0 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" onClick={() => setShowChats((s) => !s)} aria-label="Toggle saved chats" title="Toggle saved chats" className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted shrink-0">
              <PanelLeft className="h-4 w-4" />
            </button>
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">Assistant</h1>
              <p className="text-xs text-muted-foreground truncate">Read-only - reads my data to answer, never changes it. Not saved unless I save it.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleSave} disabled={messages.length === 0 || saving} className="flex items-center gap-1 text-xs border border-border rounded-md px-2 py-1.5 hover:bg-muted disabled:opacity-40" title="Save this chat">
              <Save className="h-3.5 w-3.5" />{saving ? "Saving" : "Save"}
            </button>
            <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model" className="text-xs border border-border rounded-md px-2 py-1.5 bg-background">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}{providers[m.provider] ? "" : " - add key"}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 pr-2 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Bot className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Ask about my week, projects, applications, coding, faith or goals.</p>
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
            placeholder={configured ? "Ask anything or attach an image/PDF..." : "Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel to enable"}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {busy ? (
            <button type="button" onClick={() => stop()} aria-label="Stop" title="Stop generating" className="h-9 w-9 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 hover:bg-muted/70">
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim() && !files?.length} aria-label="Send" className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 shrink-0">
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
