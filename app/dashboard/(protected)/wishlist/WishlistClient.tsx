"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ShoppingBag } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"

type Item = {
  id: string
  name: string
  category: string
  status: string
  priority: string
  notes: string | null
}

// I convert a category name to a URL slug so category pages have clean paths
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

const PRIORITY_COLOURS: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-muted-foreground",
}

export default function WishlistClient({ items }: { items: Item[] }) {
  // I derive unique categories from the items array so the grid is always current
  const categories = Array.from(new Set(items.map((i) => i.category))).sort()
  const totalGot = items.filter((i) => i.status === "got_it").length

  // I compute per-category stats once so the card render loop is cheap
  const categoryStats = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat)
    const gotCount = catItems.filter((i) => i.status === "got_it").length
    const highCount = catItems.filter((i) => i.priority === "high").length
    const mediumCount = catItems.filter((i) => i.priority === "medium").length
    const lowCount = catItems.filter((i) => i.priority === "low").length
    const progress = catItems.length > 0 ? (gotCount / catItems.length) * 100 : 0
    return { cat, catItems, gotCount, highCount, mediumCount, lowCount, progress }
  })

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-5xl"
      variants={dashboardPage}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Wishlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalGot} of {items.length} obtained
          </p>
        </div>
        {/* I link to the "all" category so the user can add an item without choosing a category first */}
        <Link
          href="/dashboard/wishlist/all"
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">My wishlist is empty</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visit a category or the &quot;View all&quot; card below to start adding items.
          </p>
        </div>
      ) : null}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
        variants={dashboardGrid}
        initial="hidden"
        animate="visible"
      >
        {/* I always show a "View all" card at the top so the user can see everything at once */}
        <motion.div variants={dashboardCard}>
          <Link
            href="/dashboard/wishlist/all"
            className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group block"
          >
            <div className="flex items-center justify-between">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold tabular-nums text-foreground/80">{items.length}</span>
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">All items</p>
              <p className="text-xs text-muted-foreground">{totalGot} obtained</p>
            </div>
            {items.length > 0 && (
              <div className="mt-auto bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 bg-green-500 rounded-full transition-all"
                  style={{ width: `${(totalGot / items.length) * 100}%` }}
                />
              </div>
            )}
          </Link>
        </motion.div>

        {categoryStats.map(({ cat, catItems, gotCount, highCount, mediumCount, lowCount, progress }) => (
          <motion.div key={cat} variants={dashboardCard}>
            <Link
              href={`/dashboard/wishlist/${toSlug(cat)}`}
              className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {cat}
                </span>
                <span className="text-2xl font-bold tabular-nums text-foreground/80 shrink-0">
                  {catItems.length}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{cat}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {highCount > 0 && (
                    <span className={`text-xs ${PRIORITY_COLOURS.high}`}>{highCount} high</span>
                  )}
                  {mediumCount > 0 && (
                    <span className={`text-xs ${PRIORITY_COLOURS.medium}`}>{mediumCount} medium</span>
                  )}
                  {lowCount > 0 && (
                    <span className={`text-xs ${PRIORITY_COLOURS.low}`}>{lowCount} low</span>
                  )}
                  {catItems.length === 0 && (
                    <span className="text-xs text-muted-foreground">No items yet</span>
                  )}
                </div>
              </div>
              {catItems.length > 0 && (
                <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 bg-green-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">{gotCount}/{catItems.length} obtained</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
