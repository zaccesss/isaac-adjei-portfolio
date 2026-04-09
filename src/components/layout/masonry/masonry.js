//Full Documentation: https://animmaster.github.io/docs/masonry.html

/*
========================================================
ANIM MASONRY MODULE
========================================================

Dynamic masonry grid with filtering support.

Powered by Isotope.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div class="masonry">

	<ul class="masonry__filter">

		<li>
			<a data-anim-masonry-filter-link="*">All</a>
		</li>

		<li>
			<a data-anim-masonry-filter-link="a">Category A</a>
		</li>

	</ul>


	<div data-anim-masonry>

		<div
			data-anim-masonry-item
			data-anim-masonry-filter="a">
		</div>

	</div>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-masonry
masonry container


data-anim-masonry-item
masonry grid item


data-anim-masonry-filter
item category


data-anim-masonry-filter-link
filter button



--------------------------------------------------------
FILTER EXAMPLES
--------------------------------------------------------

data-anim-masonry-filter="design"

data-anim-masonry-filter="frontend"

data-anim-masonry-filter="animation"



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ masonry layout
✔ animated filtering
✔ category system
✔ responsive grid
✔ lightweight

========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Isotope library
import Isotope from 'isotope-layout/js/isotope.js'

// Styles
import './masonry.scss'

function masonryRun() {
	const container = document.querySelector('[data-anim-masonry]')

	if (!container) return

	ANIM('_ANIM_MASONRY_INIT')

	const isotope = new Isotope(container, {
		itemSelector: '[data-anim-masonry-item]',

		masonry: {
			fitWidth: true,
			gutter: 20,
		},
	})

	/* ----------------------------------------
	Filter system
	---------------------------------------- */

	document.addEventListener('click', function (e) {
		const filterBtn = e.target.closest('[data-anim-masonry-filter-link]')

		if (!filterBtn) return

		const filterValue = filterBtn.dataset.animMasonryFilterLink

		const active = document.querySelector(
			'[data-anim-masonry-filter-link].--active',
		)

		if (filterValue === '*') {
			isotope.arrange({ filter: '*' })
		} else {
			isotope.arrange({
				filter: `[data-anim-masonry-filter="${filterValue}"]`,
			})
		}

		if (active) active.classList.remove('--active')

		filterBtn.classList.add('--active')

		e.preventDefault()
	})
}

/* ----------------------------------------
Auto init
---------------------------------------- */

if (document.querySelector('[data-anim-masonry]')) {
	window.addEventListener('load', masonryRun)
}
