//Full Documentation: https://animmaster.github.io/docs/spoller.html

/*
========================================================
ANIM SPOLLERS MODULE
========================================================

Flexible accordion / FAQ system.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------
STRUCTURE default
<div class="spollers" data-anim-spollers >
	<details class="spollers__item">
		<summary class="spollers__title">Spoiler title</summary>
		<div class="spollers__body">Spoiler content</div>
	</details>
</div>

STRUCTURE for responsive spollers , they will work only on device whidth < 768 , you can also put like this data-anim-spollers="768, min"
<div class="spollers" data-anim-spollers="768, max">
	<details class="spollers__item">
		<summary class="spollers__title">Spoiler title</summary>
		<div class="spollers__body">Spoiler content</div>
	</details>
</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-spollers
accordion wrapper


data-anim-spollers="768,max"
responsive mode max or min for showing spollers


data-anim-spollers-one
only one item open


data-anim-spollers-speed="500"
animation speed


data-anim-spollers-open
default open item


data-anim-spollers-scroll
scroll to item on open


data-anim-spollers-scroll="100"
scroll offset


data-anim-spollers-scroll-noheader
subtract header height



--------------------------------------------------------
CLASSES ADDED
--------------------------------------------------------

--spoller-init
module initialized


--spoller-active
active title



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ native details
✔ animated accordion
✔ responsive activation
✔ single-open mode
✔ smooth scrolling
✔ close outside


========================================================
*/

// Import functionality
import {
	ANIM,
	slideUp,
	slideDown,
	slideToggle,
	dataMediaQueries,
} from '@js/common/functions.js'

// Import base styles
import './spollers.scss'

