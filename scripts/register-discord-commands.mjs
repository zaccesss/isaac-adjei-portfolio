// Registers the personal OS slash commands with Discord. Run once and again whenever the command list
// changes. Guild-scoped (instant) when DISCORD_GUILD_ID is set, otherwise global (can take ~1 hour).
//
//   DISCORD_BOT_TOKEN=... DISCORD_APPLICATION_ID=... DISCORD_GUILD_ID=... node scripts/register-discord-commands.mjs
//
// The Bot Token and Application ID come from discord.com/developers; the Guild ID is your server id
// (enable Developer Mode in Discord, right-click the server, Copy Server ID).

import { COMMANDS, toDiscordSchema } from "./discord-commands.mjs"

const token = process.env.DISCORD_BOT_TOKEN
const appId = process.env.DISCORD_APPLICATION_ID
const guildId = process.env.DISCORD_GUILD_ID

if (!token || !appId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID first.")
  process.exit(1)
}

// The command list lives in discord-commands.mjs so the register script and the #commands reference share
// one definition. Here I strip the doc-only fields to the plain schema Discord expects.
const commands = COMMANDS.map(toDiscordSchema)

const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`

const res = await fetch(url, {
  method: "PUT",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(commands),
})

if (res.ok) {
  console.log(`Registered ${commands.length} commands ${guildId ? "(guild, instant)" : "(global, ~1h to propagate)"}.`)
} else {
  console.error("Failed:", res.status, await res.text())
  process.exit(1)
}
