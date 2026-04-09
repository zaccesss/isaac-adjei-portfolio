//Full Documentation: https://animmaster.github.io/docs/beforeater.html

/*
========================================================
ANIM BEFORE / AFTER IMAGE COMPARISON MODULE
========================================================

Required attribute

data-anim-beforeafter
Main container


Required inner elements

data-anim-beforeafter-before
Before image

data-anim-beforeafter-after
After image

data-anim-beforeafter-arrow
Drag handle


Example HTML

<div data-anim-beforeafter>

	<div data-anim-beforeafter-before>
		<img src="before.jpg" alt="">
	</div>

	<div data-anim-beforeafter-after>
		<img src="after.jpg" alt="">
	</div>

	<div data-anim-beforeafter-arrow></div>

</div>


How it works

1. User drags the arrow
2. Script calculates cursor position
3. After image width updates
4. Arrow position updates
5. Works with mouse and touch


Features

✔ drag comparison
✔ mobile touch support
✔ hover direction feedback
✔ smooth clipping
✔ zero dependencies

========================================================
*/

// Import functionality
import { isMobile, ANIM } from '@js/common/functions.js'

// Import styles
import './beforeafter.scss'

class BeforeAfter {
	constructor(props) {
		const defaultConfig = {
			init: true,
			logging: true,
		}

		this.config = Object.assign(defaultConfig, props)

		if (!this.config.init) return

		const beforeAfterItems = document.querySelectorAll(
			'[data-anim-beforeafter]',
		)

		if (beforeAfterItems.length) {
			this.setLogging(`Woke up, I see elements: ${beforeAfterItems.length}`)

			this.beforeAfterInit(beforeAfterItems)
		} else {
			this.setLogging(`Woke up, I don’t see any elements`)
		}
	}

	/* ------------------------------------------------
	Init items
	------------------------------------------------ */

	beforeAfterInit(beforeAfterItems) {
		beforeAfterItems.forEach(beforeAfter => {
			if (!beforeAfter) return

			this.beforeAfterClasses(beforeAfter)

			this.beforeAfterItemInit(beforeAfter)
		})
	}

	/* ------------------------------------------------
	Hover direction classes
	------------------------------------------------ */

	beforeAfterClasses(beforeAfter) {
		beforeAfter.addEventListener('mouseover', function (e) {
			const targetElement = e.target

			if (!targetElement.hasAttribute('data-anim-beforeafter-arrow')) {
				if (targetElement.closest('[data-anim-beforeafter-before]')) {
					beforeAfter.classList.remove('-right')

					beforeAfter.classList.add('-left')
				} else {
					beforeAfter.classList.add('-right')

					beforeAfter.classList.remove('-left')
				}
			}
		})

		beforeAfter.addEventListener('mouseleave', function () {
			beforeAfter.classList.remove('-left')

			beforeAfter.classList.remove('-right')
		})
	}

	/* ------------------------------------------------
	Init drag functionality
	------------------------------------------------ */

	beforeAfterItemInit(beforeAfter) {
		const beforeAfterArrow = beforeAfter.querySelector(
			'[data-anim-beforeafter-arrow]',
		)

		const afterItem = beforeAfter.querySelector('[data-anim-beforeafter-after]')

		const beforeAfterArrowWidth = parseFloat(
			window.getComputedStyle(beforeAfterArrow).getPropertyValue('width'),
		)

		let beforeAfterSizes = {}

		if (beforeAfterArrow) {
			if (isMobile.any()) {
				beforeAfterArrow.addEventListener('touchstart', beforeAfterDrag)
			} else {
				beforeAfterArrow.addEventListener('mousedown', beforeAfterDrag)
			}
		}

		/* --------------------------------------------
		Start drag
		-------------------------------------------- */

		function beforeAfterDrag(e) {
			beforeAfterSizes = {
				width: beforeAfter.offsetWidth,

				left: beforeAfter.getBoundingClientRect().left - scrollX,
			}

			if (isMobile.any()) {
				document.addEventListener('touchmove', beforeAfterArrowMove)

				document.addEventListener(
					'touchend',
					function () {
						document.removeEventListener('touchmove', beforeAfterArrowMove)
					},
					{ once: true },
				)
			} else {
				document.addEventListener('mousemove', beforeAfterArrowMove)

				document.addEventListener(
					'mouseup',
					function () {
						document.removeEventListener('mousemove', beforeAfterArrowMove)
					},
					{ once: true },
				)
			}

			document.addEventListener(
				'dragstart',
				function (e) {
					e.preventDefault()
				},
				{ once: true },
			)
		}

		/* --------------------------------------------
		Drag move
		-------------------------------------------- */

		function beforeAfterArrowMove(e) {
			const posLeft =
				e.type === 'touchmove'
					? e.touches[0].clientX - beforeAfterSizes.left
					: e.clientX - beforeAfterSizes.left

			if (posLeft <= beforeAfterSizes.width && posLeft > 0) {
				const way = (posLeft / beforeAfterSizes.width) * 100

				beforeAfterArrow.style.cssText = `left:calc(${way}% - ${beforeAfterArrowWidth}px)`

				afterItem.style.cssText = `width: ${100 - way}%`
			} else if (posLeft >= beforeAfterSizes.width) {
				beforeAfterArrow.style.cssText = `left: calc(100% - ${beforeAfterArrowWidth}px)`

				afterItem.style.cssText = `width: 0%`
			} else if (posLeft <= 0) {
				beforeAfterArrow.style.cssText = `left: 0%`

				afterItem.style.cssText = `width: 100%`
			}
		}
	}

	/* ------------------------------------------------
	Console logging
	------------------------------------------------ */

	setLogging(message) {
		if (this.config.logging) {
			ANIM(`[BeforeAfter]: ${message}`)
		}
	}
}

// Run module
new BeforeAfter({})
