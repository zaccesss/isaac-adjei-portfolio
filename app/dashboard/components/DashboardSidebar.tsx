"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  User, Heart, Target, Dumbbell, BookMarked, StickyNote,
  Gift, Package, GraduationCap, BookOpen, Briefcase, Lock,
  Flame, LogOut, ChevronLeft, ChevronRight, Menu, X, Settings, Activity, Github, BarChart2, Code2, Trash2, Users,
  Brain, Church, School, CheckSquare, CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import DashboardSearch from "@/components/dashboard/DashboardSearch"

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; sub?: boolean }
type NavGroup = { group: string; items: NavItem[] }

const nav: (NavItem | NavGroup)[] = [
  { href: "/dashboard/me", label: "Me", icon: User },
  { href: "/dashboard/us", label: "Us", icon: Heart },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  {
    group: "University",
    items: [
      { href: "/dashboard/university", label: "Overview", icon: School },
      { href: "/dashboard/course", label: "Course", icon: GraduationCap, sub: true },
      { href: "/dashboard/modules", label: "Modules", icon: BookOpen, sub: true },
    ],
  },
  { href: "/dashboard/study", label: "Study", icon: Brain },
  { href: "/dashboard/faith", label: "Faith", icon: Church },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/health", label: "Health & Fitness", icon: Dumbbell },
  { href: "/dashboard/habits", label: "Habits", icon: CheckSquare },
  { href: "/dashboard/streaks", label: "Streaks", icon: Flame },
  { href: "/dashboard/diary", label: "Diary", icon: BookMarked },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Gift },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/vault", label: "Vault", icon: Lock },
  {
    group: "Analytics",
    items: [
      { href: "/dashboard/coding", label: "Coding", icon: Code2 },
      { href: "/dashboard/blog-analytics", label: "Posts", icon: BarChart2, sub: true },
    ],
  },
  { href: "/dashboard/opensource", label: "Open Source", icon: Github },
  { href: "/dashboard/activity", label: "Activity log", icon: Activity },
  { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
]

export default function DashboardSidebar({
  user,
}: {
  user: { name?: string | null; image?: string | null }
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(() => {
    // I guard against SSR where window is undefined, defaulting to expanded
    if (typeof window === "undefined") return false
    // I read from localStorage so the preference survives page navigations
    return localStorage.getItem("nexus_sidebar_collapsed") === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem("nexus_sidebar_collapsed", String(next)) } catch {}
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`flex items-center pt-2 pb-1 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? "avatar"}
                width={28}
                height={28}
                className="rounded-full shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate leading-tight">My Dashboard</p>
              {user.name && <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.name}</p>}
            </div>
          </div>
        )}
        {collapsed && user.image && (
          <Image
            src={user.image}
            alt={user.name ?? "avatar"}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className="ml-auto p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && <div className="py-1"><DashboardSearch /></div>}

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {nav.map((entry) => {
          if ("group" in entry) {
            const groupActive = entry.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
            return (
              <div key={entry.group} className="mt-1">
                {!collapsed && (
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2.5 py-1">{entry.group}</p>
                )}
                {entry.items.map(({ href, label, icon: Icon, sub }) => {
                  const active = pathname === href || pathname.startsWith(href + "/")
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? label : undefined}
                      className={`flex items-center gap-2.5 ${sub && !collapsed ? "pl-5 pr-2.5" : "px-2.5"} py-1.5 rounded-md text-sm transition-colors ${
                        active ? "bg-primary text-primary-foreground" : groupActive && !active ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${sub ? "h-3.5 w-3.5" : ""}`} />
                      {!collapsed && <span className={`truncate ${sub ? "text-xs" : ""}`}>{label}</span>}
                    </Link>
                  )
                })}
              </div>
            )
          }

          const { href, label, icon: Icon } = entry
          // I also highlight the link when on a sub-route so nested pages feel connected
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              // I close the mobile drawer on navigation so the content is not obscured
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Settings + sign out at the bottom */}
      <div className="flex flex-col gap-0.5 border-t border-border/60 pt-2 mt-1">
        {(() => {
          const active = pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")
          return (
            <Link
              href="/dashboard/settings"
              title={collapsed ? "Settings" : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
          )
        })()}
        <Button
          variant="ghost"
          size="sm"
          title={collapsed ? "Sign out" : undefined}
          className={`justify-start gap-2 text-muted-foreground hover:text-foreground ${collapsed ? "justify-center px-2" : ""}`}
          onClick={() => signOut({ callbackUrl: "/dashboard/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-muted/30 p-3 gap-3 sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? "w-14" : "w-52"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger + slide-over */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-background border border-border shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-[85vw] bg-background border-r border-border p-3 gap-3 h-full overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                {user.image && (
                  <Image src={user.image} alt={user.name ?? "avatar"} width={28} height={28} className="rounded-full" />
                )}
                <div>
                  <p className="text-xs font-semibold">Nexus</p>
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                </div>
              </div>
              <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 flex-1">
              {nav.map((entry) => {
                if ("group" in entry) {
                  return (
                    <div key={entry.group} className="mt-1">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2.5 py-1">{entry.group}</p>
                      {entry.items.map(({ href, label, icon: Icon, sub }) => {
                        const active = pathname === href || pathname.startsWith(href + "/")
                        return (
                          <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 ${sub ? "pl-5 pr-2.5" : "px-2.5"} py-1.5 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                          >
                            <Icon className={`shrink-0 ${sub ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
                            <span className={sub ? "text-xs" : ""}>{label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )
                }
                const { href, label, icon: Icon } = entry
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="flex flex-col gap-0.5 border-t border-border/60 pt-2 mt-1">
              {(() => {
                const active = pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")
                return (
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Settings</span>
                  </Link>
                )
              })()}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => signOut({ callbackUrl: "/dashboard/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
