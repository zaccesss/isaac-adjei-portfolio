import { streamText, generateText, convertToModelMessages, tool, stepCountIs, type UIMessage } from "ai"
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
import { projects } from "@/data/projects"
import { experiences } from "@/data/experience"
import { education } from "@/data/education"
import { professionalSkillGroups } from "@/data/skills"
import { societies } from "@/data/societies"
import { posts } from "@/data/blog"
import { tilEntries } from "@/data/til"
import { publications } from "@/data/respub"

// My in-dashboard AI assistant. It is READ-ONLY by construction: it can read a fixed allow-list of my
// own non-sensitive sections (via the getDashboardData tool) and stream back text. It has NO write or
// delete capability and NO access to private sections (vault, diary, notes, university, contacts, etc.)
// - there is simply no code path to them, so a prompt can never reach them. Behind the dashboard
// session, rate limited, keys server-side only. Chats are not persisted anywhere.
export const runtime = "nodejs"
export const maxDuration = 60

// The ONLY sections the assistant can ever read. Everything else (vault, diary, notes, contacts, us, me,
// activity log, settings, trash) is intentionally absent - there is no tool path to it.
const SECTIONS = ["applications", "coding", "streaks", "habits", "goals", "faith", "study", "content", "university", "calendar", "inventory", "wishlist", "portfolio"] as const

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
      const { data } = await supabase.from("wakatime_daily").select("date,total_seconds,languages,projects,editors,operating_systems").gte("date", since(90))
      type Item = { name: string; total_seconds: number }
      const wd = (data ?? []) as { date: string; total_seconds: number | null; languages: Item[] | null; projects: Item[] | null; editors: Item[] | null; operating_systems: Item[] | null }[]
      const h = (from: string) => (wd.filter((r) => r.date >= from).reduce((a, r) => a + (r.total_seconds ?? 0), 0) / 3600).toFixed(1)
      const topOf = (key: "languages" | "projects" | "editors" | "operating_systems", n: number) => {
        const agg: Record<string, number> = {}
        for (const r of wd) for (const it of (r[key] as Item[] | null) ?? []) agg[it.name] = (agg[it.name] ?? 0) + (it.total_seconds ?? 0)
        return Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, n).map(([nm, s]) => `${nm} (${(s / 3600).toFixed(1)}h)`).join(", ") || "none"
      }
      return `Coding hours - today ${h(today)}, 7d ${h(since(7))}, 30d ${h(since(30))}, 90d ${h(since(90))}. Top languages: ${topOf("languages", 6)}. Top projects: ${topOf("projects", 6)}. Editors: ${topOf("editors", 4)}. OS: ${topOf("operating_systems", 3)}`
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
      // I read only the type and date here, never the free-text notes, so personal reflections never
      // leave the database for an external model.
      const { data } = await supabase.from("faith_entries").select("type,date").order("date", { ascending: false }).limit(60)
      return (data ?? []).map((f) => `${f.date} ${f.type}`).join("; ") || "no faith entries logged"
    }
    if (section === "study") {
      const { data } = await supabase.from("study_sessions").select("subject,duration_m,date").gte("date", since(60)).order("date", { ascending: false })
      const rows = data ?? []
      const totalH = (rows.reduce((a, r) => a + (r.duration_m ?? 0), 0) / 60).toFixed(1)
      const bySubject: Record<string, number> = {}
      for (const r of rows) bySubject[r.subject] = (bySubject[r.subject] ?? 0) + (r.duration_m ?? 0)
      return `Study last 60d: ${totalH}h total. By subject: ${Object.entries(bySubject).sort((a, b) => b[1] - a[1]).map(([s, m]) => `${s} ${(m / 60).toFixed(1)}h`).join(", ") || "none"}`
    }
    if (section === "content") {
      const [{ data: os }, { count: reads }] = await Promise.all([
        supabase.from("opensource_contributions").select("repo,title,status").order("created_at", { ascending: false }).limit(20),
        supabase.from("blog_read_events").select("id", { count: "exact", head: true }),
      ])
      return `Open-source contributions (${(os ?? []).length}): ${(os ?? []).map((c) => `${c.repo}${c.title ? ` - ${c.title}` : ""} [${c.status ?? ""}]`).join("; ") || "none"}. Total blog post reads tracked: ${reads ?? 0}`
    }
    if (section === "university") {
      const [{ data: mods }, { data: deadlines }] = await Promise.all([
        supabase.from("uni_modules").select("code,name,credits,target_grade,semester").eq("active", true).order("order_index"),
        supabase.from("uni_deadlines").select("title,type,due_date,weight_pct,status,grade_received").gte("due_date", since(14)).order("due_date", { ascending: true }).limit(15),
      ])
      const modList = (mods ?? []).map((m) => `${m.code ?? ""} ${m.name}${m.target_grade ? ` (target ${m.target_grade})` : ""}`).join("; ")
      const dueList = (deadlines ?? []).map((d) => `${d.title} [${d.type ?? "task"}, due ${d.due_date}${d.weight_pct ? `, ${d.weight_pct}%` : ""}, ${d.status ?? "pending"}${d.grade_received != null ? `, grade ${d.grade_received}` : ""}]`).join("; ")
      return `Active modules: ${modList || "none"}. Deadlines from two weeks ago onward (${(deadlines ?? []).length}): ${dueList || "none"}`
    }
    if (section === "calendar") {
      // I send the title and time only, not the location, so my whereabouts do not leave the database.
      const { data } = await supabase.from("calendar_events").select("title,start_at,event_type").eq("is_deleted", false).gte("start_at", new Date().toISOString()).order("start_at", { ascending: true }).limit(20)
      return `Upcoming events (${(data ?? []).length}): ${(data ?? []).map((e) => `${e.title}${e.start_at ? ` @ ${String(e.start_at).slice(0, 16).replace("T", " ")}` : ""}`).join("; ") || "none scheduled"}`
    }
    if (section === "inventory") {
      const { data } = await supabase.from("inventory_items").select("name,category,quantity").order("created_at", { ascending: false }).limit(80)
      const rows = data ?? []
      const byCat: Record<string, number> = {}
      for (const r of rows) byCat[r.category ?? "other"] = (byCat[r.category ?? "other"] ?? 0) + 1
      return `Inventory: ${rows.length} items. By category: ${Object.entries(byCat).map(([c, n]) => `${c}: ${n}`).join(", ") || "none"}. Items: ${rows.slice(0, 30).map((r) => `${r.name}${r.quantity && r.quantity > 1 ? ` x${r.quantity}` : ""}`).join("; ") || "none"}`
    }
    if (section === "wishlist") {
      const { data } = await supabase.from("wishlist").select("name,category,status,priority").order("created_at", { ascending: false }).limit(80)
      const rows = data ?? []
      return `Wishlist (${rows.length}): ${rows.map((r) => `${r.name}${r.category ? ` [${r.category}]` : ""}${r.priority ? ` (priority ${r.priority})` : ""}${r.status ? ` - ${r.status}` : ""}`).join("; ") || "nothing on it"}`
    }
    if (section === "portfolio") {
      // All public site content, imported statically - safe to share in full.
      const proj = projects.map((p) => `${p.title} (${p.category}): ${p.technologies.slice(0, 5).join(", ")}`).join("; ")
      const exp = experiences.map((e) => `${e.role} at ${e.company}${e.startDate ? ` (${e.startDate})` : ""}`).join("; ")
      const edu = education.map((e) => `${e.degree} in ${e.field}, ${e.institution}${e.grade ? ` - ${e.grade}` : ""}`).join("; ")
      const skl = professionalSkillGroups.map((g) => `${g.label}: ${g.skills.slice(0, 8).join(", ")}`).join("; ")
      const soc = societies.map((s) => `${s.name} (${s.role})`).join("; ")
      const blg = posts.map((p) => `${p.title}${p.tags?.length ? ` [${p.tags.slice(0, 3).join(", ")}]` : ""}`).join("; ")
      const til = tilEntries.map((t) => t.title).join("; ")
      const pub = publications.map((p) => `${p.title} (${p.venue}, ${p.year})`).join("; ")
      return `Projects: ${proj}\nExperience: ${exp}\nEducation: ${edu}\nSkills: ${skl}\nSocieties: ${soc}\nBlog posts: ${blg}\nTILs: ${til}\nResearch: ${pub}`
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
  const minimaxKey = process.env.MINIMAX_API_KEY
  // Files (images/PDFs) need a multimodal model - Gemini (free) first, then Claude/GPT if their keys exist.
  if (multimodal) {
    if (googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-3.6-flash")
    if (anthropicKey) return createAnthropic({ apiKey: anthropicKey })("claude-sonnet-5")
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
  if (c.startsWith("minimax:") && minimaxKey) return createOpenAICompatible({ name: "minimax", baseURL: "https://api.minimax.io/v1", apiKey: minimaxKey })(c.slice(8))
  if (c.startsWith("google:") && googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })(c.slice(7))
  if (c === "groq" && groqKey) return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  if (c === "gemini" && googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-3.6-flash")
  // Fallback so an unconfigured choice still answers with whatever IS available.
  if (googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-3.6-flash")
  if (groqKey) return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  if (orKey) return createOpenRouter({ apiKey: orKey })("nvidia/nemotron-3-ultra-550b-a55b:free")
  return null
}

type Candidate = { model: NonNullable<ReturnType<typeof pickModel>>; label: string }

// The chosen model first, then free fallbacks (Gemini, Groq, OpenRouter). ANY model can hit a quota, rate
// limit or budget wall - GitHub Models and the free OpenRouter tiers especially - so rather than erroring I
// fall through to the next free model that actually responds. I skip a fallback that duplicates the choice.
function pickModelChain(choice: string | undefined, multimodal: boolean): Candidate[] {
  const chain: Candidate[] = []
  const push = (label: string, model: ReturnType<typeof pickModel>) => {
    if (model) chain.push({ model, label })
  }
  push(choice || "default", pickModel(choice, multimodal))
  const c = choice ?? ""
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const orKey = process.env.OPENROUTER_API_KEY
  // Gemini is the only free multimodal fallback, so the text-only fallbacks are skipped when files attach.
  if (googleKey && c !== "gemini" && !c.startsWith("google:")) push("gemini (fallback)", createGoogleGenerativeAI({ apiKey: googleKey })("gemini-3.6-flash"))
  if (!multimodal && groqKey && c !== "groq" && !c.startsWith("groq:")) push("groq (fallback)", createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile"))
  if (!multimodal && orKey && !c.startsWith("openrouter:")) push("openrouter (fallback)", createOpenRouter({ apiKey: orKey })("nvidia/nemotron-3-ultra-550b-a55b:free"))
  return chain
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response("Unauthorised", { status: 401, headers: { "Cache-Control": "no-store" } })
  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return new Response("Too many requests", { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json()
  const multimodal = hasFiles(messages)
  const chain = pickModelChain(model, multimodal)
  if (chain.length === 0) {
    return new Response(
      multimodal
        ? "Image and file analysis needs the Gemini key (GOOGLE_AI_API_KEY) in Vercel."
        : "The AI assistant is not configured yet. Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  const system = [
    "You are Isaac's personal assistant inside his private dashboard. Be warm, encouraging, opinionated and",
    "genuinely useful, like a sharp friend who knows him well. Answer anything: chat, give your honest",
    "opinion and advice, teach, brainstorm, and help him write, plan, study, code or decide. When he asks",
    "for a judgement (such as whether something is good or enough), give a real, thoughtful answer; never",
    "refuse or hide behind being an AI.",
    "",
    "About Isaac, so you can be personal and specific: he is Isaac Adjei, known as Zac, an Electronic",
    "Engineering and Computer Science student at Aston University, Birmingham, aiming for a First Class BEng.",
    "He grew up in Ghana (Adisadel College) and moved to the UK in 2022. He has monocular vision after",
    "losing sight in his right eye to retinoblastoma at age two, which fuels his passion for accessible",
    "technology. He works across the stack: bare-metal C and C++ and PCB design (KiCad, Proteus), Next.js",
    "and TypeScript on the web, and Python ML (TensorFlow, PyTorch), and he is job-hunting for graduate and",
    "placement roles. He is a committed Christian, plays piano, trains at the gym and cycles. He was a 2026",
    "Top 40 Finalist for the Black Heritage Undergraduate of the Year. Projects include Phaemos (predictive",
    "maintenance), a 4x4x4 NeoPixel LED cube, an open-source Git course and Zaccess, an OCR and",
    "text-to-speech accessibility tool. He prizes excellence, discipline, faith and building things that",
    "help real people.",
    "",
    "You can also look up his live dashboard data when a question calls for it, using the getDashboardData",
    "tool: applications, coding, streaks, habits, goals, faith, study, content, university,",
    "calendar, inventory, wishlist, and portfolio (public projects, experience, education, skills,",
    "societies, blog posts, TILs and research). Reach for it on questions about his life, work or numbers;",
    "otherwise just talk normally. You can only read it and never change anything, and his private",
    "sections (vault, diary, notes, contacts, us, me) are not available to you.",
    "Only state facts that are actually in the data the tool returns. Never invent companies, names,",
    "numbers, applications or details. If the data does not include something, say you do not have it",
    "rather than guessing.",
    "This is Isaac's own private data behind his login, so treat anything personal (faith, plans, details)",
    "with discretion. If you ever notice something that looks like a security risk or a secret in what you",
    "read (a password, API key or token), do not repeat it back and tell him so he can remove it.",
    "When you show code, always put it in a fenced markdown code block with the language (for example",
    "```python) so it renders as a copyable block.",
    "Use UK English. Never use em dashes or en dashes (use a comma, full stop or brackets instead) and do",
    "not use Oxford commas. For a Bible-verse suggestion, glance at the faith section first so you avoid",
    "repeating recent reading.",
  ].join("\n")

  // Probe each candidate with a tiny call so a quota, budget, rate-limit or auth failure is caught up front,
  // then stream with the first that answers. This is what makes the fallback work for every provider: the
  // failure modes (403 budget, 429 rate limit, 401 bad key) all surface here as a thrown error I can skip.
  const failures: string[] = []
  let working: Candidate | null = null
  for (const cand of chain) {
    try {
      await generateText({ model: cand.model, prompt: "ok", maxOutputTokens: 1 })
      working = cand
      break
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      console.error(`[assistant] ${cand.label} unavailable: ${detail}`)
      failures.push(`${cand.label}: ${detail}`)
    }
  }
  if (!working) {
    // Every model failed - surface the full detail so I can see exactly why (quota, key, model access).
    return new Response(`Every model is unavailable right now.\n\n${failures.join("\n")}`, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const result = streamText({
    model: working.model,
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
