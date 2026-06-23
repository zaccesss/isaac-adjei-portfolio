import { streamText, convertToModelMessages, tool, stepCountIs, type UIMessage } from "ai"
import { z } from "zod"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { checkRateLimit, heavyApiLimiter, getIp } from "@/lib/ratelimit"

// My in-dashboard AI assistant. It is READ-ONLY by construction: it can read a fixed allow-list of my
// own non-sensitive sections (via the getDashboardData tool) and stream back text. It has NO write or
// delete capability and NO access to private sections (vault, diary, notes, university, contacts, etc.)
// - there is simply no code path to them, so a prompt can never reach them. Behind the dashboard
// session, rate limited, keys server-side only. Chats are not persisted anywhere.
export const runtime = "nodejs"
export const maxDuration = 60

// The ONLY sections the assistant can ever read. Everything else (vault, diary, notes, university,
// contacts, us, me, inventory, wishlist, activity log, settings, trash) is intentionally absent.
const SECTIONS = ["applications", "coding", "streaks", "habits", "goals", "faith", "study", "health", "content"] as const

const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

async function readSection(section: (typeof SECTIONS)[number]): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    if (section === "applications") {
      const { data } = await supabase.from("applications").select("company,role,status,type,applied_date").not("status", "in", '("scraped")').order("created_at", { ascending: false }).limit(80)
      const rows = data ?? []
      const byStatus: Record<string, number> = {}
      for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
      const tracked = rows.filter((r) => r.status !== "Not Applied" && r.status !== "Not Interested")
      const recent = tracked.slice(0, 15).map((r) => `${r.company} - ${r.role} [${r.status}]`).join("; ")
      return `By status: ${Object.entries(byStatus).map(([s, c]) => `${s}: ${c}`).join(", ")}. Tracked applications: ${tracked.length}. Recent: ${recent || "none"}`
    }
    if (section === "coding") {
      const { data } = await supabase.from("wakatime_daily").select("date,total_seconds,languages").gte("date", since(90))
      const wd = (data ?? []) as { date: string; total_seconds: number | null; languages: { name: string; total_seconds: number }[] | null }[]
      const h = (from: string) => (wd.filter((r) => r.date >= from).reduce((a, r) => a + (r.total_seconds ?? 0), 0) / 3600).toFixed(1)
      const lt: Record<string, number> = {}
      for (const r of wd) for (const l of r.languages ?? []) lt[l.name] = (lt[l.name] ?? 0) + (l.total_seconds ?? 0)
      const top = Object.entries(lt).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, s]) => `${n} (${(s / 3600).toFixed(1)}h)`).join(", ")
      return `Coding hours - today ${h(today)}, 7d ${h(since(7))}, 30d ${h(since(30))}, 90d ${h(since(90))}. Top languages (90d): ${top || "none"}`
    }
    if (section === "streaks") {
      const [{ data: streaks }, { data: logs }] = await Promise.all([
        supabase.from("streaks").select("id,name").eq("active", true),
        supabase.from("streak_logs").select("streak_id,date").gte("date", since(60)),
      ])
      const byId: Record<string, string[]> = {}
      for (const l of logs ?? []) (byId[l.streak_id] = byId[l.streak_id] ?? []).push(l.date)
      return (streaks ?? []).map((s) => `${s.name}: ${(byId[s.id] ?? []).length} check-ins in 60d, last ${(byId[s.id] ?? []).sort().slice(-1)[0] ?? "never"}`).join("; ") || "no active streaks"
    }
    if (section === "habits") {
      const [{ data: habits }, { data: logs }] = await Promise.all([
        supabase.from("habits").select("id,name").eq("active", true),
        supabase.from("habit_logs").select("habit_id,date").gte("date", since(30)),
      ])
      const byId: Record<string, number> = {}
      for (const l of logs ?? []) byId[l.habit_id] = (byId[l.habit_id] ?? 0) + 1
      return (habits ?? []).map((hb) => `${hb.name}: ${byId[hb.id] ?? 0} days in last 30`).join("; ") || "no active habits"
    }
    if (section === "goals") {
      const { data } = await supabase.from("goals").select("title,status,category")
      const rows = data ?? []
      const open = rows.filter((g) => g.status !== "done")
      return `Open goals (${open.length}): ${open.map((g) => `${g.title} [${g.category ?? "general"}, ${g.status}]`).join("; ") || "none"}. Completed: ${rows.length - open.length}`
    }
    if (section === "faith") {
      const { data } = await supabase.from("faith_entries").select("type,date,notes").order("date", { ascending: false }).limit(40)
      return (data ?? []).map((f) => `${f.date} ${f.type}${f.notes ? `: ${String(f.notes).slice(0, 120)}` : ""}`).join("\n") || "no faith entries logged"
    }
    if (section === "study") {
      const { data } = await supabase.from("study_sessions").select("subject,duration_m,date").gte("date", since(60)).order("date", { ascending: false })
      const rows = data ?? []
      const totalH = (rows.reduce((a, r) => a + (r.duration_m ?? 0), 0) / 60).toFixed(1)
      const bySubject: Record<string, number> = {}
      for (const r of rows) bySubject[r.subject] = (bySubject[r.subject] ?? 0) + (r.duration_m ?? 0)
      return `Study last 60d: ${totalH}h total. By subject: ${Object.entries(bySubject).sort((a, b) => b[1] - a[1]).map(([s, m]) => `${s} ${(m / 60).toFixed(1)}h`).join(", ") || "none"}`
    }
    if (section === "health") {
      const [{ data: workouts }, { data: metrics }] = await Promise.all([
        supabase.from("health_workouts").select("date,type").gte("date", since(30)).order("date", { ascending: false }).limit(30),
        supabase.from("body_metrics").select("metric,value,unit,date").order("date", { ascending: false }).limit(12),
      ])
      const latest: Record<string, string> = {}
      for (const m of metrics ?? []) if (!latest[m.metric]) latest[m.metric] = `${m.value}${m.unit ?? ""} (${m.date})`
      return `Workouts last 30d: ${(workouts ?? []).length}. Latest body metrics: ${Object.entries(latest).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`
    }
    if (section === "content") {
      const [{ data: os }, { count: reads }] = await Promise.all([
        supabase.from("opensource_contributions").select("repo,title,status").order("created_at", { ascending: false }).limit(20),
        supabase.from("blog_read_events").select("id", { count: "exact", head: true }),
      ])
      return `Open-source contributions (${(os ?? []).length}): ${(os ?? []).map((c) => `${c.repo}${c.title ? ` - ${c.title}` : ""} [${c.status ?? ""}]`).join("; ") || "none"}. Total blog post reads tracked: ${reads ?? 0}`
    }
    return "Unknown section."
  } catch {
    return "That section is currently unavailable."
  }
}

