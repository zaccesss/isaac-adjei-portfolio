import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import VaultTypeClient from "./VaultTypeClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

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
  const { type } = await params
  const dbType = TYPE_SLUGS[type]
  if (!dbType) notFound()

  const { data: entries } = await supabase
    .from("vault")
    .select("*")
    .eq("type", dbType)
    .order("name")

  return (
    <VaultTypeClient
      entries={entries ?? []}
      type={dbType}
      typeSlug={type}
      typeLabel={TYPE_LABELS[type]}
    />
  )
}
