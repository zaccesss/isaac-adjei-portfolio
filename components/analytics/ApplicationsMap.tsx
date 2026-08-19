"use client"

// A real interactive map of application locations - pan/zoom/rotate/click, pulsing markers for
// recent applications (mirroring LiveStatusCards' own pulsing dots elsewhere on the dashboard).
// MapLibre GL JS for the engine, MapTiler Cloud for tiles/styles/labels/glyphs - free (no card,
// 100k map loads/month), key-gated and origin-restricted. Switched from OpenFreeMap after 3 days
// chasing a reproducible bug where MapLibre never issued a single vector tile (.pbf) request
// against it (confirmed via a real network capture, not a style/zoom-threshold assumption) -
// MapTiler is a professional commercial product where the tile/glyph pipeline is a core, heavily
// used deliverable, not a hobby project's edge case. Only ever reads lat/lng from
// location_geocodes, which isaac-adjei-automations' geocode-locations.mjs job populates - this
// component never geocodes anything itself.
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import MapGL, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre"
import { setWorkerUrl, type LayerSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { STATUS_COLOURS, normaliseStatus } from "@/lib/application-status"
import { Globe2, Map as MapIcon, ExternalLink, Box, Square, X } from "lucide-react"

// Confirmed root cause of a 3-day bug (a real network capture showed zero .pbf tile requests
// ever fired, against two different tile providers): Turbopack (Next.js' default dev/build
// bundler) silently drops MapLibre's own inline worker, so the dedicated thread that parses
// vector tiles never starts - polygons/labels/everything data-driven stayed blank while raster
// tiles (no worker needed) rendered fine, which is what actually pointed at the worker. The
// worker's own .mjs file imports a sibling maplibre-gl-shared.mjs by relative path, so both are
// copied into public/ (same-origin, no bundler transform needed) rather than trying to get
// Turbopack to bundle them correctly - self-hosting sidesteps the bug entirely. Re-copy both
// from node_modules/maplibre-gl/dist/ if maplibre-gl is ever upgraded to a new major version.
setWorkerUrl("/maplibre-gl-worker.mjs")

function maptilerStyles(key: string) {
  const url = (id: string) => `https://api.maptiler.com/maps/${id}/style.json?key=${key}`
  return {
    streets: { label: "Streets", url: url("streets-v2") },
    base: { label: "Base", url: url("basic-v2") },
    dataviz: { label: "Dataviz", url: url("dataviz") },
    dark: { label: "Dark", url: url("dataviz-dark") },
    satellite: { label: "Satellite", url: url("hybrid") },
    toner: { label: "Toner", url: url("toner-v2") },
    outdoor: { label: "Outdoor", url: url("outdoor-v2") },
    uk: { label: "UK Ordnance Survey", url: url("uk-openzoomstack-light") },
  } as const
}

// Esri's World Imagery REST tile service is a genuinely free, no-key, no-card raster tile source
// - a raw MapLibre raster style rather than a hosted vector style URL, used only for OpenFreeMap's
// own satellite option since OpenFreeMap itself has no satellite imagery. Plain imagery alone has
// no place names, so this also composites OpenFreeMap's own "openmaptiles" vector source (already
// used by its other styles, same worker pipeline) filtered to just its 9 place-label layers
// (country/state/city/town/village, copied from tiles.openfreemap.org/styles/positron and
// restyled white-on-dark for legibility over imagery instead of the light-basemap default of
// dark-on-white) - a real hybrid style, matching what MapTiler's own "hybrid" satellite option
// already does. Icon markers are dropped rather than pulled in from OpenFreeMap's own per-style
// sprite sheet, keeping this self-contained instead of depending on a second style's sprite atlas.
function placeLabelLayer(
  id: string,
  filter: unknown[],
  layout: Record<string, unknown>,
  opts: { minzoom?: number; maxzoom?: number } = {}
) {
  return {
    id,
    type: "symbol" as const,
    source: "openmaptiles",
    "source-layer": "place",
    ...opts,
    filter,
    layout,
    paint: { "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 1.2, "text-halo-blur": 0.5 },
  } as unknown as LayerSpecification
}

const NAME_FIELD = [
  "case",
  ["has", "name:nonlatin"],
  ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
  ["coalesce", ["get", "name_en"], ["get", "name"]],
]

const ESRI_SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    esri: {
      type: "raster" as const,
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
    openmaptiles: { type: "vector" as const, url: "https://tiles.openfreemap.org/planet" },
  },
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  layers: [
    { id: "esri-satellite", type: "raster" as const, source: "esri" },
    placeLabelLayer("label_state", ["==", ["get", "class"], "state"], {
      "text-field": NAME_FIELD, "text-font": ["Noto Sans Italic"], "text-letter-spacing": 0.2, "text-max-width": 9,
      "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 14], "text-transform": "uppercase",
    }, { minzoom: 5, maxzoom: 8 }),
    placeLabelLayer("label_town", ["==", ["get", "class"], "town"], {
      "text-anchor": "bottom", "text-field": NAME_FIELD, "text-font": ["Noto Sans Regular"], "text-max-width": 8,
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 12, 11, 14],
    }, { minzoom: 6 }),
    placeLabelLayer("label_village", ["==", ["get", "class"], "village"], {
      "text-anchor": "bottom", "text-field": NAME_FIELD, "text-font": ["Noto Sans Regular"], "text-max-width": 8,
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 10, 11, 12],
    }, { minzoom: 9 }),
    placeLabelLayer("label_city", ["all", ["==", ["get", "class"], "city"], ["!=", ["get", "capital"], 2]], {
      "text-anchor": "bottom", "text-field": NAME_FIELD, "text-font": ["Noto Sans Regular"], "text-max-width": 8,
      "text-offset": [0, -0.1], "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 11, 7, 13, 11, 18],
    }, { minzoom: 3 }),
    placeLabelLayer("label_city_capital", ["all", ["==", ["get", "class"], "city"], ["==", ["get", "capital"], 2]], {
      "text-anchor": "bottom", "text-field": NAME_FIELD, "text-font": ["Noto Sans Bold"], "text-max-width": 8,
      "text-offset": [0, -0.2], "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 12, 7, 14, 11, 20],
    }, { minzoom: 3 }),
    placeLabelLayer("label_country_3", ["all", ["==", ["get", "class"], "country"], [">=", ["get", "rank"], 3]], {
      "text-field": NAME_FIELD, "text-font": ["Noto Sans Bold"], "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9, 7, 17],
    }, { minzoom: 2, maxzoom: 9 }),
    placeLabelLayer("label_country_2", ["all", ["==", ["get", "class"], "country"], ["==", ["get", "rank"], 2]], {
      "text-field": NAME_FIELD, "text-font": ["Noto Sans Bold"], "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 2, 9, 5, 17],
    }, { maxzoom: 9 }),
    placeLabelLayer("label_country_1", ["all", ["==", ["get", "class"], "country"], ["==", ["get", "rank"], 1]], {
      "text-field": NAME_FIELD, "text-font": ["Noto Sans Bold"], "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 1, 9, 4, 17],
    }, { maxzoom: 9 }),
  ],
}

