"use client"

// The dashboard's light and dark toggle, fixed top right like the public pages. Same icon swap as
// the shared ThemeToggle, plus the dashboard behaviour the old Settings toggle had: the choice is
// saved to config so ThemeSync restores it on any device I sign in from. Fixed at the viewport
// corner; the mobile menu button sits top left so the two never meet.

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { setConfig } from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"

export default function DashboardThemeToggle() {
  const { theme, setTheme } = useTheme()

  function handleToggle() {
    const next = theme === "dark" ? "light" : "dark"
    const html = document.documentElement
    html.classList.add("theme-transitioning")
    setTheme(next)
    window.setTimeout(() => html.classList.remove("theme-transitioning"), 100)
    void setConfig("theme_preference", next).then((res) => savedOk(res, "Could not save theme"))
  }

  return (
    <div className="fixed top-3 right-3 z-40">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-label="Toggle theme"
        className="text-muted-foreground hover:text-foreground"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
