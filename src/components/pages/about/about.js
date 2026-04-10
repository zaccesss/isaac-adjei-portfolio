import './about.scss'

// Scroll reveal
const revealObs = new IntersectionObserver(
	entries => entries.forEach(e => {
		if (e.isIntersecting) {
			e.target.classList.add('is-visible')
			revealObs.unobserve(e.target)
		}
	}),
	{ threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
)

document.querySelectorAll('.section-reveal').forEach(el => revealObs.observe(el))

// Scroll progress
const bar = document.createElement('div')
bar.className = 'scroll-progress'
document.body.appendChild(bar)

window.addEventListener('scroll', () => {
	const max = document.documentElement.scrollHeight - window.innerHeight
	bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%'
}, { passive: true })

// Header scroll state
const header = document.querySelector('.header')
if (header) {
	window.addEventListener('scroll', () => {
		header.classList.toggle('header--scrolled', window.scrollY > 20)
	}, { passive: true })
}
