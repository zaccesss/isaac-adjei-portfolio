// I query all active streaks and check which are not yet logged for today, then post a
// Discord reminder so nothing is forgotten before the day is over. Runs at 08:00 UTC daily.
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
)

async function main() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log("No DISCORD_WEBHOOK_URL set — skipping.")
    return
  }

  const today = new Date().toISOString().split("T")[0]

  const [{ data: streaks }, { data: logs }] = await Promise.all([
    supabase.from("streaks").select("id,name,icon").eq("active", true).order("order_index"),
    supabase.from("streak_logs").select("streak_id").eq("date", today).eq("completed", true),
  ])

  if (!streaks || streaks.length === 0) {
    console.log("No active streaks — nothing to remind.")
    return
  }

  const doneIds = new Set((logs ?? []).map((l: { streak_id: string }) => l.streak_id))
  const pending = streaks.filter((s: { id: string }) => !doneIds.has(s.id))
  const done = streaks.filter((s: { id: string }) => doneIds.has(s.id))

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  let description: string
  let color: number
  const fields: { name: string; value: string; inline: boolean }[] = []

  if (pending.length === 0) {
    description = "All streaks done for today — great work! Keep the momentum going. 🎉"
    color = 0x22c55e // green
  } else {
    description = `You have **${pending.length}** streak${pending.length === 1 ? "" : "s"} left to complete today. Don't break the chain!`
    color = 0xf59e0b // amber

    fields.push({
      name: "Still to do",
      value: pending.map((s: { icon: string; name: string }) => `${s.icon} ${s.name}`).join("\n"),
      inline: true,
    })
  }

  if (done.length > 0) {
    fields.push({
      name: done.length === streaks.length ? "All done ✅" : "Completed",
      value: done.map((s: { icon: string; name: string }) => `${s.icon} ${s.name}`).join("\n"),
      inline: true,
    })
  }

  const embed = {
    title: `☀️ Morning streak check — ${dateLabel}`,
    url: "https://isaacadjei.me/dashboard/streaks",
    description,
    color,
    fields,
    footer: { text: "isaacadjei.me/dashboard/streaks" },
    timestamp: new Date().toISOString(),
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Discord error:", res.status, text)
    process.exit(1)
  }

  console.log(`Streak reminder sent. Pending: ${pending.length}, Done: ${done.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
