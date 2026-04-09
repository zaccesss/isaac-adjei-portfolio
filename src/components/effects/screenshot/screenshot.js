//Full Documentation: https://animmaster.github.io/docs/screenshot.html

/*
========================================================
ANIM SCREENSHOT MODULE
========================================================

Dependency

html2canvas
Used to capture DOM elements as images


Required attribute

data-anim-screenshot=".selector"

Defines which element should be captured


Example HTML

<button data-anim-screenshot=".card">
	Download screenshot
</button>


Target element

<div class="card">
	Content to capture
</div>


How it works

1. User clicks button
2. html2canvas captures the target element
3. Canvas is converted to base64 image
4. Temporary <a> element is created
5. Image is downloaded automatically

========================================================
*/

import html2canvas from 'html2canvas'

function screenshotInit() {
	/* ------------------------------------------------
	Get screenshot button
	------------------------------------------------ */

	const button = document.querySelector('[data-anim-screenshot]')

	if (!button) return

	/* ------------------------------------------------
	Button click handler
	------------------------------------------------ */

	button.addEventListener('click', function () {
		const screenshotTargetClass = button.dataset.animScreenshot

		const screenshotTarget = document.querySelector(screenshotTargetClass)

		if (!screenshotTarget) return

		/* ------------------------------------------------
		Capture element
		------------------------------------------------ */

		html2canvas(screenshotTarget).then(canvas => {
			/* convert canvas to base64 image */

			const base64image = canvas.toDataURL()

			/* create temporary download link */

			document.body.insertAdjacentHTML(
				'beforeend',
				`<a id="screenshot-download" download href="${base64image}"></a>`,
			)

			const download = document.querySelector('#screenshot-download')

			/* trigger download */

			download.click()

			/* cleanup */

			download.remove()
		})
	})
}

/* ------------------------------------------------
Auto init
------------------------------------------------ */

document.querySelector('[data-anim-screenshot]')
	? window.addEventListener('load', screenshotInit)
	: null
