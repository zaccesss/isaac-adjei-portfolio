/*
========================================================
ANIM INPUT AUTOHEIGHT MODULE
========================================================

Auto-resize textarea based on content.


--------------------------------------------------------
HTML STRUCTURE
--------------------------------------------------------

<textarea data-anim-input-autoheight></textarea>



--------------------------------------------------------
ATTRIBUTES
--------------------------------------------------------

data-anim-input-autoheight
activate auto height


data-anim-input-autoheight-min="120"
minimum height


data-anim-input-autoheight-max="400"
maximum height



--------------------------------------------------------
FEATURES
--------------------------------------------------------

✔ auto resize
✔ min height
✔ max height
✔ lightweight


========================================================
*/

export function autoHeight() {
	const textareas = document.querySelectorAll(
		'textarea[data-anim-input-autoheight]',
	)

	if (!textareas.length) return

	textareas.forEach(textarea => {
		const minHeight = textarea.dataset.animInputAutoheightMin
			? +textarea.dataset.animInputAutoheightMin
			: textarea.offsetHeight

		const maxHeight = textarea.dataset.animInputAutoheightMax
			? +textarea.dataset.animInputAutoheightMax
			: Infinity

		resize(textarea)

		textarea.addEventListener('input', () => {
			resize(textarea)
		})

		function resize(el) {
			el.style.height = 'auto'

			const newHeight = Math.min(
				Math.max(el.scrollHeight, minHeight),
				maxHeight,
			)

			el.style.height = `${newHeight}px`
		}
	})
}

if (document.querySelector('textarea[data-anim-input-autoheight]')) {
	window.addEventListener('load', autoHeight)
}
