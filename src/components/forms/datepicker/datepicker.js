//Full Documentation: https://animmaster.github.io/docs/datepickerdoc.html

/*
========================================================
ANIM DATEPICKER MODULE
========================================================

Lightweight date picker powered by js-datepicker.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<input
	type="text"
	data-anim-datepicker
>


--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-datepicker
activate datepicker


data-anim-datepicker-lang="en"
datepicker language


data-anim-datepicker-startday="1"
week start day


--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ lightweight
✔ multi-language
✔ multiple inputs
✔ customizable


Docs
https://github.com/qodesmith/datepicker


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Library
import datepicker from 'js-datepicker'

// Languages
import langs from './_lang.json'

// Styles
import './datepicker.scss'

function datepickerInit() {
	const inputs = document.querySelectorAll('[data-anim-datepicker]')

	if (!inputs.length) return

	ANIM('_ANIM_DATEPICKER_START', inputs.length)

	inputs.forEach(input => {
		const lang = input.dataset.animDatepickerLang || 'en'

		const startDay = input.dataset.animDatepickerStartday
			? +input.dataset.animDatepickerStartday
			: 1

		datepicker(input, {
			customDays: langs[lang].week,

			customMonths: langs[lang].month,

			overlayButton: langs[lang].button,

			overlayPlaceholder: langs[lang].year,

			startDay,

			formatter: (input, date) => {
				input.value = date.toLocaleDateString()
			},

			onSelect: (instance, date) => {
				ANIM('_ANIM_DATE_SELECTED', date)
			},
		})
	})
}

if (document.querySelector('[data-anim-datepicker]')) {
	window.addEventListener('load', datepickerInit)
}
