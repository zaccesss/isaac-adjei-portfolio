import { supabase } from "@/lib/supabase"
import { notFound, redirect } from "next/navigation"
import { isPinVerified } from "@/lib/pin"
import { decryptVaultRows, vaultEncryptionReady } from "@/lib/vault-crypto"
import VaultTypeClient from "./VaultTypeClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Vault", robots: "noindex, nofollow" }

// I map URL slugs to the actual DB type values stored in the vault table
const TYPE_SLUGS: Record<string, string> = {
  account: "account",
  secure_note: "secure_note",
  api_key: "api_key",
  card: "card",
  identity: "identity",
}

// I map DB type values to human-readable display labels
const TYPE_LABELS: Record<string, string> = {
  account: "Accounts",
  secure_note: "Secure Notes",
  api_key: "API Keys",
  card: "Cards",
  identity: "Identities",
}

export default async function VaultTypePage({ params }: { params: Promise<{ type: string }> }) {
  // The per-type pages carry the same secrets as the index, so they get the same
  // server-side PIN check; the index hosts the unlock prompt.
  if (!(await isPinVerified())) redirect("/dashboard/vault")

  const { type } = await params
  const dbType = TYPE_SLUGS[type]
  if (!dbType) notFound()

  const { data: entries } = await supabase
    .from("vault")
    .select("*")
    .eq("type", dbType)
    .order("name")

  // No key means decrypting would throw, so pass the rows through and let the client warn.
  const encryptionReady = vaultEncryptionReady()

  return (
    <VaultTypeClient
      entries={encryptionReady ? decryptVaultRows(entries) : (entries ?? [])}
      encryptionReady={encryptionReady}
      type={dbType}
      typeSlug={type}
      typeLabel={TYPE_LABELS[type]}
    />
  )
}
