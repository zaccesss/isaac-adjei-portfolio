"use client"

// A count-only public map of application locations for /stats/applications - one pin per city
// scaled by count, hover shows a location and a count, nothing else. No click-through detail
// popup and no per-application data at all, since the API this reads from
// (/api/stats/applications-locations) never returns company, status, role or date in the first
// place - there is nothing more specific to show even if I wanted to.
//
// OpenFreeMap only, deliberately not MapTiler. This page is public and could see real,
// unpredictable traffic if shared - MapTiler's 100k-loads/month key is shared with the private
// dashboard map, so a spike here could exhaust that quota and take the dashboard's own map down
// with it. OpenFreeMap has no key and nothing to run out, so it is the safer default for anything
// public-facing; MapTiler stays reserved for the private dashboard.
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import { setWorkerUrl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// Same Turbopack worker-drop fix as the dashboard's ApplicationsMap - see that component for the
// full explanation. setWorkerUrl is idempotent to call twice if both components ever mount in the
// same session, so no extra guard is needed here.
setWorkerUrl("/maplibre-gl-worker.mjs")

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
}

interface LocationPoint {
  location: string
  lat: number
  lng: number
  count: number
}

export function PublicApplicationsMap() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [points, setPoints] = useState<LocationPoint[] | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    fetch("/api/stats/applications-locations")
      .then((r) => (r.ok ? r.json() : { total: 0, points: [] }))
      .then((d) => { setPoints(d.points ?? []); setTotal(d.total ?? 0) })
      .catch(() => { setPoints([]); setTotal(0) })
  }, [])

  const style = resolvedTheme === "dark" ? STYLES.dark : STYLES.light

  const maxCount = useMemo(() => Math.max(1, ...(points ?? []).map((p) => p.count)), [points])
  // Square-root scale, matching every other size-by-value chart on this site - a handful of
  // dominant cities (London especially) would otherwise swallow the whole map on a linear scale.
  const radius = (count: number) => 6 + Math.sqrt(count / maxCount) * 18

  const totalHeadline = (
    <p className="text-sm text-muted-foreground">
      {total === null ? (
        <span className="inline-block h-4 w-24 bg-muted/60 rounded animate-pulse align-middle" />
      ) : (
        <><span className="font-semibold text-foreground">{total.toLocaleString()}</span> applications sent, all time</>
      )}
    </p>
  )

  if (points === null || !mounted) {
    return (
      <div className="space-y-3">
        {totalHeadline}
        <div className="h-[480px] w-full rounded-lg border border-border bg-muted/30 animate-pulse" />
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="space-y-3">
        {totalHeadline}
        <p className="text-xs text-muted-foreground py-12 text-center">No location data yet.</p>
      </div>
    )
  }

  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
  const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length
  const hoveredPoint = points.find((p) => p.location === hovered) ?? null

  return (
    <div className="space-y-3">
      {totalHeadline}
      <div className="h-[480px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 3 }}
          mapStyle={style}
          style={{ width: "100%", height: "100%" }}
          renderWorldCopies={false}
          dragPan
          dragRotate={false}
          scrollZoom
          doubleClickZoom
          touchZoomRotate
          keyboard
        >
          <NavigationControl position="top-right" showCompass={false} showZoom />
          {points.map((p) => (
            <Marker key={p.location} latitude={p.lat} longitude={p.lng}>
              <div
                className="rounded-full bg-primary/70 border border-primary-foreground/40 cursor-default transition-transform hover:scale-110"
                style={{ width: radius(p.count) * 2, height: radius(p.count) * 2 }}
                onMouseEnter={() => setHovered(p.location)}
                onMouseLeave={() => setHovered((h) => (h === p.location ? null : h))}
              />
            </Marker>
          ))}
          {hoveredPoint && (
            <Popup
              latitude={hoveredPoint.lat}
              longitude={hoveredPoint.lng}
              closeButton={false}
              closeOnClick={false}
              offset={12}
            >
              <div className="text-xs text-black">
                <p className="font-semibold">{hoveredPoint.location}</p>
                <p className="text-muted-foreground">{hoveredPoint.count} application{hoveredPoint.count !== 1 ? "s" : ""}</p>
              </div>
            </Popup>
          )}
        </MapGL>
      </div>
    </div>
  )
}
