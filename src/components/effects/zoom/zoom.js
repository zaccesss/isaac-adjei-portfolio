//Full Documentation: https://animmaster.github.io/docs/zoomdoc.html

/*
========================================================
ANIM IMAGE ZOOM MODULE
========================================================

Required attribute

data-anim-zoom="3"

Zoom multiplier (default = 3)


Example HTML

<div data-anim-zoom="3">
   <img src="@img/animmaster-pic.jpg" alt="">
</div>


How it works

1. Mouse enters image container
2. Script clones the image
3. Clone is enlarged
4. Mouse movement shifts the image
5. On mouse leave clone is removed


Required structure

[data-anim-zoom]
   img


Features

✔ image magnifier effect
✔ customizable zoom level
✔ mouse tracking zoom
✔ automatic cleanup
✔ zero dependencies

========================================================
*/

// Connecting functionality
import { ANIM } from '@js/common/functions.js'

import './zoom.scss'

function zoomInit() {
	const zoomItems = document.querySelectorAll('[data-anim-zoom]')

	if (!zoomItems.length) return

	/* ------------------------------------------------
	Global mouse events
	------------------------------------------------ */

	document.addEventListener('mouseover', zoomAction)
	document.addEventListener('mouseout', zoomAction)
	document.addEventListener('mousemove', zoomAction)

	function zoomAction(e) {
		const targetElement = e.target

		if (!targetElement.closest('[data-anim-zoom]')) return

		const zoomBlock = targetElement.closest('[data-anim-zoom]')

		const zoomValue = +zoomBlock.dataset.animZoom || 3

		const zoomImage = zoomBlock.querySelector('img')

		if (!zoomImage) {
			ANIM('_ANIM_ZOOM_NOIMAGE')
			return
		}

		const zoomImageParent = zoomImage.parentElement

		/* --------------------------------------------
		mouse enter
		-------------------------------------------- */

		if (e.type === 'mouseover') {
			let cloneImage = document.createElement('img')

			cloneImage.setAttribute('data-anim-zoom-image', '')

			cloneImage.src = zoomImage.src

			if (!zoomImageParent.querySelector('[data-anim-zoom-image]')) {
				zoomImageParent.insertAdjacentElement('beforeend', cloneImage)
			}
		} else if (e.type === 'mousemove') {
			/* --------------------------------------------
		mouse move
		-------------------------------------------- */
			const mousePos = {
				left:
					((e.clientX - zoomBlock.getBoundingClientRect().left) /
						zoomBlock.offsetWidth) *
					(100 -
						(zoomBlock.offsetWidth / (zoomBlock.offsetWidth * zoomValue)) *
							100),

				top:
					((e.clientY - zoomBlock.getBoundingClientRect().top) /
						zoomBlock.offsetHeight) *
					(100 -
						(zoomBlock.offsetHeight / (zoomBlock.offsetHeight * zoomValue)) *
							100),
			}

			setStyles(
				zoomImageParent.querySelector('[data-anim-zoom-image]'),
				zoomImage,
				mousePos,
				zoomValue,
			)
		} else if (e.type === 'mouseout') {
			/* --------------------------------------------
		mouse leave
		-------------------------------------------- */
			const clone = zoomImageParent.querySelector('[data-anim-zoom-image]')

			if (clone) {
				clone.remove()
			}
		}
	}

	/* ------------------------------------------------
	Update clone styles
	------------------------------------------------ */

	function setStyles(cloneImage, zoomImage, mousePos, zoomValue) {
		if (!cloneImage) return

		const imageSize = {
			width: zoomImage.offsetWidth * zoomValue,
		}

		cloneImage.style.cssText = `
			width: ${imageSize.width}px;
			transform: translate(-${mousePos.left}%,-${mousePos.top}%);
		`
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-zoom]')
	? window.addEventListener('load', zoomInit)
	: null
