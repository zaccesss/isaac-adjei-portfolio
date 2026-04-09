// Popup module
// Snippet (HTML): pl
/*

//Full Documentation: https://animmaster.github.io/docs/popup.html

======================================================
ANIM POPUP MODULE
======================================================

BUTTON ATTRIBUTES

data-anim-popup-link="popup-name"
Button that opens popup

data-anim-popup-close
Button that closes popup


POPUP ELEMENT

data-anim-popup="popup-name"
Main popup container


POPUP STRUCTURE

data-anim-popup-body
Popup content wrapper (click outside closes popup)


YOUTUBE POPUP

data-anim-popup-youtube="VIDEO_ID"
Attach YouTube video to open button

data-anim-popup-youtube-place
Container where iframe will be injected


ADVANCED FEATURES

data-anim-popup-autoplay="5000"
Open popup automatically after delay (ms)

data-anim-popup-once
Popup opens only once per session

data-anim-popup-no-overlay-close
Disable closing popup by clicking overlay

data-anim-popup-no-esc
Disable ESC closing

data-anim-popup-lock
Popup cannot be closed

data-anim-popup-delay-close="2000"
Auto close popup after delay (ms)


GLOBAL STATES

[data-anim-popup-open]
Added to <html> when popup is open


JS API

animPopup.open("popup-name")
animPopup.close()


EVENTS

beforePopupOpen
afterPopupOpen
beforePopupClose
afterPopupClose

======================================================
*/

import { bodyLock, bodyUnlock, bodyLockStatus } from '@js/common/functions.js'

class Popup {
	constructor() {
		this.isOpen = false
		this.activePopup = null
		this.lastFocus = null
		this.closeTimer = null
		this.youtubeCode = null
		this.hash = null

		this.app = document.getElementById('app')

		this.init()
	}

	/* ---------------- INIT ---------------- */

	init() {
		document.addEventListener('click', this.handleClick.bind(this))
		document.addEventListener('keydown', this.handleKeydown.bind(this))

		window.addEventListener('hashchange', this.handleHash.bind(this))

		this.initAutoplay()

		if (window.location.hash) {
			this.openFromHash()
		}
	}

	/* ---------------- AUTOPLAY ---------------- */

	initAutoplay() {
		const popups = document.querySelectorAll('[data-anim-popup-autoplay]')

		popups.forEach(popup => {
			const delay = parseInt(popup.dataset.animPopupAutoplay)

			if (!delay) return

			setTimeout(() => {
				const selector = popup.dataset.animPopup
				this.open(selector)
			}, delay)
		})
	}

	/* ---------------- HELPERS ---------------- */

	setInert(state) {
		if (!this.app) return

		if (state) this.app.setAttribute('inert', '')
		else this.app.removeAttribute('inert')
	}

