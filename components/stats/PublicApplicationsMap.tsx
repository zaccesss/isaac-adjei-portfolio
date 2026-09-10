"use client"

// A count-only public map of application locations for /stats/applications - one pin per city
// scaled by count, hover shows a location and a count, nothing else. No click-through detail
// popup and no per-application data at all, since the API this reads from
// (/api/stats/applications-locations) never returns company, status, role or date in the first
// place - there is nothing more specific to show even if I wanted to.
//
// The overwhelming majority of "tracked" locations are scraped job listings I discovered but
// never actually applied to, not places I have literally sent an application - the copy here says
// "tracked" throughout rather than "applied"/"sent", which would misrepresent what the number
// actually counts.
//
// OpenFreeMap only, deliberately not MapTiler. This page is public and could see real,
// unpredictable traffic if shared - MapTiler's 100k-loads/month key is shared with the private
// dashboard map, so a spike here could exhaust that quota and take the dashboard's own map down
// with it. OpenFreeMap has no key and nothing to run out, so it is the safer default for anything
// public-facing; MapTiler stays reserved for the private dashboard. The style picker (Bright,
// Streets, Light, Dark, Satellite) and the globe/3D view toggles mirror the dashboard's own
// ApplicationsMap one-for-one, sharing its style definitions from lib/map-styles.ts, so a visitor
// comparing the two sees the same set of views rather than a cut-down public version.
import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import MapGL, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre"
import { setWorkerUrl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { openFreeMapStyles, skyForView } from "@/lib/map-styles"
import { Globe2, Map as MapIcon, Box, Square } from "lucide-react"

// Same Turbopack worker-drop fix as the dashboard's ApplicationsMap - see that component for the
// full explanation. setWorkerUrl is idempotent to call twice if both components ever mount in the
// same session, so no extra guard is needed here.
setWorkerUrl("/maplibre-gl-worker.mjs")

// Persisted separately from the dashboard's own applicationsMap.style key - a visitor's choice on
// the public page has no reason to affect (or be affected by) the owner's own dashboard setting.
function readStored(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private browsing or storage disabled - the choice just stops persisting, no functional loss.
  }
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
  const [clustering, setClustering] = useState(true)
  const [zoom, setZoom] = useState(3)
  const [globe, setGlobe] = useState(false)
  const [is3D, setIs3D] = useState(false)
  const mapRef = useRef<MapRef>(null)

  const STYLES = useMemo(() => openFreeMapStyles(), [])
  const [userStyle, setUserStyle] = useState<string | null>(() => readStored("publicApplicationsMap.style"))
  // Defaults to the site theme's own light/dark style until a visitor picks one manually, same
  // "theme sets the default, manual choice always wins" pattern the dashboard map uses.
  const style = (userStyle && userStyle in STYLES ? userStyle : null) ?? (resolvedTheme === "dark" ? "dark" : "light")
  function setStyleAndPersist(next: string) {
    setUserStyle(next)
    writeStored("publicApplicationsMap.style", next)
  }

  function toggle3D() {
    const next = !is3D
    setIs3D(next)
    mapRef.current?.easeTo({ pitch: next ? 45 : 0, duration: 400 })
  }

  // Globe mode at the same zoom used for the flat view left a small sphere floating in a lot of
  // empty space, since a landscape box does not naturally fit a full circle - nudging the zoom in
  // when entering globe mode (and back out when leaving) makes it fill the box properly.
  function setGlobeAndFit(next: boolean) {
    setGlobe(next)
    mapRef.current?.setSky(skyForView(next))
    mapRef.current?.easeTo({ zoom: zoom + (next ? 1.2 : -1.2), duration: 400 })
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // A style switch fully reloads the style (styleDiffing={false} below), which wipes any sky
  // previously set via setSky() - re-applies it after every style load so switching from, say,
  // Bright to Dark while in globe mode does not silently drop back to a plain white void. Reads
  // globe from a ref rather than the effect's own closure since this listener is attached once
  // (on mount) and must still see whichever globe/flat state is current whenever it later fires.
  const globeRef = useRef(globe)
  useEffect(() => { globeRef.current = globe }, [globe])
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const applySky = () => map.setSky(skyForView(globeRef.current))
    map.on("style.load", applySky)
    applySky()
    return () => { map.off("style.load", applySky) }
  }, [mounted])

  // The site's own light/dark toggle should carry the map along with it whenever the visitor is on
  // one of the two theme-linked styles (Light/Dark) - a creative pick like Bright/Streets/Satellite
  // is a deliberate departure from the theme and stays put. The unpinned default already reacts to
  // resolvedTheme via the `style` expression below with no extra code; this only handles the case
  // where a visitor has explicitly clicked Light or Dark and then flips the site's own toggle.
  const prevThemeRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const prev = prevThemeRef.current
    prevThemeRef.current = resolvedTheme
    if (prev === undefined || prev === resolvedTheme) return
    if (userStyle === "light" || userStyle === "dark") {
      // Reacting to an external system's own state (the site-wide theme) genuinely changing is
      // the legitimate external-sync case the rule allows for - this only ever runs after a real
      // theme flip, never on mount or on the map's own local state changing.
      /* eslint-disable react-hooks/set-state-in-effect */
      setStyleAndPersist(resolvedTheme === "dark" ? "dark" : "light")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  useEffect(() => {
    fetch("/api/stats/applications-locations")
      .then((r) => (r.ok ? r.json() : { total: 0, points: [] }))
      .then((d) => { setPoints(d.points ?? []); setTotal(d.total ?? 0) })
      .catch(() => { setPoints([]); setTotal(0) })
  }, [])

  const maxCount = useMemo(() => Math.max(1, ...(points ?? []).map((p) => p.count)), [points])
  // Square-root scale, matching every other size-by-value chart on this site - a handful of
  // dominant cities (London especially) would otherwise swallow the whole map on a linear scale.
  const radius = (count: number) => 6 + Math.sqrt(count / maxCount) * 18

  // Groups nearby CITIES together at low zoom, same grid-cell technique the dashboard's own
  // ApplicationsMap uses for individual pins - there is no per-application data here to cluster
  // (this endpoint only ever returns one row per city), so "unclustered" still means one pin per
  // city and "clustered" merges cities that are close together on screen into a single combined
  // circle. Still count-only either way, nothing more specific than a summed number.
  const clusters = useMemo(() => {
    const pts = points ?? []
    if (!clustering) return pts.map((p) => ({ lat: p.lat, lng: p.lng, items: [p] }))
    const cellDegrees = 50 / 2 ** zoom
    const cells = new Map<string, LocationPoint[]>()
    for (const p of pts) {
      const key = `${Math.round(p.lat / cellDegrees)}:${Math.round(p.lng / cellDegrees)}`
      const group = cells.get(key)
      if (group) group.push(p)
      else cells.set(key, [p])
    }
    return Array.from(cells.values()).map((items) => ({
      lat: items.reduce((s, p) => s + p.lat, 0) / items.length,
      lng: items.reduce((s, p) => s + p.lng, 0) / items.length,
      items,
    }))
  }, [points, zoom, clustering])

  const totalHeadline = (
    <p className="text-sm text-muted-foreground">
      {total === null ? (
        <span className="inline-block h-4 w-24 bg-muted/60 rounded animate-pulse align-middle" />
      ) : (
        <><span className="font-semibold text-foreground">{total.toLocaleString()}</span> job opportunities tracked, all time</>
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
  const hoveredCluster = clusters.find((c) => c.items.some((i) => i.location === hovered)) ?? null

  return (
    <div className="space-y-3">
      {totalHeadline}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          {Object.entries(STYLES).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStyleAndPersist(key)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${style === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setGlobeAndFit(!globe)}
            title="Globe projection has a known MapLibre limitation where country/place labels can fail to render (github.com/maplibre/maplibre-gl-js#5025) - Flat is the reliable choice for readable labels"
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${globe ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {globe ? <Globe2 className="h-3 w-3" /> : <MapIcon className="h-3 w-3" />}
            {globe ? "Globe" : "Flat"}
          </button>
          <button
            type="button"
            onClick={toggle3D}
            title="Toggle 2D/3D tilt"
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${is3D ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {is3D ? <Box className="h-3 w-3" /> : <Square className="h-3 w-3" />}
            {is3D ? "3D" : "2D"}
          </button>
          <button
            type="button"
            onClick={() => setClustering((c) => !c)}
            title={clustering ? "Show every city's own pin, unclustered" : "Group nearby cities into clusters"}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${clustering ? "border-border text-muted-foreground hover:text-foreground" : "bg-primary text-primary-foreground border-primary"}`}
          >
            {clustering ? "Clustered" : "All pins"}
          </button>
        </div>
      </div>
      <div className="h-[480px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          ref={mapRef}
          initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 3 }}
          mapStyle={STYLES[style as keyof typeof STYLES].url}
          // A full reload rather than an incremental diff on every style switch - see
          // ApplicationsMap.tsx (the private dashboard map) for the full rationale. This map has far
          // fewer markers (one per city, not per application) so is lower risk, but the fix is cheap
          // and keeps both maps behaving the same way.
          styleDiffing={false}
          projection={globe ? "globe" : "mercator"}
          style={{ width: "100%", height: "100%" }}
          renderWorldCopies={false}
          onMove={(e) => setZoom(e.viewState.zoom)}
          dragPan
          dragRotate
          scrollZoom
          doubleClickZoom
          touchZoomRotate
          touchPitch
          keyboard
        >
          <NavigationControl position="top-right" visualizePitch showCompass showZoom />
          {clusters.map((cluster) => {
            const clusterCount = cluster.items.reduce((s, i) => s + i.count, 0)
            const key = cluster.items.length === 1
              ? cluster.items[0].location
              : `${cluster.lat}:${cluster.lng}:${cluster.items.length}`
            return (
              <Marker key={key} latitude={cluster.lat} longitude={cluster.lng}>
                <button
                  type="button"
                  title={cluster.items.length > 1 ? `${cluster.items.length} cities - click to zoom in` : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (cluster.items.length > 1) {
                      mapRef.current?.easeTo({ center: [cluster.lng, cluster.lat], zoom: zoom + 2.5, duration: 500 })
                    }
                  }}
                  className="rounded-full bg-primary/70 border border-primary-foreground/40 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ width: radius(clusterCount) * 2, height: radius(clusterCount) * 2 }}
                  onMouseEnter={() => setHovered(cluster.items[0].location)}
                  onMouseLeave={() => setHovered((h) => (cluster.items.some((i) => i.location === h) ? null : h))}
                >
                  {cluster.items.length > 1 && (
                    <span className="text-[9px] font-semibold text-primary-foreground">{cluster.items.length}</span>
                  )}
                </button>
              </Marker>
            )
          })}
          {hoveredCluster && (
            <Popup
              latitude={hoveredCluster.lat}
              longitude={hoveredCluster.lng}
              closeButton={false}
              closeOnClick={false}
              offset={12}
            >
              <div className="text-xs text-black space-y-1">
                {hoveredCluster.items.length === 1 ? (
                  <>
                    <p className="font-semibold">{hoveredCluster.items[0].location}</p>
                    <p className="text-muted-foreground">
                      {hoveredCluster.items[0].count} opportunit{hoveredCluster.items[0].count === 1 ? "y" : "ies"} tracked
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{hoveredCluster.items.length} cities, opportunities tracked</p>
                    {hoveredCluster.items.slice(0, 5).map((i) => (
                      <p key={i.location} className="text-muted-foreground">{i.location} - {i.count}</p>
                    ))}
                    {hoveredCluster.items.length > 5 && (
                      <p className="text-muted-foreground">+{hoveredCluster.items.length - 5} more</p>
                    )}
                  </>
                )}
              </div>
            </Popup>
          )}
        </MapGL>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {clustering ? "Numbered circle = a cluster of nearby cities, click to zoom in. " : ""}
        Hover a pin for a count. Toggle &quot;All pins&quot; above to turn off clustering entirely.
      </p>
    </div>
  )
}