function hasFiles(messages: UIMessage[]): boolean {
  return messages.some((m) => m.parts?.some((p) => p.type === "file"))
}

function pickModel(choice: string | undefined, multimodal: boolean) {
  const groqKey = process.env.GROQ_API_KEY
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const orKey = process.env.OPENROUTER_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const moonshotKey = process.env.MOONSHOT_API_KEY
  const zaiKey = process.env.ZAI_API_KEY
  const githubToken = process.env.GITHUB_MODELS_TOKEN
  const minimaxKey = process.env.MINIMAX_API_KEY
  // Files (images/PDFs) need a multimodal model - Gemini (free) first, then Claude/GPT if their keys exist.
  if (multimodal) {
    if (googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.5-flash")
    if (anthropicKey) return createAnthropic({ apiKey: anthropicKey })("claude-sonnet-4-6")
    if (openaiKey) return createOpenAI({ apiKey: openaiKey })("gpt-4o")
    return null
  }
  // Provider-prefixed ids: "groq:<id>", "openrouter:<id>", "anthropic:<id>", "openai:<id>".
  const c = choice || "gemini"
  if (c.startsWith("groq:") && groqKey) return createGroq({ apiKey: groqKey })(c.slice(5))
  if (c.startsWith("openrouter:") && orKey) return createOpenRouter({ apiKey: orKey })(c.slice(11))
  if (c.startsWith("anthropic:") && anthropicKey) return createAnthropic({ apiKey: anthropicKey })(c.slice(10))
  if (c.startsWith("openai:") && openaiKey) return createOpenAI({ apiKey: openaiKey })(c.slice(7))
  // Frontier open models exposed over OpenAI-compatible endpoints.
  if (c.startsWith("deepseek:") && deepseekKey) return createOpenAICompatible({ name: "deepseek", baseURL: "https://api.deepseek.com/v1", apiKey: deepseekKey })(c.slice(9))
  if (c.startsWith("kimi:") && moonshotKey) return createOpenAICompatible({ name: "moonshot", baseURL: "https://api.moonshot.ai/v1", apiKey: moonshotKey })(c.slice(5))
  if (c.startsWith("glm:") && zaiKey) return createOpenAICompatible({ name: "zai", baseURL: "https://api.z.ai/api/paas/v4", apiKey: zaiKey })(c.slice(4))
  if (c.startsWith("github:") && githubToken) return createOpenAICompatible({ name: "github", baseURL: "https://models.github.ai/inference", apiKey: githubToken })(c.slice(7))
  if (c.startsWith("minimax:") && minimaxKey) return createOpenAICompatible({ name: "minimax", baseURL: "https://api.minimax.io/v1", apiKey: minimaxKey })(c.slice(8))
  if (c.startsWith("google:") && googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })(c.slice(7))
  if (c === "groq" && groqKey) return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  if (c === "gemini" && googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.5-flash")
  // Fallback so an unconfigured choice still answers with whatever IS available.
  if (googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.5-flash")
  if (groqKey) return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  if (orKey) return createOpenRouter({ apiKey: orKey })("meta-llama/llama-3.3-70b-instruct:free")
  return null
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response("Unauthorised", { status: 401, headers: { "Cache-Control": "no-store" } })
  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return new Response("Too many requests", { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json()
  const multimodal = hasFiles(messages)
  const chosen = pickModel(model, multimodal)
  if (!chosen) {
    return new Response(
      multimodal
        ? "Image and file analysis needs the Gemini key (GOOGLE_AI_API_KEY) in Vercel."
        : "The AI assistant is not configured yet. Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  const system = [
    "You are Isaac's personal dashboard assistant.",
    "You are READ-ONLY. You can read his data with the getDashboardData tool and answer or draft text,",
    "but you cannot change, add or delete anything. Call the tool when a question needs real data.",
    "Available sections: applications, coding, streaks, habits, goals, faith, study, health, content.",
    "You have NO access to private sections (vault, diary, notes, university, contacts). If asked about",
    "those, say plainly that they are private and you cannot read them. Be concise, practical and use UK",
    "English. For a Bible-verse suggestion, read the faith section first so you do not repeat recent reading.",
  ].join("\n")

  const result = streamText({
    model: chosen,
    system,
    messages: await convertToModelMessages(messages),
    tools: {
      getDashboardData: tool({
        description: "Read Isaac's own dashboard data (READ-ONLY). Returns a summary for one section. Private sections are not available.",
        inputSchema: z.object({ section: z.enum(SECTIONS) }),
        execute: async ({ section }) => readSection(section),
      }),
    },
    stopWhen: stepCountIs(5),
  })
  // I surface the real provider error to the client (this is my own private, auth-gated dashboard), so
  // a failing model shows me exactly why - invalid key, quota, model access - instead of a vague message.
  return result.toUIMessageStreamResponse({
    onError: (error) => (error instanceof Error ? error.message : String(error)),
  })
}
