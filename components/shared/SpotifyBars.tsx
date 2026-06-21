"use client"

// Album-art-driven ambient visualiser. No real audio signal exists in the browser and
// Spotify deprecated audio-features/analysis (Nov 2024), so this does not react to sound -
// it extracts the album's dominant colours and renders a sine wave above a bouncy equaliser,
// both tinted from the cover. Drawn on a device-pixel-ratio canvas (crisp + identically
// proportioned on every screen) and animated on delta-time (same speed at any refresh rate).
//
// Two deliberate touches: the bars share one bright-base -> dark-tip gradient so a taller bar
// reaches into the dark zone and its peak goes darker (like a real meter); and the wave is
// synced to the bars - at each x it swings wider and darkens in step with the bar beneath it.
import { useEffect, useRef } from "react"
import { useAlbumColours } from "./useAlbumColours"

interface Props {
  playing: boolean
  albumArt?: string | null
}

const HEIGHT = 110
const WAVE_Y = 16
const BAR_TOP = 32
const BAR_BOTTOM = HEIGHT - 4
const BAR_AREA_H = BAR_BOTTOM - BAR_TOP
const BAR_W = 5
const GAP = 3

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const lighten = (c: RGB, a: number): RGB => [c[0] + (255 - c[0]) * a, c[1] + (255 - c[1]) * a, c[2] + (255 - c[2]) * a]
const darken = (c: RGB, a: number): RGB => [c[0] * (1 - a), c[1] * (1 - a), c[2] * (1 - a)]
const rgba = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`

export default function SpotifyBars({ playing, albumArt }: Props) {
  const colours = useAlbumColours(albumArt)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  const rgbRef = useRef<{ primary: RGB; secondary: RGB; accent: RGB } | null>(null)
  const themeRef = useRef<RGB>([99, 102, 241])
  const isDarkRef = useRef(true)
  const rafRef = useRef(0)
  const phasesRef = useRef<number[]>([])
  const tPrevRef = useRef(0)
  const intensityRef = useRef(0)
  const driftRef = useRef(0)

  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    rgbRef.current = colours
      ? { primary: hexToRgb(colours.primary), secondary: hexToRgb(colours.secondary), accent: hexToRgb(colours.accent) }
      : null
  }, [colours])

  // Track light/dark via the resolved --background lightness, re-checked on toggle
  useEffect(() => {
    const readIsDark = () => {
      try {
        const bg = getComputedStyle(document.documentElement).getPropertyValue("--background").trim()
        const l = parseFloat(bg.split(/\s+/)[2] ?? "100")
        isDarkRef.current = !Number.isNaN(l) && l < 50
      } catch { isDarkRef.current = false }
    }
    readIsDark()
    const mo = new MutationObserver(readIsDark)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Resolve theme --primary once for the no-album fallback
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
      if (v) {
        const probe = document.createElement("div")
        probe.style.color = `hsl(${v})`
        document.body.appendChild(probe)
        const m = getComputedStyle(probe).color.match(/\d+/g)
        document.body.removeChild(probe)
        if (m && m.length >= 3) themeRef.current = [Number(m[0]), Number(m[1]), Number(m[2])]
      }
    } catch {}

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    const resize = () => {
      width = canvas.clientWidth || 1
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(HEIGHT * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t: number) => {
      const dt = tPrevRef.current ? Math.min((t - tPrevRef.current) / 1000, 0.05) : 0.016
      tPrevRef.current = t
      intensityRef.current += ((playingRef.current ? 1 : 0) - intensityRef.current) * Math.min(1, dt * 3)
      const intensity = intensityRef.current
      driftRef.current += dt
      const isDark = isDarkRef.current

      const rgb = rgbRef.current
      const c1 = rgb?.primary ?? themeRef.current
      const c2 = rgb?.secondary ?? themeRef.current
      const c3 = rgb?.accent ?? c1

      ctx.clearRect(0, 0, width, HEIGHT)

      const barCount = Math.max(12, Math.floor((width + GAP) / (BAR_W + GAP)))
      const phases = phasesRef.current
      while (phases.length < barCount) phases.push((phases.length * 0.7) % (Math.PI * 2))

      // Bouncy, lively per-bar heights (abs-sine, varied speed per bar)
      const norms: number[] = new Array(barCount)
      for (let i = 0; i < barCount; i++) {
        phases[i] += dt * (2.3 + (i % 7) * 0.18) * (0.3 + 0.7 * intensity)
        const ph = phases[i]
        norms[i] = Math.abs(Math.sin(ph)) * 0.8 + Math.abs(Math.sin(ph * 0.5 + i)) * 0.2
      }

      // Ambient album-colour glow (additive on dark; normal alpha on light so it does not wash out)
      if (intensity > 0.02) {
        ctx.globalCompositeOperation = isDark ? "lighter" : "source-over"
        const glowA = (isDark ? 0.16 : 0.22) * intensity
        const blooms: { col: RGB; fx: number; fy: number }[] = [
          { col: c1, fx: 0.30 + 0.18 * Math.sin(driftRef.current * 0.6), fy: 0.72 },
          { col: c2, fx: 0.70 + 0.18 * Math.sin(driftRef.current * 0.5 + 2), fy: 0.6 },
          { col: c3, fx: 0.50 + 0.22 * Math.sin(driftRef.current * 0.4 + 4), fy: 0.82 },
        ]
        for (const b of blooms) {
          const cx = b.fx * width, cy = b.fy * HEIGHT
          const rad = Math.max(width * 0.28, 90)
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
          grd.addColorStop(0, rgba(b.col, glowA))
          grd.addColorStop(1, rgba(b.col, 0))
          ctx.fillStyle = grd
          ctx.fillRect(0, 0, width, HEIGHT)
        }
        ctx.globalCompositeOperation = "source-over"
      }

      // Bars: one shared gradient, bright album base at the bottom -> dark album tip at the top.
      // A taller bar reaches further up into the dark zone, so its peak naturally goes darker.
      const base = isDark ? lighten(c1, 0.12) : c1
      const tip = darken(c3, isDark ? 0.45 : 0.5)
      const barGrad = ctx.createLinearGradient(0, BAR_BOTTOM, 0, BAR_TOP)
      barGrad.addColorStop(0, rgba(base, 0.45 + 0.3 * intensity))
      barGrad.addColorStop(1, rgba(tip, 0.92))
      ctx.fillStyle = barGrad
      for (let i = 0; i < barCount; i++) {
        const h = Math.max(2, norms[i] * BAR_AREA_H * (0.15 + 0.85 * intensity))
        const x = i * (BAR_W + GAP)
        const y = BAR_BOTTOM - h
        const rr = Math.min(BAR_W / 2, h / 2)
        ctx.beginPath()
        ctx.moveTo(x, y + rr)
        ctx.arcTo(x, y, x + rr, y, rr)
        ctx.arcTo(x + BAR_W, y, x + BAR_W, y + rr, rr)
        ctx.lineTo(x + BAR_W, BAR_BOTTOM)
        ctx.lineTo(x, BAR_BOTTOM)
        ctx.closePath()
        ctx.fill()
      }

      // Sine wave above the bars, synced to them: at each x it swings wider and darkens in step
      // with the bar beneath, so a tall dark bar lifts and darkens that strip of the wave.
      const waveCol = isDark ? lighten(c3, 0.1) : c3
      const segs = Math.max(64, barCount)
      const freq = (Math.PI * 2 * 3) / width
      const phase = driftRef.current * 3.2
      ctx.lineWidth = 2.3
      ctx.lineCap = "round"
      const yAt = (x: number) => {
        const bi = Math.min(barCount - 1, Math.max(0, Math.floor(x / (BAR_W + GAP))))
        const bn = norms[bi]
        const amp = (2.5 + bn * 8) * (0.25 + 0.75 * intensity)
        return WAVE_Y + Math.sin(x * freq + phase) * amp - bn * 4 * intensity
      }
      for (let s = 0; s < segs; s++) {
        const x0 = (s / segs) * width
        const x1 = ((s + 1) / segs) * width
        const bi = Math.min(barCount - 1, Math.max(0, Math.floor(x0 / (BAR_W + GAP))))
        const bn = norms[bi]
        const wc = darken(waveCol, bn * 0.5) // darker where the bar is tall
        ctx.strokeStyle = rgba(wc, (isDark ? 0.5 : 0.6) + 0.35 * intensity)
        ctx.beginPath()
        ctx.moveTo(x0, yAt(x0))
        ctx.lineTo(x1, yAt(x1))
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="w-full block h-[110px]" aria-hidden="true" />
}
