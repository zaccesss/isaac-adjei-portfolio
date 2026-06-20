"use client"

// PCBViewer - interactive 3D model at top, four photo/schematic panels below.
// The whole file is dynamically imported without SSR in LabContent.tsx.
import Image from "next/image"
import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Center } from "@react-three/drei"
import { X, CircuitBoard } from "lucide-react"
import * as THREE from "three"
import styles from "./PCBViewer.module.css"

// ---------------------------------------------------------------------------
// Lightbox (shared by assembled board + schematic cards)
// ---------------------------------------------------------------------------

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X className="h-7 w-7" />
      </button>
      <div
        className="relative max-h-[90vh] max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain max-h-[90vh] w-full rounded-md"
          priority
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3D model panel
// ---------------------------------------------------------------------------

function PCBModel({ wireframe }: { wireframe: boolean }) {
  const { scene } = useGLTF("/models/pcb.glb")

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => { ;(m as THREE.MeshStandardMaterial).wireframe = wireframe })
      }
    })
  }, [scene, wireframe])

  return <Center><primitive object={scene} /></Center>
}

type CamPos = [number, number, number]

function CameraView({ pos, trigger }: { pos: CamPos; trigger: number }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (trigger === 0) return
    camera.position.set(...pos)
    camera.lookAt(0, 0, 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = controls as any
    if (c?.target) { c.target.set(0, 0, 0); c?.update?.() }
  }, [trigger, pos, camera, controls])
  return null
}

const VIEW_PRESETS: { label: string; pos: CamPos }[] = [
  { label: "front",  pos: [0,   0.5,  6] },
  { label: "back",   pos: [0,   0.5, -6] },
  { label: "top",    pos: [0,   8,    0.01] },
  { label: "bottom", pos: [0,  -8,    0.01] },
  { label: "left",   pos: [-6,  0.5,  0] },
  { label: "right",  pos: [6,   0.5,  0] },
]

