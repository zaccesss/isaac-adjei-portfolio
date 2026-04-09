// Template configuration
import templateConfig from '../template.config.js'
// Logger
import logger from './logger.js'
import { normalizePath } from 'vite'
import fs from 'fs'
import path from 'node:path'
import { optimize } from 'svgo'
import { readFile, writeFile } from 'fs/promises'

// ---------------------------------------
import SVGFixer from 'oslllo-svg-fixer'
// ---------------------------------------

// SVG icon optimization
export async function svgOptimaze(iconsFiles) {
	const srcDir = 'src/assets/svgicons'
	const distDir = 'src/assets/svgicons/fixed'

	!fs.existsSync(distDir) ? fs.mkdirSync(distDir) : null

	logger('_ICONS_OPT_START')

	// SVG icon optimization
	// Convert SVG strokes to paths and optimize SVG
	const convertAndOptimizeSvg = async (file, srcDir, distDir) => {
		let filePath = path.join(srcDir, file)
		filePath = normalizePath(filePath)
		const outputFilePath = filePath.replace('/svgicons/', '/svgicons/fixed/')
		try {
			let outlinedSvg = await readFile(filePath, 'utf8')
			const optimizedSvg = optimize(outlinedSvg, {
				path: outputFilePath,
				plugins: getSvgOptimizationPlugins(),
			})
			await writeFile(outputFilePath, optimizedSvg.data, 'utf8')
		} catch (error) {
			console.error(`Error processing file ${file}:`, error)
		}
	}

	// SVG optimization plugins
	const getSvgOptimizationPlugins = () => [
		{
			name: 'mergePaths',
			params: { force: true, floatPrecision: 3, noSpaceAfterFlags: false },
		},
		// { name: 'removeXMLProcInst', active: true },
		// { name: 'removeUselessDefs', active: true },
		// { name: 'removeEmptyContainers', active: true },
		// { name: 'convertStyleToAttrs', active: true },
		// { name: 'convertPathData', active: true },
		// { name: 'cleanupAttrs', active: true },
		// { name: 'cleanupEnableBackground', active: true },
		// { name: 'removeUselessStrokeAndFill', active: true },
		// { name: 'removeUselessDefs', active: true },
		// { name: 'convertEllipseToCircle', active: true },
		// { name: 'convertTransform', active: true },
		// { name: 'sortAttrs', active: true },
		// {
		// 	name: 'removeAttrs',
		// 	params: { attrs: '(stroke|style|fill|clip-path|id|data-name)' },
		// }
	]

	for (let index = 0; index < iconsFiles.length; index++) {
		await convertAndOptimizeSvg(iconsFiles[index], '', '')
	}

	// logger('_ICONS_OPT_END')

	try {
		await SVGFixer(distDir, distDir, { throwIfDestinationDoesNotExist: false })
			.fix()
			.then(() => {
				logger('_ICONS_OPT_END')
			})
	} catch (err) {
		console.log(err)
		throw err
	}
}
