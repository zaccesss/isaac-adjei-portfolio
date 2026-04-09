//Full Documentation: https://animmaster.github.io/docs/rippledoc.html

/*
========================================================
ANIM RIPPLE EFFECT MODULE
========================================================

Required attribute

data-anim-ripple
Enables ripple effect on element click


Optional attribute

data-anim-ripple="once"
Allows only one ripple element at a time
(previous ripple will be removed before creating new one)


How it works

1. User clicks element
2. Ripple <span> element is created
3. Element is positioned at click coordinates
4. CSS animation runs
5. Ripple element is automatically removed


Example HTML

<button data-anim-ripple>
	Button
</button>


Single ripple mode

<button data-anim-ripple="once">
	Button
</button>

========================================================
*/

// Connecting functionality
import { ANIM } from '@js/common/functions.js'

import './ripple.scss'

export function rippleEffect() {
	/* ------------------------------------------------
	Global click listener
	------------------------------------------------ */

	document.addEventListener('click', function (e) {
		const targetItem = e.target

		const button = targetItem.closest('[data-anim-ripple]')

		if (!button) return

		/* ------------------------------------------------
		Create ripple element
		------------------------------------------------ */

		const ripple = document.createElement('span')

		const diameter = Math.max(button.clientWidth, button.clientHeight)

		const radius = diameter / 2

		/* ------------------------------------------------
		Position ripple at click location
		------------------------------------------------ */

		ripple.style.width = ripple.style.height = `${diameter}px`

		ripple.style.left = `${e.pageX - (button.getBoundingClientRect().left + scrollX) - radius}px`

		ripple.style.top = `${e.pageY - (button.getBoundingClientRect().top + scrollY) - radius}px`

		ripple.classList.add('--ripple')

		/* ------------------------------------------------
		Remove existing ripple (once mode)
		------------------------------------------------ */

		if (button.dataset.animRipple === 'once') {
			const existingRipple = button.querySelector('.--ripple')

			if (existingRipple) {
				existingRipple.remove()
			}
		}

		/* ------------------------------------------------
		Add ripple element
		------------------------------------------------ */

		button.appendChild(ripple)

		/* ------------------------------------------------
		Get animation duration from CSS
		------------------------------------------------ */

		const timeOut = getAnimationDuration(ripple)

		/* ------------------------------------------------
		Remove ripple after animation
		------------------------------------------------ */

		setTimeout(() => {
			ripple.remove()
		}, timeOut)
	})

	/* ------------------------------------------------
	Get animation duration helper
	------------------------------------------------ */

	function getAnimationDuration(el) {
		const aDuration = window.getComputedStyle(el).animationDuration

		return aDuration.includes('ms')
			? parseFloat(aDuration)
			: parseFloat(aDuration) * 1000
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-ripple]')
	? window.addEventListener('load', rippleEffect)
	: null
