//Full Documentation: https://animmaster.github.io/docs/map.html

/*
========================================================
ANIM GOOGLE MAP MODULE
========================================================

Interactive Google Maps integration for ANIM.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<section data-anim-map>

	<div
		data-anim-map-body
		data-anim-map-lat="50.4501"
		data-anim-map-lng="30.5234"
		data-anim-map-zoom="10"
		data-anim-map-max-zoom="18"
	></div>


	<div
		data-anim-map-marker
		data-anim-map-lat="50.4501"
		data-anim-map-lng="30.5234"
		data-anim-map-title="Office"
		data-anim-map-icon="/img/marker.svg"
		data-anim-map-marker-zoom="12"
		data-anim-map-marker-popup="office-popup"
	></div>

</section>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-map
map section wrapper


data-anim-map-body
map container element


data-anim-map-lat
center latitude


data-anim-map-lng
center longitude


data-anim-map-zoom
initial zoom


data-anim-map-max-zoom
max zoom level



--------------------------------------------------------
MARKERS
--------------------------------------------------------

data-anim-map-marker
marker element


data-anim-map-marker-lat
marker latitude


data-anim-map-marker-lng
marker longitude


data-anim-map-icon
custom marker icon


data-anim-map-title
marker title


data-anim-map-marker-zoom
zoom level when clicking marker


data-anim-map-marker-popup
popup ID (requires ANIM popup module)



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ Google Maps integration
✔ multiple markers
✔ custom icons
✔ marker zoom
✔ marker popups
✔ responsive marker sizes
✔ styled map
✔ popup integration


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Google maps loader
import { Loader } from '@googlemaps/js-api-loader'

// Settings
import { MAP_STYLES, BREAKPOINTS, MAP_KEY } from './_settings.js'

// Styles
import './map.scss'

function mapInit() {
	const SELECTORS = {
		section: '[data-anim-map]',
		marker: '[data-anim-map-marker]',
		map: '[data-anim-map-body]',
	}

	const $sections = document.querySelectorAll(SELECTORS.section)

	if (!$sections.length) return

	/* ------------------------------------------------
	Load Google Maps API
	------------------------------------------------ */

	const loadMap = async onLoad => {
		const loader = new Loader({
			apiKey: MAP_KEY,
			version: 'weekly',
			libraries: ['places'],
		})

		try {
			const { Map } = await loader.importLibrary('maps')
			const { AdvancedMarkerElement } = await loader.importLibrary('marker')
			const Core = await loader.importLibrary('core')

			onLoad({ Map, AdvancedMarkerElement, Core })
		} catch (e) {
			ANIM('_ANIM_MAP_ERROR')

			console.log(e)
		}
	}

	/* ------------------------------------------------
	Create map instance
	------------------------------------------------ */

	const initMap = async ({
		api,
		lng,
		lat,
		markersData,
		zoom,
		maxZoom,
		$map,
	}) => {
		const mapOptions = {
			center: { lat, lng },

			zoom,
			maxZoom,

			mapTypeControl: false,

			styles: MAP_STYLES,

			disableDefaultUI: true,

			mapId: 'DEMO_MAP_ID',
		}

		const map = new api.Map($map, mapOptions)

		/* marker sizes */

		const markerDesktopSize = { width: 40, height: 57 }
		const markerMobileSize = { width: 30, height: 42 }

		const markerSize =
			window.innerWidth < BREAKPOINTS.tablet
				? markerMobileSize
				: markerDesktopSize

		/* create markers */

		const markers = markersData.map(
			({ lat, lng, icon, title, markerZoom, markerPopup }) => {
				let image

				if (icon) {
					image = document.createElement('img')
					image.src = icon
				}

				const marker = new api.AdvancedMarkerElement({
					map,

					title,

					gmpClickable: true,

					position: new api.Core.LatLng(lat, lng),

					content: icon ? image : null,
				})

				marker.addEventListener('gmp-click', () => {
					/* zoom */

					if (markerZoom.enable) {
						map.setZoom(+markerZoom.value || 10)
					}

					/* popup */

					if (markerPopup.enable && window.animPopup) {
						window.animPopup.open(markerPopup.value)
					}

					map.panTo(marker.position)
				})

				return marker
			},
		)

		return map
	}

	/* ------------------------------------------------
	Init maps
	------------------------------------------------ */

	loadMap(api => {
		$sections.forEach($section => {
			const $maps = $section.querySelectorAll(SELECTORS.map)

			if (!$maps.length) return

			$maps.forEach($map => {
				const $markers = $map.parentElement.querySelectorAll(SELECTORS.marker)

				const markersData = Array.from($markers).map($marker => ({
					lng: parseFloat($marker.dataset.animMapLng) || 0,

					lat: parseFloat($marker.dataset.animMapLat) || 0,

					icon: $marker.dataset.animMapIcon,

					title: $marker.dataset.animMapTitle,

					markerZoom: {
						enable: $marker.hasAttribute('data-anim-map-marker-zoom'),

						value: $marker.dataset.animMapMarkerZoom,
					},

					markerPopup: {
						enable: $marker.hasAttribute('data-anim-map-marker-popup'),

						value: $marker.dataset.animMapMarkerPopup,
					},
				}))

				initMap({
					api,

					$map,

					lng: parseFloat($map.dataset.animMapLng) || 0,

					lat: parseFloat($map.dataset.animMapLat) || 0,

					zoom: parseFloat($map.dataset.animMapZoom) || 6,

					maxZoom: parseFloat($map.dataset.animMapMaxZoom) || 18,

					markersData,
				})
			})
		})
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-map]')) {
	window.addEventListener('load', mapInit)
}
