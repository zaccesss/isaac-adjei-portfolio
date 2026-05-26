import { supabase } from "@/lib/supabase"

type Goal = {
  id: string
  title: string
  status: string
  updated_at: string
}

type Application = {
  id: string
  company: string
  role: string
  status: string
}

type StreakLog = {
  streak_id: string
  date: string
}

type DiaryEntry = {
  id: string
  mood: string | null
  created_at: string
}

export type DigestResult = {
  ok: boolean
  skipped?: boolean
  error?: string
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function buildEmailHtml(
  startDate: string,
  endDate: string,
  goals: Goal[],
  applications: Application[],
  streakLogs: StreakLog[],
  diaryEntries: DiaryEntry[]
): string {
  const offersReceived = applications.filter((a) => a.status === "Offer Received")
  const applied = applications.filter((a) => a.status === "Applied")
  const interviews = applications.filter(
    (a) => a.status === "Interview" || a.status === "Assessment Centre"
  )

  // I count unique streak_ids so I get how many distinct streaks were checked in at least once
  const uniqueStreaks = new Set(streakLogs.map((l) => l.streak_id)).size

  const goalsDone = goals.filter((g) => g.status === "done")
  const goalsUpdated = goals.filter((g) => g.status !== "done")

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
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:24px 32px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Isaac Adjei - Nexus Dashboard</p>
              <h1 style="margin:8px 0 0;color:#f8fafc;font-size:22px;font-weight:700;">Your week in review</h1>
              <p style="margin:6px 0 0;color:#64748b;font-size:13px;">${startDate} - ${endDate}</p>
            </td>
          </tr>

          <!-- Goals -->
          <tr>
            <td style="padding:24px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
                Goals
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Updated this week</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${goals.length}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Marked done</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#16a34a;">${goalsDone.length}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">In progress</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${goalsUpdated.length}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Applications -->
          <tr>
            <td style="padding:20px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
                Applications
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">New applications</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${applied.length}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Interviews / Assessments</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#2563eb;">${interviews.length}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Offers received</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#16a34a;">${offersReceived.length}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Streaks -->
          <tr>
            <td style="padding:20px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
                Streaks
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Total check-ins this week</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${streakLogs.length}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Unique streaks active</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#ea580c;">${uniqueStreaks}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Diary -->
          <tr>
            <td style="padding:20px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
                Diary
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Entries written</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${diaryEntries.length}</span>
                  </td>
                </tr>
                ${
                  diaryEntries.length > 0
                    ? `<tr>
                  <td style="padding:4px 0;">
                    <span style="color:#6b7280;font-size:13px;">Latest mood</span>
                    <span style="float:right;font-weight:600;font-size:13px;color:#1e293b;">${diaryEntries[0]?.mood ?? "-"}</span>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 28px;">
              <hr style="border:none;border-top:1px solid #f1f5f9;margin-bottom:20px;" />
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                <a href="https://isaacadjei.me/dashboard" style="color:#64748b;text-decoration:none;">
                  Open Dashboard
                </a>
                &nbsp;&middot;&nbsp;
                Nexus - Isaac Adjei's private dashboard
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

// I extract the core digest logic here so both trigger-digest (session auth) and
// weekly-digest (cron auth) can call it directly - this avoids the internal HTTP
// fetch that was silently failing on Vercel due to header stripping on redirects
export async function sendWeeklyDigest(): Promise<DigestResult> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoIso = weekAgo.toISOString()
  const weekAgoDate = weekAgoIso.split("T")[0]

  const startDate = formatDate(weekAgoIso)
  const endDate = formatDate(now.toISOString())

  const [
    { data: goals },
    { data: applications },
    { data: streakLogs },
    { data: diaryEntries },
  ] = await Promise.all([
    supabase
      .from("goals")
      .select("id,title,status,updated_at")
      .gte("updated_at", weekAgoIso)
      .returns<Goal[]>(),
    supabase
      .from("applications")
      .select("id,company,role,status")
      .not("status", "in", '("Not Applied","Not Interested")')
      .gte("applied_date", weekAgoDate)
      .returns<Application[]>(),
    supabase
      .from("streak_logs")
      .select("streak_id,date")
      .gte("date", weekAgoDate)
      .returns<StreakLog[]>(),
    supabase
      .from("diary")
      .select("id,mood,created_at")
      .gte("created_at", weekAgoIso)
      .order("created_at", { ascending: false })
      .returns<DiaryEntry[]>(),
  ])

  const html = buildEmailHtml(
    startDate,
    endDate,
    goals ?? [],
    applications ?? [],
    streakLogs ?? [],
    diaryEntries ?? []
  )

  const subject = `Your week in review - ${startDate} to ${endDate}`
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.DIGEST_EMAIL

  if (!apiKey || !toEmail) {
    return { ok: true, skipped: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Nexus Dashboard <contact@isaacadjei.me>",
        to: [toEmail],
        subject,
        html,
      }),
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
