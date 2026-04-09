//Full Documentation: https://animmaster.github.io/docs/parallaxdoc.html

/*
========================================================
ANIM PARALLAX MODULE
========================================================

Required attribute

data-anim-parallax-parent
Container that activates parallax logic


Parallax elements inside parent

data-anim-parallax


Optional attributes

data-anim-parallax-smooth="15"
Smoothness of animation (lower = faster movement)

data-anim-parallax-center="top | center | bottom"
Defines the reference point for parallax calculation


Element attributes

data-anim-parallax-direction="1 | -1"
Movement direction

data-anim-parallax-coefficient="5"
Speed multiplier

data-axis="v | h"
Movement axis
v = vertical
h = horizontal

data-anim-parallax-properties
Additional transform properties


Example HTML

<div data-anim-parallax-parent>

	<div
		data-anim-parallax
		data-anim-parallax-coefficient="10"
		data-anim-parallax-direction="1"
	></div>

</div>

========================================================
*/

// Connecting functionality
import {
	ANIM,
	slideUp,
	slideDown,
	slideToggle,
	dataMediaQueries,
} from '@js/common/functions.js'

import './parallax.scss'

/* ------------------------------------------------
Parallax controller
------------------------------------------------ */

class Parallax {
	constructor(elements) {
		if (!elements.length) return

		this.elements = Array.from(elements).map(el => new Parallax.Each(el))
	}

	/* destroy animation */

	destroyEvents() {
		this.elements.forEach(el => {
			el.destroyEvents()
		})
	}

	/* start animation */

	setEvents() {
		this.elements.forEach(el => {
			el.setEvents()
		})
	}
}

/* ------------------------------------------------
Each parallax container instance
------------------------------------------------ */

Parallax.Each = class {
	constructor(parent) {
		this.parent = parent

		// Parallax elements inside parent
		this.elements = this.parent.querySelectorAll('[data-anim-parallax]')

		// Animation frame binding
		this.animation = this.animationFrame.bind(this)

		// Current offset
		this.offset = 0

		// Smoothed value
		this.value = 0

		// Smoothness factor
		this.smooth = parent.dataset.animParallaxSmooth
			? Number(parent.dataset.animParallaxSmooth)
			: 15

		this.setEvents()
	}

	/* start animation */

	setEvents() {
		this.animationID = window.requestAnimationFrame(this.animation)
	}

	/* stop animation */

	destroyEvents() {
		window.cancelAnimationFrame(this.animationID)
	}

	/* ------------------------------------------------
	Main animation loop
	------------------------------------------------ */

	animationFrame() {
		const topToWindow = this.parent.getBoundingClientRect().top
		const heightParent = this.parent.offsetHeight
		const heightWindow = window.innerHeight

		/* parent position relative to viewport */

		const positionParent = {
			top: topToWindow - heightWindow,
			bottom: topToWindow + heightParent,
		}

		/* reference point */

		const centerPoint = this.parent.dataset.animParallaxCenter
			? this.parent.dataset.animParallaxCenter
			: 'center'

		/* calculate offset */

		if (positionParent.top < 30 && positionParent.bottom > -30) {
			switch (centerPoint) {
				// top of parent touches top of screen

				case 'top':
					this.offset = -1 * topToWindow
					break

				// center of parent = center of screen

				case 'center':
					this.offset = heightWindow / 2 - (topToWindow + heightParent / 2)
					break

				// bottom of screen = top of parent

				case 'bottom':
					this.offset = heightWindow - (topToWindow + heightParent)
					break
			}
		}

		/* smoothing */

		this.value += (this.offset - this.value) / this.smooth

		this.animationID = window.requestAnimationFrame(this.animation)

		/* apply transform to elements */

		this.elements.forEach(el => {
			const parameters = {
				axis: el.dataset.axis ? el.dataset.axis : 'v',

				direction: el.dataset.animParallaxDirection
					? el.dataset.animParallaxDirection + '1'
					: '-1',

				coefficient: el.dataset.animParallaxCoefficient
					? Number(el.dataset.animParallaxCoefficient)
					: 5,

				additionalProperties: el.dataset.animParallaxProperties
					? el.dataset.animParallaxProperties
					: '',
			}

			this.parameters(el, parameters)
		})
	}

	/* ------------------------------------------------
	Apply transform
	------------------------------------------------ */

	parameters(el, parameters) {
		const movement = (
			parameters.direction *
			(this.value / parameters.coefficient)
		).toFixed(2)

		if (parameters.axis === 'v') {
			el.style.transform = `translate3D(0, ${movement}px, 0) ${parameters.additionalProperties}`
		} else if (parameters.axis === 'h') {
			el.style.transform = `translate3D(${movement}px, 0, 0) ${parameters.additionalProperties}`
		}
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-parallax-parent]')) {
	new Parallax(document.querySelectorAll('[data-anim-parallax-parent]'))
}
