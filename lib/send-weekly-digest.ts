// I build and send a weekly summary email covering my whole week: applications, coding, study, fitness,
// goals, streaks, habits, faith, diary, plus what is coming up (deadlines, follow-ups, expiring items).
// The figures come from the shared gatherer so this and the daily Discord digest stay consistent, and an
// AI-written intro (best free model, falling back through several) phrases it all when a key is set.
import { gatherDigestData, type DigestData } from "@/lib/digest-facts"
import { digestAiSummary, type DigestFacts } from "@/lib/digest-ai-summary"

export type DigestResult = {
  ok: boolean
  skipped?: boolean
  error?: string
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

// AI text and any DB-derived strings (deadline titles, expiry labels) are escaped before going into HTML.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function row(label: string, value: string | number, colour = "#1e293b"): string {
  return `<tr><td style="padding:4px 0;">
    <span style="color:#6b7280;font-size:13px;">${escapeHtml(label)}</span>
    <span style="float:right;font-weight:600;font-size:13px;color:${colour};">${escapeHtml(String(value))}</span>
  </td></tr>`
}

function section(title: string, rows: string): string {
  if (!rows) return ""
  return `<tr><td style="padding:20px 32px 0;">
    <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">${escapeHtml(title)}</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>`
}

// I use inline styles throughout because Gmail, Outlook and Apple Mail strip external
// stylesheets and style blocks - inline is the only reliably rendered approach.
function buildEmailHtml(
  startDate: string,
  endDate: string,
  facts: DigestFacts,
  summary: string | null,
  expiring: DigestData["expiring"],
): string {
  const summaryBlock = summary
    ? `<tr><td style="padding:22px 32px 0;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#334155;">${escapeHtml(summary)}</p>
        </div>
      </td></tr>`
    : ""

  const applications = section(
    "Applications",
    row("New applications", facts.applied) +
      row("Interviews / assessments", facts.interviews, "#2563eb") +
      row("Offers", facts.offers, "#16a34a"),
  )

  const codingStudy = section(
    "Coding & study",
    row("Coding", `${facts.codingHours}h`) +
      (facts.topLanguages ? row("Top languages", facts.topLanguages) : "") +
      row("Study", `${facts.studyHours}h`),
  )

  const fitnessRows =
    (facts.workouts > 0 ? row("Workouts", facts.workouts) + row("Distance", `${facts.workoutDistanceKm} km`, "#FC4C02") : "") +
    (facts.currentWeight != null
      ? row(
          "Weight",
          `${facts.currentWeight} kg${facts.weightChange != null && facts.weightChange !== 0 ? ` (${facts.weightChange > 0 ? "+" : ""}${facts.weightChange})` : ""}`,
          facts.weightChange != null && facts.weightChange < 0 ? "#16a34a" : "#1e293b",
        )
      : "")
  const fitness = section("Fitness & body", fitnessRows)

  const content = section(
    "Content",
    row("Visitor reads (public site)", facts.reads) +
      (facts.published > 0 ? row("Published", `${facts.published} posts / TILs`) : "") +
      (facts.openSource > 0 ? row("Open-source contributions", facts.openSource) : ""),
  )

  const goals = section(
    "Goals",
    row("Updated", facts.goalsUpdated) +
      row("Done", facts.goalsDone, "#16a34a") +
      row("In progress", facts.goalsInProgress),
  )

  const streaksHabits = section(
    "Streaks & habits",
    row("Streak check-ins", facts.streakCheckIns) +
      row("Active streaks", facts.activeStreaks, "#ea580c") +
      row("Habit check-ins", facts.habitCheckIns) +
      row("Active habits", facts.activeHabits),
  )

  const faithDiary = section(
    "Faith & diary",
    row("Faith entries", facts.faithEntries) +
      row("Diary entries", facts.diaryEntries) +
      (facts.latestMood ? row("Latest mood", facts.latestMood) : ""),
  )

  // What is coming up: deadlines, follow-ups and expiring items (full names are fine here, only I see it).
  const comingRows =
    (facts.upcomingEvents > 0
      ? row("Events this week", facts.upcomingEvents, "#2563eb") + (facts.nextEvent ? row("Next", facts.nextEvent) : "")
      : "") +
    (facts.deadlinesDueSoon > 0
      ? row("Deadlines due soon", facts.deadlinesDueSoon, "#dc2626") +
        (facts.nextDeadline ? row("Nearest", facts.nextDeadline) : "")
      : "") +
    (facts.followUpsDue > 0 ? row("Contacts to follow up", facts.followUpsDue, "#dc2626") : "") +
    expiring
      .map((e) =>
        row(`${e.name} (${e.type})`, e.daysLeft < 0 ? "expired" : `${e.daysLeft}d`, e.daysLeft <= 7 ? "#dc2626" : "#ea580c"),
      )
      .join("")
  const comingUp = section("Coming up", comingRows)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your week in review</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#0f172a;padding:24px 32px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Isaac Adjei - Dashboard</p>
              <h1 style="margin:8px 0 0;color:#f8fafc;font-size:22px;font-weight:700;">Your week in review</h1>
              <p style="margin:6px 0 0;color:#64748b;font-size:13px;">${startDate} - ${endDate}</p>
            </td>
          </tr>
          ${summaryBlock}
          ${applications}
          ${codingStudy}
          ${content}
          ${fitness}
          ${goals}
          ${streaksHabits}
          ${faithDiary}
          ${comingUp}
          <tr>
            <td style="padding:24px 32px 28px;">
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0;" />
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                <a href="https://isaacadjei.me/dashboard" style="color:#64748b;text-decoration:none;">Open Dashboard</a>
                &nbsp;&middot;&nbsp; Isaac Adjei's private dashboard
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendWeeklyDigest(): Promise<DigestResult> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startDate = formatDate(weekAgo.toISOString())
  const endDate = formatDate(now.toISOString())

  const { facts, expiring } = await gatherDigestData(7 * 24, "the past week")
  const summary = await digestAiSummary(facts, true)
  const html = buildEmailHtml(startDate, endDate, facts, summary, expiring)

  const subject = `Your week in review - ${startDate} to ${endDate}`
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.DIGEST_EMAIL

  if (!apiKey || !toEmail) {
    return { ok: true, skipped: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: "My Dashboard <contact@isaacadjei.me>", to: [toEmail], subject, html }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Resend weekly digest error:", res.status, errText)
      return { ok: false, error: "Failed to send digest" }
    }

    return { ok: true }
  } catch (err) {
    console.error("Weekly digest error:", err)
    return { ok: false, error: "Something went wrong" }
  }
}
