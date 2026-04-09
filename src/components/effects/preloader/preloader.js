//Full Documentation: https://animmaster.github.io/docs/preloader.html

/*
========================================================
ANIM PRELOADER MODULE
========================================================

Optional attribute

data-anim-preloader="true"
Enable one-time preloader (will run only once per page)


HTML states added automatically

data-anim-preloader-loading
Page is currently loading

data-anim-preloader-loaded
Preloader finished

data-anim-scrolllock
Disables scrolling while loading


How it works

1. All <img> elements are scanned
2. Images are preloaded using cloned images
3. Loading progress is calculated
4. Progress bar + counter animate to 100%
5. Page unlocks and preloader disappears


Saved in localStorage

location.href

Used to prevent showing preloader again
when data-anim-preloader="true"


Example HTML

<body data-anim-preloader="true">

========================================================
*/

import './preloader.scss'

function preloader() {
	const preloaderImages = document.querySelectorAll('img')

	const htmlDocument = document.documentElement

	/* ------------------------------------------------
	Check if preloader already ran (one-time mode)
	------------------------------------------------ */

	const isPreloaded =
		localStorage.getItem(location.href) &&
		document.querySelector('[data-anim-preloader="true"]')

	/* ------------------------------------------------
	Run preloader if images exist and not preloaded
	------------------------------------------------ */

	if (preloaderImages.length && !isPreloaded) {
		/* ------------------------------------------------
		Create preloader HTML
		------------------------------------------------ */

		const preloaderTemplate = `
			<div class="anim-preloader">
				<div class="anim-preloader__body">

					<div class="anim-preloader__counter">
						0%
					</div>

					<div class="anim-preloader__line">
						<span></span>
					</div>

				</div>
			</div>
		`

		document.body.insertAdjacentHTML('beforeend', preloaderTemplate)

		const preloader = document.querySelector('.anim-preloader')

		const showPecentLoad = document.querySelector('.anim-preloader__counter')

		const showLineLoad = document.querySelector('.anim-preloader__line span')

		let imagesLoadedCount = 0
		let counter = 0
		let progress = 0

		/* ------------------------------------------------
		Set loading states
		------------------------------------------------ */

		htmlDocument.setAttribute('data-anim-preloader-loading', '')
		htmlDocument.setAttribute('data-anim-scrolllock', '')

		/* ------------------------------------------------
		Preload images
		------------------------------------------------ */

		preloaderImages.forEach(preloaderImage => {
			const imgClone = document.createElement('img')

			if (imgClone) {
				imgClone.onload = imageLoaded
				imgClone.onerror = imageLoaded

				preloaderImage.dataset.src
					? (imgClone.src = preloaderImage.dataset.src)
					: (imgClone.src = preloaderImage.src)
			}
		})

		/* ------------------------------------------------
		Update progress UI
		------------------------------------------------ */

		function setValueProgress(progress) {
			if (showPecentLoad) {
				showPecentLoad.innerText = `${progress}%`
			}

			if (showLineLoad) {
				showLineLoad.style.width = `${progress}%`
			}
		}

		setValueProgress(progress)

		/* ------------------------------------------------
		Image load handler
		------------------------------------------------ */

		function imageLoaded() {
			imagesLoadedCount++

			progress = Math.round((100 / preloaderImages.length) * imagesLoadedCount)

			const intervalId = setInterval(() => {
				counter >= progress
					? clearInterval(intervalId)
					: setValueProgress(++counter)

				if (counter >= 100) {
					addLoadedClass()
				}
			}, 10)
		}

		/* ------------------------------------------------
		Save preloader state (one-time mode)
		------------------------------------------------ */

		const preloaderOnce = () => localStorage.setItem(location.href, 'preloaded')

		if (document.querySelector('[data-anim-preloader="true"]')) {
			preloaderOnce()
		}
	} else {
		/* ------------------------------------------------
		Skip preloader
		------------------------------------------------ */

		addLoadedClass()
	}

	/* ------------------------------------------------
	Finish loading
	------------------------------------------------ */

	function addLoadedClass() {
		htmlDocument.setAttribute('data-anim-preloader-loaded', '')

		htmlDocument.removeAttribute('data-anim-preloader-loading')

		htmlDocument.removeAttribute('data-anim-scrolllock')
	}
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.addEventListener('DOMContentLoaded', preloader)
