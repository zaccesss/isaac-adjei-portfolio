"use client"

// 4-face CSS 3D carousel - each PCB view is one face of a rotating cube.
// Face transforms (translateZ) are set via JS because depth = containerWidth/2,
// which is only known at runtime. All other DOM updates bypass React state
// to avoid 60 re-renders/second.
import Image from "next/image"
import { useCallback, useEffect, useRef } from "react"
import styles from "./PCBChip.module.css"

const VIEWS = [
  { src: "/images/lab/pcb-3d-top.png",   alt: "3D render - top view",          label: "3D top" },
  { src: "/images/lab/pcb-top.png",       alt: "schematic - top copper layer",   label: "top layer" },
  { src: "/images/lab/pcb-3d-bottom.png", alt: "3D render - bottom view",        label: "3D bottom" },
  { src: "/images/lab/pcb-bottom.png",    alt: "schematic - bottom copper layer", label: "bottom layer" },
]

export default function PCBChip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const groupRef     = useRef<HTMLDivElement>(null)
  const faceRefs     = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const labelRef     = useRef<HTMLSpanElement>(null)
  const rotRef       = useRef(0)
  const dragging     = useRef(false)
  const lastX        = useRef(0)
  const autoRef      = useRef<number>(0)

  const getDepth = useCallback(() => (containerRef.current?.offsetWidth ?? 400) / 2, [])

  const applyFaces = useCallback((depth: number) => {
    faceRefs.current.forEach((face, i) => {
      if (face) face.style.transform = `rotateY(${i * 90}deg) translateZ(${depth}px)`
    })
  }, [])

  // Negative auto-rotation reveals views in order: 3D top → top layer → 3D bottom → bottom layer
  const applyGroup = useCallback(() => {
    if (groupRef.current) groupRef.current.style.transform = `rotateY(${rotRef.current}deg)`
    if (labelRef.current) {
      const norm = ((-rotRef.current % 360) + 360) % 360
      labelRef.current.textContent = VIEWS[Math.round(norm / 90) % 4].label
    }
  }, [])

  const stopAuto = useCallback(() => cancelAnimationFrame(autoRef.current), [])

  const startAuto = useCallback(() => {
    const tick = () => {
      rotRef.current -= 0.28
      applyGroup()
      autoRef.current = requestAnimationFrame(tick)
    }
    autoRef.current = requestAnimationFrame(tick)
  }, [applyGroup])

  useEffect(() => {
    applyFaces(getDepth())
    startAuto()
    const ro = new ResizeObserver(() => applyFaces(getDepth()))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { cancelAnimationFrame(autoRef.current); ro.disconnect() }
  }, [startAuto, applyFaces, getDepth])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    stopAuto()
    dragging.current = true
    lastX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [stopAuto])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    rotRef.current += (e.clientX - lastX.current) * 0.9
    lastX.current = e.clientX
    applyGroup()
  }, [applyGroup])

  const onPointerUp = useCallback(() => { dragging.current = false; startAuto() }, [startAuto])

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          hardware
        </p>
        <span ref={labelRef} className="text-[10px] font-mono text-muted-foreground/50">3D top</span>
      </div>

      <div
        ref={containerRef}
        className={`relative h-[280px] cursor-grab active:cursor-grabbing ${styles.viewport}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div ref={groupRef} className="absolute inset-0 [transform-style:preserve-3d]">
          {VIEWS.map((view, i) => (
            <div
              key={i}
              ref={(el) => { faceRefs.current[i] = el }}
              className="absolute inset-0 [backface-visibility:hidden]"
            >
              <Image
                src={view.src}
                alt={view.alt}
                fill
                className="object-contain p-3 pointer-events-none"
                sizes="(max-width: 640px) 100vw, 800px"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
