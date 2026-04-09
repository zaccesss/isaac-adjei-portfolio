//Full Documentation: https://animmaster.github.io/docs/mousedoc.html 

// =============================================================
// Mouse Parallax Class
// =============================================================

/*
This class creates a parallax effect that reacts to mouse movement.

To enable parallax on an element, add:

	data-anim-mouse

Example:
	<div data-anim-mouse></div>


---------------------------------------------------------------

Optional settings via attributes:

data-anim-mouse-cx="100"
	Controls X offset sensitivity
	Higher value = smaller movement

data-anim-mouse-cy="100"
	Controls Y offset sensitivity
	Higher value = smaller movement

data-anim-mouse-dxr
	Inverts X axis movement

data-anim-mouse-dyr
	Inverts Y axis movement

data-anim-mouse-a="50"
	Animation speed

---------------------------------------------------------------

Optional wrapper:

If you want the mouse tracking to happen inside a parent container:

	data-anim-mouse-wrapper

Example:

<div data-anim-mouse-wrapper>
	<div data-anim-mouse></div>
</div>

---------------------------------------------------------------

If parallax is applied to an image, it is recommended to make it larger
than the container so movement does not reveal empty space.

Example CSS:

	width: 130%;
	height: 130%;
	top: -15%;
	left: -15%;

*/

// =============================================================
// Import helpers from project
// =============================================================

// Utility functions from the project
import { isMobile, ANIM } from '@js/common/functions.js'

class MousePRLX {
	// ----------------------------------------------------------
	// Constructor
	// ----------------------------------------------------------

	constructor(props = {}) {
		// Default configuration
		const defaultConfig = {
			init: true,
		}

		// Merge user settings with default settings
		this.config = Object.assign(defaultConfig, props)

		// Stop initialization if disabled
		if (!this.config.init) return

		// Get all elements with parallax attribute
		const parallaxElements = document.querySelectorAll('[data-anim-mouse]')

		// If none found — stop
		if (!parallaxElements.length) {
			ANIM('_ANIM_MOUSE_SLEEP')
			return
		}

		// Initialize parallax logic
		this.initParallax(parallaxElements)

		ANIM('_ANIM_MOUSE_START', parallaxElements.length)
	}

	// ----------------------------------------------------------
	// Initialize parallax for elements
	// ----------------------------------------------------------

	initParallax(elements) {
		elements.forEach(el => {
			// Wrapper for mouse tracking (optional)
			const wrapper = el.closest('[data-anim-mouse-wrapper]')

			// Read configuration from HTML attributes

			const coefficientX = +el.dataset.animMouseCx || 100
			const coefficientY = +el.dataset.animMouseCy || 100

			const directionX = el.hasAttribute('data-anim-mouse-dxr') ? -1 : 1
			const directionY = el.hasAttribute('data-anim-mouse-dyr') ? -1 : 1

			const animationSpeed = +el.dataset.animMouseA || 50

			// Current position values

			let positionX = 0
			let positionY = 0

			let coordXPercent = 0
			let coordYPercent = 0

			// --------------------------------------------------
			// Animation loop
			// --------------------------------------------------

			const setParallaxStyle = () => {
				// Calculate distance to target
				const distX = coordXPercent - positionX
				const distY = coordYPercent - positionY

				// Smooth interpolation
				positionX += (distX * animationSpeed) / 1000
				positionY += (distY * animationSpeed) / 1000

				// Apply transform
				el.style.transform = `
					translate3d(
						${(directionX * positionX) / (coefficientX / 10)}%,
						${(directionY * positionY) / (coefficientY / 10)}%,
						0
					)
					rotate(0.02deg)
				`

				// Continue animation
				requestAnimationFrame(setParallaxStyle)
			}

			setParallaxStyle()

			// --------------------------------------------------
			// Mouse movement listener
			// --------------------------------------------------

			const mouseMove = (target = window) => {
				target.addEventListener('mousemove', e => {
					// Get element position
					const offsetTop = el.getBoundingClientRect().top + window.scrollY

					// Only animate if element is in viewport
					if (
						offsetTop >= window.scrollY ||
						offsetTop + el.offsetHeight >= window.scrollY
					) {
						// Window size
						const width = window.innerWidth
						const height = window.innerHeight

						// Calculate cursor position relative to center
						const coordX = e.clientX - width / 2
						const coordY = e.clientY - height / 2

						// Convert to percentages
						coordXPercent = (coordX / width) * 100
						coordYPercent = (coordY / height) * 100
					}
				})
			}

			mouseMove(wrapper || window)
		})
	}
}

// =============================================================
// Initialization
// =============================================================

/*
Only initialize the parallax if the page contains
at least one element with:

	data-anim-mouse
*/

if (document.querySelector('[data-anim-mouse]')) {
	window.addEventListener('load', () => {
		new MousePRLX()
	})
}
