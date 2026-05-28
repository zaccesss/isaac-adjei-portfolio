import { supabase } from "@/lib/supabase"

export type DiscordDigestResult = {
  ok: boolean
  skipped?: boolean
  error?: string
}

// I query the last N hours so the daily digest covers today and the weekly
// digest falls back to 7 days.
async function fetchDigestData(hoursBack: number) {
  const now = new Date()
  const since = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)
  const sinceIso = since.toISOString()
  const sinceDate = sinceIso.split("T")[0]

  const [
    { data: goals },
    { data: applications },
    { data: streakLogs },
    { data: diaryEntries },
  ] = await Promise.all([
    supabase
      .from("goals")
      .select("id,title,status,updated_at")
      .gte("updated_at", sinceIso),
    supabase
      .from("applications")
      .select("id,company,role,status,url")
      .not("status", "in", '("Not Applied","Not Interested","scraped")')
      .gte("applied_date", sinceDate),
    supabase
      .from("streak_logs")
      .select("streak_id,date")
      .gte("date", sinceDate),
    supabase
      .from("diary")
      .select("id,mood,created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false }),
  ])

  return {
    goals: goals ?? [],
    applications: applications ?? [],
    streakLogs: streakLogs ?? [],
    diaryEntries: diaryEntries ?? [],
    sinceIso,
  }
}

function buildEmbeds(data: Awaited<ReturnType<typeof fetchDigestData>>, label: string) {
  const { goals, applications, streakLogs, diaryEntries } = data

  const goalsDone = goals.filter((g) => g.status === "done")
  const goalsInProgress = goals.filter((g) => g.status !== "done")
  const offers = applications.filter((a) => a.status === "Offer Received")
  const interviews = applications.filter(
    (a) =>
      a.status === "Interview" ||
      a.status === "Assessment Centre" ||
      a.status === "Video Interview" ||
      a.status === "Face-to-face Interview" ||
      a.status === "Telephone Interview"
  )
  const applied = applications.filter(
    (a) => a.status === "Application Submitted"
  )
  const uniqueStreaks = new Set(streakLogs.map((l) => l.streak_id)).size
  const latestMood = diaryEntries[0]?.mood ?? null

  const fields = [
    {
      name: "Goals",
      value: [
        `Updated: **${goals.length}**`,
        `Done: **${goalsDone.length}**`,
        `In progress: **${goalsInProgress.length}**`,
      ].join("\n"),
      inline: true,
    },
    {
      name: "Applications",
      value: [
        `Applied: **${applied.length}**`,
        `Interviews: **${interviews.length}**`,
        `Offers: **${offers.length}**`,
      ].join("\n"),
      inline: true,
    },
    {
      name: "Streaks",
      value: [
        `Check-ins: **${streakLogs.length}**`,
        `Active streaks: **${uniqueStreaks}**`,
      ].join("\n"),
      inline: true,
    },
    {
      name: "Diary",
      value: [
        `Entries: **${diaryEntries.length}**`,
        latestMood ? `Latest mood: **${latestMood}**` : "No entries",
      ].join("\n"),
      inline: true,
    },
  ]

  // I show recently applied applications if there are any so the digest is
  // immediately actionable rather than just a count.
  if (applied.length > 0) {
    const lines = applied
      .slice(0, 5)
      .map((a) =>
        a.url
          ? `- [${a.company} - ${a.role}](${a.url})`
          : `- ${a.company} - ${a.role}`
      )
    if (applied.length > 5) lines.push(`- ...and ${applied.length - 5} more`)
    fields.push({
      name: "Applied today",
      value: lines.join("\n"),
      inline: false,
    })
  }

  return [
    {
      title: `Daily digest - ${label}`,
      url: "https://isaacadjei.me/dashboard",
      description:
        goals.length === 0 &&
        applications.length === 0 &&
        streakLogs.length === 0 &&
        diaryEntries.length === 0
          ? "Nothing recorded today. Quiet one."
          : null,
      color: 0x5865f2,
      fields,
      footer: {
        text: "isaacadjei.me/dashboard",
      },
      timestamp: new Date().toISOString(),
    },
  ]
}

export async function sendDiscordDigest(): Promise<DiscordDigestResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return { ok: true, skipped: true }

  const now = new Date()
  const label = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const data = await fetchDigestData(24)
  const embeds = buildEmbeds(data, label)

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Discord digest error:", res.status, errText)
      return { ok: false, error: "Failed to send Discord digest" }
    }

    return { ok: true }
  } catch (err) {
    console.error("Discord digest error:", err)
    return { ok: false, error: "Something went wrong" }
  }
}
