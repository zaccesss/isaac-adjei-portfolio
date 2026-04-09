//Full Documentation: https://animmaster.github.io/docs/showmore.html

/*
========================================================
ANIM SHOWMORE MODULE
========================================================

Expandable content block.

Allows collapsing content by height or by number of items.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div data-anim-showmore>

	<div data-anim-showmore-content>

		content

	</div>

	<button data-anim-showmore-button>
		<span>Show more</span>
		<span>Hide</span>
	</button>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-showmore
showmore wrapper


data-anim-showmore-content
content container


data-anim-showmore-button
toggle button



--------------------------------------------------------
MODES
--------------------------------------------------------

default (size)

data-anim-showmore
data-anim-showmore-content="150"


items mode

data-anim-showmore="items"
data-anim-showmore-content="3"



--------------------------------------------------------
RESPONSIVE
--------------------------------------------------------

data-anim-showmore-media="768,max"

Example:

data-anim-showmore-media="768,max"



--------------------------------------------------------
OPTIONS
--------------------------------------------------------

data-anim-showmore-button="500"

animation speed



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ collapse by height
✔ collapse by items
✔ responsive support
✔ animated expand / collapse
✔ lightweight


========================================================
*/

// Import functionality
import {
	ANIM,
	slideUp,
	slideDown,
	dataMediaQueries,
} from '@js/common/functions.js'

import './showmore.scss'

export function showMore() {
	const showMoreBlocks = document.querySelectorAll('[data-anim-showmore]')

	let showMoreBlocksRegular
	let mdQueriesArray

	if (!showMoreBlocks.length) return

	/* -----------------------------------------
	Regular blocks
	----------------------------------------- */

	showMoreBlocksRegular = Array.from(showMoreBlocks).filter(
		item => !item.dataset.animShowmoreMedia,
	)

	showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null

	document.addEventListener('click', showMoreActions)

	window.addEventListener('resize', showMoreActions)

	/* -----------------------------------------
	Responsive blocks
	----------------------------------------- */

	mdQueriesArray = dataMediaQueries(showMoreBlocks, 'animShowmoreMedia')

	if (mdQueriesArray && mdQueriesArray.length) {
		mdQueriesArray.forEach(mdQueriesItem => {
			mdQueriesItem.matchMedia.addEventListener('change', () => {
				initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
			})
		})

		initItemsMedia(mdQueriesArray)
	}

	function initItemsMedia(mdQueriesArray) {
		mdQueriesArray.forEach(mdQueriesItem => {
			initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia)
		})
	}

	function initItems(showMoreBlocks, matchMedia) {
		showMoreBlocks.forEach(showMoreBlock => {
			initItem(showMoreBlock, matchMedia)
		})
	}

	/* -----------------------------------------
	Init block
	----------------------------------------- */

	function initItem(showMoreBlock, matchMedia = false) {
		showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock

		let showMoreContent = showMoreBlock.querySelector(
			'[data-anim-showmore-content]',
		)

		let showMoreButton = showMoreBlock.querySelector(
			'[data-anim-showmore-button]',
		)

		const hiddenHeight = getHeight(showMoreBlock, showMoreContent)

		if (matchMedia.matches || !matchMedia) {
			if (hiddenHeight < getOriginalHeight(showMoreContent)) {
				slideUp(
					showMoreContent,
					0,
					showMoreBlock.classList.contains('--showmore-active')
						? getOriginalHeight(showMoreContent)
						: hiddenHeight,
				)

				showMoreButton.hidden = false
			} else {
				slideDown(showMoreContent, 0, hiddenHeight)

				showMoreButton.hidden = true
			}
		} else {
			slideDown(showMoreContent, 0, hiddenHeight)

			showMoreButton.hidden = true
		}
	}

	/* -----------------------------------------
	Get collapsed height
	----------------------------------------- */

	function getHeight(showMoreBlock, showMoreContent) {
		let hiddenHeight = 0

		const showMoreType = showMoreBlock.dataset.animShowmore
			? showMoreBlock.dataset.animShowmore
			: 'size'

		if (showMoreType === 'items') {
			const showMoreTypeValue = showMoreContent.dataset.animShowmoreContent || 3

			const items = showMoreContent.children

			for (let i = 0; i < showMoreTypeValue; i++) {
				const item = items[i]

				if (!item) break

				hiddenHeight += item.offsetHeight
			}
		} else {
			hiddenHeight = showMoreContent.dataset.animShowmoreContent || 150
		}

		return hiddenHeight
	}

	function getOriginalHeight(showMoreContent) {
		const currentHeight = showMoreContent.offsetHeight

		showMoreContent.style.removeProperty('height')

		const originalHeight = showMoreContent.offsetHeight

		showMoreContent.style.height = `${currentHeight}px`

		return originalHeight
	}

	/* -----------------------------------------
	Button actions
	----------------------------------------- */

	function showMoreActions(e) {
		if (!e.target.closest('[data-anim-showmore-button]')) return

		const showMoreButton = e.target.closest('[data-anim-showmore-button]')

		const showMoreBlock = showMoreButton.closest('[data-anim-showmore]')

		const showMoreContent = showMoreBlock.querySelector(
			'[data-anim-showmore-content]',
		)

		const showMoreSpeed = showMoreBlock.dataset.animShowmoreButton || 500

		const hiddenHeight = getHeight(showMoreBlock, showMoreContent)

		if (!showMoreContent.classList.contains('--slide')) {
			if (showMoreBlock.classList.contains('--showmore-active')) {
				slideUp(showMoreContent, showMoreSpeed, hiddenHeight)
			} else {
				slideDown(showMoreContent, showMoreSpeed, hiddenHeight)
			}

			showMoreBlock.classList.toggle('--showmore-active')
		}
	}
}

/* -----------------------------------------
Auto init
----------------------------------------- */

window.addEventListener('load', showMore)
