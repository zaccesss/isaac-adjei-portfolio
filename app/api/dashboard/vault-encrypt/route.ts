import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { encryptVaultData, needsEncryption, vaultEncryptionReady } from "@/lib/vault-crypto"

export const dynamic = "force-dynamic"

// One-off migration that encrypts every legacy plaintext vault row in place. Idempotent: rows that are
// already encrypted are skipped, so it is safe to run more than once. Owner-only and it never returns
// any secret. Trigger it once, after deploy, from the dashboard (logged in):
//   fetch("/api/dashboard/vault-encrypt", { method: "POST" }).then(r => r.json()).then(console.log)
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  if (!vaultEncryptionReady()) {
    return NextResponse.json({ error: "VAULT_ENCRYPTION_KEY is not set or not 32 bytes" }, { status: 500 })
  }

  // Paged past the 1000-row PostgREST cap so a grown vault still migrates in full - the
  // migration is idempotent, but a silent partial pass would look complete.
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const { data: page, error } = await supabase.from("vault").select("*").order("id").range(from, from + 999)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!page || page.length === 0) break
    rows.push(...page)
    if (page.length < 1000) break
  }

  let encrypted = 0
  let skipped = 0
  for (const row of rows) {
    if (!needsEncryption(row)) {
      skipped++
      continue
    }
    const { error: upErr } = await supabase
      .from("vault")
      .update(encryptVaultData(row))
      .eq("id", (row as { id: string }).id)
    if (upErr) {
      return NextResponse.json({ error: upErr.message, encrypted, skipped }, { status: 500 })
    }
    encrypted++
  }

  return NextResponse.json({ ok: true, encrypted, skipped, total: rows.length })
}
