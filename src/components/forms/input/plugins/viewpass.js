/*
========================================================
ANIM VIEW PASSWORD MODULE
========================================================

Toggle password visibility.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div class="input">

	<input
		type="password"
		data-anim-input-password
	>

	<button
		type="button"
		data-anim-input-viewpass
	></button>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-input-viewpass
toggle button


data-anim-input-password
password input



--------------------------------------------------------
CLASSES ADDED
--------------------------------------------------------

--viewpass-active
button active state



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ toggle password
✔ lightweight
✔ multiple inputs


========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

function viewPassInit() {
	const buttons = document.querySelectorAll('[data-anim-input-viewpass]')

	if (!buttons.length) return

	ANIM('_ANIM_VIEWPASS_START', buttons.length)

	document.addEventListener('click', e => {
		const button = e.target.closest('[data-anim-input-viewpass]')

		if (!button) return

		const wrapper = button.closest('div')

		const input = wrapper?.querySelector('[data-anim-input-password]')

		if (!input) return

		const isActive = button.classList.toggle('--viewpass-active')

		input.setAttribute('type', isActive ? 'text' : 'password')
	})
}

if (document.querySelector('[data-anim-input-viewpass]')) {
	window.addEventListener('load', viewPassInit)
}
