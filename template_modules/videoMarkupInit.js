import templateConfig from '../template.config.js'

export function videoMarkupInit(
	srcPathFromSrc,
	{
		sizes = [1080, 720, 480],
		codecs = { mp4: true, webm: true, av1: false },
		attr = 'autoplay muted loop playsinline',
		poster = null,
		className = '',
		preload = 'metadata',
		controls = false,
	} = {},
) {
	// srcPathFromSrc expected: 'src/files/name.mp4'
	const publicBase = templateConfig.server.path || './'
	const publicRel = srcPathFromSrc.replace(/^src\//, publicBase)

	const mk = (h, ext) => publicRel.replace(/\.[^.]+$/, `-${h}.${ext}`)
	const types = { mp4: 'video/mp4', webm: 'video/webm', av1: 'video/mp4' }

	const variants = sizes.map(h => {
		const v = {}
		if (codecs.av1) v.av1 = mk(h, 'mp4').replace(/\.mp4$/, '-av1.mp4')
		if (codecs.webm) v.webm = mk(h, 'webm')
		if (codecs.mp4) v.mp4 = mk(h, 'mp4')
		return { h, src: v }
	})

	const posterAttr = poster
		? ` poster="${poster.replace(/^src\//, publicBase)}"`
		: ''
	const controlsAttr = controls ? ' controls' : ''
	const classAttr = className ? ` class="${className}"` : ''

	// IMPORTANT: runtime JS will remove <source> anyway; but we can add a safe fallback mp4 here
	const fallbackMp4 = publicRel.replace(/\.[^.]+$/, '.mp4')

	return `<video ${attr}${controlsAttr}${classAttr}${posterAttr} preload="${preload}" data-variants='${JSON.stringify(
		variants,
	)}'>
  <source src="${fallbackMp4}" type="video/mp4">
</video>`
}
