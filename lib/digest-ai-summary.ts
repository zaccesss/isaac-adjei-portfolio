// I write a short, natural-language summary for the digests from the exact figures I already counted.
// It is a pure enhancement: I try the best free models in turn (Groq, then Gemini, then a free OpenRouter
// model) so if one provider is down or rate-limited the next still answers, and if none has a key or they
// all fail I return null so the digest falls back to its plain template and never breaks or stalls. I
// only ever pass the model the numbers I computed and tell it to use them verbatim, so it phrases the
// data without inventing figures, companies or events. GitHub Models (a fourth fallback this chain used
// to carry) was fully retired 2026-07-30 - removed outright rather than left pointing at a dead endpoint.
import { generateText, type LanguageModel } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

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
  workoutCalories: number
  sports: string
  // music
  musicPlays: number
  musicHours: number
  topArtist: string | null
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
  finishedReads: number
  published: number
  openSource: number
  // body metrics
  currentWeight: number | null
  weightChange: number | null
  weightGoal: string | null
  // the same headline figures for the window before this one, so the summary can compare periods
  prev?: {
    applied: number
    codingHours: number
    studyHours: number
    workouts: number
    workoutDistanceKm: number
    reads: number
    habitCheckIns: number
    streakCheckIns: number
  } | null
}

// The best free models, in order of preference. Each is included only if its key is set, so the chain is
// however many of these I have configured. Same providers the in-dashboard assistant uses.
function summaryCandidates(): LanguageModel[] {
  const out: LanguageModel[] = []
  const groqKey = process.env.GROQ_API_KEY
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const orKey = process.env.OPENROUTER_API_KEY
  if (groqKey) out.push(createGroq({ apiKey: groqKey })("llama-3.3-70b-versatile"))
  if (googleKey) out.push(createGoogleGenerativeAI({ apiKey: googleKey })("gemini-3.6-flash"))
  if (orKey) out.push(createOpenRouter({ apiKey: orKey })("nvidia/nemotron-3-ultra-550b-a55b:free"))
  return out
}

export async function digestAiSummary(facts: DigestFacts, detailed = false): Promise<string | null> {
  const models = summaryCandidates()
  if (models.length === 0) return null

  const figures = [
    `Period: ${facts.period}`,
    `Job applications: ${facts.applied} applied, ${facts.interviews} interviews or assessments, ${facts.offers} offers`,
    `Goals: ${facts.goalsUpdated} updated (${facts.goalsDone} done, ${facts.goalsInProgress} in progress)`,
    `Coding: ${facts.codingHours}h${facts.topLanguages ? `, top languages ${facts.topLanguages}` : ""}`,
    `Study: ${facts.studyHours}h`,
    `Fitness: ${facts.workouts} workouts, ${facts.workoutDistanceKm}km${facts.workoutCalories > 0 ? `, ${facts.workoutCalories} kcal burned` : ""}${facts.sports ? ` (${facts.sports})` : ""}`,
    facts.musicPlays > 0
      ? `Music: ${facts.musicPlays} plays, ${facts.musicHours}h listening${facts.topArtist ? `, top artist ${facts.topArtist}` : ""}`
      : null,
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
    `Blog audience: visitors opened Isaac's published posts ${facts.reads} times on the public site, finishing ${facts.finishedReads}${facts.published > 0 ? `; Isaac published ${facts.published} new posts or TILs` : ""}`,
    facts.openSource > 0 ? `Open-source contributions: ${facts.openSource}` : null,
    facts.currentWeight != null
      ? `Weight: ${facts.currentWeight}kg${facts.weightChange != null && facts.weightChange !== 0 ? ` (${facts.weightChange > 0 ? "up" : "down"} ${Math.abs(facts.weightChange)}kg this period)` : ""}`
      : null,
    facts.weightGoal ? `Weight-loss goal: ${facts.weightGoal}` : null,
    facts.expiringItems > 0
      ? `Expiring soon (vault keys, cards or warranties): ${facts.expiringItems}${facts.expiringSoon ? ` - ${facts.expiringSoon}` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  // The same headline figures for the period before, so the model can compare rather than recite.
  const prevFigures = facts.prev
    ? [
        `Job applications: ${facts.prev.applied}`,
        `Coding: ${facts.prev.codingHours}h`,
        `Study: ${facts.prev.studyHours}h`,
        `Fitness: ${facts.prev.workouts} workouts, ${facts.prev.workoutDistanceKm}km`,
        `Habit check-ins: ${facts.prev.habitCheckIns}`,
        `Streak check-ins: ${facts.prev.streakCheckIns}`,
        `Blog audience: ${facts.prev.reads} visitor reads`,
      ].join("\n")
    : null

  const system = [
    "You write a warm, personal summary for Isaac's dashboard digest, covering his whole week or day.",
    detailed
      ? "Write two thorough paragraphs (roughly 9 to 14 sentences) that walk through every area that has any activity, weaving in the actual figures, so it reads as a proper, detailed rundown and leaves nothing relevant out."
      : "Write 3 to 5 sentences, kept tight.",
    "Address Isaac as 'you', be encouraging and specific, and cover the areas that actually have activity",
    "(applications, coding, study, fitness, weight, music, faith, goals, streaks, habits, content, diary).",
    "Use ONLY the figures given. Never invent numbers, companies, names or events.",
    "The blog audience figure is other people reading Isaac's published posts on his public site. It is",
    "never posts Isaac read himself, so phrase it as readership (for example 'your posts were read 12",
    "times'), never as 'you read'.",
    "When previous-period figures are given, weave in the comparison where the difference is meaningful:",
    "say what is up, what is down and by roughly how much, in plain words. Open with the single most",
    "notable change or achievement of the period rather than a stock greeting, and vary your sentence",
    "structure and word choice from digest to digest so consecutive summaries never read the same.",
    "If a figure is 0, leave it out rather than padding, but do gently note a quiet patch if most are 0.",
    "If a weight is given, comment on the trend; if a weight-loss goal projection is given, lead with it",
    "(say whether you are on track or behind and the estimated date) and give a gentle sense of pace. If",
    "weight is flat or rising, encouragingly nudge one habit (a calorie deficit, more steps, consistency).",
    "Be supportive, never preachy.",
    "Always call out, as priorities, any university deadlines or calendar events coming up, contacts due a",
    "follow-up, and anything expiring soon (an API key, card or warranty) so nothing slips.",
    "Use UK English. No em dashes or en dashes (use a comma, full stop or brackets). No Oxford commas.",
    "Return only the summary text: no preamble, no markdown, no heading, no sign-off.",
  ].join(" ")

  const prompt = `Here are this period's figures:\n${figures}${
    prevFigures ? `\n\nAnd the previous period's, for comparison only (do not list them as this period's):\n${prevFigures}` : ""
  }\n\nWrite the summary.`

  for (const model of models) {
    try {
      const { text } = await generateText({ model, system, prompt, temperature: 0.85 })
      const out = text.trim()
      if (out.length > 0) return out
    } catch (err) {
      console.error("Digest AI summary model failed, trying the next one:", err)
    }
  }
  return null
}
