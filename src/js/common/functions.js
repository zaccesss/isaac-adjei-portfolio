//  (Full Logging System)
export function ANIM(text, vars = '') {
	if (animLogging) {
		if (animLang[text]) {
			if (Array.isArray(vars)) {
				let i = 0
				text = animLang[text].replace(/@@/g, () => vars[i++])
			} else {
				text = text.replace(text, animLang[text].replace('@@', vars))
			}
		}
		setTimeout(() => {
			if (text.startsWith('(!)')) {
				console.warn(text.replace('(!)', ''))
			} else if (text.startsWith('(!!)')) {
				console.error(text.replace('(!!)', ''))
			} else {
				console.log(text)
			}
		}, 0)
	}
}

/* Mobile browser check */
export const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i)
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i)
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i)
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i)
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i)
	},
	any: function () {
		return (
			isMobile.Android() ||
			isMobile.BlackBerry() ||
			isMobile.iOS() ||
			isMobile.Opera() ||
			isMobile.Windows()
		)
	},
}

/* Add touch attribute to HTML if the browser is mobile */
export function addTouchAttr() {
	// Add data-anim-touch to HTML if the browser is mobile
	if (isMobile.any())
		document.documentElement.setAttribute('data-anim-touch', '')
}

// Add loaded attribute to HTML after the page is fully loaded
export function addLoadedAttr() {
	if (!document.documentElement.hasAttribute('data-anim-preloader-loading')) {
		window.addEventListener('load', function () {
			setTimeout(function () {
				document.documentElement.setAttribute('data-anim-loaded', '')
			}, 0)
		})
	}
}

// Get hash from the site URL
export function getHash() {
	if (location.hash) {
		return location.hash.replace('#', '')
	}
}

// Set hash in the site URL
export function setHash(hash) {
	hash = hash ? `#${hash}` : window.location.href.split('#')[0]
	history.pushState('', '', hash)
}

// Helper modules for smooth slide up/down
export let slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('--slide')) {
		target.classList.add('--slide')
		target.style.transitionProperty = 'height, margin, padding'
		target.style.transitionDuration = duration + 'ms'
		target.style.height = `${target.offsetHeight}px`
		target.offsetHeight
		target.style.overflow = 'hidden'
		target.style.height = showmore ? `${showmore}px` : `0px`
		target.style.paddingTop = 0
		target.style.paddingBottom = 0
		target.style.marginTop = 0
		target.style.marginBottom = 0
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false
			!showmore ? target.style.removeProperty('height') : null
			target.style.removeProperty('padding-top')
			target.style.removeProperty('padding-bottom')
			target.style.removeProperty('margin-top')
			target.style.removeProperty('margin-bottom')
			!showmore ? target.style.removeProperty('overflow') : null
			target.style.removeProperty('transition-duration')
			target.style.removeProperty('transition-property')
			target.classList.remove('--slide')
			// Create event
			document.dispatchEvent(
				new CustomEvent('slideUpDone', {
					detail: { target: target },
				})
			)
		}, duration)
	}
}

export let slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('--slide')) {
		target.classList.add('--slide')
		target.hidden = target.hidden ? false : null
		showmore ? target.style.removeProperty('height') : null
		let height = target.offsetHeight
		target.style.overflow = 'hidden'
		target.style.height = showmore ? `${showmore}px` : `0px`
		target.style.paddingTop = 0
		target.style.paddingBottom = 0
		target.style.marginTop = 0
		target.style.marginBottom = 0
		target.offsetHeight
		target.style.transitionProperty = 'height, margin, padding'
		target.style.transitionDuration = duration + 'ms'
		target.style.height = height + 'px'
		target.style.removeProperty('padding-top')
		target.style.removeProperty('padding-bottom')
		target.style.removeProperty('margin-top')
		target.style.removeProperty('margin-bottom')
		window.setTimeout(() => {
			target.style.removeProperty('height')
			target.style.removeProperty('overflow')
			target.style.removeProperty('transition-duration')
			target.style.removeProperty('transition-property')
			target.classList.remove('--slide')
			// Create event
			document.dispatchEvent(
				new CustomEvent('slideDownDone', {
					detail: { target: target },
				})
			)
		}, duration)
	}
}

export let slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return slideDown(target, duration)
	} else {
		return slideUp(target, duration)
	}
}

