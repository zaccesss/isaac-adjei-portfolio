//Full Documentation: https://animmaster.github.io/docs/tabs.html

/*
========================================================
ANIM TABS MODULE
========================================================

Flexible tab system with animation, hash navigation
and responsive accordion mode.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div data-anim-tabs>

	<div data-anim-tabs-titles>

		<button>Tab 1</button>
		<button>Tab 2</button>

	</div>

	<div data-anim-tabs-body>

		<div>Content 1</div>
		<div>Content 2</div>

	</div>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-tabs
tabs wrapper


data-anim-tabs-animate="500"
enable slide animation


data-anim-tabs-hash
enable hash navigation


data-anim-tabs="768,max"
responsive accordion mode



--------------------------------------------------------
CLASSES ADDED
--------------------------------------------------------

--tab-init
tabs initialized


--tab-active
active tab


--tab-spoller
accordion mode



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ tab navigation
✔ animated switching
✔ hash navigation
✔ responsive accordion mode
✔ lightweight


========================================================
*/

// Import functionality
import {
	ANIM,
	slideUp,
	slideDown,
	dataMediaQueries,
	getHash,
	setHash,
} from '@js/common/functions.js'

// Styles
import './tabs.scss'

export function tabs() {
	const tabs = document.querySelectorAll('[data-anim-tabs]')
	let tabsActiveHash = []

	if (!tabs.length) return

	const hash = getHash()

	ANIM('_ANIM_TABS_START', tabs.length)

	if (hash && hash.startsWith('tab-')) {
		tabsActiveHash = hash.replace('tab-', '').split('-')
	}

	tabs.forEach((tabsBlock, index) => {
		tabsBlock.classList.add('--tab-init')

		tabsBlock.setAttribute('data-anim-tabs-index', index)

		tabsBlock.addEventListener('click', setTabsAction)

		initTabs(tabsBlock)
	})

	/* ----------------------------------------
	Responsive accordion
	---------------------------------------- */

	const mdQueriesArray = dataMediaQueries(tabs, 'animTabs')

	if (mdQueriesArray && mdQueriesArray.length) {
		mdQueriesArray.forEach(mdQueriesItem => {
			mdQueriesItem.matchMedia.addEventListener('change', () => {
				setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
			})

			setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
		})
	}

	/* ----------------------------------------
	Move titles for accordion
	---------------------------------------- */

	function setTitlePosition(tabsMediaArray, matchMedia) {
		tabsMediaArray.forEach(tabsMediaItem => {
			tabsMediaItem = tabsMediaItem.item

			const tabsTitles = tabsMediaItem.querySelector('[data-anim-tabs-titles]')

			const tabsTitleItems = tabsMediaItem.querySelectorAll(
				'[data-anim-tabs-title]',
			)

			const tabsContent = tabsMediaItem.querySelector('[data-anim-tabs-body]')

			const tabsContentItems = tabsMediaItem.querySelectorAll(
				'[data-anim-tabs-item]',
			)

			tabsContentItems.forEach((tabsContentItem, index) => {
				if (matchMedia.matches) {
					tabsContent.append(tabsTitleItems[index])
					tabsContent.append(tabsContentItem)

					tabsMediaItem.classList.add('--tab-spoller')
				} else {
					tabsTitles.append(tabsTitleItems[index])

					tabsMediaItem.classList.remove('--tab-spoller')
				}
			})
		})
	}

	/* ----------------------------------------
	Init tabs
	---------------------------------------- */

	function initTabs(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll('[data-anim-tabs-titles]>*')

		let tabsContent = tabsBlock.querySelectorAll('[data-anim-tabs-body]>*')

		const tabsBlockIndex = tabsBlock.dataset.animTabsIndex

		const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex

		if (tabsContent.length) {
			tabsContent.forEach((tabsContentItem, index) => {
				tabsTitles[index].setAttribute('data-anim-tabs-title', '')
				tabsContentItem.setAttribute('data-anim-tabs-item', '')

				if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
					tabsTitles[index].classList.add('--tab-active')
				}

				tabsContentItem.hidden =
					!tabsTitles[index].classList.contains('--tab-active')
			})
		}
	}

	/* ----------------------------------------
	Update tab state
	---------------------------------------- */

	function setTabsStatus(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll('[data-anim-tabs-title]')

		let tabsContent = tabsBlock.querySelectorAll('[data-anim-tabs-item]')

		const tabsBlockIndex = tabsBlock.dataset.animTabsIndex

		const tabsBlockAnimate = tabsBlock.dataset.animTabsAnimate || false

		const isHash = tabsBlock.hasAttribute('data-anim-tabs-hash')

		tabsContent.forEach((tabsContentItem, index) => {
			if (tabsTitles[index].classList.contains('--tab-active')) {
				if (tabsBlockAnimate) {
					slideDown(tabsContentItem, tabsBlockAnimate)
				} else {
					tabsContentItem.hidden = false
				}

				if (isHash && !tabsContentItem.closest('.popup')) {
					setHash(`tab-${tabsBlockIndex}-${index}`)
				}
			} else {
				if (tabsBlockAnimate) {
					slideUp(tabsContentItem, tabsBlockAnimate)
				} else {
					tabsContentItem.hidden = true
				}
			}
		})
	}

	/* ----------------------------------------
	Click action
	---------------------------------------- */

	function setTabsAction(e) {
		const el = e.target

		if (!el.closest('[data-anim-tabs-title]')) return

		const tabTitle = el.closest('[data-anim-tabs-title]')

		const tabsBlock = tabTitle.closest('[data-anim-tabs]')

		if (
			!tabTitle.classList.contains('--tab-active') &&
			!tabsBlock.querySelector('.--slide')
		) {
			const tabActiveTitle = tabsBlock.querySelector(
				'[data-anim-tabs-title].--tab-active',
			)

			if (tabActiveTitle) {
				tabActiveTitle.classList.remove('--tab-active')
			}

			tabTitle.classList.add('--tab-active')

			setTabsStatus(tabsBlock)
		}

		e.preventDefault()
	}
}

/* ----------------------------------------
Auto init
---------------------------------------- */

window.addEventListener('load', tabs)
