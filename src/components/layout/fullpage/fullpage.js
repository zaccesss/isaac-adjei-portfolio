//Full Documentation: https://animmaster.github.io/docs/fullpage.html

/*
========================================================
ANIM FULLPAGE MODULE
========================================================

Creates full screen scrolling sections similar to:

Fullpage.js
Locomotive scroll sections
Apple style landing pages


Basic HTML structure

<div data-anim-fullpage>

	<section data-anim-fullpage-section>
		content
	</section>

	<section data-anim-fullpage-section>
		content
	</section>

</div>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-fullpage
wrapper element


data-anim-fullpage-section
section element


data-anim-fullpage-effect
scroll effect

slider (default)
cards
fade


data-anim-fullpage-bullets
enable navigation bullets


data-anim-fullpage-noevent
area where scroll/swipe events are disabled


data-anim-fullpage-direction-up
custom animation delay for scrolling up


data-anim-fullpage-direction-down
custom animation delay for scrolling down



--------------------------------------------------------
EXAMPLE
--------------------------------------------------------

<div data-anim-fullpage data-anim-fullpage-effect="cards" data-anim-fullpage-bullets>

	<section data-anim-fullpage-section>
		Hero
	</section>

	<section data-anim-fullpage-section>
		Features
	</section>

	<section data-anim-fullpage-section>
		Pricing
	</section>

</div>



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ full screen sections
✔ mouse wheel navigation
✔ touch swipe navigation
✔ bullet navigation
✔ multiple animation modes
✔ mobile support
✔ section callbacks
✔ lightweight
✔ no dependencies


--------------------------------------------------------
AVAILABLE MODES
--------------------------------------------------------

slider
classic vertical sliding


cards
stacking cards animation


fade
crossfade transition



========================================================
*/

// Import  functionality
import { isMobile, ANIM } from '@js/common/functions.js'

import './fullpage.scss'

// FullPage class
class FullPage {
	constructor(element, options) {
		let config = {
			//===============================
			// Selector where swipe/wheel events do NOT work
			noEventSelector: '[data-anim-fullpage-noevent]',
			//===============================
			// Wrapper settings
			// Class added when the plugin is initialized
			classInit: '--fullpage-init',
			// Class for the wrapper while switching
			wrapperAnimatedClass: '--fullpage-switching',
			//===============================
			// Section settings
			// SELECTOR for sections
			selectorSection: '[data-anim-fullpage-section]',
			// Class for the active section
			activeClass: '--fullpage-active-section',
			// Class for the previous section
			previousClass: '--fullpage-previous-section',
			// Class for the next section
			nextClass: '--fullpage-next-section',
			// ID of the initially active section
			idActiveSection: 0,
			//===============================
			// Other settings
			// Mouse swipe simulation
			// touchSimulator: false,
			//===============================
			// Effects
			// Effects: fade, cards, slider
			mode: element.dataset.animFullpageEffect
				? element.dataset.animFullpageEffect
				: 'slider',
			//===============================
			// Bullets
			// Enable bullets
			bullets: element.hasAttribute('data-anim-fullpage-bullets')
				? true
				: false,
			// Bullets wrapper class
			bulletsClass: '--fullpage-bullets',
			// Bullet class
			bulletClass: '--fullpage-bullet',
			// Active bullet class
			bulletActiveClass: '--fullpage-bullet-active',
			//===============================
			// Events
			// Init event
			onInit: function () {},
			// Section switching event
			onSwitching: function () {},
			// Destroy event
			onDestroy: function () {},
		}

		this.options = Object.assign(config, options)

		// Parent element
		this.wrapper = element
		this.sections = this.wrapper.querySelectorAll(this.options.selectorSection)

		// Active section
		this.activeSection = false
		this.activeSectionId = false

		// Previous section
		this.previousSection = false
		this.previousSectionId = false

		// Next section
		this.nextSection = false
		this.nextSectionId = false

		// Bullets wrapper
		this.bulletsWrapper = false

		// Helper flag
		this.stopEvent = false

		if (this.sections.length) {
			// Initialize
			this.init()
		}
	}

	//===============================
	// Initial initialization
	init() {
		if (this.options.idActiveSection > this.sections.length - 1) return

		// Set IDs
		this.setId()
		this.activeSectionId = this.options.idActiveSection

		// Add effect classes
		this.setEffectsClasses()

		// Set classes
		this.setClasses()

		// Set styles
		this.setStyle()

		// Set bullets
		if (this.options.bullets) {
			this.setBullets()
			this.setActiveBullet(this.activeSectionId)
		}

		// Set events
		this.events()

		// Add init class
		setTimeout(() => {
			ANIM('_ANIM_FULLPAGE_START', this.sections.length)

			document.documentElement.classList.add(this.options.classInit)

			// Custom init event
			this.options.onInit(this)
			document.dispatchEvent(
				new CustomEvent('fpinit', {
					detail: { fp: this },
				}),
			)
		}, 0)
	}

