//Full Documentation: https://animmaster.github.io/docs/selectdoc.html

/*
========================================================
ANIM SELECT MODULE
========================================================

Custom animated select component that replaces
native <select> with a fully customizable UI.


--------------------------------------------------------
REQUIRED ATTRIBUTE
--------------------------------------------------------

data-anim-select

Applied to native <select> element


--------------------------------------------------------
EXAMPLE HTML
--------------------------------------------------------

<select data-anim-select>
	<option value="0" selected>Select option</option>
	<option value="1">Item 1</option>
	<option value="2">Item 2</option>
</select>


--------------------------------------------------------
HOW IT WORKS
--------------------------------------------------------

1. Script finds all <select data-anim-select>
2. Wraps each select into custom container
3. Hides native select (kept for forms)
4. Generates custom dropdown UI
5. Syncs selected value with native select


--------------------------------------------------------
GENERATED STRUCTURE
--------------------------------------------------------

<div class="select">

	<select hidden></select>

	<div class="select__body">

		<div class="select__title">
			<div class="select__value">
				<span class="select__content"></span>
			</div>
		</div>

		<div class="select__options">
			<div class="select__option"></div>
		</div>

	</div>

</div>


--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ custom dropdown UI
✔ smooth open / close animation
✔ native select compatibility (forms)
✔ click outside to close
✔ selected state highlighting
✔ disabled state support
✔ lightweight


--------------------------------------------------------
INTERACTION
--------------------------------------------------------

• Click on title → open / close dropdown
• Click on option → select value
• Click outside → close dropdown
• Change triggers native 'change' event


--------------------------------------------------------
STATES
--------------------------------------------------------

.--select-open
dropdown is open


.--select-selected
selected option


.--select-disabled
disabled state (from native select)


--------------------------------------------------------
DISABLED STATE
--------------------------------------------------------

Use native attribute:

<select data-anim-select disabled></select>

Component automatically applies disabled styles.


--------------------------------------------------------
CUSTOMIZATION
--------------------------------------------------------

You can fully customize via CSS:

.select__title {
	background: #000;
	color: #fff;
}

.select__option:hover {
	background: #ff3c3c;
}


--------------------------------------------------------
CONFIGURATION
--------------------------------------------------------

const select = new SelectConstructor({
	speed: 150
})

speed
animation duration (ms)


--------------------------------------------------------
NOTES
--------------------------------------------------------

• Native select is preserved for form submission
• Placeholder options (value="") are ignored in dropdown
• Supports dynamic updates (change event)
• Works with multiple selects on page


--------------------------------------------------------
UX IMPROVEMENTS (RECOMMENDED)
--------------------------------------------------------

Add hover animation:

.select__option {
	transition: 0.2s ease;
}

.select__title:hover {
	background: #e6e6e6;
}


--------------------------------------------------------
PRO FEATURES (EXTENDABLE)
--------------------------------------------------------

You can extend component with:

• search inside dropdown
• multi-select
• icons inside options
• async loading options

========================================================
*/
// Import animation helpers (used for dropdown animation)
import { slideUp, slideDown, slideToggle, ANIM } from '@js/common/functions.js'

// Import styles
import './select.scss'

/*
====================================================
  Custom Select Constructor
  This class transforms native <select> elements
  into animated custom dropdown components.
====================================================
*/

class SelectConstructor {
	constructor(props, data = null) {
		// Default configuration
		const defaultConfig = {
			init: true, // auto initialize on load
			speed: 150, // animation speed in ms
		}

		// Merge user props with defaults
		this.config = Object.assign(defaultConfig, props)

		// All CSS class names used in component
		this.selectClasses = {
			classSelect: 'select',
			classSelectBody: 'select__body',
			classSelectTitle: 'select__title',
			classSelectValue: 'select__value',
			classSelectContent: 'select__content',
			classSelectOptions: 'select__options',
			classSelectOption: 'select__option',
			classSelectOpen: '--select-open',
			classSelectDisabled: '--select-disabled',
			classSelectOptionSelected: '--select-selected',
		}

		// Auto initialize selects if enabled
		if (this.config.init) {
			const selectItems = data
				? document.querySelectorAll(data)
				: document.querySelectorAll('select[data-anim-select]')

			if (selectItems.length) {
				this.selectsInit(selectItems)
				ANIM(`_ANIM_SELECT_START`, selectItems.length)
			}
		}
	}

	/*
	====================================================
	  Utility Methods
	====================================================
	*/

	// Return CSS selector string (adds dot before class)
	getSelectClass(className) {
		return `.${className}`
	}

	// Return original <select> and optional inner element
	getSelectElement(selectItem, className = null) {
		return {
			originalSelect: selectItem.querySelector('select'),
			selectElement: className
				? selectItem.querySelector(this.getSelectClass(className))
				: selectItem,
		}
	}

	/*
	====================================================
	  Initialization Methods
	====================================================
	*/

	// Initialize all found select elements
	selectsInit(selectItems) {
		selectItems.forEach((originalSelect, index) => {
			this.selectInit(originalSelect, index + 1)
		})

		// Global click listener for interaction
		document.addEventListener('click', this.selectsActions.bind(this))
	}

