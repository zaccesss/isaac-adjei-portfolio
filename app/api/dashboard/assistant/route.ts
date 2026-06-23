import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { checkRateLimit, heavyApiLimiter, getIp } from "@/lib/ratelimit"

// My in-dashboard AI assistant. It is READ-ONLY by construction: it receives a small snapshot of my
// own data as the system prompt and streams back text. It has NO tools, NO server-action access and
// NO database writes, so a prompt (even a malicious one) can never change or delete anything. The route
// is behind the dashboard session, rate limited, and the keys stay server-side. The model is chosen by
// the client; if its key is missing I fall back to whatever provider IS configured, so a missing key
// degrades gracefully instead of erroring.
export const runtime = "nodejs"
export const maxDuration = 60

function pickModel(choice: string | undefined) {
  const groqKey = process.env.GROQ_API_KEY
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const orKey = process.env.OPENROUTER_API_KEY
  const c = choice || "gemini"

  if (c.startsWith("openrouter:") && orKey) {
    return createOpenRouter({ apiKey: orKey })(c.slice("openrouter:".length))
  }
  if (c === "groq" && groqKey) {
    return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  }
  if (c === "gemini" && googleKey) {
    return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.0-flash")
  }
  // Fallback chain so the assistant never goes dark when a single key is absent.
  if (googleKey) return createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.0-flash")
  if (groqKey) return createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile")
  if (orKey) return createOpenRouter({ apiKey: orKey })("deepseek/deepseek-chat:free")
  return null
}

// A read-only snapshot of my own data. Each query is independent and defaults to empty, so a renamed
// column degrades the relevant line to "none" rather than failing the whole request.
async function buildContext(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  const [apps, streaks, goals, deadlines, waka] = await Promise.all([
    supabase.from("applications").select("status").not("status", "in", '("scraped","Not Applied","Not Interested","Rejected")'),
    supabase.from("streaks").select("name").eq("active", true),
    supabase.from("goals").select("title").neq("status", "done"),
    supabase.from("uni_deadlines").select("title,due_date").gte("due_date", today).order("due_date", { ascending: true }).limit(8),
    supabase.from("wakatime_daily").select("total_seconds").eq("date", today).maybeSingle(),
  ])
  const codingMins = Math.round((waka.data?.total_seconds ?? 0) / 60)
  return [
    `Active job applications: ${(apps.data ?? []).length}`,
    `Coding today: ${codingMins} minutes`,
    `Active streaks: ${(streaks.data ?? []).map((s) => s.name).join(", ") || "none"}`,
    `Open goals: ${(goals.data ?? []).map((g) => g.title).join(", ") || "none"}`,
    `Upcoming uni deadlines: ${(deadlines.data ?? []).map((d) => `${d.title} (${d.due_date})`).join("; ") || "none"}`,
  ].join("\n")
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response("Unauthorised", { status: 401, headers: { "Cache-Control": "no-store" } })
  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return new Response("Too many requests", { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json()
  const chosen = pickModel(model)
  if (!chosen) {
    return new Response("The AI assistant is not configured yet. Add GROQ_API_KEY or GOOGLE_AI_API_KEY in Vercel.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const context = await buildContext()
  const system = [
    "You are Isaac's personal dashboard assistant.",
    "You are READ-ONLY: you can read the snapshot below and answer questions or draft text, but you",
    "cannot change, add or delete anything in the dashboard. If asked to do so, explain that you can",
    "only advise. Be concise, practical and friendly. Use UK English.",
    "",
    "Today's snapshot of Isaac's data:",
    context,
  ].join("\n")

  const result = streamText({ model: chosen, system, messages: await convertToModelMessages(messages) })
  return result.toUIMessageStreamResponse()
}
