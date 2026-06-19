"use client"

// SVG refs are updated directly in the rAF loop (not React state) to avoid 60 re-renders/second.
// dataRef holds the latest Spotify data so the animation closure always reads current values.
// Album art is an absolutely-positioned overlay div - cleaner than SVG foreignObject.
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface SpotifyData {
  playing: boolean
  track?: string
  artist?: string
  albumArt?: string | null
  url?: string
  audioFeatures?: { energy: number; tempo: number; valence: number; danceability: number } | null
  lastPlayed?: { track: string; artist: string; albumArt: string | null } | null
}

const BAR_COUNT = 40
const THUMB = 56
const H = 160

export default function SpotifyVisualiser() {
  const svgRef = useRef<SVGSVGElement>(null)
  const barsRef = useRef<SVGGElement>(null)
  const sineRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const animRef = useRef<number>(0)
  const dataRef = useRef<SpotifyData | null>(null)
  const phaseRef = useRef(0)
  const barPhasesRef = useRef(Array.from({ length: BAR_COUNT }, (_, i) => i * (Math.PI * 2 / BAR_COUNT)))

  const [info, setInfo] = useState<{
    track?: string; artist?: string; albumArt?: string | null; url?: string; playing: boolean
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/spotify")
        const d = await res.json() as SpotifyData
        dataRef.current = d
        const track = d.track ?? d.lastPlayed?.track
        const artist = d.artist ?? d.lastPlayed?.artist
        const albumArt = d.albumArt ?? d.lastPlayed?.albumArt
        setInfo({ track, artist, albumArt, url: d.url, playing: d.playing })
      } catch {}
    }
    load()
    const iv = setInterval(load, 10000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const tick = () => {
      const svg = svgRef.current
      const barsG = barsRef.current
      const sinePath = sineRef.current
      const glowCircle = glowRef.current
      if (!svg || !barsG || !sinePath) { animRef.current = requestAnimationFrame(tick); return }

      const d = dataRef.current
      const playing = d?.playing ?? false
      const energy = playing && d?.audioFeatures ? d.audioFeatures.energy : 0.08
      const tempo = playing && d?.audioFeatures ? d.audioFeatures.tempo : 72
      const speedMult = tempo / 120

      const W = svg.clientWidth || 400
      const cx = W / 2
      const cy = H / 2
      const innerR = THUMB / 2 + 8
      const outerR = Math.min(cx, cy) - 4

      phaseRef.current += 0.03 * speedMult

      // Radial bars radiating outward from the album art circle
      const barEls = barsG.children
      for (let i = 0; i < BAR_COUNT; i++) {
        barPhasesRef.current[i] += 0.035 * speedMult * (1 + (i % 4) * 0.1)
        const base = 0.25 + 0.75 * Math.abs(Math.sin(barPhasesRef.current[i]))
        const barLen = Math.max(2, energy * (outerR - innerR) * base)
        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2
        const x1 = cx + Math.cos(angle) * innerR
        const y1 = cy + Math.sin(angle) * innerR
        const x2 = cx + Math.cos(angle) * (innerR + barLen)
        const y2 = cy + Math.sin(angle) * (innerR + barLen)
        const el = barEls[i] as SVGLineElement | undefined
        if (el) {
          el.setAttribute("x1", x1.toFixed(1))
          el.setAttribute("y1", y1.toFixed(1))
          el.setAttribute("x2", x2.toFixed(1))
          el.setAttribute("y2", y2.toFixed(1))
          el.setAttribute("opacity", (playing ? 0.5 + 0.5 * base : 0.12).toFixed(2))
        }
      }

      // Sine wave flowing across the bottom of the visualiser
      const waveY = cy + outerR * 0.62
      const amplitude = energy * 16
      const cycles = Math.max(2, tempo / 42)
      let pathD = `M 0 ${waveY.toFixed(1)}`
      for (let i = 1; i <= 80; i++) {
        const x = (i / 80) * W
        const y = waveY + amplitude * Math.sin((i / 80) * Math.PI * 2 * cycles + phaseRef.current)
        pathD += ` L ${x.toFixed(1)} ${y.toFixed(2)}`
      }
      sinePath.setAttribute("d", pathD)
      sinePath.setAttribute("opacity", playing ? "0.45" : "0.1")

      // Glow pulse around the album art
      if (glowCircle) {
        glowCircle.setAttribute("cx", cx.toFixed(1))
        glowCircle.setAttribute("cy", cy.toFixed(1))
        const glowR = innerR + energy * 14 * (0.8 + 0.2 * Math.sin(phaseRef.current * 2))
        glowCircle.setAttribute("r", glowR.toFixed(1))
        glowCircle.setAttribute("opacity", playing ? (0.25 + energy * 0.35).toFixed(2) : "0.04")
      }

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const albumArt = info?.albumArt

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden select-none relative">
      {/* Blurred album art as card background */}
      {albumArt && (
        <div className="absolute inset-0 opacity-[0.18]" aria-hidden="true">
          <Image src={albumArt} alt="" fill className="object-cover blur-2xl scale-110" sizes="800px" />
        </div>
      )}

      <div className="relative p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            now playing
          </p>
          <span className="text-[10px] font-mono text-muted-foreground/40">spotify</span>
        </div>

        {/* Visualiser: SVG radial bars + sine wave, album art div centred on top */}
        <div className="relative w-full h-[160px]">
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full text-primary overflow-visible"
            height={H}
            aria-hidden="true"
          >
            <circle ref={glowRef} cx="50%" cy="50%" r={THUMB / 2 + 8} fill="currentColor" opacity={0.04} />
            <g ref={barsRef} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <line key={i} x1={0} y1={0} x2={0} y2={0} />
              ))}
            </g>
            <path
              ref={sineRef}
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              d={`M 0 ${H * 0.81} L 400 ${H * 0.81}`}
            />
          </svg>

          {/* Album art centred over the SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[56px] h-[56px] rounded-full overflow-hidden border-2 border-primary/30 bg-card shrink-0"
            >
              {albumArt ? (
                <img src={albumArt} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/30 text-lg">
                  {info?.playing ? "▶" : "◼"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary font-mono text-xs shrink-0">{info?.playing ? "▶" : "◼"}</span>
          {info?.track ? (
            info.url ? (
              <a
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {info.track}
                {info.artist ? <span className="text-muted-foreground/50"> - {info.artist}</span> : null}
              </a>
            ) : (
              <span className="text-xs font-mono text-muted-foreground truncate">
                {info.track}
                {info.artist ? <span className="text-muted-foreground/50"> - {info.artist}</span> : null}
              </span>
            )
          ) : (
            <span className="text-xs font-mono text-muted-foreground/40">nothing playing right now</span>
          )}
        </div>
      </div>
    </div>
  )
}
