"use client"

// Bar heights and positions are updated directly via SVG refs in the rAF loop.
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
const VH = 72       // SVG height
const BAR_W = 4
const GAP = 2
const VBOX_W = BAR_COUNT * (BAR_W + GAP) - GAP  // 364

export default function SpotifyVisualiser() {
  const barsRef = useRef<SVGGElement>(null)
  const animRef = useRef<number>(0)
  const dataRef = useRef<SpotifyData | null>(null)
  const phaseRef = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => i * ((Math.PI * 2) / BAR_COUNT))
  )

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
    const iv = setInterval(load, 10_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const tick = () => {
      const barsG = barsRef.current
      if (!barsG) { animRef.current = requestAnimationFrame(tick); return }

      const d = dataRef.current
      const playing = d?.playing ?? false
      const energy  = playing && d?.audioFeatures ? d.audioFeatures.energy  : 0.05
      const tempo   = playing && d?.audioFeatures ? d.audioFeatures.tempo   : 72
      const speedMult = tempo / 120

      const maxH  = playing ? Math.max(10, energy * VH * 0.92) : 8
      const minH  = playing ? 3 : 1
      const barEls = barsG.children

      for (let i = 0; i < BAR_COUNT; i++) {
        // Each bar oscillates at a slightly different rate so they don't move in sync
        phaseRef.current[i] += 0.045 * speedMult * (1 + (i % 5) * 0.06)
        const osc = Math.abs(Math.sin(phaseRef.current[i]))
        const h   = minH + (maxH - minH) * osc
        const y   = VH - h
        const el  = barEls[i] as SVGRectElement | undefined
        if (el) {
          el.setAttribute("height", h.toFixed(1))
          el.setAttribute("y",      y.toFixed(1))
          el.setAttribute(
            "opacity",
            playing
              ? (0.35 + 0.65 * osc).toFixed(2)
              : (0.06 + 0.1  * osc).toFixed(2),
          )
        }
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

        {/* Album art + track info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-primary/25 bg-card/60 shrink-0">
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

        {/* Equaliser bars */}
        <svg
          className="w-full text-primary block"
          height={VH}
          viewBox={`0 0 ${VBOX_W} ${VH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g ref={barsRef} fill="currentColor">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <rect
                key={i}
                x={i * (BAR_W + GAP)}
                y={VH - 2}
                width={BAR_W}
                height={2}
                rx={1}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
