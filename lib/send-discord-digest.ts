// I build and post a Discord embed digest covering the last 24 hours across everything I track:
// applications, coding, study, fitness, goals, streaks, habits, faith, diary, plus what is coming up
// (deadlines, contacts to follow up, expiring items). Figures come from the shared gatherer so this and
// the weekly email stay consistent, and an AI-written line (best free model with fallbacks) leads it when
// a key is set. The same function is called by both the daily cron and the manual dashboard trigger.
import { gatherDigestData, type DigestData } from "@/lib/digest-facts"
import { digestAiSummary } from "@/lib/digest-ai-summary"
import { postDiscordWebhook } from "@/lib/discord-webhook"

export type DiscordDigestResult = {
  ok: boolean
  skipped?: boolean
  error?: string
}

type EmbedField = { name: string; value: string; inline: boolean }

function buildEmbeds(data: DigestData, summary: string | null, label: string) {
  const { facts, appliedList, followUps, expiring } = data

  const fields: EmbedField[] = [
    {
      name: "Applications",
      value: [`Applied: **${facts.applied}**`, `Interviews: **${facts.interviews}**`, `Offers: **${facts.offers}**`].join("\n"),
      inline: true,
    },
    {
      name: "Coding & study",
      value: [`Coding: **${facts.codingHours}h**`, `Study: **${facts.studyHours}h**`, facts.topLanguages ? `Top: ${facts.topLanguages}` : ""]
        .filter(Boolean)
        .join("\n"),
      inline: true,
    },
    {
      name: "Goals",
      value: [`Updated: **${facts.goalsUpdated}**`, `Done: **${facts.goalsDone}**`, `In progress: **${facts.goalsInProgress}**`].join("\n"),
      inline: true,
    },
    {
      name: "Streaks & habits",
      value: [`Streaks: **${facts.streakCheckIns}** in **${facts.activeStreaks}**`, `Habits: **${facts.habitCheckIns}** in **${facts.activeHabits}**`].join("\n"),
      inline: true,
    },
    {
      name: "Faith & diary",
      value: [`Faith: **${facts.faithEntries}**`, `Diary: **${facts.diaryEntries}**`, facts.latestMood ? `Mood: **${facts.latestMood}**` : ""]
        .filter(Boolean)
        .join("\n"),
      inline: true,
    },
  ]

  if (facts.workouts > 0 || facts.currentWeight != null) {
    fields.push({
      name: "Fitness & body",
      value: [
        facts.workouts > 0 ? `Workouts: **${facts.workouts}** (${facts.workoutDistanceKm}km)` : "",
        facts.currentWeight != null
          ? `Weight: **${facts.currentWeight}kg**${facts.weightChange != null && facts.weightChange !== 0 ? ` (${facts.weightChange > 0 ? "+" : ""}${facts.weightChange})` : ""}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      inline: true,
    })
  }

  fields.push({
    name: "Content",
    value: [
      `Visitor reads: **${facts.reads}**`,
      facts.published > 0 ? `Published: **${facts.published}**` : "",
      facts.openSource > 0 ? `Open-source: **${facts.openSource}**` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    inline: true,
  })

  // I show recently applied roles so the digest is immediately actionable, not just counts.
  if (appliedList.length > 0) {
    const lines = appliedList.map((a) => (a.url ? `- [${a.company} - ${a.role}](${a.url})` : `- ${a.company} - ${a.role}`))
    if (facts.applied > appliedList.length) lines.push(`- ...and ${facts.applied - appliedList.length} more`)
    fields.push({ name: "Applied", value: lines.join("\n"), inline: false })
  }

  // Forward-looking nudges: calendar events then deadlines due soon.
  if (facts.upcomingEvents > 0) {
    fields.push({
      name: "Events this week",
      value: `**${facts.upcomingEvents}** coming up${facts.nextEvent ? `, next ${facts.nextEvent}` : ""}`,
      inline: false,
    })
  }

  if (facts.deadlinesDueSoon > 0) {
    fields.push({
      name: "Deadlines due soon",
      value: `**${facts.deadlinesDueSoon}** within two weeks${facts.nextDeadline ? `, nearest ${facts.nextDeadline}` : ""}`,
      inline: false,
    })
  }

  // Contacts due a follow-up so the digest nudges me to reach out.
  if (followUps.length > 0) {
    const followLines = followUps.slice(0, 5).map((c) => `- ${c.name}${c.last_contact ? ` (last contacted ${c.last_contact})` : " (never contacted)"}`)
    if (facts.followUpsDue > 5) followLines.push(`- ...and ${facts.followUpsDue - 5} more`)
    fields.push({ name: "Follow-ups due", value: followLines.join("\n"), inline: false })
  }

  // Expiring vault keys, cards and warranties. Full names are fine here, this is my own private Discord.
  if (expiring.length > 0) {
    const expLines = expiring.map((e) => `- ${e.name} (${e.type}) - ${e.daysLeft < 0 ? "expired" : `${e.daysLeft}d`}`)
    fields.push({ name: "Expiring soon", value: expLines.join("\n"), inline: false })
  }

  const quiet =
    facts.applied === 0 &&
    facts.goalsUpdated === 0 &&
    facts.streakCheckIns === 0 &&
    facts.habitCheckIns === 0 &&
    facts.diaryEntries === 0 &&
    facts.codingHours === 0 &&
    facts.studyHours === 0 &&
    facts.workouts === 0 &&
    facts.faithEntries === 0

  return [
    {
      title: `Daily digest - ${label}`,
      url: "https://isaacadjei.me/dashboard",
      description: summary ?? (quiet ? "Nothing recorded. A quiet day." : null),
      color: 0x5865f2,
      fields,
      footer: { text: "isaacadjei.me/dashboard" },
      timestamp: new Date().toISOString(),
    },
  ]
}

export async function sendDiscordDigest(): Promise<DiscordDigestResult> {
  // Prefer a dedicated per-channel webhook, falling back to the shared one so existing setups keep working.
  const webhookUrl = process.env.DISCORD_WEBHOOK_DIGEST ?? process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return { ok: true, skipped: true }

  // The digest covers the last 24 hours. It is scheduled for 00:30 UK, so the window is the day that
  // just ended - label it that day (not "now", which would stamp it with the new day's date).
  const covered = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const label = covered.toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const data = await gatherDigestData(24, "the past day")
  const summary = await digestAiSummary(data.facts)
  const embeds = buildEmbeds(data, summary, label)

  // Loud on failure: a dead webhook logs the full Discord error and opens an incident, never a silent skip.
  const result = await postDiscordWebhook(webhookUrl, { embeds }, "discord-digest")
  return { ok: result.ok, error: result.error }
}
