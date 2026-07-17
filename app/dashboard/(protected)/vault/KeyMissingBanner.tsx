import { ShieldAlert } from "lucide-react"

// Shown on the vault when VAULT_ENCRYPTION_KEY is not configured. Reads are passed through without
// decrypting and new secrets cannot be encrypted, so I surface it clearly here rather than letting
// the page throw on read or a save fail with an opaque error.
export default function KeyMissingBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-medium">Vault encryption is not configured</p>
        <p className="text-destructive/90">
          Set VAULT_ENCRYPTION_KEY then reload. Until it is set, existing secrets show as stored rather
          than decrypted. Saving a new secret will not work.
        </p>
      </div>
    </div>
  )
}
