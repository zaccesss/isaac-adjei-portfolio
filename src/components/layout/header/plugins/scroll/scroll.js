/*
========================================================
ANIM HEADER SCROLL MODULE
========================================================

Sticky header with hide / show on scroll.


--------------------------------------------------------
HTML
--------------------------------------------------------

<header
	data-anim-header-scroll
	data-anim-header-scroll-show
	data-anim-header-scroll="100"
	data-anim-header-scroll-show="500"
>

</header>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-header-scroll
enables header scroll behaviour

value = scroll start point (px)

default = 1


data-anim-header-scroll-show
enables hide / show header on scroll


data-anim-header-scroll-show="500"
delay before header shows again (ms)



--------------------------------------------------------
CLASSES ADDED
--------------------------------------------------------

--header-scroll
header becomes sticky


--header-show
header becomes visible



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ sticky header
✔ hide on scroll down
✔ show on scroll up
✔ configurable start point
✔ configurable delay
✔ lightweight

========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

export function headerScroll() {
	const header = document.querySelector('[data-anim-header-scroll]')

	if (!header) return

	const headerShow = header.hasAttribute('data-anim-header-scroll-show')

	const headerShowTimer = header.dataset.animHeaderScrollShow
		? header.dataset.animHeaderScrollShow
		: 500

	const startPoint = header.dataset.animHeaderScroll
		? header.dataset.animHeaderScroll
		: 1

	let scrollDirection = 0
	let timer

	document.addEventListener('scroll', function () {
		const scrollTop = window.scrollY

		clearTimeout(timer)

		/* start sticky */

		if (scrollTop >= startPoint) {
			if (!header.classList.contains('--header-scroll')) {
				header.classList.add('--header-scroll')
			}

			/* hide / show */

			if (headerShow) {
				if (scrollTop > scrollDirection) {
					// scrolling down
					header.classList.remove('--header-show')
				} else {
					// scrolling up
					header.classList.add('--header-show')
				}

				timer = setTimeout(() => {
					header.classList.add('--header-show')
				}, headerShowTimer)
			}
		} else {
			header.classList.remove('--header-scroll')

			if (headerShow) {
				header.classList.remove('--header-show')
			}
		}

		scrollDirection = scrollTop <= 0 ? 0 : scrollTop
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-header-scroll]')) {
	window.addEventListener('load', headerScroll)
}
