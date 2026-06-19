"use client"

// Two-panel PCB viewer: drag to orbit, scroll to zoom, preset angle buttons.
// All transforms are applied via DOM refs in the rAF loop - no React state for
// animation values, no inline style props in JSX.
// The card uses two faces (front + back) with backface-visibility:hidden so
// rotating past 90deg on Y reveals the opposite side of the board.
import Image from "next/image"
import { useCallback, useEffect, useRef } from "react"
import styles from "./PCBViewer.module.css"

interface Preset { label: string; rx: number; ry: number }

interface CardProps {
  title: string
  front: string
  back: string
  frontLabel: string
  backLabel: string
  presets: Preset[]
  defaultRx?: number
  defaultRy?: number
}

function PCBCard({ title, front, back, frontLabel, backLabel, presets, defaultRx = 0, defaultRy = 0 }: CardProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const groupRef    = useRef<HTMLDivElement>(null)
  const sideRef     = useRef<HTMLSpanElement>(null)

  const cur   = useRef({ rx: defaultRx, ry: defaultRy, zoom: 1 })
  const tgt   = useRef({ rx: defaultRx, ry: defaultRy, zoom: 1 })
  const down  = useRef(false)
  const last  = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)

  const commit = useCallback(() => {
    const el = groupRef.current
    if (!el) return
    const { rx, ry, zoom } = cur.current
    el.style.transform = `scale(${zoom.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    if (sideRef.current) {
      const normY = ((ry % 360) + 360) % 360
      sideRef.current.textContent = (normY > 90 && normY < 270) ? backLabel : frontLabel
    }
  }, [frontLabel, backLabel])

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      cur.current.rx   = lerp(cur.current.rx,   tgt.current.rx,   0.1)
      cur.current.ry   = lerp(cur.current.ry,   tgt.current.ry,   0.1)
      cur.current.zoom = lerp(cur.current.zoom, tgt.current.zoom, 0.1)
      commit()
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [commit])

  // Wheel zoom needs passive:false so preventDefault works
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      tgt.current.zoom = Math.max(0.5, Math.min(3, tgt.current.zoom - e.deltaY * 0.001))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    down.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!down.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    tgt.current.rx = Math.max(-90, Math.min(90, tgt.current.rx - dy * 0.55))
    tgt.current.ry += dx * 0.75
    // apply immediately while dragging so there is no lerp lag
    cur.current.rx = tgt.current.rx
    cur.current.ry = tgt.current.ry
  }, [])

  const onPointerUp = useCallback(() => { down.current = false }, [])

  const snap = useCallback((rx: number, ry: number) => {
    tgt.current.rx = rx
    tgt.current.ry = ry
  }, [])

  const resetZoom = useCallback(() => { tgt.current.zoom = 1 }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        <span ref={sideRef} className="text-[10px] font-mono text-muted-foreground/50">
          {frontLabel}
        </span>
      </div>

      <div
        ref={viewportRef}
        className={`relative w-full aspect-[3/2] cursor-grab active:cursor-grabbing rounded-lg bg-black/15 overflow-hidden ${styles.viewport}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div ref={groupRef} className="absolute inset-0 [transform-style:preserve-3d]">
          {/* Front face */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image
              src={front}
              alt={frontLabel}
              fill
              className="object-contain p-2 pointer-events-none"
              sizes="(max-width: 640px) 100vw, 50vw"
              draggable={false}
            />
          </div>
          {/* Back face - rotated 180deg on Y so it shows when the card is flipped */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Image
              src={back}
              alt={backLabel}
              fill
              className="object-contain p-2 pointer-events-none"
              sizes="(max-width: 640px) 100vw, 50vw"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Preset angle buttons */}
      <div className="flex gap-1 flex-wrap items-center">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => snap(p.rx, p.ry)}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50 transition-colors"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={resetZoom}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/50 hover:text-foreground hover:border-primary/50 transition-colors ml-auto"
        >
          1:1
        </button>
      </div>
    </div>
  )
}

export default function PCBViewer() {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          audio amplifier PCB
        </p>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PCBCard
        title="3D view"
        front="/images/lab/pcb-3d-top.png"
        back="/images/lab/pcb-3d-bottom.png"
        frontLabel="top"
        backLabel="bottom"
        defaultRx={-28}
        defaultRy={25}
        presets={[
          { label: "iso",    rx: -28, ry:   25 },
          { label: "top",    rx: -90, ry:    0 },
          { label: "front",  rx:   0, ry:    0 },
          { label: "right",  rx:   0, ry:  -90 },
          { label: "left",   rx:   0, ry:   90 },
          { label: "flip",   rx:   0, ry:  180 },
          { label: "bottom", rx:  90, ry:    0 },
        ]}
      />
      <PCBCard
        title="copper layers"
        front="/images/lab/pcb-top.png"
        back="/images/lab/pcb-bottom.png"
        frontLabel="top layer"
        backLabel="bottom layer"
        defaultRx={0}
        defaultRy={0}
        presets={[
          { label: "top layer",    rx: 0, ry:   0 },
          { label: "bottom layer", rx: 0, ry: 180 },
          { label: "tilt",         rx: -25, ry: 15 },
        ]}
      />
    </div>
    </div>
  )
}
