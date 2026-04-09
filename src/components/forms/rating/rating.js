//Full Documentation: https://animmaster.github.io/docs/ratingdoc.html

/*
========================================================
ANIM RATING MODULE
========================================================

Star rating component.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div
class="rating"
data-anim-rating
data-anim-rating-value="3.5"
data-anim-rating-size="5"
></div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-rating
rating wrapper


data-anim-rating-value="3.5"
current rating


data-anim-rating-size="5"
number of stars


data-anim-rating="set"
interactive rating



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ static rating
✔ interactive rating
✔ fractional stars
✔ lightweight


========================================================
*/

import { ANIM } from '@js/common/functions.js'

import './rating.scss'

export function formRating() {
	const ratings = document.querySelectorAll('[data-anim-rating]')

	if (!ratings.length) return

	ANIM('_ANIM_RATING_START', ratings.length)

	ratings.forEach(rating => {
		const value = +rating.dataset.animRatingValue || 0

		const size = +rating.dataset.animRatingSize || 5

		initRating(rating, size)

		if (value) setRating(rating, value)
	})

	document.addEventListener('click', ratingAction)

	function ratingAction(e) {
		const input = e.target.closest('.rating__input')

		if (!input) return

		const rating = input.closest('[data-anim-rating]')

		if (rating.dataset.animRating !== 'set') return

		const value = +input.value

		setRating(rating, value)
	}

	function initRating(rating, size) {
		let html = `<div class="rating__items">`

		for (let i = 0; i < size; i++) {
			html += `
				<label class="rating__item">
					<input
					class="rating__input"
					type="radio"
					name="rating"
					value="${i + 1}">
				</label>
			`
		}

		html += `</div>`

		rating.insertAdjacentHTML('beforeend', html)
	}

	function setRating(rating, value) {
		const items = rating.querySelectorAll('.rating__item')

		const full = parseInt(value)

		const part = value - full

		if (rating.hasAttribute('data-rating-title')) {
			rating.title = value
		}

		items.forEach((item, index) => {
			item.classList.remove('rating__item--active')

			const span = item.querySelector('span')

			if (span) span.remove()

			if (index < full) {
				item.classList.add('rating__item--active')
			}

			if (index === full && part) {
				item.insertAdjacentHTML(
					'beforeend',
					`<span style="width:${part * 100}%"></span>`,
				)
			}
		})
	}
}

if (document.querySelector('[data-anim-rating]')) {
	window.addEventListener('load', formRating)
}
