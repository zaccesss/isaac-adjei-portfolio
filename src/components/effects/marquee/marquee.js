//Full Documentation: https://animmaster.github.io/docs/marquee.html

/*
========================================================
ANIM MARQUEE MODULE
========================================================

Required attribute

data-anim-marquee
Enables marquee animation on container


Optional attributes

data-anim-marquee-speed="100"
Animation speed (default = 100)

data-anim-marquee-space="30"
Space between items

data-anim-marquee-direction="left | right | top | bottom"
Animation direction

data-anim-marquee-start="0"
Start position offset (percent)

data-anim-marquee-pause
Pause animation on mouse hover


Internal attributes (generated automatically)

data-anim-marquee-wrapper
data-anim-marquee-inner
data-anim-marquee-item


Example HTML

<div data-anim-marquee data-anim-marquee-speed="80">
	<div>Item 1</div>
	<div>Item 2</div>
	<div>Item 3</div>
</div>

========================================================
*/

// Connecting functionality
import { ANIM } from '@js/common/functions.js'

import './marquee.scss'

const marquee = () => {
	/* ------------------------------------------------
	Get all marquee elements
	------------------------------------------------ */

	const $marqueeArray = document.querySelectorAll('[data-anim-marquee]')

	if (!$marqueeArray.length) return

	const { head } = document

	/* ------------------------------------------------
	Attribute names
	------------------------------------------------ */

	const ATTR_NAMES = {
		wrapper: 'data-anim-marquee-wrapper',
		inner: 'data-anim-marquee-inner',
		item: 'data-anim-marquee-item',
	}

	/* ------------------------------------------------
	Debounce helper
	Used to optimize resize events
	------------------------------------------------ */

	const debounce = (delay, fn) => {
		let timerId

		return (...args) => {
			if (timerId) clearTimeout(timerId)

			timerId = setTimeout(() => {
				fn(...args)
				timerId = null
			}, delay)
		}
	}

	/* ------------------------------------------------
	Run callback only when window WIDTH changes
	------------------------------------------------ */

	const onWindowWidthResize = cb => {
		let prevWidth = 0

		const handleResize = () => {
			const currentWidth = window.innerWidth

			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth
				cb()
			}
		}

		window.addEventListener('resize', debounce(50, handleResize))

		handleResize()
	}

	/* ------------------------------------------------
	Build marquee HTML structure
	Wrap children into inner container
	------------------------------------------------ */

	const buildMarquee = marqueeNode => {
		const $marquee = marqueeNode

		const $childElements = $marquee.children

		if (!$childElements.length) return

		Array.from($childElements).forEach($childItem =>
			$childItem.setAttribute(ATTR_NAMES.item, ''),
		)

		const htmlStructure = `<div ${ATTR_NAMES.inner}>${$marquee.innerHTML}</div>`

		$marquee.innerHTML = htmlStructure
	}

	/* ------------------------------------------------
	Get element size
	------------------------------------------------ */

	const getElSize = ($el, isVertical) => {
		return isVertical ? $el.offsetHeight : $el.offsetWidth
	}

	/* ------------------------------------------------
	Main marquee logic
	------------------------------------------------ */

	$marqueeArray.forEach($wrapper => {
		if (!$wrapper) return

		buildMarquee($wrapper)

		const $marqueeInner = $wrapper.firstElementChild

		if (!$marqueeInner) return

		let cacheArray = []

		const dataMarqueeSpace = parseFloat(
			$wrapper.getAttribute('data-anim-marquee-space'),
		)

		const $items = $wrapper.querySelectorAll(`[${ATTR_NAMES.item}]`)

		const speed =
			parseFloat($wrapper.getAttribute('data-anim-marquee-speed')) / 10 || 100

		const isMousePaused = $wrapper.hasAttribute('data-anim-marquee-pause')

		const direction = $wrapper.getAttribute('data-anim-marquee-direction')

		const isVertical = direction === 'bottom' || direction === 'top'

		const animName = `marqueeAnimation-${Math.floor(Math.random() * 10000000)}`

		let spaceBetweenItem = parseFloat(
			window.getComputedStyle($items[0])?.getPropertyValue('margin-right'),
		)

		let spaceBetween = spaceBetweenItem
			? spaceBetweenItem
			: !isNaN(dataMarqueeSpace)
				? dataMarqueeSpace
				: 30

		let startPosition =
			parseFloat($wrapper.getAttribute('data-anim-marquee-start')) || 0

		let sumSize = 0
		let firstScreenVisibleSize = 0
		let initialSizeElements = 0
		let initialElementsLength = $marqueeInner.children.length

		let index = 0
		let counterDuplicateElements = 0

		/* ------------------------------------------------
		Event initialization
		------------------------------------------------ */

		const initEvents = () => {
			if (startPosition) {
				$marqueeInner.addEventListener(
					'animationiteration',
					onChangeStartPosition,
				)
			}

			if (!isMousePaused) return

			$marqueeInner.addEventListener('mouseenter', onChangePaused)
			$marqueeInner.addEventListener('mouseleave', onChangePaused)
		}

		/* ------------------------------------------------
		Reset start position after first loop
		------------------------------------------------ */

		const onChangeStartPosition = () => {
			startPosition = 0

			$marqueeInner.removeEventListener(
				'animationiteration',
				onChangeStartPosition,
			)

			onResize()
		}

		/* ------------------------------------------------
		Set base flex styles
		------------------------------------------------ */

		const setBaseStyles = firstScreenVisibleSize => {
			let baseStyle = 'display:flex;flex-wrap:nowrap;'

			if (isVertical) {
				baseStyle += `
					flex-direction:column;
					position:relative;
					will-change:transform;
				`

				if (direction === 'bottom') {
					baseStyle += `top:-${firstScreenVisibleSize}px;`
				}
			} else {
				baseStyle += `
					position:relative;
					will-change:transform;
				`

				if (direction === 'right') {
					baseStyle += `inset-inline-start:-${firstScreenVisibleSize}px;`
				}
			}

			$marqueeInner.style.cssText = baseStyle
		}

		/* ------------------------------------------------
		Animation direction
		------------------------------------------------ */

		const setdirectionAnim = totalWidth => {
			switch (direction) {
				case 'right':
				case 'bottom':
					return totalWidth

				default:
					return -totalWidth
			}
		}

		/* ------------------------------------------------
		Create animation
		------------------------------------------------ */

		const animation = () => {
			const keyFrameCss = `
				@keyframes ${animName} {

					0% {
						transform:translate${isVertical ? 'Y' : 'X'}(${startPosition}%);
					}

					100% {
						transform:translate${isVertical ? 'Y' : 'X'}(${setdirectionAnim(firstScreenVisibleSize)}px);
					}

				}
			`

			const $style = document.createElement('style')

			$style.classList.add(animName)

			$style.innerHTML = keyFrameCss

			head.append($style)

			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed}s infinite linear`
		}

		/* ------------------------------------------------
		Duplicate elements to create infinite scroll
		------------------------------------------------ */

		const addDublicateElements = () => {
			sumSize =
				firstScreenVisibleSize =
				initialSizeElements =
				counterDuplicateElements =
				index =
					0

			const parentSize = getElSize($wrapper, isVertical)

			let children = Array.from($marqueeInner.children)

			if (!cacheArray.length) {
				cacheArray = children.map(el => el)
			} else {
				children = [...cacheArray]
			}

			$marqueeInner.innerHTML = ''

			children.forEach(el => $marqueeInner.append(el))

			children.forEach(el => {
				if (isVertical) {
					el.style.marginBottom = `${spaceBetween}px`
				} else {
					el.style.marginRight = `${spaceBetween}px`
					el.style.flexShrink = 0
				}

				const size = getElSize(el, isVertical)

				sumSize += size + spaceBetween
				firstScreenVisibleSize += size + spaceBetween
				initialSizeElements += size + spaceBetween
				counterDuplicateElements++
			})

			const multiplyWidth = parentSize * 2 + initialSizeElements

			for (; sumSize < multiplyWidth; index++) {
				if (!children[index]) index = 0

				const clone = children[index].cloneNode(true)

				const last = $marqueeInner.children[index]

				$marqueeInner.append(clone)

				sumSize += getElSize(last, isVertical) + spaceBetween

				if (
					firstScreenVisibleSize < parentSize ||
					counterDuplicateElements % initialElementsLength !== 0
				) {
					counterDuplicateElements++

					firstScreenVisibleSize += getElSize(last, isVertical) + spaceBetween
				}
			}

			setBaseStyles(firstScreenVisibleSize)
		}

		/* ------------------------------------------------
		Init marquee
		------------------------------------------------ */

		const init = () => {
			addDublicateElements()

			animation()

			initEvents()
		}

		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove()

			init()
		}

		/* ------------------------------------------------
		Pause on hover
		------------------------------------------------ */

		const onChangePaused = e => {
			const { type, target } = e

			target.style.animationPlayState =
				type === 'mouseenter' ? 'paused' : 'running'
		}

		onWindowWidthResize(onResize)
	})
}

marquee()
