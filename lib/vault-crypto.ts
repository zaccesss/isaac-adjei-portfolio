// Vault encryption at rest. Every secret field is AES-256-GCM encrypted before it touches the database
// and decrypted only here on the server (behind auth and the PIN gate), so a database leak or the
// service-role key never exposes a password, an API key or an SSH key in the clear.
//
// The key lives in VAULT_ENCRYPTION_KEY (32 bytes, base64 or hex), set in Vercel and nowhere else - not
// in the database and not in the repo. It must stay stable: it is the only thing that can decrypt the
// data, so losing it loses the secrets.
//
// Encrypted values carry an "enc:v1:" prefix. Anything without the prefix is treated as legacy plaintext
// and returned as-is, so reads keep working while the one-off migration encrypts existing rows.

import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const PREFIX = "enc:v1:"

// The fields that hold secrets. name, type, url, key_name, key_expiry, hidden and locked stay in the
// clear so the list still renders and sorts without decrypting every row.
const SECRET_FIELDS = [
  "username",
  "email",
  "password",
  "totp_secret",
  "card_number",
  "card_holder",
  "card_expiry",
  "phone",
  "address",
  "key_value",
  "content",
  "notes",
] as const

function getKey(): Buffer {
  const raw = process.env.VAULT_ENCRYPTION_KEY || ""
  if (!raw) throw new Error("VAULT_ENCRYPTION_KEY is not set")
  const buf = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64")
  if (buf.length !== 32) throw new Error("VAULT_ENCRYPTION_KEY must decode to 32 bytes")
  return buf
}

/** Whether encryption is configured. Lets callers fail safe if the key is missing. */
export function vaultEncryptionReady(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

export function isEncrypted(value: unknown): boolean {
  return typeof value === "string" && value.startsWith(PREFIX)
}

export function encryptValue(plain: string): string {
  if (plain === "" || plain == null) return plain
  if (isEncrypted(plain)) return plain // never double-encrypt
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64")
}

export function decryptValue(stored: string): string {
  if (!isEncrypted(stored)) return stored // legacy plaintext, or not a string
  const raw = Buffer.from(stored.slice(PREFIX.length), "base64")
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const ct = raw.subarray(28)
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
}

type Row = Record<string, unknown>

function mapFields(obj: unknown, fn: (v: string) => string): unknown {
  if (!obj || typeof obj !== "object") return obj
  const out: Record<string, unknown> = Array.isArray(obj) ? ([] as unknown as Record<string, unknown>) : {}
  for (const [k, v] of Object.entries(obj)) out[k] = typeof v === "string" && v !== "" ? fn(v) : v
  return out
}

/** Encrypt the secret fields of a vault row before an insert or update. */
export function encryptVaultData<T extends Row>(data: T): T {
  const out: Row = { ...data }
  for (const f of SECRET_FIELDS) {
    if (typeof out[f] === "string" && out[f] !== "") out[f] = encryptValue(out[f] as string)
  }
  if (out.fields && typeof out.fields === "object") out.fields = mapFields(out.fields, encryptValue)
  return out as T
}

/** Decrypt the secret fields of a vault row read from the database. Safe on legacy plaintext rows. */
export function decryptVaultRow<T extends Row>(row: T | null | undefined): T | null | undefined {
  if (!row) return row
  const out: Row = { ...row }
  for (const f of SECRET_FIELDS) {
    if (typeof out[f] === "string") out[f] = decryptValue(out[f] as string)
  }
  if (out.fields && typeof out.fields === "object") out.fields = mapFields(out.fields, decryptValue)
  return out as T
}

/** Decrypt a list of vault rows. */
export function decryptVaultRows<T extends Row>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).map((r) => decryptVaultRow(r) as T)
}

/** True if a row still holds any plaintext secret - used by the one-off migration to skip done rows. */
export function needsEncryption(row: Row): boolean {
  for (const f of SECRET_FIELDS) {
    if (typeof row[f] === "string" && row[f] !== "" && !isEncrypted(row[f])) return true
  }
  if (row.fields && typeof row.fields === "object") {
    for (const v of Object.values(row.fields)) {
      if (typeof v === "string" && v !== "" && !isEncrypted(v)) return true
    }
  }
  return false
}