	getFocusable(popup) {
		return popup.querySelectorAll(
			'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
	}

	isTippy(target) {
		return (
			target.closest('[data-anim-tippy-content]') ||
			target.closest('.tippy-box')
		)
	}

	/* ---------------- EVENTS ---------------- */

	handleClick(e) {
		if (this.isTippy(e.target)) return

		const openBtn = e.target.closest('[data-anim-popup-link]')
		const closeBtn = e.target.closest('[data-anim-popup-close]')

		if (openBtn) {
			e.preventDefault()

			const selector = openBtn.getAttribute('data-anim-popup-link')

			this.youtubeCode = openBtn.getAttribute('data-anim-popup-youtube')

			this.open(selector, openBtn)
			return
		}

		if (!this.isOpen) return

		const noOverlayClose =
			this.activePopup?.hasAttribute('data-anim-popup-no-overlay-close')

		if (
			closeBtn ||
			(!e.target.closest('[data-anim-popup-body]') && !noOverlayClose)
		) {
			e.preventDefault()
			this.close()
		}
	}

	handleKeydown(e) {
		if (!this.isOpen || !this.activePopup) return

		const disableEsc = this.activePopup?.hasAttribute('data-anim-popup-no-esc')

		if (e.key === 'Escape' && !disableEsc) {
			e.preventDefault()
			this.close()
		}

		if (e.key === 'Tab') {
			this.trapTab(e)
		}
	}

	handleHash() {
		if (window.location.hash) {
			this.openFromHash()
		} else {
			this.close()
		}
	}

	/* ---------------- HASH ---------------- */

	openFromHash() {
		const selector = window.location.hash.replace('#', '')

		if (!selector) return

		const btn = document.querySelector(
			`[data-anim-popup-link="${selector}"]`
		)

		if (btn) {
			this.youtubeCode = btn.getAttribute('data-anim-popup-youtube')
		}

		this.open(selector)
	}

	setHash(selector) {
		history.pushState('', '', `#${selector}`)
	}

	removeHash() {
		history.pushState('', '', window.location.pathname)
	}

	/* ---------------- OPEN ---------------- */

	open(selector, triggerEl) {
		const popup = document.querySelector(`[data-anim-popup="${selector}"]`)
		if (!popup) return

		if (popup.hasAttribute('data-anim-popup-once')) {
			const key = `popup-${selector}`

			if (sessionStorage.getItem(key)) return

			sessionStorage.setItem(key, true)
		}

		clearTimeout(this.closeTimer)

		if (this.activePopup && this.activePopup !== popup) {
			this.close()
		}

		this.lastFocus = triggerEl || document.activeElement

		this.activePopup = popup
		this.isOpen = true

		popup.hidden = false
		popup.setAttribute('data-anim-popup-active', '')
		popup.removeAttribute('aria-hidden')

		this.setHash(selector)

		document.documentElement.setAttribute('data-anim-popup-open', '')

		if (bodyLockStatus) bodyLock()

		this.setInert(true)

		this.insertYoutube()

		this.focusFirst()

		const autoClose = popup.dataset.animPopupDelayClose

		if (autoClose) {
			setTimeout(() => {
				this.close()
			}, parseInt(autoClose))
		}

		document.dispatchEvent(
			new CustomEvent('afterPopupOpen', { detail: { popup: this } })
		)
	}

	/* ---------------- CLOSE ---------------- */

	close() {
		if (!this.isOpen || !this.activePopup) return

		if (this.activePopup.hasAttribute('data-anim-popup-lock')) return

		const popup = this.activePopup

		popup.removeAttribute('data-anim-popup-active')
		popup.setAttribute('aria-hidden', 'true')

		document.documentElement.removeAttribute('data-anim-popup-open')

		if (bodyLockStatus) bodyUnlock()

		this.setInert(false)

		this.removeHash()

		this.removeYoutube()

		this.isOpen = false
		this.activePopup = null

		this.closeTimer = setTimeout(() => {
			popup.hidden = true
		}, 350)

		this.lastFocus?.focus()

		document.dispatchEvent(
			new CustomEvent('afterPopupClose', { detail: { popup: this } })
		)
	}

	/* ---------------- YOUTUBE ---------------- */

	insertYoutube() {
		if (!this.youtubeCode || !this.activePopup) return

		const place =
			this.activePopup.querySelector('[data-anim-popup-youtube-place]') ||
			this.activePopup.querySelector('[data-anim-popup-body]')

		if (!place) return

		const iframe = document.createElement('iframe')

		iframe.src = `https://www.youtube.com/embed/${this.youtubeCode}?rel=0&showinfo=0&autoplay=1`

		iframe.setAttribute('allowfullscreen', '')
		iframe.setAttribute('allow', 'autoplay; encrypted-media')

		iframe.setAttribute('data-anim-popup-youtube-place', '')

		place.appendChild(iframe)
	}

	removeYoutube() {
		if (!this.activePopup) return

		const iframe = this.activePopup.querySelector(
			'[data-anim-popup-youtube-place]'
		)

		if (iframe) iframe.remove()
	}

	/* ---------------- FOCUS ---------------- */

	focusFirst() {
		const focusable = this.getFocusable(this.activePopup)

		if (focusable.length) focusable[0].focus()
	}

	trapTab(e) {
		const focusable = this.getFocusable(this.activePopup)

		if (!focusable.length) return

		const first = focusable[0]
		const last = focusable[focusable.length - 1]

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault()
			last.focus()
		}

		if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault()
			first.focus()
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (document.querySelector('[data-anim-popup]')) {
		window.animPopup = new Popup()
	}
})