// Helper modules for locking scroll and preventing layout jump
export let bodyLockStatus = true

export let bodyLockToggle = (delay = 500) => {
	if (document.documentElement.hasAttribute('data-anim-scrolllock')) {
		bodyUnlock(delay)
	} else {
		bodyLock(delay)
	}
}

export let bodyUnlock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll('[data-anim-lp]')
		setTimeout(() => {
			lockPaddingElements.forEach(lockPaddingElement => {
				lockPaddingElement.style.paddingRight = ''
			})
			document.body.style.paddingRight = ''
			document.documentElement.removeAttribute('data-anim-scrolllock')
		}, delay)

		bodyLockStatus = false
		setTimeout(function () {
			bodyLockStatus = true
		}, delay)
	}
}

export let bodyLock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll('[data-anim-lp]')
		const lockPaddingValue =
			window.innerWidth - document.body.offsetWidth + 'px'

		lockPaddingElements.forEach(lockPaddingElement => {
			lockPaddingElement.style.paddingRight = lockPaddingValue
		})

		document.body.style.paddingRight = lockPaddingValue
		document.documentElement.setAttribute('data-anim-scrolllock', '')

		bodyLockStatus = false
		setTimeout(function () {
			bodyLockStatus = true
		}, delay)
	}
}

// Get key by value in an object
export function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value)
}

// Extract digits from a string
export function getDigFromString(item) {
	return parseInt(item.replace(/[^\d]/g, ''))
}

