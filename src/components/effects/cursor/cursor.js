//Full Documentation: https://animmaster.github.io/docs/cursor.html

/*
==================================================
ANIM CUSTOM CURSOR MODULE
==================================================

Required HTML attribute

data-anim-cursor
Wrapper element where the custom cursor will be injected


Optional attributes

data-anim-cursor-shadow
Adds a delayed shadow cursor element


Example HTML

<body data-anim-cursor>

JS automatically creates:

.anim-cursor
.anim-cursor__pointer
.anim-cursor__shadow (optional)


Cursor states

.--hover
Active when hovering interactive elements

.--active
Active when mouse is pressed


Disabled automatically on mobile devices
(using isMobile.any())


==================================================
*/

// Connecting functionality
import { ANIM, isMobile } from '@js/common/functions.js'

// Base styles
import './cursor.scss'

export function customCursor() {
	// Wrapper element where cursor will be mounted
	const wrapper = document.querySelector('[data-anim-cursor]')

	// Do not run cursor on mobile devices
	if (wrapper && !isMobile.any()) {
		// Check if shadow cursor is enabled
		const isShadowTrue = document.querySelector('[data-anim-cursor-shadow]')

		/* ------------------------------------------------
		Create cursor element
		------------------------------------------------ */

		const cursor = document.createElement('div')
		cursor.classList.add('anim-cursor')

		// Hide cursor until first mouse move
		cursor.style.opacity = 0

		// Create pointer element
		cursor.insertAdjacentHTML(
			'beforeend',
			`<span class="anim-cursor__pointer"></span>`,
		)

		// Create optional shadow cursor
		if (isShadowTrue) {
			cursor.insertAdjacentHTML(
				'beforeend',
				`<span class="anim-cursor__shadow"></span>`,
			)
		}

		// Append cursor to wrapper
		wrapper.append(cursor)

		/* ------------------------------------------------
		Get cursor elements
		------------------------------------------------ */

		const cursorPointer = document.querySelector('.anim-cursor__pointer')

		// Store pointer size for centering cursor
		const cursorPointerStyle = {
			width: cursorPointer.offsetWidth,
			height: cursorPointer.offsetHeight,
		}

		let cursorShadow, cursorShadowStyle

		// Shadow cursor setup
		if (isShadowTrue) {
			cursorShadow = document.querySelector('.anim-cursor__shadow')

			cursorShadowStyle = {
				width: cursorShadow.offsetWidth,
				height: cursorShadow.offsetHeight,
			}
		}

		/* ------------------------------------------------
		Main cursor movement + state logic
		------------------------------------------------ */

		function mouseActions(e) {
			// Hide cursor when leaving window
			if (e.type === 'mouseout') {
				cursor.style.opacity = 0
			}

			// Show cursor and detect hover states
			else if (e.type === 'mousemove') {
				cursor.style.removeProperty('opacity')

				// Detect interactive elements
				if (
					e.target.closest('button') ||
					e.target.closest('a') ||
					e.target.closest('input') ||
					(window.getComputedStyle(e.target).cursor !== 'none' &&
						window.getComputedStyle(e.target).cursor !== 'default')
				) {
					cursor.classList.add('--hover')
				} else {
					cursor.classList.remove('--hover')
				}
			}

			// Mouse press
			else if (e.type === 'mousedown') {
				cursor.classList.add('--active')
			}

			// Mouse release
			else if (e.type === 'mouseup') {
				cursor.classList.remove('--active')
			}

			/* ------------------------------------------------
			Update pointer position
			------------------------------------------------ */

			if (cursorPointer) {
				cursorPointer.style.transform = `translate3d(
					${e.clientX - cursorPointerStyle.width / 2}px,
					${e.clientY - cursorPointerStyle.height / 2}px,
					0
				)`
			}

			/* ------------------------------------------------
			Update shadow position (if enabled)
			------------------------------------------------ */

			if (cursorShadow) {
				cursorShadow.style.transform = `translate3d(
					${e.clientX - cursorShadowStyle.width / 2}px,
					${e.clientY - cursorShadowStyle.height / 2}px,
					0
				)`
			}
		}

		/* ------------------------------------------------
		Event listeners
		------------------------------------------------ */

		wrapper.addEventListener('mouseup', mouseActions)
		wrapper.addEventListener('mousedown', mouseActions)
		wrapper.addEventListener('mousemove', mouseActions)
		wrapper.addEventListener('mouseout', mouseActions)
	}
}

/*
------------------------------------------------
Auto initialize cursor
------------------------------------------------
*/

document.querySelector('[data-anim-cursor]')
	? window.addEventListener('load', customCursor)
	: null