// A second, independent tile provider kept as a real manual fallback - no key, no card, nothing
// to run out. The worker fix that actually resolved the 3-day label bug is provider-agnostic, so
// this works exactly as well as MapTiler; it exists purely so MapTiler being unavailable for any
// reason (quota, an outage) is never a single point of failure for the whole map.
function openFreeMapStyles() {
  return {
    bright: { label: "Bright", url: "https://tiles.openfreemap.org/styles/bright" },
    streets: { label: "Streets", url: "https://tiles.openfreemap.org/styles/liberty" },
    light: { label: "Light", url: "https://tiles.openfreemap.org/styles/positron" },
    dark: { label: "Dark", url: "https://tiles.openfreemap.org/styles/dark" },
    satellite: { label: "Satellite", url: ESRI_SATELLITE_STYLE },
  } as const
}

const PROVIDERS = { maptiler: "MapTiler", openfreemap: "OpenFreeMap" } as const

type StyleEntry = { label: string; url: string | typeof ESRI_SATELLITE_STYLE }
type StyleMap = Record<string, StyleEntry>

const RECENT_DAYS = 14

export interface MapApplication {
  id: string
  company: string
  role: string
  type: string
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

// Both the provider and style choice persist across reloads via localStorage - a plain useState
// initialiser (not an effect) so the very first render already has the saved value, matching the
// same "no flash of the wrong state" reasoning the theme/style-on-mount logic below already uses.
// Guarded for SSR/private-browsing since localStorage can throw or simply not exist there.
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

export function ApplicationsMap({ apps, geocodes, apiKey }: { apps: MapApplication[]; geocodes: Geocode[]; apiKey: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [provider, setProvider] = useState<keyof typeof PROVIDERS>(
    () => (readStored("applicationsMap.provider") as keyof typeof PROVIDERS | null) ?? "maptiler"
  )
  const maptilerStylesMemo = useMemo(() => maptilerStyles(apiKey), [apiKey])
  const openFreeMapStylesMemo = useMemo(() => openFreeMapStyles(), [])
  // Both factories return an `as const` literal of a different shape (8 keys vs 5) - widened to
  // a shared StyleMap here since the provider toggle means this is now a genuine runtime union,
  // not a single fixed shape the compiler can narrow on its own.
  const STYLES: StyleMap = provider === "maptiler" ? maptilerStylesMemo : openFreeMapStylesMemo
  // The default style within whichever provider is active is its own "designed for dashboards"
  // clean option (MapTiler's "dataviz", OpenFreeMap's "bright") - defaults to that provider's own
  // dark style if the site is in dark mode, only until the user picks a style themselves, same
  // "site theme sets the default, manual choice always wins" pattern the isometric calendar uses.
  //
  // The map does not mount until `mounted` is true (below), so the very first style MapGL ever
  // receives is already the correct one rather than swapping moments after mount once
  // useTheme()'s resolvedTheme resolves (it is undefined for one tick after mount by design,
  // next-themes' own hydration-mismatch guard) - avoids a second internal setStyle() call this
  // early in the map's life, regardless of tile provider.
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Deferred rather than called synchronously in the effect body, matching
    // useEChartsColours' own established pattern for this exact class of lint constraint.
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  const [userStyle, setUserStyle] = useState<string | null>(() => readStored(`applicationsMap.style.${provider}`))
  const defaultStyleKey = provider === "maptiler" ? "dataviz" : "bright"
  const style = (userStyle && userStyle in STYLES ? userStyle : null) ?? (resolvedTheme === "dark" ? "dark" : defaultStyleKey)

  function setProviderAndPersist(next: keyof typeof PROVIDERS) {
    setProvider(next)
    setUserStyle(readStored(`applicationsMap.style.${next}`))
    writeStored("applicationsMap.provider", next)
  }
  function setStyleAndPersist(next: string) {
    setUserStyle(next)
    writeStored(`applicationsMap.style.${provider}`, next)
  }
  const [globe, setGlobe] = useState(false)
  const [is3D, setIs3D] = useState(false)
  const [clustering, setClustering] = useState(true)
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
    if (!clustering) return pins.map((p) => ({ lat: p.lat, lng: p.lng, items: [p] }))
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
  }, [pins, zoom, clustering])

