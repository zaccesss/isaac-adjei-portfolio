// I write a short, natural-language summary for the digests from the exact figures I already counted.
// It is a pure enhancement: I try the best free models in turn (Groq, then Gemini, then a free OpenRouter
// model, then GitHub Models) so if one provider is down or rate-limited the next still answers, and if
// none has a key or they all fail I return null so the digest falls back to its plain template and never
// breaks or stalls. I only ever pass the model the numbers I computed and tell it to use them verbatim,
// so it phrases the data without inventing figures, companies or events.
import { generateText, type LanguageModel } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export type DigestFacts = {
  period: string
  // career
  applied: number
  interviews: number
  offers: number
  // goals
  goalsUpdated: number
  goalsDone: number
  goalsInProgress: number
  // streaks and habits
  streakCheckIns: number
  activeStreaks: number
  habitCheckIns: number
  activeHabits: number
  // coding
  codingHours: number
  topLanguages: string
  // study
  studyHours: number
  // faith
  faithEntries: number
  // fitness
  workouts: number
  workoutDistanceKm: number
  // university
  deadlinesDueSoon: number
  nextDeadline: string | null
  // diary
  diaryEntries: number
  latestMood: string | null
  // contacts
  followUpsDue: number
  // vault and inventory expiry
  expiringItems: number
  expiringSoon: string | null
  // calendar (looking ahead)
  upcomingEvents: number
  nextEvent: string | null
  // content
  reads: number
  published: number
  openSource: number
  // body metrics
  currentWeight: number | null
  weightChange: number | null
}

// The best free models, in order of preference. Each is included only if its key is set, so the chain is
// however many of these I have configured. Same providers the in-dashboard assistant uses.
function summaryCandidates(): LanguageModel[] {
  const out: LanguageModel[] = []
  const groqKey = process.env.GROQ_API_KEY
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const orKey = process.env.OPENROUTER_API_KEY
  const githubTok = process.env.GITHUB_MODELS_TOKEN
  if (groqKey) out.push(createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile"))
  if (googleKey) out.push(createGoogleGenerativeAI({ apiKey: googleKey })("gemini-2.5-flash"))
  if (orKey) out.push(createOpenRouter({ apiKey: orKey })("meta-llama/llama-3.3-70b-instruct:free"))
  if (githubTok) {
    out.push(
      createOpenAICompatible({
        name: "github",
        baseURL: "https://models.github.ai/inference",
        apiKey: githubTok,
      })("openai/gpt-4o-mini"),
    )
  }
  return out
}

export async function digestAiSummary(facts: DigestFacts): Promise<string | null> {
  const models = summaryCandidates()
  if (models.length === 0) return null

  const figures = [
    `Period: ${facts.period}`,
    `Job applications: ${facts.applied} applied, ${facts.interviews} interviews or assessments, ${facts.offers} offers`,
    `Goals: ${facts.goalsUpdated} updated (${facts.goalsDone} done, ${facts.goalsInProgress} in progress)`,
    `Coding: ${facts.codingHours}h${facts.topLanguages ? `, top languages ${facts.topLanguages}` : ""}`,
    `Study: ${facts.studyHours}h`,
    `Fitness: ${facts.workouts} workouts, ${facts.workoutDistanceKm}km`,
    `Streaks: ${facts.streakCheckIns} check-ins across ${facts.activeStreaks} active streaks`,
    `Habits: ${facts.habitCheckIns} check-ins across ${facts.activeHabits} active habits`,
    `Faith: ${facts.faithEntries} entries`,
    `Diary: ${facts.diaryEntries} entries${facts.latestMood ? `, latest mood ${facts.latestMood}` : ""}`,
    facts.deadlinesDueSoon > 0
      ? `University deadlines due soon: ${facts.deadlinesDueSoon}${facts.nextDeadline ? `, nearest ${facts.nextDeadline}` : ""}`
      : null,
    facts.followUpsDue > 0 ? `Contacts due a follow-up: ${facts.followUpsDue}` : null,
    facts.upcomingEvents > 0
      ? `Calendar: ${facts.upcomingEvents} events coming up${facts.nextEvent ? `, next ${facts.nextEvent}` : ""}`
      : null,
    `Content: ${facts.reads} post reads${facts.published > 0 ? `, ${facts.published} new posts or TILs published` : ""}`,
    facts.openSource > 0 ? `Open-source contributions: ${facts.openSource}` : null,
    facts.currentWeight != null
      ? `Weight: ${facts.currentWeight}kg${facts.weightChange != null && facts.weightChange !== 0 ? ` (${facts.weightChange > 0 ? "up" : "down"} ${Math.abs(facts.weightChange)}kg this period)` : ""}`
      : null,
    facts.expiringItems > 0
      ? `Expiring soon (vault keys, cards or warranties): ${facts.expiringItems}${facts.expiringSoon ? ` - ${facts.expiringSoon}` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  const system = [
    "You write a short, warm summary for Isaac's personal dashboard digest, covering his whole week or day.",
    "Write 4 to 6 sentences, addressed to Isaac as 'you', encouraging and specific, touching the areas that",
    "actually have activity (applications, coding, study, fitness, weight, faith, goals, streaks, habits,",
    "content, diary).",
    "Use ONLY the figures given. Never invent numbers, companies, names or events.",
    "If a figure is 0, leave it out rather than padding, but do gently note a quiet patch if most are 0.",
    "If a weight is given, comment on the trend: if it is falling, affirm the progress towards losing weight",
    "and, from the rate of change, give a gentle sense of pace; if it is flat or rising, encouragingly nudge",
    "one helpful habit (a calorie deficit, more steps, consistency). Be supportive, never preachy.",
    "Always call out, as priorities, any university deadlines or calendar events coming up, contacts due a",
    "follow-up, and anything expiring soon (an API key, card or warranty) so nothing slips.",
    "Use UK English. No em dashes or en dashes (use a comma, full stop or brackets). No Oxford commas.",
    "Return only the summary text: no preamble, no markdown, no heading, no sign-off.",
  ].join(" ")

  const prompt = `Here are this period's figures:\n${figures}\n\nWrite the summary.`

  for (const model of models) {
    try {
      const { text } = await generateText({ model, system, prompt, temperature: 0.5 })
      const out = text.trim()
      if (out.length > 0) return out
    } catch (err) {
      console.error("Digest AI summary model failed, trying the next one:", err)
    }
  }
  return null
}
