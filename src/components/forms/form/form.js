//Full Documentation: https://animmaster.github.io/docs/form.html

/*
========================================================
ANIM FORM MODULE
========================================================

Advanced form system with validation and AJAX support.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<form
	data-anim-form="ajax"
	action="send.php"
	method="POST"
>

	<input type="text" name="name" required>

	<button type="submit">Send</button>

</form>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-form="ajax"
send form via fetch()


data-anim-form="dev"
development mode


data-anim-form-popup="#popup-id"
open popup after submit


data-anim-form-gotoerr
scroll to first error


data-anim-form-novalidate
disable JS validation


data-anim-form-validatenow
validate on blur


data-anim-form-nofocus
disable focus class



--------------------------------------------------------
CLASSES ADDED
--------------------------------------------------------

--sending
form is sending


--form-focus
input focused


--form-error
validation error



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ AJAX submit
✔ validation
✔ popup integration
✔ scroll to error
✔ dev mode


========================================================
*/

// Import functionality
import { gotoBlock, ANIM } from '@js/common/functions.js'

// Validation
import { formValidate } from '../_functions.js'

// Styles
import './form.scss'

function formInit() {
	initFormSubmit()

	initFormFields()
}

/* ------------------------------------------------
FORM SUBMIT
------------------------------------------------ */

function initFormSubmit() {
	const forms = document.forms

	if (!forms.length) return

	for (const form of forms) {
		// disable native validation

		if (!form.hasAttribute('data-anim-form-novalidate')) {
			form.setAttribute('novalidate', true)
		}

		form.addEventListener('submit', e => {
			formSubmitAction(e.target, e)
		})

		form.addEventListener('reset', e => {
			formValidate.formClean(e.target)
		})
	}
}

async function formSubmitAction(form, e) {
	const error = formValidate.getErrors(form)

	if (error !== 0) {
		e.preventDefault()

		if (
			form.querySelector('.--form-error') &&
			form.hasAttribute('data-anim-form-gotoerr')
		) {
			const selector = form.dataset.animFormGotoerr || '.--form-error'

			gotoBlock(selector)
		}

		return
	}

	/* ------------------------------
	AJAX MODE
	------------------------------ */

	if (form.dataset.animForm === 'ajax') {
		e.preventDefault()

		const action = form.getAttribute('action')?.trim() || '#'

		const method = form.getAttribute('method')?.trim() || 'GET'

		const formData = new FormData(form)

		form.classList.add('--sending')

		const response = await fetch(action, {
			method,
			body: formData,
		})

		if (response.ok) {
			const result = await response.json()

			form.classList.remove('--sending')

			formSent(form, result)
		} else {
			ANIM('_ANIM_FORM_AJAX_ERR')

			form.classList.remove('--sending')
		}
	} else if (form.dataset.animForm === 'dev') {
		/* ------------------------------
	DEV MODE
	------------------------------ */
		e.preventDefault()

		formSent(form)
	}
}

/* ------------------------------------------------
AFTER SUBMIT
------------------------------------------------ */

function formSent(form, response = null) {
	document.dispatchEvent(
		new CustomEvent('formSent', {
			detail: { form },
		}),
	)

	setTimeout(() => {
		if (window.animPopup) {
			const popup = form.dataset.animFormPopup

			if (popup) window.animPopup.open(popup)
		}
	})

	formValidate.formClean(form)

	ANIM('_ANIM_FORM_SEND')
}

/* ------------------------------------------------
FIELDS
------------------------------------------------ */

function initFormFields() {
	document.body.addEventListener('focusin', e => {
		const el = e.target

		if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return

		if (!el.hasAttribute('data-anim-form-nofocus')) {
			el.classList.add('--form-focus')

			el.parentElement.classList.add('--form-focus')
		}

		if (el.hasAttribute('data-anim-form-validatenow')) {
			formValidate.removeError(el)
		}
	})

	document.body.addEventListener('focusout', e => {
		const el = e.target

		if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return

		if (!el.hasAttribute('data-anim-form-nofocus')) {
			el.classList.remove('--form-focus')

			el.parentElement.classList.remove('--form-focus')
		}

		if (el.hasAttribute('data-anim-form-validatenow')) {
			formValidate.validateInput(el)
		}
	})
}

/* ------------------------------------------------
INIT
------------------------------------------------ */

if (document.querySelector('[data-anim-form]')) {
	window.addEventListener('load', formInit)
}