export function spollers() {
	const spollersArray = document.querySelectorAll('[data-anim-spollers]')
	if (spollersArray.length > 0) {
		ANIM(`_ANIM_SPOLLERS_START`, spollersArray.length)

		// Click event
		document.addEventListener('click', setSpollerAction)

		// Get regular spollers
		const spollersRegular = Array.from(spollersArray).filter(
			function (item, index, self) {
				return !item.dataset.animSpollers.split(',')[0]
			},
		)

		// Initialize regular spollers
		if (spollersRegular.length) {
			initSpollers(spollersRegular)
		}

		// Get spollers with media queries
		let mdQueriesArray = dataMediaQueries(spollersArray, 'animSpollers')
		if (mdQueriesArray && mdQueriesArray.length) {
			mdQueriesArray.forEach(mdQueriesItem => {
				// Event
				mdQueriesItem.matchMedia.addEventListener('change', function () {
					initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
				})
				initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
			})
		}

		// Initialization
		function initSpollers(spollersArray, matchMedia = false) {
			spollersArray.forEach(spollersBlock => {
				spollersBlock = matchMedia ? spollersBlock.item : spollersBlock
				if (matchMedia.matches || !matchMedia) {
					spollersBlock.classList.add('--spoller-init')
					initSpollerBody(spollersBlock)
				} else {
					spollersBlock.classList.remove('--spoller-init')
					initSpollerBody(spollersBlock, false)
				}
			})
		}

		// Content handling
		function initSpollerBody(spollersBlock, hideSpollerBody = true) {
			let spollerItems = spollersBlock.querySelectorAll('details')
			if (spollerItems.length) {
				//spollerItems = Array.from(spollerItems).filter(item => item.closest('[data-spollers]') === spollersBlock);
				spollerItems.forEach(spollerItem => {
					let spollerTitle = spollerItem.querySelector('summary')
					if (hideSpollerBody) {
						spollerTitle.removeAttribute('tabindex')
						if (!spollerItem.hasAttribute('data-anim-spollers-open')) {
							spollerItem.open = false
							spollerTitle.nextElementSibling.hidden = true
						} else {
							spollerTitle.classList.add('--spoller-active')
							spollerItem.open = true
						}
					} else {
						spollerTitle.setAttribute('tabindex', '-1')
						spollerTitle.classList.remove('--spoller-active')
						spollerItem.open = true
						spollerTitle.nextElementSibling.hidden = false
					}
				})
			}
		}

		function setSpollerAction(e) {
			const el = e.target
			if (el.closest('summary') && el.closest('[data-anim-spollers]')) {
				e.preventDefault()
				if (
					el
						.closest('[data-anim-spollers]')
						.classList.contains('--spoller-init')
				) {
					const spollerTitle = el.closest('summary')
					const spollerBlock = spollerTitle.closest('details')
					const spollersBlock = spollerTitle.closest('[data-anim-spollers]')
					const oneSpoller = spollersBlock.hasAttribute(
						'data-anim-spollers-one',
					)
					const scrollSpoller = spollerBlock.hasAttribute(
						'data-anim-spollers-scroll',
					)
					const spollerSpeed = spollersBlock.dataset.animSpollersSpeed
						? parseInt(spollersBlock.dataset.animSpollersSpeed)
						: 500

					if (!spollersBlock.querySelectorAll('.--slide').length) {
						if (oneSpoller && !spollerBlock.open) {
							hideSpollersBody(spollersBlock)
						}

						!spollerBlock.open
							? (spollerBlock.open = true)
							: setTimeout(() => {
									spollerBlock.open = false
								}, spollerSpeed)

						spollerTitle.classList.toggle('--spoller-active')
						slideToggle(spollerTitle.nextElementSibling, spollerSpeed)

						if (
							scrollSpoller &&
							spollerTitle.classList.contains('--spoller-active')
						) {
							const scrollSpollerValue = spollerBlock.dataset.animSpollersScroll
							const scrollSpollerOffset = +scrollSpollerValue
								? +scrollSpollerValue
								: 0
							const scrollSpollerNoHeader = spollerBlock.hasAttribute(
								'data-anim-spollers-scroll-noheader',
							)
								? document.querySelector('.header').offsetHeight
								: 0

							//setTimeout(() => {
							window.scrollTo({
								top:
									spollerBlock.offsetTop -
									(scrollSpollerOffset + scrollSpollerNoHeader),
								behavior: 'smooth',
							})
							//}, spollerSpeed);
						}
					}
				}
			}

			// Close on click outside the spoller
			if (!el.closest('[data-anim-spollers]')) {
				const spollersClose = document.querySelectorAll(
					'[data-anim-spollers-close]',
				)
				if (spollersClose.length) {
					spollersClose.forEach(spollerClose => {
						const spollersBlock = spollerClose.closest('[data-anim-spollers]')
						const spollerCloseBlock = spollerClose.parentNode
						if (spollersBlock.classList.contains('--spoller-init')) {
							const spollerSpeed = spollersBlock.dataset.animSpollersSpeed
								? parseInt(spollersBlock.dataset.animSpollersSpeed)
								: 500
							spollerClose.classList.remove('--spoller-active')
							slideUp(spollerClose.nextElementSibling, spollerSpeed)
							setTimeout(() => {
								spollerCloseBlock.open = false
							}, spollerSpeed)
						}
					})
				}
			}
		}

		function hideSpollersBody(spollersBlock) {
			const spollerActiveBlock = spollersBlock.querySelector('details[open]')
			if (
				spollerActiveBlock &&
				!spollersBlock.querySelectorAll('.--slide').length
			) {
				const spollerActiveTitle = spollerActiveBlock.querySelector('summary')
				const spollerSpeed = spollersBlock.dataset.animSpollersSpeed
					? parseInt(spollersBlock.dataset.animSpollersSpeed)
					: 500
				spollerActiveTitle.classList.remove('--spoller-active')
				slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed)
				setTimeout(() => {
					spollerActiveBlock.open = false
				}, spollerSpeed)
			}
		}
	}
}

window.addEventListener('load', spollers)