	//===============================
	// Destroy
	destroy() {
		// Remove events
		this.removeEvents()
		// Remove section classes
		this.removeClasses()
		// Remove init class
		document.documentElement.classList.remove(this.options.classInit)
		// Remove animation class
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass)
		// Remove effect classes
		this.removeEffectsClasses()
		// Remove z-index
		this.removeZIndex()
		// Remove styles
		this.removeStyle()
		// Remove IDs
		this.removeId()

		// Custom destroy event
		this.options.onDestroy(this)
		document.dispatchEvent(
			new CustomEvent('fpdestroy', {
				detail: { fp: this },
			}),
		)
	}

	//===============================
	// Set section IDs
	setId() {
		for (let index = 0; index < this.sections.length; index++) {
			this.sections[index].setAttribute('data-anim-fullpage-id', index)
		}
	}

	//===============================
	// Remove section IDs
	removeId() {
		for (let index = 0; index < this.sections.length; index++) {
			this.sections[index].removeAttribute('data-anim-fullpage-id')
		}
	}

	//===============================
	// Set classes for previous/active/next sections
	setClasses() {
		// Previous
		this.previousSectionId =
			this.activeSectionId - 1 >= 0 ? this.activeSectionId - 1 : false

		// Next
		this.nextSectionId =
			this.activeSectionId + 1 < this.sections.length
				? this.activeSectionId + 1
				: false

		// Active
		this.activeSection = this.sections[this.activeSectionId]
		this.activeSection.classList.add(this.options.activeClass)

		for (let index = 0; index < this.sections.length; index++) {
			document.documentElement.classList.remove(`--fullpage-section-${index}`)
		}
		document.documentElement.classList.add(
			`--fullpage-section-${this.activeSectionId}`,
		)

		// Previous section
		if (this.previousSectionId !== false) {
			this.previousSection = this.sections[this.previousSectionId]
			this.previousSection.classList.add(this.options.previousClass)
		} else {
			this.previousSection = false
		}

		// Next section
		if (this.nextSectionId !== false) {
			this.nextSection = this.sections[this.nextSectionId]
			this.nextSection.classList.add(this.options.nextClass)
		} else {
			this.nextSection = false
		}
	}

	//===============================
	// Remove effect classes
	removeEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.remove('slider-mode')
				break

			case 'cards':
				this.wrapper.classList.remove('cards-mode')
				this.setZIndex()
				break

			case 'fade':
				this.wrapper.classList.remove('fade-mode')
				this.setZIndex()
				break

			default:
				break
		}
	}

	//===============================
	// Add effect classes
	setEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.add('slider-mode')
				break

			case 'cards':
				this.wrapper.classList.add('cards-mode')
				this.setZIndex()
				break

			case 'fade':
				this.wrapper.classList.add('fade-mode')
				this.setZIndex()
				break

			default:
				break
		}
	}

	//===============================
	// Set styles
	setStyle() {
		switch (this.options.mode) {
			case 'slider':
				this.styleSlider()
				break

			case 'cards':
				this.styleCards()
				break

			case 'fade':
				this.styleFade()
				break

			default:
				break
		}
	}

	// slider-mode
	styleSlider() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index]
			if (index === this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)'
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)'
			} else {
				section.style.transform = 'translate3D(0,100%,0)'
			}
		}
	}

	// cards mode
	styleCards() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index]
			if (index >= this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)'
			} else {
				section.style.transform = 'translate3D(0,-100%,0)'
			}
		}
	}

	// fade mode
	styleFade() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index]
			if (index === this.activeSectionId) {
				section.style.opacity = '1'
				section.style.pointerEvents = 'all'
				// section.style.visibility = 'visible';
			} else {
				section.style.opacity = '0'
				section.style.pointerEvents = 'none'
				// section.style.visibility = 'hidden';
			}
		}
	}

	//===============================
	// Remove styles
	removeStyle() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index]
			section.style.opacity = ''
			section.style.visibility = ''
			section.style.transform = ''
		}
	}

	//===============================
	// Check if the element was fully scrolled
	checkScroll(yCoord, element) {
		this.goScroll = false

		// If element exists and events are allowed
		if (!this.stopEvent && element) {
			this.goScroll = true

			// If section height differs from window height
			if (this.haveScroll(element)) {
				this.goScroll = false
				const position = Math.round(element.scrollHeight - element.scrollTop)

				// Check if section is fully scrolled
				if (
					(Math.abs(position - element.scrollHeight) < 2 && yCoord <= 0) ||
					(Math.abs(position - element.clientHeight) < 2 && yCoord >= 0)
				) {
					this.goScroll = true
				}
			}
		}
	}

	//===============================
	// Check scroll height
	haveScroll(element) {
		return element.scrollHeight !== window.innerHeight
	}

	//===============================
	// Remove classes
	removeClasses() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index]
			section.classList.remove(this.options.activeClass)
			section.classList.remove(this.options.previousClass)
			section.classList.remove(this.options.nextClass)
		}
	}

	//===============================
	// Event collection
	events() {
		this.events = {
			// Mouse wheel
			wheel: this.wheel.bind(this),

			// Swipe
			touchdown: this.touchDown.bind(this),
			touchup: this.touchUp.bind(this),
			touchmove: this.touchMove.bind(this),
			touchcancel: this.touchUp.bind(this),

			// End of animation
			transitionEnd: this.transitionend.bind(this),

			// Bullet clicks
			click: this.clickBullets.bind(this),
		}

		if (isMobile.iOS()) {
			document.addEventListener('touchmove', e => {
				e.preventDefault()
			})
		}

		this.setEvents()
	}

	setEvents() {
		// Wheel event
		this.wrapper.addEventListener('wheel', this.events.wheel)

		// Touch start event
		this.wrapper.addEventListener('touchstart', this.events.touchdown)

		// Bullet click event
		if (this.options.bullets && this.bulletsWrapper) {
			this.bulletsWrapper.addEventListener('click', this.events.click)
		}
	}

	removeEvents() {
		this.wrapper.removeEventListener('wheel', this.events.wheel)
		this.wrapper.removeEventListener('touchdown', this.events.touchdown)
		this.wrapper.removeEventListener('touchup', this.events.touchup)
		this.wrapper.removeEventListener('touchcancel', this.events.touchup)
		this.wrapper.removeEventListener('touchmove', this.events.touchmove)

		if (this.bulletsWrapper) {
			this.bulletsWrapper.removeEventListener('click', this.events.click)
		}
	}

	//===============================
	// Bullet click handler
	clickBullets(e) {
		const bullet = e.target.closest(`.${this.options.bulletClass}`)
		if (bullet) {
			const arrayChildren = Array.from(this.bulletsWrapper.children)
			const idClickBullet = arrayChildren.indexOf(bullet)
			this.switchingSection(idClickBullet)
		}
	}

	//===============================
	// Activate bullet
	setActiveBullet(idButton) {
		if (!this.bulletsWrapper) return

		const bullets = this.bulletsWrapper.children

		for (let index = 0; index < bullets.length; index++) {
			const bullet = bullets[index]
			if (idButton === index)
				bullet.classList.add(this.options.bulletActiveClass)
			else bullet.classList.remove(this.options.bulletActiveClass)
		}
	}

	//===============================
	// Touch down
	touchDown(e) {
		this._yP = e.changedTouches[0].pageY
		this._eventElement = e.target.closest(`.${this.options.activeClass}`)

		if (this._eventElement) {
			// Bind touch events
			this._eventElement.addEventListener('touchend', this.events.touchup)
			this._eventElement.addEventListener('touchcancel', this.events.touchup)
			this._eventElement.addEventListener('touchmove', this.events.touchmove)

			this.clickOrTouch = true

			// iOS scroll hack
			if (isMobile.iOS()) {
				if (
					this._eventElement.scrollHeight !== this._eventElement.clientHeight
				) {
					if (this._eventElement.scrollTop === 0) {
						this._eventElement.scrollTop = 1
					}
					if (
						this._eventElement.scrollTop ===
						this._eventElement.scrollHeight - this._eventElement.clientHeight
					) {
						this._eventElement.scrollTop =
							this._eventElement.scrollHeight -
							this._eventElement.clientHeight -
							1
					}
				}
				this.allowUp = this._eventElement.scrollTop > 0
				this.allowDown =
					this._eventElement.scrollTop <
					this._eventElement.scrollHeight - this._eventElement.clientHeight
				this.lastY = e.changedTouches[0].pageY
			}
		}
	}

	//===============================
	// Touch move
	touchMove(e) {
		const targetElement = e.target.closest(`.${this.options.activeClass}`)

		// iOS scroll handling
		if (isMobile.iOS()) {
			let up = e.changedTouches[0].pageY > this.lastY
			let down = !up
			this.lastY = e.changedTouches[0].pageY

			if (targetElement) {
				if ((up && this.allowUp) || (down && this.allowDown)) {
					e.stopPropagation()
				} else if (e.cancelable) {
					e.preventDefault()
				}
			}
		}

		// If not a touch/click or inside "no event" block
		if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector))
			return

		let yCoord = this._yP - e.changedTouches[0].pageY

		this.checkScroll(yCoord, targetElement)

		if (this.goScroll && Math.abs(yCoord) > 20) {
			this.choiceOfDirection(yCoord)
		}
	}

	//===============================
	// Touch up
	touchUp() {
		this._eventElement.removeEventListener('touchend', this.events.touchup)
		this._eventElement.removeEventListener('touchcancel', this.events.touchup)
		this._eventElement.removeEventListener('touchmove', this.events.touchmove)
		return (this.clickOrTouch = false)
	}

	//===============================
	// Transition end
	transitionend() {
		this.stopEvent = false
		document.documentElement.classList.remove(this.options.wrapperAnimatedClass)
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass)
	}

	//===============================
	// Mouse wheel
	wheel(e) {
		if (e.target.closest(this.options.noEventSelector)) return

		const yCoord = e.deltaY
		const targetElement = e.target.closest(`.${this.options.activeClass}`)

		this.checkScroll(yCoord, targetElement)

		if (this.goScroll) this.choiceOfDirection(yCoord)
	}

	//===============================
	// Choose direction
	choiceOfDirection(direction) {
		if (direction > 0 && this.nextSection !== false) {
			this.activeSectionId =
				this.activeSectionId + 1 < this.sections.length
					? ++this.activeSectionId
					: this.activeSectionId
		} else if (direction < 0 && this.previousSection !== false) {
			this.activeSectionId =
				this.activeSectionId - 1 >= 0
					? --this.activeSectionId
					: this.activeSectionId
		}

		this.switchingSection(this.activeSectionId, direction)
	}

	//===============================
	// Switch sections
	switchingSection(idSection = this.activeSectionId, direction) {
		if (!direction) {
			if (idSection < this.activeSectionId) direction = -100
			else if (idSection > this.activeSectionId) direction = 100
		}

		this.activeSectionId = idSection

		// Stop events
		this.stopEvent = true

		// Allow events if we’re on the edge
		if (
			(this.previousSectionId === false && direction < 0) ||
			(this.nextSectionId === false && direction > 0)
		) {
			this.stopEvent = false
		}

		if (this.stopEvent) {
			// Add switching classes
			document.documentElement.classList.add(this.options.wrapperAnimatedClass)
			this.wrapper.classList.add(this.options.wrapperAnimatedClass)

			// Remove classes
			this.removeClasses()
			// Set classes
			this.setClasses()
			// Set styles
			this.setStyle()
			// Set bullets
			if (this.options.bullets) this.setActiveBullet(this.activeSectionId)

			// Delay + direction classes
			let delaySection
			if (direction < 0) {
				delaySection = this.activeSection.dataset.animFullpageDirectionUp
					? parseInt(this.activeSection.dataset.animFullpageDirectionUp)
					: 500
				document.documentElement.classList.add('--fullpage-up')
				document.documentElement.classList.remove('--fullpage-down')
			} else {
				delaySection = this.activeSection.dataset.animFullpageDirectionDown
					? parseInt(this.activeSection.dataset.animFullpageDirectionDown)
					: 500
				document.documentElement.classList.remove('--fullpage-up')
				document.documentElement.classList.add('--fullpage-down')
			}

			ANIM('_ANIM_FULLPAGE_GOTO', idSection)

			setTimeout(() => {
				this.events.transitionEnd()
			}, delaySection)

			// Switching callback + custom event
			this.options.onSwitching(this)
			document.dispatchEvent(
				new CustomEvent('fpswitching', {
					detail: { fp: this },
				}),
			)
		}
	}

	//===============================
	// Bullets
	setBullets() {
		this.bulletsWrapper = document.querySelector(
			`.${this.options.bulletsClass}`,
		)

		if (!this.bulletsWrapper) {
			const bullets = document.createElement('div')
			bullets.classList.add(this.options.bulletsClass)
			this.wrapper.append(bullets)
			this.bulletsWrapper = bullets
		}

		if (this.bulletsWrapper) {
			for (let index = 0; index < this.sections.length; index++) {
				const span = document.createElement('span')
				span.classList.add(this.options.bulletClass)
				this.bulletsWrapper.append(span)
			}
		}
	}

	//===============================
	// Z-INDEX
	setZIndex() {
		let zIndex = this.sections.length
		for (let index = 0; index < this.sections.length; index++) {
			this.sections[index].style.zIndex = zIndex
			--zIndex
		}
	}

	removeZIndex() {
		for (let index = 0; index < this.sections.length; index++) {
			this.sections[index].style.zIndex = ''
		}
	}
}

// Run and add to the modules object
if (document.querySelector('[data-anim-fullpage]')) {
	window.addEventListener(
		'load',
		() =>
			(window.animFullpage = new FullPage(
				document.querySelector('[data-anim-fullpage]'),
			)),
	)
}
