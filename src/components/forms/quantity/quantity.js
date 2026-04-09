
//Full Documentation:  https://animmaster.github.io/docs/quantitydoc.html

/*
========================================================
ANIM QUANTITY MODULE
========================================================

Quantity input control with plus/minus buttons.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div data-anim-quantity>

	<button
	data-anim-quantity-minus
	type="button"
	></button>

	<input
	data-anim-quantity-value
	type="text"
	value="1"
	>

	<button
	data-anim-quantity-plus
	type="button"
	></button>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-quantity
quantity wrapper


data-anim-quantity-value
input value


data-anim-quantity-plus
increase value


data-anim-quantity-minus
decrease value


data-anim-quantity-min="1"
minimum value


data-anim-quantity-max="10"
maximum value



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ plus / minus buttons
✔ min / max limits
✔ input validation
✔ lightweight


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Styles
import './quantity.scss'

export function formQuantity() {
	const quantities = document.querySelectorAll('[data-anim-quantity]')

	if (!quantities.length) return

	ANIM('_ANIM_QUANTITY_START', quantities.length)

	document.addEventListener('click', quantityActions)
	document.addEventListener('input', quantityActions)

	function quantityActions(e) {
		const target = e.target

		/* -----------------------
		CLICK
		----------------------- */

		if (e.type === 'click') {
			const plus = target.closest('[data-anim-quantity-plus]')

			const minus = target.closest('[data-anim-quantity-minus]')

			if (!plus && !minus) return

			const quantity = target.closest('[data-anim-quantity]')

			const input = quantity.querySelector('[data-anim-quantity-value]')

			let value = parseInt(input.value) || 1

			const min = input.dataset.animQuantityMin
				? +input.dataset.animQuantityMin
				: 1

			const max = input.dataset.animQuantityMax
				? +input.dataset.animQuantityMax
				: Infinity

			if (plus) value++

			if (minus) value--

			value = Math.max(min, Math.min(max, value))

			input.value = value
		}

		/* -----------------------
		INPUT
		----------------------- */

		if (e.type === 'input' && target.matches('[data-anim-quantity-value]')) {
			if (/[^0-9]/g.test(target.value)) {
				target.value = target.value.replace(/[^0-9]/g, '')
			}

			if (target.value === '' || target.value === '0') {
				target.value = 1
			}
		}
	}
}

if (document.querySelector('[data-anim-quantity]')) {
	window.addEventListener('load', formQuantity)
}
