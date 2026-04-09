// Import logging / debug helper
import { ANIM } from '@js/common/functions.js'

/*
========================================================
ANIM FORM VALIDATION MODULE
========================================================

Provides validation utilities for forms.

--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ required field validation
✔ email validation
✔ checkbox validation
✔ success / error states
✔ custom error text
✔ automatic form reset
✔ compatibility with animSelect

--------------------------------------------------------
USAGE
--------------------------------------------------------

<form data-anim-form>

<input
	required
	data-anim-form-errtext="Please enter your email"
	type="email"
/>

</form>

========================================================
*/

export let formValidate = {
	/*
	====================================================
	CHECK FORM FOR ERRORS
	====================================================

	Scans all required fields and validates them.
	Returns number of errors found.
	*/

	getErrors(form) {
		ANIM(`_ANIM_FORM_VALIDATE`)

		let error = 0

		const formRequiredItems = form.querySelectorAll('[required]')

		if (formRequiredItems.length) {
			formRequiredItems.forEach(formRequiredItem => {
				// validate only visible inputs
				if (
					(formRequiredItem.offsetParent !== null ||
						formRequiredItem.tagName === 'SELECT') &&
					!formRequiredItem.disabled
				) {
					error += this.validateInput(formRequiredItem)
				}
			})
		}

		return error
	},

	/*
	====================================================
	VALIDATE SINGLE INPUT
	====================================================
	*/

	validateInput(formRequiredItem) {
		let error = 0

		/*
		--------------------------------------------
		EMAIL VALIDATION
		--------------------------------------------
		*/

		if (formRequiredItem.type === 'email') {
			// remove spaces
			formRequiredItem.value = formRequiredItem.value.replace(' ', '')

			if (this.emailTest(formRequiredItem)) {
				this.addError(formRequiredItem)
				this.removeSuccess(formRequiredItem)

				error++
			} else {
				this.removeError(formRequiredItem)
				this.addSuccess(formRequiredItem)
			}
		} else if (

		/*
		--------------------------------------------
		CHECKBOX VALIDATION
		--------------------------------------------
		*/
			formRequiredItem.type === 'checkbox' &&
			!formRequiredItem.checked
		) {
			this.addError(formRequiredItem)
			this.removeSuccess(formRequiredItem)

			error++
		} else {

		/*
		--------------------------------------------
		DEFAULT INPUT VALIDATION
		--------------------------------------------
		*/
			if (!formRequiredItem.value.trim()) {
				this.addError(formRequiredItem)
				this.removeSuccess(formRequiredItem)

				error++
			} else {
				this.removeError(formRequiredItem)
				this.addSuccess(formRequiredItem)
			}
		}

		return error
	},

	/*
	====================================================
	ADD ERROR STATE
	====================================================
	*/

	addError(formRequiredItem) {
		formRequiredItem.classList.add('--form-error')

		formRequiredItem.parentElement.classList.add('--form-error')

		// remove existing error message
		const inputError = formRequiredItem.parentElement.querySelector(
			'[data-anim-form-error]',
		)

		if (inputError) {
			formRequiredItem.parentElement.removeChild(inputError)
		}

		// add custom error message
		if (formRequiredItem.dataset.animFormErrtext) {
			formRequiredItem.parentElement.insertAdjacentHTML(
				'beforeend',
				`
				<div data-anim-form-error>
					${formRequiredItem.dataset.animFormErrtext}
				</div>
				`,
			)
		}
	},

	/*
	====================================================
	REMOVE ERROR STATE
	====================================================
	*/

	removeError(formRequiredItem) {
		formRequiredItem.classList.remove('--form-error')

		formRequiredItem.parentElement.classList.remove('--form-error')

		const errNode = formRequiredItem.parentElement.querySelector(
			'[data-anim-form-error]',
		)

		if (errNode) {
			formRequiredItem.parentElement.removeChild(errNode)
		}
	},

	/*
	====================================================
	ADD SUCCESS STATE
	====================================================
	*/

	addSuccess(formRequiredItem) {
		formRequiredItem.classList.add('--form-success')

		formRequiredItem.parentElement.classList.add('--form-success')
	},

	/*
	====================================================
	REMOVE SUCCESS STATE
	====================================================
	*/

	removeSuccess(formRequiredItem) {
		formRequiredItem.classList.remove('--form-success')

		formRequiredItem.parentElement.classList.remove('--form-success')
	},

	/*
	====================================================
	REMOVE FOCUS STATE
	====================================================
	*/

	removeFocus(formRequiredItem) {
		formRequiredItem.classList.remove('--form-focus')

		formRequiredItem.parentElement.classList.remove('--form-focus')
	},

	/*
	====================================================
	CLEAN FORM
	====================================================

	Resets form and removes all states.

	*/

	formClean(form) {
		form.reset()

		setTimeout(() => {
			const inputs = form.querySelectorAll('input,textarea')

			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index]

				formValidate.removeFocus(el)
				formValidate.removeSuccess(el)
				formValidate.removeError(el)
			}

			/*
			--------------------------------------------
			RESET CHECKBOXES
			--------------------------------------------
			*/

			const checkboxes = form.querySelectorAll('input[type="checkbox"]')

			if (checkboxes.length) {
				checkboxes.forEach(checkbox => {
					checkbox.checked = false
				})
			}

			/*
			--------------------------------------------
			REBUILD CUSTOM SELECTS
			--------------------------------------------
			*/

			if (window['animSelect']) {
				const selects = form.querySelectorAll('select[data-anim-select]')

				if (selects.length) {
					selects.forEach(select => {
						window['animSelect'].selectBuild(select)
					})
				}
			}
		}, 0)
	},

	/*
	====================================================
	EMAIL REGEX TEST
	====================================================
	*/

	emailTest(formRequiredItem) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(
			formRequiredItem.value,
		)
	},
}
