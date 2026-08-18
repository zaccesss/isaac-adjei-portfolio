"use client"

// A real interactive map of application locations - pan/zoom/rotate/click, pulsing markers for
// recent applications (mirroring LiveStatusCards' own pulsing dots elsewhere on the dashboard).
// MapLibre GL JS (the open-source Mapbox GL fork) for the engine, OpenFreeMap for tiles - both
// genuinely free forever, no account, no API key, no card. Only ever reads lat/lng from
// location_geocodes, which isaac-adjei-automations' geocode-locations.mjs job populates - this
// component never geocodes anything itself.
import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import MapGL, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { STATUS_COLOURS, normaliseStatus } from "@/lib/application-status"
import { Globe2, Map as MapIcon, ExternalLink, Box, Square, X } from "lucide-react"

// Esri's World Imagery REST tile service is a genuinely free, no-key, no-card raster tile source
// (used by plenty of open-source map projects for exactly this) - a raw MapLibre raster style
// rather than a hosted vector style URL like OpenFreeMap's other two.
const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    esri: {
      type: "raster" as const,
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri-satellite", type: "raster" as const, source: "esri" }],
}

const STYLES = {
  bright: { label: "Bright", url: "https://tiles.openfreemap.org/styles/bright" },
  streets: { label: "Streets", url: "https://tiles.openfreemap.org/styles/liberty" },
  light: { label: "Light", url: "https://tiles.openfreemap.org/styles/positron" },
  dark: { label: "Dark", url: "https://tiles.openfreemap.org/styles/dark" },
  satellite: { label: "Satellite", url: SATELLITE_STYLE },
} as const

const RECENT_DAYS = 14

export interface MapApplication {
  id: string
  company: string
  role: string
  status: string
  location: string | null
  created_at: string
  url: string | null
}

interface Geocode {
  location: string
  lat: number | null
  lng: number | null
}

