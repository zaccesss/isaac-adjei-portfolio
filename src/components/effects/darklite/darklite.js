//Full Documentation: https://animmaster.github.io/docs/daynight.html
/*
====================================================
ANIM DARK / LIGHT THEME MODULE
====================================================

Required attribute

data-anim-darklite
Enables theme system


Optional attributes

data-anim-darklite-set
Button that toggles theme manually

data-anim-darklite-reset
Button that resets saved theme preference

data-anim-darklite-time="18,5"
Automatic dark theme during selected hours


Examples

<body data-anim-darklite>

<button data-anim-darklite-set>
Toggle theme
</button>

<button data-anim-darklite-reset>
Reset theme
</button>


HTML states added automatically

data-anim-darklite-light
data-anim-darklite-dark


Saved in localStorage

anim-user-theme


Priority order

1. Saved user theme
2. Time based theme
3. System theme (prefers-color-scheme)

====================================================
*/

// Connecting functionality
import { isMobile, ANIM } from '@js/common/functions.js'

// Base styles
import './darklite.scss'

/* ------------------------------------------------
Get current hour
------------------------------------------------ */

function getHours() {
	const now = new Date()
	return now.getHours()
}

/* ------------------------------------------------
Dark / Light theme init
------------------------------------------------ */

function darkliteInit() {
	// HTML element
	const htmlBlock = document.documentElement

	// Theme stored by user
	const saveUserTheme = localStorage.getItem('anim-user-theme')

	let userTheme

	/* ------------------------------------------------
	Time based theme mode
	Example:
	data-anim-darklite-time="18,5"
	------------------------------------------------ */

	if (document.querySelector('[data-anim-darklite-time]')) {
		let customRange = document.querySelector('[data-anim-darklite-time]')
			.dataset.animDarkliteTime

		// Default time range
		customRange = customRange || '18,5'

		const timeFrom = +customRange.split(',')[0]
		const timeTo = +customRange.split(',')[1]

		userTheme =
			getHours() >= timeFrom && getHours() <= timeTo ? 'dark' : 'light'
	} else {
		/* ------------------------------------------------
	System theme mode (prefers-color-scheme)
	------------------------------------------------ */
		if (window.matchMedia) {
			userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
		}

		// Listen for system theme change
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', () => {
				if (!saveUserTheme) changeTheme()
			})
	}

	/* ------------------------------------------------
	Manual theme toggle button
	------------------------------------------------ */

	const themeButton = document.querySelector('[data-anim-darklite-set]')

	if (themeButton) {
		themeButton.addEventListener('click', () => {
			changeTheme(true)
		})
	}

	/* ------------------------------------------------
	Reset theme preference
	------------------------------------------------ */

	const resetButton = document.querySelector('[data-anim-darklite-reset]')

	if (resetButton) {
		resetButton.addEventListener('click', () => {
			localStorage.setItem('anim-user-theme', '')
		})
	}

	/* ------------------------------------------------
	Set theme class on HTML
	------------------------------------------------ */

	function setThemeClass() {
		htmlBlock.setAttribute(
			`data-anim-darklite-${saveUserTheme ? saveUserTheme : userTheme}`,
			'',
		)
	}

	setThemeClass()

	/* ------------------------------------------------
	Theme switch logic
	------------------------------------------------ */

	function changeTheme(saveTheme = false) {
		let currentTheme = htmlBlock.hasAttribute('data-anim-darklite-light')
			? 'light'
			: 'dark'

		let newTheme = currentTheme === 'light' ? 'dark' : 'light'

		htmlBlock.removeAttribute(`data-anim-darklite-${currentTheme}`)
		htmlBlock.setAttribute(`data-anim-darklite-${newTheme}`, '')

		if (saveTheme) {
			localStorage.setItem('anim-user-theme', newTheme)
		}
	}
}

/* ------------------------------------------------
Auto init module
------------------------------------------------ */

document.querySelector('[data-anim-darklite]')
	? window.addEventListener('load', darkliteInit)
	: null
