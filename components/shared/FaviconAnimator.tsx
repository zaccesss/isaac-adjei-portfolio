"use client"

// Progressive enhancement for the browser-tab favicon. The static app/icon.svg (a blue
// "ia." tile) is the base and renders everywhere. Where a browser reliably repaints a
// swapped favicon (Chrome, Firefox) and the visitor has not asked for reduced motion,
// this upgrades the tab icon to a canvas whose status dot gently breathes, matching the
// header signature. Safari keeps the crisp static SVG (its favicon repainting is
// unreliable and a static canvas frame would look worse than the vector).

import { useEffect } from "react"

// The tile is the foreground colour (never a blue field, to avoid the Discord/LinkedIn
// look); blue lives only in the accent dot. Values mirror app/icon.svg.
const TILE_LIGHT = "#05070D"
const TILE_DARK = "#FAFAFA"
const DOT_LIGHT = "#5778DB"
const DOT_DARK = "#2445A8"

export default function FaviconAnimator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ua = navigator.userAgent
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
    if (isSafari) return

    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Our own icon link, layered after Next's static one so the browser prefers it.
    // Removed on cleanup, which restores the static SVG.
    const link = document.createElement("link")
    link.rel = "icon"
    link.type = "image/png"
    document.head.appendChild(link)

    const darkMode = window.matchMedia("(prefers-color-scheme: dark)")

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath()
      c.moveTo(x + r, y)
      c.arcTo(x + w, y, x + w, y + h, r)
      c.arcTo(x + w, y + h, x, y + h, r)
      c.arcTo(x, y + h, x, y, r)
      c.arcTo(x, y, x + w, y, r)
      c.closePath()
    }

    let raf = 0
    let start = 0
    let last = 0

    function draw(t: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, 64, 64)

      // tile in the foreground colour (never a blue field)
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = darkMode.matches ? TILE_DARK : TILE_LIGHT
      roundRect(ctx, 5, 5, 54, 54, 13)
      ctx.fill()

      // knock the letters out so the tab background (the OS colour) shows through,
      // plus a clean hole where the i-dot sits so the blue tittle lands crisply
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "#000000"
      ctx.font = "800 31px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "alphabetic"
      ctx.fillText("ia", 26, 43)
      ctx.beginPath()
      ctx.arc(18, 21, 4.4, 0, Math.PI * 2)
      ctx.fill()

      // both accent dots blue, alternating out of phase: the i-dot lights while the
      // trailing dot dims and back, a gentle transmission ping between the two
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = darkMode.matches ? DOT_DARK : DOT_LIGHT
      const swing = 0.5 + 0.5 * Math.sin(t * Math.PI) // 0..1 over a 2s cycle
      ctx.globalAlpha = 0.3 + 0.7 * swing
      ctx.beginPath()
      ctx.arc(18, 21, 4.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.3 + 0.7 * (1 - swing)
      ctx.beginPath()
      ctx.arc(45, 40, 3.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      link.href = canvas.toDataURL("image/png")
    }

    // one loop, throttled to ~8fps: a breathing dot needs no more and it keeps the tab cheap
    function loop(now: number) {
      if (!start) start = now
      if (now - last > 120) {
        last = now
        draw((now - start) / 1000)
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(raf)
      link.remove()
    }
  }, [])

  return null
}
