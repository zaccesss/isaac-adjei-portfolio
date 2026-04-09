//Full Documentation: https://animmaster.github.io/docs/tippydoc.html

/*
========================================================
ANIM TIPPY TOOLTIP MODULE
========================================================

Dependency

tippy.js
https://atomiks.github.io/tippyjs/


Required attribute

data-anim-tippy-content="Tooltip text"


Example HTML

<div
	class="component-card__type-value"
	data-anim-tippy-content="Only for PRO members"
></div>


How it works

Desktop
	trigger: mouseenter + focus

Mobile / touch devices
	trigger: click


Features

✔ auto mobile detection
✔ click tooltips on mobile
✔ hover tooltips on desktop
✔ only one tooltip open at a time
✔ interactive tooltips
✔ smooth fade animation

========================================================
*/

// Connecting functionality
import { isMobile } from '@js/common/functions.js'

import tippy from 'tippy.js'

import './tippy.scss'

/* ------------------------------------------------
Touch breakpoint
------------------------------------------------ */

const TOUCH_BREAKPOINT = 991.98

/* ------------------------------------------------
Detect touch devices
------------------------------------------------ */

function isTouchDevice() {
	return (
		window.matchMedia('(pointer: coarse)').matches ||
		window.innerWidth <= TOUCH_BREAKPOINT
	)
}

/* ------------------------------------------------
Init tooltips
------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
	const elements = document.querySelectorAll('[data-anim-tippy-content]')

	if (!elements.length) return

	tippy(elements, {
		/* tooltip content */

		content(reference) {
			return reference.getAttribute('data-anim-tippy-content')
		},

		/* append tooltip to body */

		appendTo: document.body,

		/* tooltip position */

		placement: 'bottom',

		/* arrow */

		arrow: true,

		/* animation */

		animation: 'fade',

		/* animation speed */

		duration: [250, 180],

		/* allow interaction */

		interactive: true,

		/* trigger type */

		trigger: isTouchDevice() ? 'click' : 'mouseenter focus',

		/* close on click */

		hideOnClick: true,

		/* close other tooltips */

		onShow(instance) {
			document.querySelectorAll('.tippy-box').forEach(box => {
				if (box !== instance.popper) {
					box._tippy?.hide()
				}
			})
		},
	})
})
