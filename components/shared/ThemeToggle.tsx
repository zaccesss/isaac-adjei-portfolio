"use client"

// Button that toggles between light and dark mode.
// Both the Sun and Moon icons are always rendered - CSS rotations and scale transforms
// are used to show one and hide the other so the swap animation is smooth.
// I add a theme-transitioning class to <html> for 100ms so every element crossfades
// during the switch without permanently overriding hover or Framer Motion transitions.

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function handleToggle() {
    const html = document.documentElement
    html.classList.add("theme-transitioning")
    setTheme(theme === "dark" ? "light" : "dark")
    window.setTimeout(() => html.classList.remove("theme-transitioning"), 100)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
