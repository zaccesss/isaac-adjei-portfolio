//Full Documentation: https://animmaster.github.io/docs/dynamic.html

/*
========================================================
ANIM DYNAMIC ADAPT MODULE
========================================================

Moves elements in DOM depending on screen width

Works similar to CSS container queries,
but allows real DOM relocation.


Required attribute

data-anim-dynamic="selector,breakpoint,place,parent"


Parameters

selector
destination element


breakpoint
screen width trigger


place
position inside destination

first
last
number index 0,1,2 ...


parent (optional)
search scope


Example

data-anim-dynamic=".menu,991,last"


HTML example

<div class="header__actions"
	data-anim-dynamic=".mobile-menu,991,last">
</div>


How it works

Desktop

header
 └ actions


Mobile

mobile-menu
 └ actions


Features

✔ responsive DOM movement
✔ breakpoint control
✔ precise insertion position
✔ return to original position
✔ lightweight

========================================================
*/

// Import functionality
import { ANIM } from '@js/common/functions.js'

class DynamicAdapt {
	constructor() {
		this.type = 'max'

		this.init()
	}

	/* ------------------------------------------------
	Init
	------------------------------------------------ */

	init() {
		this.objects = []

		this.daClassname = '--dynamic'

		this.nodes = [...document.querySelectorAll('[data-anim-dynamic]')]

		ANIM('_ANIM_DA_START', this.nodes.length)

		this.nodes.forEach(node => {
			const data = node.dataset.animDynamic.trim()

			const dataArray = data.split(`,`)

			const object = {}

			object.element = node

			object.parent = node.parentNode

			object.destinationParent = dataArray[3]
				? node.closest(dataArray[3].trim()) || document
				: document

			const parentObjectSelector = dataArray[3] ? dataArray[3].trim() : null

			const objectSelector = dataArray[0] ? dataArray[0].trim() : null

			if (objectSelector) {
				let errorMessage

				if (parentObjectSelector) {
					errorMessage = `${parentObjectSelector} ${objectSelector}`
				} else {
					errorMessage = objectSelector
				}

				const foundDestination =
					object.destinationParent.querySelector(objectSelector)

				if (foundDestination) {
					object.destination = foundDestination
				} else {
					ANIM('_ANIM_DA_NONODE', errorMessage)
				}
			} else {
				ANIM('_ANIM_DA_ADDNODE')
			}

			object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`

			object.place = dataArray[2] ? dataArray[2].trim() : `last`

			object.index = this.indexInParent(object.parent, object.element)

			this.objects.push(object)
		})

		this.arraySort(this.objects)

		this.mediaQueries = this.objects

			.map(
				({ breakpoint }) =>
					`(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`,
			)

			.filter((item, index, self) => self.indexOf(item) === index)

		this.mediaQueries.forEach(media => {
			const mediaSplit = media.split(',')

			const matchMedia = window.matchMedia(mediaSplit[0])

			const mediaBreakpoint = mediaSplit[1]

			const objectsFilter = this.objects.filter(
				({ breakpoint }) => breakpoint === mediaBreakpoint,
			)

			matchMedia.addEventListener('change', () => {
				this.mediaHandler(matchMedia, objectsFilter)
			})

			this.mediaHandler(matchMedia, objectsFilter)
		})
	}

	/* ------------------------------------------------
	Media handler
	------------------------------------------------ */

	mediaHandler(matchMedia, objects) {
		if (matchMedia.matches) {
			objects.forEach(object => {
				if (object.destination) {
					this.moveTo(object.place, object.element, object.destination)
				}
			})
		} else {
			objects.forEach(({ parent, element, index }) => {
				if (element.classList.contains(this.daClassname)) {
					this.moveBack(parent, element, index)
				}
			})
		}
	}

	/* ------------------------------------------------
	Move element
	------------------------------------------------ */

	moveTo(place, element, destination) {
		ANIM('_ANIM_DA_MOVETO', [element.classList[0], destination.classList[0]])

		element.classList.add(this.daClassname)

		const index =
			place === 'last' || place === 'first' ? place : parseInt(place, 10)

		if (index === 'last' || index >= destination.children.length) {
			destination.append(element)
		} else if (index === 'first') {
			destination.prepend(element)
		} else {
			destination.children[index].before(element)
		}
	}

	/* ------------------------------------------------
	Return element
	------------------------------------------------ */

	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname)

		if (parent.children[index] !== undefined) {
			parent.children[index].before(element)
		} else {
			parent.append(element)
		}

		ANIM('_ANIM_DA_MOVEBACK', [element.classList[0], parent.classList[0]])
	}

	indexInParent(parent, element) {
		return [...parent.children].indexOf(element)
	}

	/* ------------------------------------------------
	Sort breakpoints
	------------------------------------------------ */

	arraySort(arr) {
		if (this.type === 'min') {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) return 0

					if (a.place === 'first' || b.place === 'last') return -1

					if (a.place === 'last' || b.place === 'first') return 1

					return 0
				}

				return a.breakpoint - b.breakpoint
			})
		} else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) return 0

					if (a.place === 'first' || b.place === 'last') return 1

					if (a.place === 'last' || b.place === 'first') return -1

					return 0
				}

				return b.breakpoint - a.breakpoint
			})
		}
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

if (document.querySelector('[data-anim-dynamic]')) {
	window.addEventListener(
		'load',
		() => (window.animDynamic = new DynamicAdapt()),
	)
}
