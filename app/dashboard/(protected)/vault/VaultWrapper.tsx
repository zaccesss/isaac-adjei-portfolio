"use client"

import { useRouter } from "next/navigation"
import PinGate from "@/components/dashboard/PinGate"
import VaultClient from "./VaultClient"

type VaultEntry = {
  id: string
  name: string
  type: string
  username: string | null
  email: string | null
  password: string | null
  url: string | null
  totp_secret: string | null
  card_number: string | null
  card_holder: string | null
  card_expiry: string | null
  phone: string | null
  address: string | null
  key_name: string | null
  key_value: string | null
  key_expiry: string | null
  content: string | null
  notes: string | null
  fields: Record<string, unknown>
}

export default function VaultWrapper({ pinVerified, entries }: {
  pinVerified: boolean
  entries: VaultEntry[]
}) {
  const router = useRouter()

  if (!pinVerified) {
    // I call router.refresh() on unlock so the server re-runs the page and passes pinVerified=true
    return <PinGate pageName="Vault" onUnlock={() => router.refresh()} />
  }

  return <VaultClient entries={entries} />
}
