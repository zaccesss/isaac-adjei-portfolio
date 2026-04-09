//Full Documentation: https://animmaster.github.io/docs/splittypedoc.html

/*
========================================================
ANIM SPLITTYPE MODULE
========================================================

Dependency

SplitType
https://www.npmjs.com/package/split-type


Required attribute

data-anim-splittype

Splits text into lines, words and characters
for advanced text animations


Example HTML

<h2 data-anim-splittype>
	Smooth text animation
</h2>


Generated structure

<div class="line">
	<span class="word">
		<span class="char">S</span>
		<span class="char">m</span>
		<span class="char">o</span>
		<span class="char">o</span>
		<span class="char">t</span>
		<span class="char">h</span>
	</span>
</div>


Available classes

.line
Container for line

.word
Container for word

.char
Container for character


Common usage

GSAP animations
Scroll animations
Reveal animations
Text stagger effects

========================================================
*/

// Connecting functionality
import { ANIM } from '@js/common/functions.js'

// SplitType library
import SplitType from 'split-type'

// Module styles
import './splittype.scss'

function splitType() {
	/* ------------------------------------------------
	Split text elements
	------------------------------------------------ */

	const splitText = SplitType.create('[data-anim-splittype]', {
		// Use relative positioning
		absolute: false,

		// Wrapper element
		tagName: 'div',

		// Generated classes
		lineClass: 'line',
		wordClass: 'word',
		charClass: 'char',

		// Optional wrapper class
		splitClass: '',

		// What to split
		types: 'lines, words, chars',

		// Extra options
		split: '',
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-splittype]')
	? window.addEventListener('load', splitType)
	: null
