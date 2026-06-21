"use client"

import { useEffect, useState } from "react"

export interface AlbumColours {
  primary: string // most dominant vibrant colour
  secondary: string // second
  accent: string // a third for glow variety
}

// Pulls a few representative colours from an album-art URL by drawing a tiny downscaled
// copy to an offscreen canvas and counting quantised pixel buckets, weighting saturated
// mid-bright pixels so the cover's real colours beat background greys. Returns null if the
// image cannot be read (CORS or load failure) so callers fall back to the theme colour.
// Spotify art on i.scdn.co serves permissive CORS headers, so crossOrigin works.
export function useAlbumColours(src?: string | null): AlbumColours | null {
  const [colours, setColours] = useState<AlbumColours | null>(null)

  useEffect(() => {
    // No src: leave the last colours in place (the visualiser fades out when not playing
    // anyway). Avoids a synchronous setState in the effect body.
    if (!src) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const S = 24
        const canvas = document.createElement("canvas")
        canvas.width = S
        canvas.height = S
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) {
          if (!cancelled) setColours(null)
          return
        }
        ctx.drawImage(img, 0, 0, S, S)
        const { data } = ctx.getImageData(0, 0, S, S)

        const buckets = new Map<string, { r: number; g: number; b: number; w: number }>()
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
          if (a < 128) continue
          const max = Math.max(r, g, b), min = Math.min(r, g, b)
          const sat = max === 0 ? 0 : (max - min) / max
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          // Prefer saturated, mid-bright pixels; near-white/near-black contribute little
          const w = (0.2 + sat) * (lum > 0.12 && lum < 0.95 ? 1 : 0.2)
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`
          const cur = buckets.get(key)
          if (cur) { cur.r += r * w; cur.g += g * w; cur.b += b * w; cur.w += w }
          else buckets.set(key, { r: r * w, g: g * w, b: b * w, w })
        }

        const sorted = [...buckets.values()]
          .filter((x) => x.w > 0)
          .sort((a, b) => b.w - a.w)
          .map((x) => ({ r: Math.round(x.r / x.w), g: Math.round(x.g / x.w), b: Math.round(x.b / x.w) }))

        if (sorted.length === 0) {
          if (!cancelled) setColours(null)
          return
        }

        const toHex = (c: { r: number; g: number; b: number }) =>
          `#${[c.r, c.g, c.b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`

        if (!cancelled) {
          setColours({
            primary: toHex(sorted[0]),
            secondary: toHex(sorted[1] ?? sorted[0]),
            accent: toHex(sorted[2] ?? sorted[1] ?? sorted[0]),
          })
        }
      } catch {
        if (!cancelled) setColours(null)
      }
    }
    img.onerror = () => { if (!cancelled) setColours(null) }
    img.src = src

    return () => { cancelled = true }
  }, [src])

  return colours
}
