//Full Documentation: https://animmaster.github.io/docs/counter.html

/*
========================================================
ANIM DIGITS COUNTER MODULE
========================================================

Required attribute

data-anim-digcounter

Defines a number that will animate from 0 → target value


Optional attributes

data-anim-digcounter-speed="2000"
Animation duration in milliseconds


data-anim-digcounter-format=" "
Number formatting separator


Example HTML

<span
	data-anim-digcounter
	data-anim-digcounter-speed="1500"
	data-anim-digcounter-format=" "
>
2500
</span>


How it works

1. Element enters viewport (ScrollWatcher)
2. Value resets to 0
3. Animation starts
4. Number increases smoothly
5. Animation stops at final value


Features

✔ smooth number animation
✔ viewport trigger
✔ customizable duration
✔ number formatting
✔ lightweight
✔ requestAnimationFrame performance

========================================================
*/

// Import functionality
import { ANIM, getDigFormat } from '@js/common/functions.js'

// Digits counter animation module
export function digitsCounter() {
	/* ------------------------------------------------
	Init counters
	------------------------------------------------ */

	function digitsCountersInit(digitsCountersItems) {
		const digitsCounters = digitsCountersItems
			? digitsCountersItems
			: document.querySelectorAll('[data-anim-digcounter]')

		if (!digitsCounters.length) return

		ANIM('_ANIM_DIGCOUNTER_ANIM')

		digitsCounters.forEach(digitsCounter => {
			/* prevent double animation */

			if (digitsCounter.hasAttribute('data-anim-digcounter-go')) return

			/* mark as active */

			digitsCounter.setAttribute('data-anim-digcounter-go', '')

			/* store original value */

			digitsCounter.dataset.animDigcounter = digitsCounter.innerHTML

			/* reset value */

			digitsCounter.innerHTML = `0`

			/* start animation */

			digitsCountersAnimate(digitsCounter)
		})
	}

	/* ------------------------------------------------
	Counter animation
	------------------------------------------------ */

	function digitsCountersAnimate(digitsCounter) {
		let startTimestamp = null

		const duration = parseFloat(digitsCounter.dataset.animDigcounterSpeed)
			? parseFloat(digitsCounter.dataset.animDigcounterSpeed)
			: 1000

		const startValue = parseFloat(digitsCounter.dataset.animDigcounter)

		const format = digitsCounter.dataset.animDigcounterFormat
			? digitsCounter.dataset.animDigcounterFormat
			: ' '

		const startPosition = 0

		const step = timestamp => {
			if (!startTimestamp) startTimestamp = timestamp

			const progress = Math.min((timestamp - startTimestamp) / duration, 1)

			const value = Math.floor(progress * (startPosition + startValue))

			digitsCounter.innerHTML =
				typeof digitsCounter.dataset.animDigcounterFormat !== 'undefined'
					? getDigFormat(value, format)
					: value

			if (progress < 1) {
				window.requestAnimationFrame(step)
			} else {
				digitsCounter.removeAttribute('data-anim-digcounter-go')
			}
		}

		window.requestAnimationFrame(step)
	}

	/* ------------------------------------------------
	ScrollWatcher integration
	------------------------------------------------ */

	function digitsCounterAction(e) {
		const entry = e.detail.entry

		const targetElement = entry.target

		if (
			targetElement.querySelectorAll('[data-anim-digcounter]').length &&
			!targetElement.querySelectorAll('[data-anim-watcher]').length &&
			entry.isIntersecting
		) {
			digitsCountersInit(
				targetElement.querySelectorAll('[data-anim-digcounter]'),
			)
		}
	}

	document.addEventListener('watcherCallback', digitsCounterAction)
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-digcounter]')
	? window.addEventListener('load', digitsCounter)
	: null
