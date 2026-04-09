import './header.scss'
import { bodyLock, bodyUnlock } from '@js/common/functions.js'

const header = document.querySelector('.header')
const burger = document.querySelector('#navBurger')
const themeToggle = document.querySelector('#themeToggle')
const html = document.documentElement

// Scroll: add solid background after 40px
window.addEventListener('scroll', () => {
	header?.classList.toggle('header--scrolled', window.scrollY > 40)
}, { passive: true })

// Mobile menu toggle
burger?.addEventListener('click', () => {
	const isOpen = html.hasAttribute('data-anim-menu-open')
	if (isOpen) {
		html.removeAttribute('data-anim-menu-open')
		bodyUnlock(300)
	} else {
		html.setAttribute('data-anim-menu-open', '')
		bodyLock(300)
	}
})

// Close mobile menu on nav link click
document.querySelectorAll('.header__link').forEach(link => {
	link.addEventListener('click', () => {
		if (html.hasAttribute('data-anim-menu-open')) {
			html.removeAttribute('data-anim-menu-open')
			bodyUnlock(300)
		}
	})
})

// Theme toggle
themeToggle?.addEventListener('click', () => {
	const current = html.getAttribute('data-theme') || 'dark'
	const next = current === 'dark' ? 'light' : 'dark'
	html.setAttribute('data-theme', next)
	localStorage.setItem('theme', next)
})
