"use client"

// Thin wrapper around NextThemesProvider so I can use the shadcn/ui convention
// of importing ThemeProvider from my own components folder rather than next-themes directly.
// All the configuration props (attribute, defaultTheme, etc.) are passed through from app/layout.tsx.

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
