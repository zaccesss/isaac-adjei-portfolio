"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

// I apply the saved theme preference from Supabase on first load so the
// choice persists across different browsers and devices
export default function ThemeSync({ savedTheme }: { savedTheme: string | null }) {
  const { setTheme } = useTheme()
  useEffect(() => {
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme)
  }, [savedTheme, setTheme])
  return null
}
