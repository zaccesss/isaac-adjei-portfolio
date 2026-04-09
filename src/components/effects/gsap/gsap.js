/*
========================================================
ANIM GSAP MODULE
========================================================

Dependencies

GSAP
https://www.npmjs.com/package/gsap

Plugins included

ScrollTrigger
Draggable
MotionPathPlugin


Required attribute

data-anim-gsap

Activates GSAP animations


Optional integration

Works perfectly with

data-anim-splittype


Example HTML

<h2 data-anim-splittype data-anim-gsap>
	Beautiful animations
</h2>


Typical structure after SplitType

.char
.word
.line


Example animation

Characters fade + move upward

========================================================
*/

// Connecting functionality
import { ANIM } from '@js/common/functions.js'

// GSAP core
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from 'gsap/all'

// Module styles
import './gsap.scss'

function gsapInit() {
	/* ------------------------------------------------
	Register GSAP plugins
	------------------------------------------------ */

	gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin)

	/* ------------------------------------------------
	Example animation (SplitType characters)
	------------------------------------------------ */

	const chars = document.querySelectorAll(
		'[data-anim-splittype][data-anim-gsap] .char',
	)

	if (!chars.length) return

	console.log(chars)

	gsap.from(chars, {
		opacity: 0,

		y: 20,

		duration: 0.5,

		stagger: {
			amount: 0.5,
		},
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-gsap]')
	? window.addEventListener('load', gsapInit)
	: null
