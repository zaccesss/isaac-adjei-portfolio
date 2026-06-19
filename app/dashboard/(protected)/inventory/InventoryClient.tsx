"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Package, Cpu, Dumbbell, Gamepad2, Music } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"

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
  // I derive unique categories from the actual items rather than a hardcoded list
  // so custom categories created by the user always appear
  const categories = Array.from(new Set(items.map((i) => i.category))).sort()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

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

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat)
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
