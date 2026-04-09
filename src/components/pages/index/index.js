import './index.scss'

// ── SCROLL REVEAL ───────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('is-visible')
			revealObserver.unobserve(entry.target)
		}
	})
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' })

document.querySelectorAll('.section-reveal').forEach(el => revealObserver.observe(el))

// ── SCROLL PROGRESS BAR ─────────────────────────────────────
const progressBar = document.createElement('div')
progressBar.className = 'scroll-progress'
document.body.prepend(progressBar)

window.addEventListener('scroll', () => {
	const maxScroll = document.body.scrollHeight - window.innerHeight
	if (maxScroll > 0) {
		progressBar.style.width = `${(window.scrollY / maxScroll) * 100}%`
	}
}, { passive: true })

// ── STAT COUNTER ANIMATION ──────────────────────────────────
function animateCount(el) {
	const raw = el.dataset.count
	if (!raw) return
	const match = raw.match(/^(\d+)(.*)$/)
	if (!match) return
	const target = parseInt(match[1])
	const suffix = match[2] || ''
	const duration = 1000
	const startTime = performance.now()

	;(function tick(now) {
		const elapsed = now - startTime
		const progress = Math.min(elapsed / duration, 1)
		const eased = 1 - Math.pow(1 - progress, 3)
		el.textContent = Math.floor(target * eased) + suffix
		if (progress < 1) requestAnimationFrame(tick)
		else el.textContent = raw
	})(startTime)
}

const countObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			animateCount(entry.target)
			countObserver.unobserve(entry.target)
		}
	})
}, { threshold: 0.8 })

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el))

// ── PROJECT LIST STAGGER ────────────────────────────────────
const projList = document.querySelector('.proj-list')
if (projList) {
	const projObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.querySelectorAll('.proj-item').forEach((item, i) => {
					setTimeout(() => item.classList.add('proj-item--visible'), i * 90)
				})
				projObserver.unobserve(entry.target)
			}
		})
	}, { threshold: 0.1 })
	projObserver.observe(projList)
}

// ── CUSTOM CURSOR ───────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
	const cursor = document.createElement('div')
	cursor.className = 'cursor'
	cursor.innerHTML = '<div class="cursor__dot"></div>'
	document.body.appendChild(cursor)

	document.addEventListener('mousemove', e => {
		cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
	})

	document.querySelectorAll('a, button').forEach(el => {
		el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'))
		el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'))
	})
}
