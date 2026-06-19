"use client"

// Bar heights, sine wave, and opacity are all updated via SVG refs in the rAF loop.
// dataRef holds the latest Spotify data so the closure always reads fresh values.
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

const BAR_COUNT = 52
const BAR_H    = 72   // usable height for bars
const WAVE_Y   = 86   // sine wave centre y
const VH       = 96   // total SVG height
const BAR_W    = 4
const GAP      = 2
const VBOX_W   = BAR_COUNT * (BAR_W + GAP) - GAP  // 364

export default function SpotifyVisualiser() {
  const barsRef      = useRef<SVGGElement>(null)
  const sineRef      = useRef<SVGPathElement>(null)
  const animRef      = useRef<number>(0)
  const dataRef      = useRef<SpotifyData | null>(null)
  const barPhasesRef = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => i * ((Math.PI * 2) / BAR_COUNT))
  )
  const sinePhaseRef = useRef(0)

  const [info, setInfo] = useState<{
    track?: string; artist?: string; albumArt?: string | null; url?: string; playing: boolean
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/spotify")
        const d   = await res.json() as SpotifyData
        dataRef.current = d
        const track    = d.track    ?? d.lastPlayed?.track
        const artist   = d.artist   ?? d.lastPlayed?.artist
        const albumArt = d.albumArt ?? d.lastPlayed?.albumArt
        setInfo({ track, artist, albumArt, url: d.url, playing: d.playing })
      } catch {}
    }
    load()
    const iv = setInterval(load, 10_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const tick = () => {
      const barsG    = barsRef.current
      const sinePath = sineRef.current
      if (!barsG) { animRef.current = requestAnimationFrame(tick); return }

      const d         = dataRef.current
      const playing   = d?.playing ?? false
      const energy    = playing && d?.audioFeatures ? d.audioFeatures.energy : 0.05
      const tempo     = playing && d?.audioFeatures ? d.audioFeatures.tempo  : 72
      const speedMult = tempo / 120

      // Bars
      const maxH   = playing ? Math.max(10, energy * BAR_H * 0.92) : 8
      const minH   = playing ? 3 : 1
      const barEls = barsG.children

      for (let i = 0; i < BAR_COUNT; i++) {
        barPhasesRef.current[i] += 0.045 * speedMult * (1 + (i % 5) * 0.06)
        const osc = Math.abs(Math.sin(barPhasesRef.current[i]))
        const h   = minH + (maxH - minH) * osc
        const el  = barEls[i] as SVGRectElement | undefined
        if (el) {
          el.setAttribute("height",  h.toFixed(1))
          el.setAttribute("y",       (BAR_H - h).toFixed(1))
          el.setAttribute("opacity", playing
            ? (0.4 + 0.6 * osc).toFixed(2)
            : (0.07 + 0.1 * osc).toFixed(2))
        }
      }

      // Sine wave below bars
      if (sinePath) {
        sinePhaseRef.current += 0.05 * speedMult
        const amplitude = playing ? energy * 9 : 2
        const cycles    = Math.max(2, tempo / 45)
        let wavePath    = `M 0 ${WAVE_Y}`
        for (let i = 1; i <= 120; i++) {
          const x = (i / 120) * VBOX_W
          const y = WAVE_Y + amplitude * Math.sin((i / 120) * Math.PI * 2 * cycles + sinePhaseRef.current)
          wavePath += ` L ${x.toFixed(1)} ${y.toFixed(2)}`
        }
        sinePath.setAttribute("d",       wavePath)
        // Higher energy = darker / more opaque sine wave
        sinePath.setAttribute("opacity", playing ? (0.2 + 0.75 * energy).toFixed(2) : "0.08")
      }

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const albumArt = info?.albumArt

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden select-none relative">
      {albumArt && (
        <div className="absolute inset-0 opacity-[0.15]" aria-hidden="true">
          <Image src={albumArt} alt="" fill className="object-cover blur-2xl scale-110" sizes="800px" />
        </div>
      )}

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            now playing
          </p>
          <span className="text-[10px] font-mono text-muted-foreground/40">spotify</span>
        </div>

        {/* Album art (spins when playing) + track info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-full overflow-hidden border border-primary/25 bg-card/60 shrink-0 ${info?.playing ? "animate-spin [animation-duration:6s]" : ""}`}
          >
            {albumArt ? (
              <img src={albumArt} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/25 text-base">◼</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {info?.track ? (
              info.url ? (
                <a
                  href={info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors block truncate"
                >
                  {info.track}
                </a>
              ) : (
                <span className="text-xs font-mono text-muted-foreground block truncate">{info.track}</span>
              )
            ) : (
              <span className="text-xs font-mono text-muted-foreground/40">nothing playing right now</span>
            )}
            {info?.artist && (
              <span className="text-[10px] font-mono text-muted-foreground/50 block truncate">{info.artist}</span>
            )}
          </div>
          <span className="text-primary font-mono text-xs shrink-0">{info?.playing ? "▶" : "◼"}</span>
        </div>

        {/* Equaliser bars + sine wave */}
        <svg
          className="w-full block"
          height={VH}
          viewBox={`0 0 ${VBOX_W} ${VH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/*
              Bar gradient: light violet at base → dark indigo at peak.
              Tall bars (high energy) show the dark tip; short bars look pale - energy reads as darkness.
            */}
            <linearGradient id="spotifyBarGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"   stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            {/* Sine wave: dark indigo, fades to transparent at both edges */}
            <linearGradient id="spotifySineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#3730a3" stopOpacity="0" />
              <stop offset="15%"  stopColor="#3730a3" stopOpacity="1" />
              <stop offset="85%"  stopColor="#3730a3" stopOpacity="1" />
              <stop offset="100%" stopColor="#3730a3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bars growing upward from baseline */}
          <g ref={barsRef} fill="url(#spotifyBarGrad)">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <rect
                key={i}
                x={i * (BAR_W + GAP)}
                y={BAR_H - 2}
                width={BAR_W}
                height={2}
                rx={1}
              />
            ))}
          </g>

          {/* Animated sine wave below bars */}
          <path
            ref={sineRef}
            stroke="url(#spotifySineGrad)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={`M 0 ${WAVE_Y} L ${VBOX_W} ${WAVE_Y}`}
          />
        </svg>
      </div>
    </div>
  )
}
