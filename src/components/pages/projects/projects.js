import './projects.scss'

// Scroll reveal
const revealObserver = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible')
				revealObserver.unobserve(entry.target)
			}
		})
	},
	{ threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
)

document.querySelectorAll('.section-reveal').forEach(el => revealObserver.observe(el))