export function ApplicationsMap({ apps, geocodes }: { apps: MapApplication[]; geocodes: Geocode[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  // "bright" is the default: unlike "streets" (liberty) it has no 3D building extrusion layer
  // (genuinely GPU-heavy with many pins on screen), and unlike "light" (positron) it colours
  // country/land-use areas and shows place labels clearly rather than a near-monochrome base.
  // Auto-switches to "dark" if the site is in dark mode - none of the light styles play well
  // against a dark dashboard - but only until the user picks a style themselves, same "site
  // theme sets the default, manual choice always wins" pattern the isometric calendar uses.
  const { resolvedTheme } = useTheme()
  // null means "no manual choice yet" - the theme-derived default is computed in render rather
  // than synced via an effect, so a style pick never fights a subsequent theme-driven re-render.
  const [userStyle, setUserStyle] = useState<keyof typeof STYLES | null>(null)
  const style = userStyle ?? (resolvedTheme === "dark" ? "dark" : "bright")
  const [globe, setGlobe] = useState(false)
  const [is3D, setIs3D] = useState(false)
  const [zoom, setZoom] = useState(3.5)
  const mapRef = useRef<MapRef>(null)

  function toggle3D() {
    const next = !is3D
    setIs3D(next)
    mapRef.current?.easeTo({ pitch: next ? 45 : 0, duration: 400 })
  }
  // Lazy useState initialiser, not a bare Date.now() call in render - computed once on mount so
  // "recent" stays stable for the component's lifetime rather than shifting on every re-render.
  const [nowMs] = useState(() => Date.now())

  const geocodeByLocation = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number }>()
    for (const g of geocodes) {
      if (g.lat != null && g.lng != null) m.set(g.location, { lat: g.lat, lng: g.lng })
    }
    return m
  }, [geocodes])

  const pins = useMemo(() => {
    const recentCutoff = nowMs - RECENT_DAYS * 24 * 60 * 60 * 1000
    return apps
      .filter((a) => a.location)
      .map((a) => {
        const coords = geocodeByLocation.get(a.location as string)
        if (!coords) return null
        return {
          ...a,
          ...coords,
          isRecent: new Date(a.created_at).getTime() >= recentCutoff,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
  }, [apps, geocodeByLocation, nowMs])

  // Grid-based clustering: many pins as individual DOM Marker overlays is the real perf cost with
  // a growing applications list, not the WebGL tile rendering itself - grouping nearby pins into
  // one badge until zoomed in keeps the DOM marker count low regardless of how many applications
  // exist. Cell size shrinks as zoom increases, so clusters split apart naturally on zoom-in
  // rather than needing a second clustering pass.
  const clusters = useMemo(() => {
    const cellDegrees = 50 / 2 ** zoom
    const cells = new Map<string, typeof pins>()
    for (const p of pins) {
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
  }, [pins, zoom])

  const ungeocodedCount = apps.filter((a) => a.location && !geocodeByLocation.has(a.location)).length

  if (pins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-12 text-center">
        No geocoded locations yet. {ungeocodedCount > 0 ? `${ungeocodedCount} location${ungeocodedCount !== 1 ? "s" : ""} waiting on the next geocoding run.` : "Add a location to an application to see it here."}
      </p>
    )
  }

  const activePin = pins.find((p) => p.id === (selected ?? hovered)) ?? null
  const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length
  const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-1">
        {(Object.entries(STYLES) as [keyof typeof STYLES, (typeof STYLES)[keyof typeof STYLES]][]).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => setUserStyle(key)}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${style === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setGlobe((g) => !g)}
          title="Toggle globe projection"
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
      </div>
      <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          ref={mapRef}
          initialViewState={{ latitude: avgLat, longitude: avgLng, zoom: 3.5 }}
          mapStyle={STYLES[style].url}
          projection={globe ? "globe" : "mercator"}
          style={{ width: "100%", height: "100%" }}
          onMove={(e) => setZoom(e.viewState.zoom)}
          dragPan
          dragRotate
          scrollZoom
          doubleClickZoom
          touchZoomRotate
          touchPitch
          keyboard
        >
          {/* visualizePitch shows a compass/tilt indicator so rotate and pitch are discoverable,
              not just draggable with no visible affordance - click it to reset to north/flat. */}
          <NavigationControl position="top-right" visualizePitch showCompass showZoom />
          {clusters.map((cluster) => {
            if (cluster.items.length === 1) {
              const pin = cluster.items[0]
              const colour = STATUS_COLOURS[normaliseStatus(pin.status)] ?? "hsl(var(--primary))"
              return (
                <Marker
                  key={pin.id}
                  latitude={pin.lat}
                  longitude={pin.lng}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelected(pin.id)
                  }}
                >
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHovered(pin.id)}
                    onMouseLeave={() => setHovered((h) => (h === pin.id ? null : h))}
                  >
                    {pin.isRecent && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: colour, opacity: 0.5 }}
                      />
                    )}
                    <span
                      className="relative block h-3 w-3 rounded-full border-2 border-white shadow"
                      style={{ background: colour }}
                    />
                  </div>
                </Marker>
              )
            }
            const clusterKey = `${cluster.lat}:${cluster.lng}:${cluster.items.length}`
            return (
              <Marker key={clusterKey} latitude={cluster.lat} longitude={cluster.lng}>
                <button
                  type="button"
                  title={`${cluster.items.length} applications - click to zoom in`}
                  onClick={(e) => {
                    e.stopPropagation()
                    mapRef.current?.easeTo({ center: [cluster.lng, cluster.lat], zoom: zoom + 2.5, duration: 500 })
                  }}
                  className="flex items-center justify-center h-7 w-7 rounded-full border-2 border-white shadow bg-primary text-primary-foreground text-[11px] font-semibold cursor-pointer"
                >
                  {cluster.items.length}
                </button>
              </Marker>
            )
          })}
          {activePin && (
            <Popup
              latitude={activePin.lat}
              longitude={activePin.lng}
              onClose={() => { setSelected(null); setHovered(null) }}
              closeButton={false}
              closeOnClick={false}
              offset={12}
            >
              <div className="text-xs space-y-1 text-black min-w-[140px] relative">
                {selected === activePin.id && (
                  <button
                    type="button"
                    onClick={() => { setSelected(null); setHovered(null) }}
                    aria-label="Close"
                    className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <p className="font-semibold pr-4">{activePin.company}</p>
                <p>{activePin.role}</p>
                <p className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: STATUS_COLOURS[normaliseStatus(activePin.status)] ?? "hsl(var(--primary))" }} />
                  {activePin.status}
                </p>
                <p className="text-muted-foreground">{activePin.location}</p>
                {selected === activePin.id && (
                  activePin.url ? (
                    <a
                      href={activePin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline pt-1"
                    >
                      Open job listing <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={`/dashboard/applications?q=${encodeURIComponent(activePin.company)}`}
                      className="flex items-center gap-1 text-primary hover:underline pt-1"
                    >
                      Open {activePin.company} in Applications <ExternalLink className="h-3 w-3" />
                    </Link>
                  )
                )}
              </div>
            </Popup>
          )}
        </MapGL>
      </div>
      <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
        <p>
          {pins.length} geocoded application{pins.length !== 1 ? "s" : ""} shown
          {ungeocodedCount > 0 && ` · ${ungeocodedCount} more waiting on the next geocoding run`}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
              <span className="relative block h-2 w-2 rounded-full bg-primary" />
            </span>
            Pulsing = applied in the last {RECENT_DAYS} days
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] font-semibold">N</span>
            Numbered badge = a cluster, click to zoom in
          </span>
          <span>Hover a pin for a quick preview</span>
          <span>Click a pin for the full popup and a link back to it</span>
        </div>
      </div>
    </div>
  )
}
