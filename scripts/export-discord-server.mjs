// Reads an existing Discord server's full structure and writes it to discord-export.json, so I can use a
// well-built server as a reference or template. READ-ONLY - it never changes anything. Node only.
//
//   DISCORD_BOT_TOKEN=... DISCORD_GUILD_ID=<server to export> node scripts/export-discord-server.mjs
//
// The bot must be in that server (View Channels is enough for the structure). Messages are NOT exported by
// default - they are heavy and rarely needed for a template. Pass WITH_MESSAGES=1 to also pull the last 20
// per text channel.

import { writeFileSync } from "node:fs"

const token = process.env.DISCORD_BOT_TOKEN
const guildId = process.env.DISCORD_GUILD_ID
const withMessages = process.env.WITH_MESSAGES === "1"

if (!token || !guildId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID (the server to export).")
  process.exit(1)
}

const API = "https://discord.com/api/v10"
const headers = { Authorization: `Bot ${token}` }

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers })
  if (res.status === 429) {
    const retry = (await res.json().catch(() => ({})))?.retry_after ?? 1
    await new Promise((r) => setTimeout(r, retry * 1000 + 250))
    return get(path)
  }
  if (!res.ok) throw new Error(`${res.status} ${await res.text()} (${path})`)
  return res.json()
}

const guild = await get(`/guilds/${guildId}`)
const roles = await get(`/guilds/${guildId}/roles`)
const channels = await get(`/guilds/${guildId}/channels`)
let integrations = []
try {
  integrations = await get(`/guilds/${guildId}/integrations`)
} catch {
  // needs Manage Guild - skip the bot list quietly if not permitted
}

const TYPE = { 0: "text", 2: "voice", 4: "category", 5: "announcement", 13: "stage", 15: "forum" }

const channelView = (c) => ({
  name: c.name,
  type: TYPE[c.type] ?? c.type,
  topic: c.topic ?? null,
  nsfw: c.nsfw ?? false,
  slowmode: c.rate_limit_per_user ?? 0,
  permissionOverwrites: (c.permission_overwrites ?? []).length,
})

const categories = channels
  .filter((c) => c.type === 4)
  .sort((a, b) => a.position - b.position)
  .map((cat) => ({
    category: cat.name,
    channels: channels
      .filter((c) => c.parent_id === cat.id)
      .sort((a, b) => a.position - b.position)
      .map(channelView),
  }))

const blueprint = {
  server: guild.name,
  roles: roles
    .filter((r) => r.name !== "@everyone")
    .sort((a, b) => b.position - a.position)
    .map((r) => ({ name: r.name, colour: `#${r.color.toString(16).padStart(6, "0")}`, hoist: r.hoist, mentionable: r.mentionable })),
  bots: integrations.map((i) => i.name ?? i.application?.name).filter(Boolean),
  uncategorised: channels.filter((c) => c.type !== 4 && !c.parent_id).map(channelView),
  categories,
}

if (withMessages) {
  for (const cat of categories) {
    for (const ch of cat.channels) {
      if (ch.type !== "text") continue
      const real = channels.find((c) => c.name === ch.name && c.type === 0)
      if (!real) continue
      try {
        const msgs = await get(`/channels/${real.id}/messages?limit=20`)
        ch.recentMessages = msgs.map((m) => ({ author: m.author?.username, content: m.content })).reverse()
      } catch {
        // missing Read Message History - skip
      }
      await new Promise((r) => setTimeout(r, 300))
    }
  }
}

writeFileSync("discord-export.json", JSON.stringify(blueprint, null, 2))
console.log(`Exported "${guild.name}": ${categories.length} categories, ${channels.length} channels, ${blueprint.roles.length} roles -> discord-export.json`)
