"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Globe, StickyNote, Key, CreditCard, User, ShieldCheck, Search, BarChart3 } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"
import { Input } from "@/components/ui/input"
import { StatCard, PieChart } from "@/components/analytics"

// I keep the VaultEntry type faithful to the DB schema so TypeScript catches any field name drift
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

// I centralise type metadata here so adding a new vault type only requires one change
const VAULT_TYPES = [
  {
    slug: "account",
    dbValue: "account",
    label: "Accounts",
    description: "Passwords and logins",
    icon: Globe,
    gradient: "from-blue-500/10 to-blue-600/5",
    accent: "border-blue-500/20",
    iconClass: "text-blue-500",
  },
  {
    slug: "secure_note",
    dbValue: "secure_note",
    label: "Secure Notes",
    description: "Private text and secrets",
    icon: StickyNote,
    gradient: "from-amber-500/10 to-amber-600/5",
    accent: "border-amber-500/20",
    iconClass: "text-amber-500",
  },
  {
    slug: "api_key",
    dbValue: "api_key",
    label: "API Keys",
    description: "Tokens and credentials",
    icon: Key,
    gradient: "from-purple-500/10 to-purple-600/5",
    accent: "border-purple-500/20",
    iconClass: "text-purple-500",
  },
  {
    slug: "card",
    dbValue: "card",
    label: "Cards",
    description: "Payment card details",
    icon: CreditCard,
    gradient: "from-green-500/10 to-green-600/5",
    accent: "border-green-500/20",
    iconClass: "text-green-500",
  },
  {
    slug: "identity",
    dbValue: "identity",
    label: "Identities",
    description: "Personal identifiers",
    icon: User,
    gradient: "from-indigo-500/10 to-indigo-600/5",
    accent: "border-indigo-500/20",
    iconClass: "text-indigo-500",
  },
]

export default function VaultClient({ entries }: { entries: VaultEntry[] }) {
  const [search, setSearch] = useState("")

  const totalEntries = entries.length

  // I match on name plus both the raw type value and its human label, so searching "card" or the
  // entry name both narrow the type grid. Empty search shows everything.
  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    const labelByValue = new Map(VAULT_TYPES.map((t) => [t.dbValue, t.label.toLowerCase()]))
    return entries.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      (labelByValue.get(e.type)?.includes(q) ?? false)
    )
  }, [entries, search])

  // I derive per-type counts once from the entries array rather than issuing per-type queries.
  // The grid uses the filtered counts so it narrows as I type; stats below use the full set.
  const typeCounts = VAULT_TYPES.map((t) => ({
    ...t,
    count: filteredEntries.filter((e) => e.type === t.dbValue).length,
  }))
  const populatedTypes = VAULT_TYPES.filter((t) => entries.some((e) => e.type === t.dbValue)).length

  // I compute the headline stats and the count-by-type pie once over the full entry set.
  const analytics = useMemo(() => {
    const counts = VAULT_TYPES.map((t) => ({
      name: t.label,
      value: entries.filter((e) => e.type === t.dbValue).length,
    })).filter((d) => d.value > 0)
    const largest = counts.reduce<{ name: string; value: number } | null>(
      (best, d) => (best === null || d.value > best.value ? d : best),
      null,
    )
    return { byType: counts, largest }
  }, [entries])

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-3xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-xl font-semibold">Vault</h1>
        {totalEntries === 0 ? (
          <p className="text-xs text-muted-foreground mt-0.5">My passwords and secrets</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalEntries} {totalEntries === 1 ? "entry" : "entries"} across {populatedTypes} {populatedTypes === 1 ? "type" : "types"}
          </p>
        )}
      </div>

      {totalEntries === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">My vault is empty</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visit a type below to start adding entries.
          </p>
        </div>
      ) : null}

      {totalEntries > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Vault analytics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="Total entries" value={totalEntries} />
            <StatCard label="Types" value={populatedTypes} />
            <StatCard label="Largest type" value={analytics.largest ? analytics.largest.name : "-"} />
          </div>

          {analytics.byType.length > 0 && (
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Entries by type</p>
              <PieChart data={analytics.byType} />
            </div>
          )}
        </div>
      )}

      {totalEntries > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or type..."
            className="pl-9"
          />
        </div>
      )}

      {totalEntries > 0 && filteredEntries.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No entries match &ldquo;{search}&rdquo;.
        </div>
      ) : null}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {typeCounts
          .filter((t) => (search.trim() ? t.count > 0 : true))
          .map((t) => (
          <motion.div key={t.slug} variants={dashboardCard}>
            <Link
              href={`/dashboard/vault/${t.slug}`}
              className={`flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br ${t.gradient} ${t.accent} hover:shadow-md transition-all group block`}
            >
              <div className="flex items-center justify-between">
                <t.icon className={`h-5 w-5 ${t.iconClass}`} />
                <span className="text-2xl font-bold tabular-nums text-foreground/80">
                  {t.count}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {t.label}
                </p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
