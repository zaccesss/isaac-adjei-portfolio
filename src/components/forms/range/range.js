//Full Documentation: https://animmaster.github.io/docs/rangedoc.html

/*
========================================================
ANIM RANGE SLIDER MODULE
========================================================

Dependency

noUiSlider
https://refreshless.com/nouislider/


--------------------------------------------------------
REQUIRED ATTRIBUTE
--------------------------------------------------------

data-anim-range

Main slider container


--------------------------------------------------------
OPTIONAL ATTRIBUTES
--------------------------------------------------------

data-anim-range-from=".selector"
Element that displays "from" value


data-anim-range-to=".selector"
Element that displays "to" value


--------------------------------------------------------
EXAMPLE HTML
--------------------------------------------------------

<div data-anim-range></div>


Example with value outputs

<div data-anim-range
     data-anim-range-from=".range-from"
     data-anim-range-to=".range-to">
</div>

<span class="range-from"></span>
<span class="range-to"></span>


--------------------------------------------------------
DEFAULT CONFIG
--------------------------------------------------------

noUiSlider.create(priceSlider, {
	start: 0,
	connect: [true, false],
	range: {
		min: 0,
		max: 200000,
	}
})


--------------------------------------------------------
DOUBLE RANGE (MIN / MAX)
--------------------------------------------------------

noUiSlider.create(priceSlider, {
	start: [1000, 50000],
	connect: true,
	range: {
		min: 0,
		max: 100000,
	}
})


--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ smooth drag interaction
✔ click on track support
✔ single and double range
✔ customizable limits
✔ lightweight
✔ mobile friendly


--------------------------------------------------------
HOW IT WORKS
--------------------------------------------------------

1. Script finds element with data-anim-range
2. Initializes noUiSlider
3. Applies start values and range limits
4. User interacts with slider
5. Values update in real time


--------------------------------------------------------
OPTIONAL VALUE SYNC (ADVANCED)
--------------------------------------------------------

You can connect slider with inputs manually:

priceSlider.noUiSlider.on('update', (values) => {
	priceFrom.value = values[0]
	priceTo.value = values[1]
})


--------------------------------------------------------
NOTES
--------------------------------------------------------

• You can fully customize slider via CSS (.noUi-*)
• For better UX use tooltips (tooltips: true)
• Use double range for filters (price, range selection)
• Works perfectly with forms and filters


========================================================
*/

// Import from node_modules
import * as noUiSlider from 'nouislider'

// Import styles
import './range.scss'

// Init
export function rangeInit() {
	const priceSlider = document.querySelector('[data-anim-range]')

	if (priceSlider) {
		let textFrom = priceSlider.getAttribute('data-anim-range-from')
		let textTo = priceSlider.getAttribute('data-anim-range-to')

		noUiSlider.create(priceSlider, {
			start: 0,
			connect: [true, false],
			range: {
				min: [0],
				max: [200000],
			},
		})
	}
}

// Auto init
document.querySelector('[data-anim-range]')
	? window.addEventListener('load', rangeInit)
	: null
