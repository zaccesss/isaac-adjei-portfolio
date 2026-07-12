// Vault entries never reach the browser unless the PIN cookie is present.
// PinGate on the client handles prompting when it is absent.
import { supabase } from "@/lib/supabase"
import { isPinVerified } from "@/lib/pin"
import { decryptVaultRows } from "@/lib/vault-crypto"
import VaultWrapper from "./VaultWrapper"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default async function VaultPage() {
  const pinVerified = await isPinVerified()

  const entries = pinVerified
    ? decryptVaultRows((await supabase.from("vault").select("*").order("name")).data)
    : []

  return <VaultWrapper pinVerified={pinVerified} entries={entries} />
}