  const ungeocodedCount = apps.filter((a) => a.location && !geocodeByLocation.has(a.location)).length

  if (pins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-12 text-center">
        No geocoded locations yet. {ungeocodedCount > 0 ? `${ungeocodedCount} location${ungeocodedCount !== 1 ? "s" : ""} waiting on the next geocoding run.` : "Add a location to an application to see it here."}
      </p>
    )
  }

  // MapGL only ever mounts once the client is known and the real theme resolved - see the note
  // above on `mounted`. This is the same shape server and client agree on before that point, so
  // there is no hydration mismatch either.
  if (!mounted) {
    return <div className="h-[420px] w-full rounded-lg border border-border bg-muted/30 animate-pulse" />
  }

  const activePin = pins.find((p) => p.id === (selected ?? hovered)) ?? null
  // Fit-to-bounds on load rather than a fixed zoom around the arithmetic mean of every
  // coordinate - a fixed zoom regularly cropped out real pins depending on how spread out that
  // session's applications were (Australia + the US both present, for example), forcing a manual
  // zoom-out before the whole picture was visible. A single-location dataset has zero-width
  // bounds, so it falls back to a plain centred view instead of an invalid empty box.
  const bounds =
    pins.length > 1
      ? ([
          [Math.min(...pins.map((p) => p.lng)), Math.min(...pins.map((p) => p.lat))],
          [Math.max(...pins.map((p) => p.lng)), Math.max(...pins.map((p) => p.lat))],
        ] as [[number, number], [number, number]])
      : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        {/* Provider on the left, its own style row on the right - MapTiler is the primary
            provider, OpenFreeMap is a real independent fallback (no key, nothing to run out) if
            MapTiler is ever unavailable. Switching provider resets to that provider's own default
            style rather than trying to carry a style key across two unrelated style sets. */}
        <div className="flex items-center gap-1">
          {(Object.entries(PROVIDERS) as [keyof typeof PROVIDERS, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setProviderAndPersist(key)}
              title={key === "openfreemap" ? "Independent fallback provider - no key, no card, nothing to run out" : undefined}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${provider === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
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
        <button
          type="button"
          onClick={() => setGlobe((g) => !g)}
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
          title={clustering ? "Show every individual pin, unclustered" : "Group nearby pins into clusters"}
          className={`text-[10px] px-2 py-1 rounded border transition-colors ${clustering ? "border-border text-muted-foreground hover:text-foreground" : "bg-primary text-primary-foreground border-primary"}`}
        >
          {clustering ? "Clustered" : "All pins"}
        </button>
        </div>
      </div>
      <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border">
        <MapGL
          ref={mapRef}
          initialViewState={
            bounds
              ? { bounds, fitBoundsOptions: { padding: 40, maxZoom: 12 } }
              : { latitude: pins[0].lat, longitude: pins[0].lng, zoom: 8 }
          }
          mapStyle={STYLES[style].url}
          // Forces a full style reload on every switch instead of MapLibre's default incremental
          // diff - the style picker switches between genuinely unrelated style documents (different
          // providers, different source URLs), and repeated diffed switches against ~10k markers
          // left the map on a stale style that never visually updated, worsening into a fully blank
          // canvas after several switches. A full reload costs a brief flash per switch but is
          // reliable, unlike the diff path.
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
                {activePin.type && <p className="text-muted-foreground capitalize">{activePin.type}</p>}
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
          <span>Toggle &quot;All pins&quot; above to turn off clustering entirely</span>
        </div>
      </div>
    </div>
  )
}
