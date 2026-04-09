import './contact.scss'

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
	{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
)
document.querySelectorAll('.section-reveal').forEach(el => revealObserver.observe(el))

// ────────────────────────────────────────────────────────────
// Form validation + mailto submission
// ────────────────────────────────────────────────────────────
const form = document.getElementById('contactForm')
const successEl = document.getElementById('formSuccess')
const submitBtn = document.getElementById('formSubmit')

function showError(inputId, errId, message) {
	const input = document.getElementById(inputId)
	const err = document.getElementById(errId)
	if (input) input.classList.add('is-error')
	if (err) err.textContent = message
}

function clearErrors() {
	document.querySelectorAll('.form-input').forEach(el => el.classList.remove('is-error'))
	document.querySelectorAll('.form-error').forEach(el => el.textContent = '')
}

form?.addEventListener('submit', e => {
	e.preventDefault()
	clearErrors()

	const firstName = form.firstName.value.trim()
	const email = form.email.value.trim()
	const message = form.message.value.trim()
	let valid = true

	if (!firstName) {
		showError('firstName', 'firstNameErr', 'Please enter your first name.')
		valid = false
	}
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		showError('email', 'emailErr', 'Please enter a valid email address.')
		valid = false
	}
	if (!message) {
		showError('message', 'messageErr', 'Please write a message.')
		valid = false
	}

	if (!valid) return

	// Open mailto as fallback works without a backend
	const subject = encodeURIComponent(form.subject?.value.trim() || 'Portfolio enquiry')
	const body = encodeURIComponent(
		`From: ${firstName} ${form.lastName?.value.trim() || ''}\nEmail: ${email}\n\n${message}`
	)
	window.location.href = `mailto:contact@zacess.com?subject=${subject}&body=${body}`

	// Show success message
	submitBtn.disabled = true
	successEl.hidden = false
	form.querySelector('.form-submit').style.display = 'none'
})
