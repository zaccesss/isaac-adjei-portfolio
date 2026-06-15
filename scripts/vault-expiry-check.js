#!/usr/bin/env node
// I check passport, warranty, API key and card expiry dates in Supabase and send a Discord alert if anything is due to expire soon, bypassing Cloudflare so the check works in GitHub Actions.
// Runs vault and inventory expiry checks directly against Supabase and posts
// a Discord embed if anything is expiring soon. Intended for GitHub Actions —
// avoids going through the production URL so Cloudflare bot protection is not
// an issue.
//
// Required env vars: SUPABASE_URL, SUPABASE_ANON_KEY, DISCORD_WEBHOOK_URL

const { createClient } = require("@supabase/supabase-js")

const ALERT_DAYS = {
  passport: 90,
  warranty: 30,
  card:     30,
  api_key:  14,
  default:  30,
}

function alertDays(type) {
  return ALERT_DAYS[type] ?? ALERT_DAYS.default
}

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / 86_400_000)
}

function parseCardExpiry(mmyy) {
  const match = mmyy.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return null
  const month = parseInt(match[1], 10)
  const year = 2000 + parseInt(match[2], 10)
  if (month < 1 || month > 12) return null
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  const webhookUrl  = process.env.DISCORD_WEBHOOK_URL

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY")
    process.exit(1)
  }

  if (!webhookUrl) {
    console.log("DISCORD_WEBHOOK_URL not set — skipping (no alert to send)")
    process.exit(0)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const expiring = []

  const { data: vaultKeys, error: e1 } = await supabase
    .from("vault")
    .select("name, type, key_expiry")
    .not("key_expiry", "is", null)

  if (e1) { console.error("vault key_expiry query failed:", e1.message); process.exit(1) }

  for (const row of vaultKeys ?? []) {
    const days = daysUntil(row.key_expiry)
    if (days <= alertDays(row.type ?? "default")) {
      expiring.push({ name: row.name, type: row.type, expiresOn: row.key_expiry, daysLeft: days })
    }
  }

  const { data: vaultCards, error: e2 } = await supabase
    .from("vault")
    .select("name, type, card_expiry")
    .not("card_expiry", "is", null)

  if (e2) { console.error("vault card_expiry query failed:", e2.message); process.exit(1) }

  for (const row of vaultCards ?? []) {
    const iso = parseCardExpiry(row.card_expiry)
    if (!iso) continue
    const days = daysUntil(iso)
    if (days <= alertDays("card")) {
      expiring.push({ name: row.name, type: "card", expiresOn: row.card_expiry, daysLeft: days })
    }
  }

  const { data: inventoryItems, error: e3 } = await supabase
    .from("inventory_items")
    .select("name, category, warranty_expiry")
    .not("warranty_expiry", "is", null)

  if (e3) { console.error("inventory_items query failed:", e3.message); process.exit(1) }

  for (const row of inventoryItems ?? []) {
    const days = daysUntil(row.warranty_expiry)
    if (days <= alertDays("warranty")) {
      expiring.push({ name: row.name, type: row.category ?? "item", expiresOn: row.warranty_expiry, daysLeft: days })
    }
  }

  if (expiring.length === 0) {
    console.log("No expiring items found — nothing to send")
    process.exit(0)
  }

  expiring.sort((a, b) => a.daysLeft - b.daysLeft)
  console.log(`Found ${expiring.length} expiring item(s):`)
  expiring.forEach((i) => console.log(`  ${i.name} (${i.type}): ${i.daysLeft}d — ${i.expiresOn}`))

  const fields = expiring.map((item) => ({
    name: `${item.name} (${item.type})`,
    value: item.daysLeft < 0
      ? `Expired ${Math.abs(item.daysLeft)}d ago — ${item.expiresOn}`
      : item.daysLeft === 0
      ? `Expires today — ${item.expiresOn}`
      : `Expires in ${item.daysLeft}d — ${item.expiresOn}`,
    inline: false,
  }))

  const colour = expiring.some((i) => i.daysLeft <= 7) ? 0xe74c3c : 0xf39c12

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `Expiry Alert — ${expiring.length} item${expiring.length === 1 ? "" : "s"} expiring soon`,
        color: colour,
        fields,
        footer: { text: "isaacadjei.me vault" },
        timestamp: new Date().toISOString(),
      }],
    }),
  })

  if (!res.ok) {
    console.error(`Discord webhook failed: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  console.log("Discord alert sent successfully")
}

main()
