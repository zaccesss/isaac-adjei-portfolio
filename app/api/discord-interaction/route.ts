// Discord interactions endpoint for the personal OS bot - slash commands, owner-only.
// Discord signs every request with Ed25519 and requires a reply within 3 seconds, so heavy commands
// defer (type 5) and finish via a followup edit. The endpoint is public (Discord calls it), so commands
// are gated to my own Discord user id (DISCORD_OWNER_ID). Guarded on DISCORD_PUBLIC_KEY - 401 when unset.
import { after } from "next/server"
import { webcrypto } from "node:crypto"
import { gatherDigestData, type DigestData } from "@/lib/digest-facts"

export const dynamic = "force-dynamic"

const DISCORD_API = "https://discord.com/api/v10"

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

// Verify the Ed25519 signature Discord sends, using built-in WebCrypto (no extra dependency).
async function verifySignature(publicKeyHex: string, signatureHex: string, timestamp: string, body: string): Promise<boolean> {
  try {
    const key = await webcrypto.subtle.importKey("raw", hexToBytes(publicKeyHex), { name: "Ed25519" }, false, ["verify"])
    return await webcrypto.subtle.verify("Ed25519", key, hexToBytes(signatureHex), new TextEncoder().encode(timestamp + body))
  } catch {
    return false
  }
}

// Edit the deferred reply once the data is ready. The interaction token authorises this for 15 minutes.
async function followup(token: string, content: string) {
  const appId = process.env.DISCORD_APPLICATION_ID
  if (!appId) return
  await fetch(`${DISCORD_API}/webhooks/${appId}/${token}/messages/@original`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }).catch(() => {})
}

function summaryLine(data: DigestData, label: string): string {
  const f = data.facts
  return [
    `**${label}**`,
    `Applied ${f.applied} · Interviews ${f.interviews} · Offers ${f.offers}`,
    `Coding ${f.codingHours}h · Study ${f.studyHours}h`,
    `Streaks ${f.streakCheckIns}/${f.activeStreaks} · Habits ${f.habitCheckIns}/${f.activeHabits}`,
    `Goals done ${f.goalsDone}, in progress ${f.goalsInProgress}`,
    f.workouts > 0 ? `Workouts ${f.workouts} (${f.workoutDistanceKm}km)` : "",
    f.deadlinesDueSoon > 0 ? `Deadlines due soon: ${f.deadlinesDueSoon}${f.nextDeadline ? `, nearest ${f.nextDeadline}` : ""}` : "",
    f.followUpsDue > 0 ? `Follow-ups due: ${f.followUpsDue}` : "",
    data.expiring.length > 0 ? `Expiring soon: ${data.expiring.length}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function POST(req: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    return Response.json({ error: "discord not configured" }, { status: 401 })
  }

  const signature = req.headers.get("x-signature-ed25519")
  const timestamp = req.headers.get("x-signature-timestamp")
  const body = await req.text()

  if (!signature || !timestamp || !(await verifySignature(publicKey, signature, timestamp, body))) {
    return new Response("invalid request signature", { status: 401 })
  }

  const interaction = JSON.parse(body) as {
    type: number
    data?: { name?: string }
    token: string
    member?: { user?: { id?: string } }
    user?: { id?: string }
  }

  // PING -> PONG. Discord uses this to verify the endpoint when I save the URL.
  if (interaction.type === 1) {
    return Response.json({ type: 1 })
  }

  // Slash command (type 2). Owner-only: this endpoint is public, so I check the invoking user id.
  if (interaction.type === 2) {
    const ownerId = process.env.DISCORD_OWNER_ID
    const userId = interaction.member?.user?.id ?? interaction.user?.id
    if (ownerId && userId !== ownerId) {
      return Response.json({ type: 4, data: { content: "Not authorised.", flags: 64 } })
    }

    const name = interaction.data?.name

    if (name === "ping") {
      return Response.json({ type: 4, data: { content: "Pong 🏓 the bot is alive." } })
    }

    if (name === "today" || name === "week") {
      const hours = name === "week" ? 168 : 24
      const label = name === "week" ? "Past week" : "Today"
      const period = name === "week" ? "the past week" : "today"
      const token = interaction.token
      // gatherDigestData runs many queries, so I defer and edit the reply when it is ready.
      after(async () => {
        const data = await gatherDigestData(hours, period)
        await followup(token, summaryLine(data, label))
      })
      return Response.json({ type: 5 })
    }

    return Response.json({ type: 4, data: { content: "Unknown command.", flags: 64 } })
  }

  return new Response("unhandled interaction type", { status: 400 })
}
