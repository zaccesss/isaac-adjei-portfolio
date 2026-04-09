// Template configuration
import templateConfig from '../template.config.js'
const finalAliases = templateConfig.aliases
// Logger
import logger from './logger.js'

import path from 'path'
import { normalizePath } from 'vite'
import * as esbuild from 'esbuild'
import { Glob, globSync } from 'glob'
import fs from 'fs'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')
const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

const pathPrefix = isWp
	? `src/components/wordpress/anim-theme/build/${isAssets}`
	: `dist/${isAssets}`

const pathToFiles = `${pathPrefix}js/*.js`
const pathToDev = `${pathPrefix}js/dev`
const pathToOptimize = `${pathPrefix}js`

export const scriptsPlugins = [
	// Alias processing in JS files
	{
		name: 'do-aliases',
		order: 'pre',
		transform(html, file) {
			if (file.endsWith('.js')) {
				Object.keys(finalAliases).forEach(alias => {
					if (html.includes(alias)) {
						finalAliases[alias] = finalAliases[alias].replace(
							new RegExp(`src`, 'g'),
							``,
						)
						html = html.replace(new RegExp(alias, 'g'), finalAliases[alias])
					}
				})
			}
			return html
		},
	},
	// Clean up module
	...(isProduction && templateConfig.logger.console.removeonbuild
		? [
				{
					name: 'anim-clean',
					apply: 'build',
					enforce: 'post',
					transform(src, id) {
						if (id.endsWith('.js')) {
							return src.replace(/(?<!function\s)ANIM\(.*?\);?/gi, '')
						}
					},
				},
			]
		: []),
	// Create file copy(ies) for developers
	...(isProduction && templateConfig.js.devfiles
		? [
				{
					name: 'js-devfiles',
					apply: 'build',
					enforce: 'pre',
					closeBundle: {
						order: 'pre',
						handler: async () => {
							const jsFiles = globSync(pathToFiles)

							// ✅ Create folder recursively (prevents ENOENT)
							if (!fs.existsSync(pathToDev)) {
								fs.mkdirSync(pathToDev, { recursive: true })
							}

							// ✅ Create copies safely
							jsFiles.forEach(jsFile => {
								jsFile = normalizePath(jsFile)
								const devJsFile = jsFile
									.replace('.min', '')
									.replace('/js/', '/js/dev/')

								// ensure parent dir exists
								fs.mkdirSync(path.dirname(devJsFile), { recursive: true })

								fs.copyFileSync(jsFile, devJsFile)
							})

							logger('_IMG_JS_DEV_DONE')

							// File optimization
							await esbuild.build({
								entryPoints: jsFiles,
								allowOverwrite: true,
								minify: true,
								outdir: pathToOptimize,
							})
						},
					},
				},
			]
		: []),
	// Dynamic JS module injection
	...(templateConfig.js.hotmodules
		? [
				{
					name: 'hot-modules',
					transformIndexHtml: {
						order: 'pre',
						handler(html) {
							return insertModule(html)
						},
					},
				},
			]
		: []),
]

async function insertModule(html) {
	const modules = new Set()
	const moduleJSFiles = new Glob(`src/components/**/*.js`, {
		ignore: ['**/_*.*', '**/plugins/**', '**/wordpress/**'],
	})
	const modulePlugins = new Map()

	for (let moduleJSFile of moduleJSFiles) {
		moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
		const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
		const pluginFiles = globSync(
			`src/components/*/${moduleName}/plugins/**/*.js`,
		)
		modulePlugins.set(
			moduleName,
			pluginFiles.map(plugin => normalizePath(plugin).replace('src', '')),
		)
	}

	for (let moduleJSFile of moduleJSFiles) {
		moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
		const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
		const regex = new RegExp(`\\bdata-anim-${moduleName}\\b`)
		if (regex.test(html)) {
			modules.add(`<script type="module" src="${moduleJSFile}"></script>`)
			// Check if plugins exist for this module
			const curentModulePlugins = modulePlugins.get(moduleName)
			if (curentModulePlugins) {
				curentModulePlugins.forEach(curentModulePlugin => {
					const pluginName = curentModulePlugin
						.split('/')
						.pop()
						.replace('.js', '')
					const pluginRegex = new RegExp(
						`\\bdata-anim-${moduleName}-${pluginName}\\b`,
					)
					if (pluginRegex.test(html)) {
						modules.add(
							`<script type="module" src="${curentModulePlugin}"></script>`,
						)
					}
				})
			}
		}
	}

	return html.replace('</head>', `${Array.from(modules).join('')}</head>`)
}
