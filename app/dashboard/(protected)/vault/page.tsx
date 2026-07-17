// Vault entries never reach the browser unless the PIN cookie is present.
// PinGate on the client handles prompting when it is absent.
import { supabase } from "@/lib/supabase"
import { isPinVerified } from "@/lib/pin"
import { decryptVaultRows, vaultEncryptionReady } from "@/lib/vault-crypto"
import VaultWrapper from "./VaultWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function VaultPage() {
  const pinVerified = await isPinVerified()
  // With no key, decrypting would throw and break the whole page. Pass the rows through undecrypted
  // and let the client show the key-missing banner instead.
  const encryptionReady = vaultEncryptionReady()

  const raw = pinVerified
    ? (await supabase.from("vault").select("*").order("name")).data
    : []
  const entries = encryptionReady ? decryptVaultRows(raw) : (raw ?? [])

  return <VaultWrapper pinVerified={pinVerified} entries={entries} encryptionReady={encryptionReady} />
}