	// Initialize single select
	selectInit(originalSelect, index) {
		// Do nothing if no options exist
		if (!originalSelect.options.length) return

		// Assign unique ID
		originalSelect.dataset.animSelectId = index

		// Create main wrapper div
		const selectItem = document.createElement('div')
		selectItem.classList.add(this.selectClasses.classSelect)

		// Insert wrapper before native select
		originalSelect.parentNode.insertBefore(selectItem, originalSelect)

		// Move native select inside wrapper
		selectItem.appendChild(originalSelect)

		// Hide native select (keep for form submission)
		originalSelect.hidden = true

		// Build basic HTML structure for custom select
		selectItem.insertAdjacentHTML(
			'beforeend',
			`<div class="${this.selectClasses.classSelectBody}">
				<div class="${this.selectClasses.classSelectTitle}">
					<div class="${this.selectClasses.classSelectValue}">
						<span class="${this.selectClasses.classSelectContent}"></span>
					</div>
				</div>
				<div hidden class="${this.selectClasses.classSelectOptions}"></div>
			</div>`,
		)

		// Build UI
		this.selectBuild(originalSelect)

		// Rebuild UI when native select value changes
		originalSelect.addEventListener('change', () => {
			this.selectBuild(originalSelect)
		})
	}

	/*
	====================================================
	  Build Methods
	====================================================
	*/

	// Rebuild select UI (title + options + state)
	selectBuild(originalSelect) {
		const selectItem = originalSelect.parentElement

		this.setSelectTitleValue(selectItem, originalSelect)
		this.setOptions(selectItem, originalSelect)
		this.selectDisabled(selectItem, originalSelect)
	}

	// Update selected value text inside title
	setSelectTitleValue(selectItem, originalSelect) {
		const content = selectItem.querySelector(
			this.getSelectClass(this.selectClasses.classSelectContent),
		)

		const selectedOption = originalSelect.options[originalSelect.selectedIndex]

		if (selectedOption) {
			content.textContent = selectedOption.text
		}
	}

	// Generate dropdown option elements
	setOptions(selectItem, originalSelect) {
		const optionsContainer = selectItem.querySelector(
			this.getSelectClass(this.selectClasses.classSelectOptions),
		)

		// Clear previous options
		optionsContainer.innerHTML = ''

		Array.from(originalSelect.options).forEach(option => {
			// Skip empty placeholder options
			if (!option.value) return

			const optionItem = document.createElement('div')
			optionItem.classList.add(this.selectClasses.classSelectOption)

			// Store value in dataset
			optionItem.dataset.value = option.value

			// Set display text
			optionItem.textContent = option.text

			// Mark selected option visually
			if (option.selected) {
				optionItem.classList.add(this.selectClasses.classSelectOptionSelected)
			}

			optionsContainer.appendChild(optionItem)
		})
	}

	/*
	====================================================
	  Interaction / Events
	====================================================
	*/

	// Global click handler
	selectsActions(e) {
		const target = e.target

		// Find closest select wrapper
		const selectItem = target.closest(
			this.getSelectClass(this.selectClasses.classSelect),
		)

		// If clicked outside any select → close all
		if (!selectItem) {
			this.closeAll()
			return
		}

		const originalSelect = this.getSelectElement(selectItem).originalSelect

		// If title clicked → toggle dropdown
		if (
			target.closest(this.getSelectClass(this.selectClasses.classSelectTitle))
		) {
			this.toggleSelect(selectItem)
		}

		// If option clicked → change value
		const option = target.closest(
			this.getSelectClass(this.selectClasses.classSelectOption),
		)

		if (option) {
			this.optionAction(selectItem, originalSelect, option)
		}
	}

	// Open / Close dropdown
	toggleSelect(selectItem) {
		const options = selectItem.querySelector(
			this.getSelectClass(this.selectClasses.classSelectOptions),
		)

		selectItem.classList.toggle(this.selectClasses.classSelectOpen)

		// If opened → slideDown
		if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
			options.hidden = false
			slideDown(options, this.config.speed)
		} else {
			// If closed → slideUp
			slideUp(options, this.config.speed)
		}
	}

	// Handle option click logic
	optionAction(selectItem, originalSelect, optionItem) {
		const value = optionItem.dataset.value

		// Update native select value
		originalSelect.value = value

		// Remove selected class from all options
		selectItem
			.querySelectorAll(
				this.getSelectClass(this.selectClasses.classSelectOption),
			)
			.forEach(el =>
				el.classList.remove(this.selectClasses.classSelectOptionSelected),
			)

		// Add selected class to clicked option
		optionItem.classList.add(this.selectClasses.classSelectOptionSelected)

		// Update title text
		this.setSelectTitleValue(selectItem, originalSelect)

		// Close dropdown
		this.toggleSelect(selectItem)

		// Trigger native change event manually
		originalSelect.dispatchEvent(new Event('change'))
	}

	/*
	====================================================
	  Utility State Methods
	====================================================
	*/

	// Close all selects on page
	closeAll() {
		document
			.querySelectorAll(this.getSelectClass(this.selectClasses.classSelect))
			.forEach(selectItem => {
				selectItem.classList.remove(this.selectClasses.classSelectOpen)

				const options = selectItem.querySelector(
					this.getSelectClass(this.selectClasses.classSelectOptions),
				)

				slideUp(options, this.config.speed)
			})
	}

	// Apply disabled state
	selectDisabled(selectItem, originalSelect) {
		if (originalSelect.disabled) {
			selectItem.classList.add(this.selectClasses.classSelectDisabled)
		} else {
			selectItem.classList.remove(this.selectClasses.classSelectDisabled)
		}
	}
}

/*
====================================================
  Auto Initialization on Page Load
====================================================
*/

document.querySelector('select[data-anim-select]')
	? window.addEventListener(
			'load',
			() => (window.animSelect = new SelectConstructor({})),
		)
	: null
