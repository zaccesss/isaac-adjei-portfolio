//Full Documentation: https://animmaster.github.io/docs/scroll.html

/*
========================================================
ANIM SCROLL TO / PAGE NAVIGATION MODULE
========================================================

Required attribute

data-anim-scrollto=".selector"
Defines which block to scroll to


Optional attributes

data-anim-scrollto-header
Compensates header height (use if header is fixed)


data-anim-scrollto-speed="800"
Scroll animation duration (ms)


data-anim-scrollto-top="100"
Additional offset from top


Navigation highlight system

To enable auto active menu item,
target section must have:

data-anim-watcher="navigator"


Example HTML

Navigation

<a data-anim-scrollto="#about">About</a>
<a data-anim-scrollto="#services">Services</a>


Section

<section id="about" data-anim-watcher="navigator"></section>


How it works

1. Click navigation link
2. Script scrolls to target block
3. Optional header offset applied
4. Optional custom speed applied
5. Active menu item updates during scroll

========================================================
*/

// Connecting functionality
import {
	isMobile,
	gotoBlock,
	getHash,
	ANIM,
	bodyUnlock,
} from '@js/common/functions.js'

// Smooth page navigation
export function pageNavigation() {
	/* ------------------------------------------------
	Global listeners
	------------------------------------------------ */

	document.addEventListener('click', pageNavigationAction)

	document.addEventListener('watcherCallback', pageNavigationAction)

	/* ------------------------------------------------
	Main navigation handler
	------------------------------------------------ */

	function pageNavigationAction(e) {
		/* --------------------------------------------
		Click navigation
		-------------------------------------------- */

		if (e.type === 'click') {
			const targetElement = e.target

			if (targetElement.closest('[data-anim-scrollto]')) {
				const gotoLink = targetElement.closest('[data-anim-scrollto]')

				const gotoLinkSelector = gotoLink.dataset.animScrollto
					? gotoLink.dataset.animScrollto
					: ''

				const noHeader = gotoLink.hasAttribute('data-anim-scrollto-header')

				const gotoSpeed = gotoLink.dataset.animScrolltoSpeed
					? gotoLink.dataset.animScrolltoSpeed
					: 500

				const offsetTop = gotoLink.dataset.animScrolltoTop
					? parseInt(gotoLink.dataset.animScrolltoTop)
					: 0

				/* ----------------------------------------
				Fullpage integration
				---------------------------------------- */

				if (window.fullpage) {
					const fullpageSection = document
						.querySelector(`${gotoLinkSelector}`)
						.closest('[data-anim-fullpage-section]')

					const fullpageSectionId = fullpageSection
						? +fullpageSection.dataset.animFullpageId
						: null

					if (fullpageSectionId !== null) {
						window.fullpage.switchingSection(fullpageSectionId)

						// Close mobile menu if open
						if (document.documentElement.hasAttribute('data-anim-menu-open')) {
							bodyUnlock()

							document.documentElement.removeAttribute('data-anim-menu-open')
						}
					}
				} else {
					/* ----------------------------------------
				Normal scroll
				---------------------------------------- */
					gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop)
				}

				e.preventDefault()
			}
		} else if (e.type === 'watcherCallback' && e.detail) {
			/* --------------------------------------------
		ScrollWatcher active menu logic
		-------------------------------------------- */
			const entry = e.detail.entry

			const targetElement = entry.target

			if (targetElement.dataset.animWatcher === 'navigator') {
				const navigatorActiveItem = document.querySelector(
					`[data-anim-scrollto].--navigator-active`,
				)

				let navigatorCurrentItem

				/* section by id */

				if (
					targetElement.id &&
					document.querySelector(`[data-anim-scrollto="#${targetElement.id}"]`)
				) {
					navigatorCurrentItem = document.querySelector(
						`[data-anim-scrollto="#${targetElement.id}"]`,
					)
				} else if (targetElement.classList.length) {
					/* section by class */
					for (let index = 0; index < targetElement.classList.length; index++) {
						const element = targetElement.classList[index]

						if (document.querySelector(`[data-anim-scrollto=".${element}"]`)) {
							navigatorCurrentItem = document.querySelector(
								`[data-anim-scrollto=".${element}"]`,
							)

							break
						}
					}
				}

				/* ----------------------------------------
				Update active state
				---------------------------------------- */

				if (entry.isIntersecting) {
					navigatorCurrentItem
						? navigatorCurrentItem.classList.add('--navigator-active')
						: null
				} else {
					navigatorCurrentItem
						? navigatorCurrentItem.classList.remove('--navigator-active')
						: null
				}
			}
		}
	}

	/* ------------------------------------------------
	Scroll to hash on page load
	------------------------------------------------ */

	if (getHash()) {
		let goToHash

		if (document.querySelector(`#${getHash()}`)) {
			goToHash = `#${getHash()}`
		} else if (document.querySelector(`.${getHash()}`)) {
			goToHash = `.${getHash()}`
		}

		goToHash ? gotoBlock(goToHash) : null
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-scrollto]')
	? window.addEventListener('load', pageNavigation)
	: null
