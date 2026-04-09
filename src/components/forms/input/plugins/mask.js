/*
========================================================
ANIM INPUT MASK MODULE
========================================================

Input masking powered by Inputmask.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<input
	data-anim-input-mask="+38 (999) 999-99-99"
>


--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-input-mask
mask pattern


Examples:

+38 (999) 999-99-99
9999 9999 9999 9999
99/99/9999



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ phone masks
✔ credit card masks
✔ date masks
✔ multiple inputs


Docs
https://github.com/RobinHerbots/Inputmask


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

// Inputmask
import Inputmask from 'inputmask'

// Styles
import './inputmask.scss'

function inputMaskInit() {
	const inputs = document.querySelectorAll('[data-anim-input-mask]')

	if (!inputs.length) return

	ANIM('_ANIM_INPUTMASK_START', inputs.length)

	inputs.forEach(input => {
		const mask = input.dataset.animInputMask

		if (!mask) return

		Inputmask({
			mask,
		}).mask(input)
	})
}

if (document.querySelector('[data-anim-input-mask]')) {
	window.addEventListener('load', inputMaskInit)
}
