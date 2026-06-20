"use client"

// Equaliser bars + sine wave SVG, embedded inside the LiveStatusCards Spotify section.
// No data fetching — driven entirely by props from the parent SSE stream.
import { useEffect, useRef } from "react"

const BAR_COUNT = 48
const BAR_H     = 72
const VH        = 110
const WAVE_Y    = 14
const BAR_TOP   = 28
const BAR_W     = 5
const GAP       = 3
const VBOX_W    = BAR_COUNT * (BAR_W + GAP) - GAP

interface Props {
  playing: boolean
  albumArt?: string | null
  energy?: number
  tempo?: number
}

export default function SpotifyBars({ playing, albumArt, energy = 0.4, tempo = 100 }: Props) {
  const barsRef    = useRef<SVGGElement>(null)
  const clipGRef   = useRef<SVGGElement>(null)
  const sineRef    = useRef<SVGPathElement>(null)
  const rafRef     = useRef(0)
  const phasesRef  = useRef(Array.from({ length: BAR_COUNT }, (_, i) => i * ((Math.PI * 2) / BAR_COUNT)))
  const sinPhRef   = useRef(0)
  const propsRef   = useRef({ playing, energy, tempo })
  const beatRef    = useRef({ lastBeat: 0, boost: 0 })

  useEffect(() => { propsRef.current = { playing, energy, tempo } }, [playing, energy, tempo])

  useEffect(() => {
    const tick = () => {
      const barsG    = barsRef.current
      const sinePath = sineRef.current
      if (!barsG) { rafRef.current = requestAnimationFrame(tick); return }

      const { playing: p, energy: e, tempo: t } = propsRef.current
      const speedMult = (t ?? 100) / 120

      // Beat pulse: fires at the song's BPM, decays between beats to create a thump effect
      const beat = beatRef.current
      if (p) {
        const now = performance.now()
        const beatInterval = 60000 / (t ?? 100)
        if (now - beat.lastBeat > beatInterval) {
          beat.lastBeat = now
          beat.boost = 1.0
        }
        beat.boost *= 0.88
      } else {
        beat.boost = 0
      }

      const maxH   = p ? Math.max(14, (e ?? 0.4) * BAR_H * 0.95 * (1 + beat.boost * 0.55)) : 5
      const minH   = p ? 3 : 1
      const barEls  = barsG.children
      const clipEls = clipGRef.current?.children

      for (let i = 0; i < BAR_COUNT; i++) {
        phasesRef.current[i] += 0.04 * speedMult * (1 + (i % 7) * 0.05)
        const osc = Math.abs(Math.sin(phasesRef.current[i]))
        const h   = minH + (maxH - minH) * osc
        const y   = (BAR_TOP + (BAR_H - h)).toFixed(1)
        const hs  = h.toFixed(1)
        const el  = barEls[i] as SVGRectElement | undefined
        if (el) {
          el.setAttribute("height", hs)
          el.setAttribute("y", y)
          el.setAttribute("opacity", p ? (0.5 + 0.5 * osc).toFixed(2) : (0.06 + 0.05 * osc).toFixed(2))
        }
        const cel = clipEls?.[i] as SVGRectElement | undefined
        if (cel) { cel.setAttribute("height", hs); cel.setAttribute("y", y) }
      }

      if (sinePath) {
        sinPhRef.current += 0.06 * speedMult
        const amplitude = p ? Math.max(8, (e ?? 0.4) * 22 * (1 + beat.boost * 0.4)) : 2
        const cycles    = Math.max(2.5, (t ?? 100) / 42)
        let d = `M 0 ${WAVE_Y}`
        for (let i = 1; i <= 200; i++) {
          const x = (i / 200) * VBOX_W
          const y = WAVE_Y + amplitude * Math.sin((i / 200) * Math.PI * 2 * cycles + sinPhRef.current)
          d += ` L ${x.toFixed(1)} ${y.toFixed(2)}`
        }
        sinePath.setAttribute("d", d)
        sinePath.setAttribute("stroke-width", p ? "2.5" : "1")
        sinePath.setAttribute("opacity", p ? (0.65 + 0.35 * (e ?? 0.4)).toFixed(2) : "0.12")
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <svg
      className="w-full block"
      height={VH}
      viewBox={`0 0 ${VBOX_W} ${VH}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sbBarGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="sbSineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="8%"   stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="92%"  stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <clipPath id="sbAlbumClip">
          <g ref={clipGRef}>
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <rect key={i} x={i * (BAR_W + GAP)} y={BAR_TOP + BAR_H - 2} width={BAR_W} height={2} rx={1} />
            ))}
          </g>
        </clipPath>
      </defs>

      <path
        ref={sineRef}
        stroke="url(#sbSineGrad)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={`M 0 ${WAVE_Y} L ${VBOX_W} ${WAVE_Y}`}
      />

      <g ref={barsRef} fill="url(#sbBarGrad)">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <rect key={i} x={i * (BAR_W + GAP)} y={BAR_TOP + BAR_H - 2} width={BAR_W} height={2} rx={1} />
        ))}
      </g>

      {albumArt && (
        <image
          href={albumArt}
          x={0} y={BAR_TOP}
          width={VBOX_W} height={BAR_H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#sbAlbumClip)"
          opacity={0.75}
        />
      )}
    </svg>
  )
}
