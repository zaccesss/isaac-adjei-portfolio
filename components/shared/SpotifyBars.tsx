"use client"

// Album-art-driven ambient visualiser. There is no real audio signal in the browser and
// Spotify deprecated audio-features/analysis (Nov 2024), so this does not pretend to react
// to the sound. Instead it extracts the album's dominant colours and renders soft drifting
// glow blooms behind organic equaliser bars. It uses a canvas (not SVG) so it can size to
// the device pixel ratio and stay crisp + identically proportioned on every screen, and it
// animates on delta-time so motion speed is the same regardless of refresh rate.
import { useEffect, useRef } from "react"
import { useAlbumColours } from "./useAlbumColours"

interface Props {
  playing: boolean
  albumArt?: string | null
}

const HEIGHT = 110
const BAR_W = 5
const GAP = 3
const BAR_TOP = 28
const BAR_AREA_H = HEIGHT - BAR_TOP - 4

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export default function SpotifyBars({ playing, albumArt }: Props) {
  const colours = useAlbumColours(albumArt)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  const rgbRef = useRef<{ primary: RGB; secondary: RGB; accent: RGB } | null>(null)
  const themeRef = useRef<RGB>([99, 102, 241])
  const rafRef = useRef(0)
  const phasesRef = useRef<number[]>([])
  const tPrevRef = useRef(0)
  const intensityRef = useRef(0)
  const driftRef = useRef(0)
  const isDarkRef = useRef(true)

  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => {
    rgbRef.current = colours
      ? { primary: hexToRgb(colours.primary), secondary: hexToRgb(colours.secondary), accent: hexToRgb(colours.accent) }
      : null
  }, [colours])

  // Track light/dark (via the resolved --background lightness, so it works whatever the theme
  // toggle mechanism is) and re-check on toggle. Drives blend mode + bar tint below so colours
  // read well in both modes - additive glow on dark would otherwise wash out on a light card.
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

    // Resolve the theme --primary once for the no-album fallback (rare on /now)
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

      // Ease overall intensity so play/pause is a smooth fade, not a jump
      intensityRef.current += ((playingRef.current ? 1 : 0) - intensityRef.current) * Math.min(1, dt * 3)
      const intensity = intensityRef.current
      driftRef.current += dt * 0.06

      const rgb = rgbRef.current
      const c1 = rgb?.primary ?? themeRef.current
      const c2 = rgb?.secondary ?? themeRef.current
      const c3 = rgb?.accent ?? c1

      ctx.clearRect(0, 0, width, HEIGHT)

      const isDark = isDarkRef.current

      // Ambient glow. Additive blending reads beautifully on a dark card but washes out to
      // white on a light one, so on light I switch to normal alpha blending at higher strength.
      if (intensity > 0.02) {
        ctx.globalCompositeOperation = isDark ? "lighter" : "source-over"
        const glowA = (isDark ? 0.16 : 0.24) * intensity
        const blooms: { col: RGB; fx: number; fy: number }[] = [
          { col: c1, fx: 0.30 + 0.18 * Math.sin(driftRef.current), fy: 0.72 },
          { col: c2, fx: 0.70 + 0.18 * Math.sin(driftRef.current * 0.8 + 2), fy: 0.55 },
          { col: c3, fx: 0.50 + 0.22 * Math.sin(driftRef.current * 0.6 + 4), fy: 0.82 },
        ]
        for (const b of blooms) {
          const cx = b.fx * width, cy = b.fy * HEIGHT
          const rad = Math.max(width * 0.28, 90)
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
          grd.addColorStop(0, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${glowA})`)
          grd.addColorStop(1, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`)
          ctx.fillStyle = grd
          ctx.fillRect(0, 0, width, HEIGHT)
        }
        ctx.globalCompositeOperation = "source-over"
      }

      // One shared vertical gradient for all bars (each bar samples the slice over its own
      // height). On dark: deepen base, brighten tip toward white. On light: keep the album
      // colour saturated and DEEPEN the tip with higher alpha so bars read against a white card.
      const tip: RGB = isDark
        ? [Math.min(255, c3[0] + 55), Math.min(255, c3[1] + 55), Math.min(255, c3[2] + 55)]
        : [Math.round(c3[0] * 0.72), Math.round(c3[1] * 0.72), Math.round(c3[2] * 0.72)]
      const baseA = (isDark ? 0.35 : 0.55) + 0.2 * intensity
      const tipA = (isDark ? 0.25 : 0.55) + (isDark ? 0.65 : 0.4) * intensity
      const barGrad = ctx.createLinearGradient(0, BAR_TOP + BAR_AREA_H, 0, BAR_TOP)
      barGrad.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},${baseA})`)
      barGrad.addColorStop(1, `rgba(${tip[0]},${tip[1]},${tip[2]},${tipA})`)
      ctx.fillStyle = barGrad

      const barCount = Math.max(12, Math.floor((width + GAP) / (BAR_W + GAP)))
      const phases = phasesRef.current
      while (phases.length < barCount) phases.push((phases.length * 0.6) % (Math.PI * 2))

      for (let i = 0; i < barCount; i++) {
        // Layered sines = natural, non-mechanical motion; a touch of per-bar speed variety
        phases[i] += dt * (1.1 + (i % 5) * 0.13) * (0.25 + 0.75 * intensity)
        const ph = phases[i]
        const osc = Math.sin(ph) * 0.55 + Math.sin(ph * 0.37 + i * 0.5) * 0.3 + Math.sin(ph * 1.7) * 0.15
        const norm = (osc + 1) / 2
        const h = Math.max(2, (3 + norm * (BAR_AREA_H - 6)) * (0.12 + 0.88 * intensity))
        const x = i * (BAR_W + GAP)
        const y = BAR_TOP + (BAR_AREA_H - h)
        const rr = Math.min(BAR_W / 2, h / 2)
        ctx.beginPath()
        ctx.moveTo(x, y + rr)
        ctx.arcTo(x, y, x + rr, y, rr)
        ctx.arcTo(x + BAR_W, y, x + BAR_W, y + rr, rr)
        ctx.lineTo(x + BAR_W, y + h)
        ctx.lineTo(x, y + h)
        ctx.closePath()
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="w-full block h-[110px]" aria-hidden="true" />
}
