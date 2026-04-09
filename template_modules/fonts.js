// Template configuration
import templateConfig from '../template.config.js'
// Logger
import logger from './logger.js'

import { globSync } from 'glob'
import fs from 'node:fs'
import path from 'node:path'

// Font conversion
import Fontmin from 'fontmin'
// Local loading of remote fonts
import webfontDownload from 'vite-plugin-webfont-dl'
// Create a font from SVG icons
import viteSvgToWebfont from 'vite-svg-2-webfont'
// SVG icon optimization
import { svgOptimaze } from './svgoptimaze.js'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

// File paths
const fontsHTMLFile = 'src/components/layout/head/fonts-preload.html'
const fontsCSSFile = 'src/styles/fonts/fonts.css'
const iconsCSSFile = 'src/styles/fonts/iconfont.css'
const iconsPreviewFiles = globSync('src/assets/svgicons/preview/*.*')
const iconsFiles = globSync('src/assets/svgicons/*.svg')

// Font processing
async function fontWork() {
	const fontsFiles = globSync('src/assets/fonts/*.{otf,ttf}', { posix: true })
	// Font conversion
	if (fontsFiles.length) {
		logger('_FONTS_START')
		const fontConverter = new Fontmin()
			.src('src/assets/fonts/*.{otf,ttf}')
			.dest('src/assets/fonts')
			.use(Fontmin.otf2ttf())
			.use(Fontmin.ttf2woff2())
		fontConverter.run(function (err, files, stream) {
			if (err) {
				throw err
			}
			fontHtmlCss()
		})
	} else {
		fontHtmlCss()
	}
}

// Create HTML/CSS files and include fonts
const fontHtmlCss = () => {
	const fontsFiles = globSync('src/assets/fonts/*.woff2', { posix: true })
	if (fontsFiles.length) {
		// Variables
		let newFileOnly
		let linksToFonts = ``
		let fontsStyles = ``
		let counter = {
			all: 0,
		}
		fontsFiles.forEach(fontsFile => {
			// File name
			const fontFileName = fontsFile
				.replace(new RegExp(' ', 'g'), '-')
				.split('/')
				.pop()
				.split('.')
				.slice(0, -1)
				.join('.')
			// If the font hasn't been processed before
			if (newFileOnly !== fontFileName) {
				const [fontName, fontWeightStr] = fontFileName
					.replace('--', '-')
					.split('-')
				const fontStyle = fontFileName.toLowerCase().includes('-italic')
					? 'italic'
					: 'normal'
				// Map to convert weight names to numeric values
				const fontWeightMap = {
					thin: 100,
					hairline: 100,
					extralight: 200,
					ultralight: 200,
					light: 300,
					medium: 500,
					semibold: 600,
					demibold: 600,
					bold: 700,
					extrabold: 800,
					ultrabold: 800,
					black: 900,
					heavy: 900,
					extrablack: 950,
					ultrablack: 950,
				}
				// Check if weight exists in the map; if not, use 400 (normal)
				let fontWeight = fontWeightStr
					? fontWeightMap[fontWeightStr.toLowerCase()] || 400
					: 400
				// Build font preload links
				linksToFonts += `<link rel="preload" href="@fonts/${fontFileName}.woff2" as="font" type="font/woff2" crossorigin="anonymous">\n`
				// Build font styles
				fontsStyles += `@font-face {font-family: ${fontName};font-display: swap;src: url("@fonts/${fontFileName}.woff2") format("woff2");font-weight: ${fontWeight};font-style: ${fontStyle};}\n`
				// Update processed file name
				newFileOnly = fontFileName
			}
			counter.all++
		})
		fs.writeFile(fontsHTMLFile, linksToFonts, cb)
		fs.writeFile(fontsCSSFile, fontsStyles, cb)

		// Remove generated source files
		const fontsSrcFiles = globSync('src/assets/fonts/*.*', { posix: true })
		for (const file of fontsSrcFiles) {
			if (file.endsWith('.otf') || file.endsWith('.ttf')) {
				fs.unlink(file, err => {
					if (err) throw err
				})
			} else {
				file.includes(' ')
					? fs.rename(file, file.replace(' ', '-'), () => {})
					: null
			}
		}
		logger(`_FONTS_DONE`, [counter.all])
	} else {
		// If there are no fonts
		fs.writeFile(fontsHTMLFile, '', cb)
		fs.writeFile(fontsCSSFile, '', cb)
	}
}

// Add icon font
function addIconFonts() {
	if (iconsFiles.length && templateConfig.fonts.iconsfont) {
		!isProduction ? logger('_FONTS_ICONS_ADD_DONE') : null
	} else {
		fs.rm(
			'src/assets/svgicons/preview',
			{ recursive: true, force: true },
			err => {
				if (err) {
					throw err
				}
			}
		)
		fs.rm(
			'src/assets/svgicons/fixed',
			{ recursive: true, force: true },
			err => {
				if (err) {
					throw err
				}
			}
		)
		fs.writeFile(iconsCSSFile, '', cb)
	}
}

// Add fonts for WP
async function addWpFonts() {
	const styles = []
	styles.push(`import '@styles/fonts/fonts.css'`)
	iconsFiles.length && templateConfig.fonts.iconsfont
		? styles.push(`import '@styles/fonts/iconfont.css'`)
		: null
	fs.writeFile(
		'src/components/wordpress/anim-wp-fonts.js',
		styles.join('\n'),
		() => {}
	)
}

// Plugins
export const fontPlugins = [
	// Font processing
	await fontWork(),
	// Create a font from SVG icons
	iconsFiles.length && templateConfig.fonts.iconsfont
		? await svgOptimaze(iconsFiles)
		: [],
	iconsFiles.length && templateConfig.fonts.iconsfont
		? {
				order: 'post',
				...viteSvgToWebfont({
					classPrefix: '--icon-',
					cssDest: path.resolve(iconsCSSFile),
					cssFontsUrl: path.resolve('src/assets/svgicons/preview'),
					types: ['woff2'],
					dest: 'src/assets/svgicons/preview',
					cssTemplate: path.resolve('template_modules/iconfont/css.hbs'),
					htmlTemplate: path.resolve('template_modules/iconfont/html.hbs'),
					context: path.resolve('src/assets/svgicons/fixed'),
					normalize: true,
					inline: true,
					generateFiles: true, //!iconsPreviewFiles.length
				}),
		  }
		: [],
	{
		order: 'post',
		...addIconFonts(),
	},
	// Local loading of remote fonts
	...(templateConfig.fonts.download
		? [
				webfontDownload([], {
					cache: true,
					embedFonts: false,
					injectAsStyleTag: false,
				}),
		  ]
		: []),
	...(isWp ? [addWpFonts()] : []),
	...(isWp && !isProduction
		? [
				{
					name: 'wp-iconfont-path',
					order: 'pre',
					transform(html, file) {
						if (file.endsWith('fonts.css')) {
							const reg = /\/assets\/fonts\//g
							return html.replace(
								reg,
								`http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/fonts/`
							)
						} else if (file.endsWith('iconfont.css')) {
							const reg = /\/assets\/svgicons\/preview\//g
							return html.replace(
								reg,
								`http://${templateConfig.server.hostname}:${templateConfig.server.port}/assets/svgicons/preview/`
							)
						}
					},
				},
		  ]
		: []),
]

// Function
function cb(err) {
	if (err) {
		throw err
	}
}
