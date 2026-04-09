//Full Documentation: https://animmaster.github.io/docs/watcherdoc.html

/*
========================================================
ANIM SCROLL WATCHER MODULE
========================================================

Uses

IntersectionObserver API


Required attribute

data-anim-watcher


Optional attributes

data-anim-watcher-root=".container"
Parent container for observation


data-anim-watcher-margin="0px"
Trigger offset (like rootMargin)


data-anim-watcher-threshold="0.5"
Trigger point (0–1)


data-anim-watcher-once
Element will be observed only once


Special mode

data-anim-watcher="navigator"
Used with navigation highlighting


Example HTML

<div data-anim-watcher></div>

<div
	data-anim-watcher
	data-anim-watcher-margin="0px"
	data-anim-watcher-threshold="0.3"
></div>


CSS class added

--watcher-view

Element is inside viewport


Events

watcherCallback

Used by other modules
(example: navigation highlighting)

========================================================
*/

// Connecting functionality
import { isMobile, uniqArray, ANIM } from '@js/common/functions.js'

class ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: true,
		}

		this.config = Object.assign(defaultConfig, props)

		this.observer

		if (!document.documentElement.hasAttribute('data-anim-watch')) {
			this.scrollWatcherRun()
		}
	}

	/* ------------------------------------------------
	Update watcher
	------------------------------------------------ */

	scrollWatcherUpdate() {
		this.scrollWatcherRun()
	}

	/* ------------------------------------------------
	Init watcher
	------------------------------------------------ */

	scrollWatcherRun() {
		document.documentElement.setAttribute('data-anim-watch', '')

		this.scrollWatcherConstructor(
			document.querySelectorAll('[data-anim-watcher]'),
		)
	}

	/* ------------------------------------------------
	Create watchers
	------------------------------------------------ */

	scrollWatcherConstructor(items) {
		if (!items.length) {
			ANIM('_ANIM_WATCHER_SLEEP')
			return
		}

		ANIM(`_ANIM_WATCHER_START_WATCH`, items.length)

		let uniqParams = uniqArray(
			Array.from(items).map(item => {
				/* auto threshold for navigator */

				if (
					item.dataset.animWatcher === 'navigator' &&
					!item.dataset.animWatcherThreshold
				) {
					let valueOfThreshold

					if (item.clientHeight > 2) {
						valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1)

						if (valueOfThreshold > 1) {
							valueOfThreshold = 1
						}
					} else {
						valueOfThreshold = 1
					}

					item.setAttribute(
						'data-anim-watcher-threshold',
						valueOfThreshold.toFixed(2),
					)
				}

				return `${item.dataset.animWatcherRoot || null}|${item.dataset.animWatcherMargin || '0px'}|${item.dataset.animWatcherThreshold || 0}`
			}),
		)

		uniqParams.forEach(uniqParam => {
			let uniqParamArray = uniqParam.split('|')

			let paramsWatch = {
				root: uniqParamArray[0],
				margin: uniqParamArray[1],
				threshold: uniqParamArray[2],
			}

			let groupItems = Array.from(items).filter(item => {
				let watchRoot = item.dataset.animWatcherRoot || null
				let watchMargin = item.dataset.animWatcherMargin || '0px'
				let watchThreshold = item.dataset.animWatcherThreshold || 0

				if (
					String(watchRoot) === paramsWatch.root &&
					String(watchMargin) === paramsWatch.margin &&
					String(watchThreshold) === paramsWatch.threshold
				) {
					return item
				}
			})

			let configWatcher = this.getScrollWatcherConfig(paramsWatch)

			this.scrollWatcherInit(groupItems, configWatcher)
		})
	}

	/* ------------------------------------------------
	Observer settings
	------------------------------------------------ */

	getScrollWatcherConfig(paramsWatch) {
		let configWatcher = {}

		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root)
		} else if (paramsWatch.root !== 'null') {
			ANIM(`_ANIM_WATCHER_NOPARENT`, paramsWatch.root)
		}

		configWatcher.rootMargin = paramsWatch.margin

		if (
			paramsWatch.margin.indexOf('px') < 0 &&
			paramsWatch.margin.indexOf('%') < 0
		) {
			ANIM(`_ANIM_WATCHER_WARN_MARGIN`)
			return
		}

		if (paramsWatch.threshold === 'prx') {
			paramsWatch.threshold = []

			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i)
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',')
		}

		configWatcher.threshold = paramsWatch.threshold

		return configWatcher
	}

	/* ------------------------------------------------
	Create observer
	------------------------------------------------ */

	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer)
			})
		}, configWatcher)
	}

	/* ------------------------------------------------
	Init observer
	------------------------------------------------ */

	scrollWatcherInit(items, configWatcher) {
		this.scrollWatcherCreate(configWatcher)

		items.forEach(item => this.observer.observe(item))
	}

	/* ------------------------------------------------
	Element visible / hidden
	------------------------------------------------ */

	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			if (!targetElement.classList.contains('--watcher-view')) {
				targetElement.classList.add('--watcher-view')
			}

			ANIM(`_ANIM_WATCHER_VIEW`, targetElement.classList[0])
		} else {
			if (targetElement.classList.contains('--watcher-view')) {
				targetElement.classList.remove('--watcher-view')
			}

			ANIM(`_ANIM_WATCHER_NOVIEW`, targetElement.classList[0])
		}
	}

	/* ------------------------------------------------
	Stop observing element
	------------------------------------------------ */

	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement)

		ANIM(`_ANIM_WATCHER_STOP_WATCH`, targetElement.classList[0])
	}

	/* ------------------------------------------------
	Main callback
	------------------------------------------------ */

	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target

		this.scrollWatcherIntersecting(entry, targetElement)

		if (
			targetElement.hasAttribute('data-anim-watcher-once') &&
			entry.isIntersecting
		) {
			this.scrollWatcherOff(targetElement, observer)
		}

		document.dispatchEvent(
			new CustomEvent('watcherCallback', {
				detail: {
					entry: entry,
				},
			}),
		)
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-watcher]')
	? window.addEventListener('load', () => new ScrollWatcher({}))
	: null
