"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, Cpu, Dumbbell, Gamepad2, Music, Search, BarChart3 } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"
import { Input } from "@/components/ui/input"
import { StatCard, PieChart } from "@/components/analytics"

type Item = {
  id: string
  name: string
  category: string
  quantity: number
  description: string | null
  purchase_date: string | null
  price_paid: string | null
  serial_number: string | null
  notes: string | null
  warranty_expiry: string | null
}

// I convert a category name to a URL slug for consistent routing
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

// I map known category names to icons so the overview cards are visually distinct
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Tech and Devices": Cpu,
  "Engineering and Components": Cpu,
  "Health and Fitness Equipment": Dumbbell,
  "Gaming": Gamepad2,
  "Music and Instruments": Music,
}

// I map known categories to gradient colours so each card has a distinct visual identity
const CATEGORY_GRADIENTS: Record<string, { gradient: string; accent: string; iconClass: string }> = {
  "Tech and Devices": { gradient: "from-blue-500/10 to-blue-600/5", accent: "border-blue-500/20", iconClass: "text-blue-500" },
  "Engineering and Components": { gradient: "from-orange-500/10 to-orange-600/5", accent: "border-orange-500/20", iconClass: "text-orange-500" },
  "Health and Fitness Equipment": { gradient: "from-green-500/10 to-green-600/5", accent: "border-green-500/20", iconClass: "text-green-500" },
  "Gaming": { gradient: "from-purple-500/10 to-purple-600/5", accent: "border-purple-500/20", iconClass: "text-purple-500" },
  "Music and Instruments": { gradient: "from-pink-500/10 to-pink-600/5", accent: "border-pink-500/20", iconClass: "text-pink-500" },
}

const DEFAULT_STYLE = { gradient: "from-muted/40 to-muted/20", accent: "border-border", iconClass: "text-muted-foreground" }

export default function InventoryClient({ items }: { items: Item[] }) {
  const [search, setSearch] = useState("")

  // I derive unique categories from the actual items rather than a hardcoded list
  // so custom categories created by the user always appear
  const categories = Array.from(new Set(items.map((i) => i.category))).sort()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // I filter by name case-insensitively, then drive the category grid off the matches so the
  // overview narrows as I type. Empty search shows everything.
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, search])
  const filteredCategories = Array.from(new Set(filteredItems.map((i) => i.category))).sort()

  // I compute the headline stats and the count-by-category pie once over the full inventory.
  // Total value sums price_paid (a string|null) times quantity, skipping rows without a price.
  const analytics = useMemo(() => {
    const totalValue = items.reduce((sum, i) => {
      const price = i.price_paid ? parseFloat(i.price_paid) : NaN
      return Number.isFinite(price) ? sum + price * i.quantity : sum
    }, 0)
    const byCategory = categories.map((cat) => ({
      name: cat,
      value: items.filter((i) => i.category === cat).length,
    }))
    return { totalValue, byCategory }
  }, [items, categories])

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-3xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h1 className="text-xl font-semibold">Inventory</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {totalItems} item{totalItems !== 1 ? "s" : ""} across {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">No items yet</p>
          <p className="text-xs text-muted-foreground mt-1">Visit a category below to start adding items.</p>
        </div>
      ) : null}

      {items.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Inventory analytics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="Total items" value={totalItems} />
            <StatCard label="Total value" value={`£${analytics.totalValue.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} />
            <StatCard label="Categories" value={categories.length} />
          </div>

          {analytics.byCategory.length > 0 && (
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Items by category</p>
              <PieChart data={analytics.byCategory} />
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="pl-9"
          />
        </div>
      )}

      {items.length > 0 && filteredCategories.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No items match &ldquo;{search}&rdquo;.
        </div>
      ) : null}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {filteredCategories.map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat)
          const Icon = CATEGORY_ICONS[cat] ?? Package
          const style = CATEGORY_GRADIENTS[cat] ?? DEFAULT_STYLE
          const totalQty = catItems.reduce((sum, i) => sum + i.quantity, 0)
          return (
            <motion.div key={cat} variants={dashboardCard}>
              <Link
                href={`/dashboard/inventory/${toSlug(cat)}`}
                className={`flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br ${style.gradient} ${style.accent} hover:shadow-md transition-all group block`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${style.iconClass}`} />
                  <span className="text-2xl font-bold tabular-nums text-foreground/80">{catItems.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{cat}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalQty} unit{totalQty !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