// Format numbers like 100 000 000
export function getDigFormat(item, sepp = ' ') {
	return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${sepp}`)
}

// Remove a class from all elements in an array
export function removeClasses(array, className) {
	for (var i = 0; i < array.length; i++) {
		array[i].classList.remove(className)
	}
}

// Make array values unique
export function uniqArray(array) {
	return array.filter((item, index, self) => self.indexOf(item) === index)
}

// Get an element's index inside its parent
export function indexInParent(parent, element) {
	const array = Array.prototype.slice.call(parent.children)
	return Array.prototype.indexOf.call(array, element)
}

// Check if an element is hidden
export function isHidden(el) {
	return el.offsetParent === null
}

// Handle media queries from data attributes
export function dataMediaQueries(array, dataSetValue) {
	const media = Array.from(array)
		.filter(item => item.dataset[dataSetValue])
		.map(item => {
			const [value, type = 'max'] = item.dataset[dataSetValue].split(',')
			return { value, type, item }
		})

	if (media.length === 0) return []

	// Get unique breakpoints
	const breakpointsArray = media.map(
		({ value, type }) => `(${type}-width: ${value}px),${value},${type}`
	)
	const uniqueQueries = [...new Set(breakpointsArray)]

	return uniqueQueries.map(query => {
		const [mediaQuery, mediaBreakpoint, mediaType] = query.split(',')
		const matchMedia = window.matchMedia(mediaQuery)

		// Filter objects with the required conditions
		const itemsArray = media.filter(
			item => item.value === mediaBreakpoint && item.type === mediaType
		)

		return { itemsArray, matchMedia }
	})
}

// Smooth scroll module to a block
export const gotoBlock = (
	targetBlock,
	noHeader = false,
	speed = 500,
	offsetTop = 0
) => {
	const targetBlockElement = document.querySelector(targetBlock)
	if (targetBlockElement) {
		let headerItem = ''
		let headerItemHeight = 0

		if (noHeader) {
			headerItem = 'header.header'
			const headerElement = document.querySelector(headerItem)

			if (!headerElement.classList.contains('--header-scroll')) {
				headerElement.style.cssText = `transition-duration: 0s;`
				headerElement.classList.add('--header-scroll')
				headerItemHeight = headerElement.offsetHeight
				headerElement.classList.remove('--header-scroll')

				setTimeout(() => {
					headerElement.style.cssText = ``
				}, 0)
			} else {
				headerItemHeight = headerElement.offsetHeight
			}
		}

		// Close the menu if it's open
		if (document.documentElement.hasAttribute('data-anim-menu-open')) {
			bodyUnlock()
			document.documentElement.removeAttribute('data-anim-menu-open')
		}

		// Scroll using native tools
		let targetBlockElementPosition =
			targetBlockElement.getBoundingClientRect().top + scrollY
		targetBlockElementPosition = headerItemHeight
			? targetBlockElementPosition - headerItemHeight
			: targetBlockElementPosition
		targetBlockElementPosition = offsetTop
			? targetBlockElementPosition - offsetTop
			: targetBlockElementPosition

		window.scrollTo({
			top: targetBlockElementPosition,
			behavior: 'smooth',
		})

		ANIM(`_ANIM_SCROLLTO_GOTO`, targetBlock)
	} else {
		ANIM(`_ANIM_SCROLLTO_WARN`, targetBlock)
	}
}

export function formatDate(date, sepp) {
	const d = new Date(date)
	const day = String(d.getDate()).padStart(2, '0')
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const year = d.getFullYear()
	return `${day}${sepp}${month}${sepp}${year}`
}


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 



// Smart video runtime chooser (requires data-variants JSON on <video>)

function pickBestVideoSource(videoEl) {
	let variants
	try {
		variants = JSON.parse(videoEl.getAttribute('data-variants') || '[]')
	} catch {
		variants = []
	}
	if (!variants.length) return null

	// 1) Format preference: WebM if likely supported, else MP4
	const vtest = document.createElement('video')
	const prefersWebm =
		vtest.canPlayType('video/webm; codecs="vp9"') === 'probably' ||
		vtest.canPlayType('video/webm') === 'probably'

	const fmt = prefersWebm ? 'webm' : 'mp4'

	// 2) Screen targeting
	const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	const dpr = window.devicePixelRatio || 1
	let wanted = vh * (dpr >= 1.5 ? 1 : 0.85)

	// 3) Network: save data / slow
	const conn =
		navigator.connection ||
		navigator.webkitConnection ||
		navigator.mozConnection

	const saveData = conn?.saveData === true
	const slow = saveData || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType || '')
	if (slow) wanted = Math.min(wanted, 480)

	// 4) Choose closest <= wanted (variants are like [{h, src:{mp4,webm}}])
	const sorted = [...variants].sort((a, b) => b.h - a.h)
	const choice = sorted.find(v => v.h <= wanted) || sorted[sorted.length - 1]

	// 5) Final src
	const src = choice?.src?.[fmt] || choice?.src?.mp4 || choice?.src?.webm
	if (!src) return null
	const type = src.endsWith('.webm') ? 'video/webm' : 'video/mp4'
	return { src, type }
}

function applyBestSource(videoEl) {
	const best = pickBestVideoSource(videoEl)
	if (!best) return

	// remove existing sources to avoid extra requests
	;[...videoEl.querySelectorAll('source')].forEach(n => n.remove())

	const s = document.createElement('source')
	s.src = best.src
	s.type = best.type
	videoEl.appendChild(s)

	// autoplay attributes
	videoEl.muted = true
	videoEl.autoplay = true
	videoEl.playsInline = true
	videoEl.setAttribute('muted', '')
	videoEl.setAttribute('playsinline', '')
	videoEl.setAttribute('webkit-playsinline', '')

	videoEl.load()
	const p = videoEl.play?.()
	if (p && typeof p.then === 'function') {
		p.catch(() => {
			const resume = () => {
				videoEl.play().catch(() => {})
				window.removeEventListener('pointerdown', resume)
				window.removeEventListener('touchstart', resume)
				window.removeEventListener('click', resume)
				window.removeEventListener('keydown', resume)
			}
			window.addEventListener('pointerdown', resume, { once: true })
			window.addEventListener('touchstart', resume, { once: true })
			window.addEventListener('click', resume, { once: true })
			window.addEventListener('keydown', resume, { once: true })
		})
	}
}

function initSmartVideos() {
	document.querySelectorAll('video[data-variants]').forEach(applyBestSource)

	const conn =
		navigator.connection ||
		navigator.webkitConnection ||
		navigator.mozConnection

	if (conn) {
		conn.addEventListener?.('change', () => {
			document.querySelectorAll('video[data-variants]').forEach(applyBestSource)
		})
	}

	let rid
	const onResize = () => {
		cancelAnimationFrame(rid)
		rid = requestAnimationFrame(() => {
			document.querySelectorAll('video[data-variants]').forEach(applyBestSource)
		})
	}
	window.addEventListener('resize', onResize)
	window.addEventListener('orientationchange', onResize)
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSmartVideos, { once: true })
} else {
	initSmartVideos()
}