"use client"

// Bar heights, sine wave and opacity are all updated via SVG refs in the rAF loop.
// dataRef holds the latest Spotify data so the closure always reads fresh values.
import { useEffect, useRef, useState } from "react"
import { ExternalLink } from "lucide-react"

interface SpotifyData {
  playing: boolean
  paused?: boolean
  track?: string
  artist?: string
  albumArt?: string | null
  url?: string
  progressMs?: number
  durationMs?: number
  audioFeatures?: { energy: number; tempo: number; valence: number; danceability: number } | null
  lastPlayed?: { track: string; artist: string; albumArt: string | null } | null
}

const BAR_COUNT = 48
const BAR_H    = 96    // max bar height
const VH       = 140   // total SVG height
const WAVE_Y   = 18    // sine wave centre y (sits above bars)
const BAR_TOP  = 36    // bars start below the wave area
const BAR_W    = 5
const GAP      = 3
const VBOX_W   = BAR_COUNT * (BAR_W + GAP) - GAP  // 382

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, "0")}`
}

export default function SpotifyVisualiser() {
  const barsRef      = useRef<SVGGElement>(null)
  const clipGRef     = useRef<SVGGElement>(null)
  const sineRef      = useRef<SVGPathElement>(null)
  const animRef      = useRef<number>(0)
  const dataRef      = useRef<SpotifyData | null>(null)
  const barPhasesRef = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => i * ((Math.PI * 2) / BAR_COUNT))
  )
  const sinePhaseRef = useRef(0)

  const [info, setInfo] = useState<{
    track?: string; artist?: string; albumArt?: string | null
    url?: string; playing: boolean; paused?: boolean
    progressMs?: number; durationMs?: number
  } | null>(null)
  const [progressMs, setProgressMs] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/spotify")
        const d   = await res.json() as SpotifyData
        dataRef.current = d
        const hasTrack = d.playing || d.paused
        const track    = hasTrack ? d.track    : (d.lastPlayed?.track)
        const artist   = hasTrack ? d.artist   : (d.lastPlayed?.artist)
        const albumArt = hasTrack ? d.albumArt : (d.lastPlayed?.albumArt)
        setInfo({ track, artist, albumArt, url: d.url, playing: d.playing, paused: d.paused, progressMs: d.progressMs, durationMs: d.durationMs })
        if (d.progressMs != null) setProgressMs(d.progressMs)
      } catch {}
    }
    load()
    const iv = setInterval(load, 15_000)
    return () => clearInterval(iv)
  }, [])

  // Tick progress forward locally
  useEffect(() => {
    if (!info?.playing) return
    const id = setInterval(() => {
      setProgressMs((p) => Math.min(p + 1000, info.durationMs ?? p))
    }, 1000)
    return () => clearInterval(id)
  }, [info?.playing, info?.durationMs])

  // rAF animation loop
  useEffect(() => {
    const tick = () => {
      const barsG    = barsRef.current
      const sinePath = sineRef.current
      if (!barsG) { animRef.current = requestAnimationFrame(tick); return }

      const d         = dataRef.current
      const playing   = d?.playing ?? false
      const energy    = playing && d?.audioFeatures ? d.audioFeatures.energy : 0.04
      const tempo     = playing && d?.audioFeatures ? d.audioFeatures.tempo  : 68
      const speedMult = tempo / 120

      // Bars grow up from BAR_TOP baseline
      const maxH   = playing ? Math.max(16, energy * BAR_H * 0.95) : 6
      const minH   = playing ? 4 : 1
      const barEls = barsG.children
      const clipEls = clipGRef.current?.children

      for (let i = 0; i < BAR_COUNT; i++) {
        barPhasesRef.current[i] += 0.04 * speedMult * (1 + (i % 7) * 0.05)
        const osc = Math.abs(Math.sin(barPhasesRef.current[i]))
        const h   = minH + (maxH - minH) * osc
        const y   = (BAR_TOP + (BAR_H - h)).toFixed(1)
        const hs  = h.toFixed(1)
        const el  = barEls[i] as SVGRectElement | undefined
        if (el) {
          el.setAttribute("height",  hs)
          el.setAttribute("y",       y)
          el.setAttribute("opacity", playing ? (0.55 + 0.45 * osc).toFixed(2) : (0.08 + 0.06 * osc).toFixed(2))
        }
        const cel = clipEls?.[i] as SVGRectElement | undefined
        if (cel) {
          cel.setAttribute("height", hs)
          cel.setAttribute("y",      y)
        }
      }

      // Sine wave rides above the bars
      if (sinePath) {
        sinePhaseRef.current += 0.06 * speedMult
        const amplitude = playing ? Math.max(10, energy * 28) : 3
        const cycles    = Math.max(2.5, tempo / 42)
        let wavePath    = `M 0 ${WAVE_Y}`
        for (let i = 1; i <= 200; i++) {
          const x = (i / 200) * VBOX_W
          const y = WAVE_Y + amplitude * Math.sin((i / 200) * Math.PI * 2 * cycles + sinePhaseRef.current)
          wavePath += ` L ${x.toFixed(1)} ${y.toFixed(2)}`
        }
        sinePath.setAttribute("d",       wavePath)
        sinePath.setAttribute("stroke-width", playing ? "3" : "1.5")
        sinePath.setAttribute("opacity", playing ? (0.7 + 0.3 * energy).toFixed(2) : "0.18")
      }

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const albumArt = info?.albumArt
  const isPlaying = info?.playing
  const isPaused  = info?.paused
  const hasTrack  = isPlaying || isPaused
  const progress  = hasTrack && info?.durationMs ? progressMs / info.durationMs : 0
  const label     = isPlaying ? "live" : isPaused ? "paused" : "last played"

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden select-none relative">
      {/* Blurred album art background */}
      {albumArt && (
        <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
          <img src={albumArt} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
        </div>
      )}

      <div className="relative p-4 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${isPlaying ? "text-green-400" : "text-muted-foreground/60"}`}>
              {label}
            </span>
            {isPlaying && (
              <span className="flex gap-[2px] items-end h-3">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="w-[3px] rounded-t-[1px] bg-green-400 animate-[equaliser_0.8s_ease-in-out_infinite_alternate]"
                    style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/40">spotify</span>
            {info?.url && (
              <a href={info.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Track info row: spinning album art + track name + artist */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Spinning disc */}
          <div className={`relative w-14 h-14 rounded-full shrink-0 ${isPlaying ? "animate-spin [animation-duration:6s]" : ""}`}>
            {/* Disc ring */}
            <div className="absolute inset-0 rounded-full border-2 border-border/40" />
            {/* Centre hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              {albumArt ? (
                <img src={albumArt} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground/30 text-lg">♫</div>
              )}
            </div>
            {/* Centre spindle dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-card/80 border border-border/60" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            {info?.track ? (
              <p className="text-sm font-mono font-semibold text-foreground truncate leading-tight">{info.track}</p>
            ) : (
              <p className="text-xs font-mono text-muted-foreground/40">nothing playing</p>
            )}
            {info?.artist && (
              <p className="text-[11px] font-mono text-muted-foreground/70 truncate">{info.artist}</p>
            )}
          </div>

          <span className={`text-base font-mono shrink-0 ${isPlaying ? "text-green-400" : "text-muted-foreground/30"}`}>
            {isPlaying ? "▶" : isPaused ? "⏸" : "◼"}
          </span>
        </div>

        {/* Progress bar (only when track is active) */}
        {hasTrack && info?.durationMs && (
          <div className="space-y-1">
            <div className="h-[3px] w-full rounded-full bg-border/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isPlaying ? "bg-green-400" : "bg-muted-foreground/40"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50">
              <span>{fmtMs(progressMs)}</span>
              <span>{fmtMs(info.durationMs)}</span>
            </div>
          </div>
        )}

        {/* Visualiser: sine wave above bars, bars coloured by album art */}
        <svg
          className="w-full block"
          height={VH}
          viewBox={`0 0 ${VBOX_W} ${VH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Bars: soft primary gradient, album art overlaid via clip */}
            <linearGradient id="spotifyBarGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"  stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            </linearGradient>
            {/* Sine wave: bright fade at edges */}
            <linearGradient id="spotifySineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="8%"   stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="92%"  stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            {/* Album art clip - mirrors bar shapes */}
            <clipPath id="albumBarsClip">
              <g ref={clipGRef}>
                {Array.from({ length: BAR_COUNT }, (_, i) => (
                  <rect key={i} x={i * (BAR_W + GAP)} y={BAR_TOP + BAR_H - 2} width={BAR_W} height={2} rx={1} />
                ))}
              </g>
            </clipPath>
          </defs>

          {/* Sine wave — clearly above the bars */}
          <path
            ref={sineRef}
            stroke="url(#spotifySineGrad)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={`M 0 ${WAVE_Y} L ${VBOX_W} ${WAVE_Y}`}
          />

          {/* Gradient bars (base layer) */}
          <g ref={barsRef} fill="url(#spotifyBarGrad)">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <rect key={i} x={i * (BAR_W + GAP)} y={BAR_TOP + BAR_H - 2} width={BAR_W} height={2} rx={1} />
            ))}
          </g>

          {/* Album art sliced through bar shapes - album colours show through */}
          {albumArt && (
            <image
              href={albumArt}
              x={0} y={BAR_TOP}
              width={VBOX_W} height={BAR_H}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#albumBarsClip)"
              opacity={0.8}
            />
          )}
        </svg>
      </div>
    </div>
  )
}
