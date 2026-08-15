"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ShoppingBag, BarChart3 } from "lucide-react"
import { dashboardPage, dashboardGrid, dashboardCard } from "@/lib/animations"
import { StatCard, PieChart, BarChart, DEFAULT_CHART_COLOURS } from "@/components/analytics"

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

  const byCategory = categoryStats.map(({ cat, catItems }) => ({ name: cat, value: catItems.length })).filter((d) => d.value > 0)
  const byPriority = ["high", "medium", "low"]
    .map((p) => ({ name: p, count: items.filter((i) => i.priority === p).length }))
    .filter((d) => d.count > 0)
  const highPriorityOpen = items.filter((i) => i.priority === "high" && i.status !== "got_it").length

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-6xl"
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

      {items.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Wishlist analytics</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total items" value={items.length} />
            <StatCard label="Obtained" value={totalGot} />
            <StatCard label="High priority open" value={highPriorityOpen} />
            <StatCard label="Categories" value={categories.length} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {byCategory.length > 0 && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-3 text-center">By category</p>
                <PieChart data={byCategory} colours={DEFAULT_CHART_COLOURS} height={180} />
              </div>
            )}
            {byPriority.length > 0 && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-3">By priority</p>
                <BarChart data={byPriority} dataKey="count" xKey="name" colours={DEFAULT_CHART_COLOURS} />
              </div>
            )}
          </div>
        </div>
      )}

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