function PCB3DCard() {
  const [wireframe,  setWireframe]  = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [showGrid,   setShowGrid]   = useState(false)
  const [camView,    setCamView]    = useState<{ pos: CamPos; trigger: number }>({ pos: [0, 8, 0.01], trigger: 0 })

  const goTo = (pos: CamPos) => setCamView(v => ({ pos, trigger: v.trigger + 1 }))

  const toggleBtn = (active: boolean) =>
    `text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50"
    }`

  const presetBtn = "text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50 transition-colors"

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">3d model</p>
        <span className="text-[10px] font-mono text-muted-foreground/40">drag · scroll to zoom</span>
      </div>

      <div className="relative w-full aspect-video rounded-lg bg-black/20 overflow-hidden cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 8, 0.01], fov: 45 }} gl={{ antialias: true }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[8, 8, 4]}   intensity={1.4} castShadow />
          <directionalLight position={[-4, -4, -4]} intensity={0.3} />
          <pointLight        position={[0, 6, 0]}   intensity={0.6} />
          {showGrid && <gridHelper args={[20, 20, "#444", "#222"]} />}
          <Suspense fallback={null}>
            <PCBModel wireframe={wireframe} />
          </Suspense>
          <OrbitControls makeDefault enablePan={false} minDistance={0.5} maxDistance={30} autoRotate={autoRotate} autoRotateSpeed={0.6} />
          <CameraView pos={camView.pos} trigger={camView.trigger} />
        </Canvas>
      </div>

      {/* Angle presets */}
      <div className="flex gap-1 flex-wrap items-center">
        {VIEW_PRESETS.map(({ label, pos }) => (
          <button key={label} type="button" className={presetBtn} onClick={() => goTo(pos)}>{label}</button>
        ))}
        <button type="button" className={`${presetBtn} ml-auto`} onClick={() => goTo([0, 8, 0.01])}>reset</button>
      </div>

      {/* Proteus-style toggles */}
      <div className="flex gap-1 flex-wrap items-center border-t border-border/30 pt-2">
        <button type="button" className={toggleBtn(wireframe)}  onClick={() => setWireframe(v => !v)}>wireframe</button>
        <button type="button" className={toggleBtn(autoRotate)} onClick={() => setAutoRotate(v => !v)}>auto-rotate</button>
        <button type="button" className={toggleBtn(showGrid)}   onClick={() => setShowGrid(v => !v)}>grid</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CSS 3D flip card - copper layers (drag to orbit, scroll to zoom, presets)
// ---------------------------------------------------------------------------

interface Preset { label: string; rx: number; ry: number }
interface CardProps {
  title: string; front: string; back: string; frontLabel: string; backLabel: string
  presets: Preset[]; defaultRx?: number; defaultRy?: number
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
    down.current = true; last.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!down.current) return
    const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    tgt.current.rx = Math.max(-90, Math.min(90, tgt.current.rx - dy * 0.55))
    tgt.current.ry += dx * 0.75
    cur.current.rx = tgt.current.rx; cur.current.ry = tgt.current.ry
  }, [])

  const onPointerUp = useCallback(() => { down.current = false }, [])

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        <span ref={sideRef} className="text-[10px] font-mono text-muted-foreground/50">{frontLabel}</span>
      </div>
      <div
        ref={viewportRef}
        className={`relative w-full aspect-[3/2] cursor-grab active:cursor-grabbing rounded-lg bg-black/15 overflow-hidden ${styles.viewport}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        <div ref={groupRef} className="absolute inset-0 [transform-style:preserve-3d]">
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image src={front} alt={frontLabel} fill className="object-contain p-2 pointer-events-none" sizes="(max-width: 640px) 100vw, 50vw" draggable={false} />
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Image src={back} alt={backLabel} fill className="object-contain p-2 pointer-events-none" sizes="(max-width: 640px) 100vw, 50vw" draggable={false} />
          </div>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap items-center">
        {presets.map((p) => (
          <button key={p.label} type="button" onClick={() => { tgt.current.rx = p.rx; tgt.current.ry = p.ry }}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50 transition-colors">
            {p.label}
          </button>
        ))}
        <button type="button" onClick={() => { tgt.current.zoom = 1 }}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-muted-foreground/50 hover:text-foreground hover:border-primary/50 transition-colors ml-auto">
          1:1
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Real board flip card
// ---------------------------------------------------------------------------

function PCBFlipPhotoCard({ title, front, back, frontLabel, backLabel }: {
  title: string; front: string; back: string; frontLabel: string; backLabel: string
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        <span className="text-[10px] font-mono text-muted-foreground/50">{flipped ? backLabel : frontLabel}</span>
      </div>
      <div className="relative w-full aspect-[3/2] rounded-lg bg-black/15 overflow-hidden">
        <Image src={flipped ? back : front} alt={flipped ? backLabel : frontLabel} fill className="object-cover transition-opacity duration-200" sizes="(max-width: 640px) 100vw, 50vw" />
      </div>
      <div className="flex gap-1">
        {[{ label: frontLabel, state: false }, { label: backLabel, state: true }].map(({ label, state }) => (
          <button key={label} type="button" onClick={() => setFlipped(state)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              flipped === state
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground/70 hover:text-foreground hover:border-primary/50"
            }`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static photo card with lightbox on click
// ---------------------------------------------------------------------------

function PCBPhotoCard({ title, src, alt }: { title: string; src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-2 select-none">
        <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        <button
          type="button"
          className="relative w-full aspect-[3/2] rounded-lg bg-black/15 overflow-hidden group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setOpen(true)}
          aria-label={`View ${title} fullscreen`}
        >
          <Image src={src} alt={alt} fill className="object-cover sm:transition-transform sm:duration-300 sm:group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-end p-2">
            <span className="text-[10px] font-mono text-white/0 group-hover:text-white/60 transition-colors">click to expand</span>
          </div>
        </button>
      </div>

      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export default function PCBViewer() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-1.5">
        <CircuitBoard className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          audio amplifier PCB
        </p>
      </div>

      {/* Full-width interactive 3D model */}
      <PCB3DCard />

      {/* Row 1 - interactive panels: copper layers + real board front/back */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PCBCard
          title="copper layers"
          front="/images/lab/pcb-top.webp"
          back="/images/lab/pcb-bottom.webp"
          frontLabel="top layer"
          backLabel="bottom layer"
          defaultRx={0} defaultRy={0}
          presets={[
            { label: "top layer",    rx: 0,   ry:   0 },
            { label: "bottom layer", rx: 0,   ry: 180 },
            { label: "tilt",         rx: -25, ry:  15 },
          ]}
        />
        <PCBFlipPhotoCard
          title="real board"
          front="/images/lab/pcb-real-1.webp"
          back="/images/lab/pcb-real-3.webp"
          frontLabel="front"
          backLabel="back"
        />
      </div>

      {/* Row 2 - click-to-expand photos: assembled board + full schematic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PCBPhotoCard
          title="assembled board"
          src="/images/lab/pcb-real-2.webp"
          alt="assembled audio amplifier PCB"
        />
        <PCBPhotoCard
          title="full schematic"
          src="/images/projects/audio-amplifier/schematic.webp"
          alt="audio amplifier full circuit schematic"
        />
      </div>
    </div>
  )
}
