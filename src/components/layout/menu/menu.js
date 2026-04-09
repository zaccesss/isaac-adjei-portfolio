//Full Documentation: https://animmaster.github.io/docs/menuburger.html

/*
========================================================
ANIM MENU MODULE
========================================================

Mobile navigation toggle.

Controls menu open / close state.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<div class="menu">

	<button data-anim-menu class="menu__icon"></button>

	<nav class="menu__body">

	</nav>

</div>



--------------------------------------------------------
ATTRIBUTE
--------------------------------------------------------

data-anim-menu
menu toggle button



--------------------------------------------------------
CLASS / ATTRIBUTE ADDED
--------------------------------------------------------

data-anim-menu-open

Added to <html> when menu is open



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ mobile menu toggle
✔ body scroll lock
✔ lightweight
✔ works with CSS animations

========================================================
*/

// Import functionality
import { bodyLockStatus, bodyLockToggle, ANIM } from '@js/common/functions.js'

// Styles
import './menu.scss'

export function menuInit() {
	const menuButton = document.querySelector('[data-anim-menu]')

	if (!menuButton) return

	ANIM('_ANIM_MENU_INIT')

	document.addEventListener('click', function (e) {
		const toggleButton = e.target.closest('[data-anim-menu]')

		if (!toggleButton) return

		if (bodyLockStatus) {
			bodyLockToggle()

			document.documentElement.toggleAttribute('data-anim-menu-open')
		}
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-menu]')) {
	window.addEventListener('load', menuInit)
}
