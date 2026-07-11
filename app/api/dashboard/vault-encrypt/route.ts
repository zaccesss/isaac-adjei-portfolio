import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { encryptVaultData, needsEncryption, vaultEncryptionReady } from "@/lib/vault-crypto"

export const dynamic = "force-dynamic"

// One-off migration that encrypts every legacy plaintext vault row in place. Idempotent: rows that are
// already encrypted are skipped, so it is safe to run more than once. Owner-only, and it never returns
// any secret. Trigger it once, after deploy, from the dashboard (logged in):
//   fetch("/api/dashboard/vault-encrypt", { method: "POST" }).then(r => r.json()).then(console.log)
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  if (!vaultEncryptionReady()) {
    return NextResponse.json({ error: "VAULT_ENCRYPTION_KEY is not set or not 32 bytes" }, { status: 500 })
  }

  const { data: rows, error } = await supabase.from("vault").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let encrypted = 0
  let skipped = 0
  for (const row of rows ?? []) {
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

  return NextResponse.json({ ok: true, encrypted, skipped, total: (rows ?? []).length })
}
