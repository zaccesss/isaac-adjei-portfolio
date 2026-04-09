import { defineConfig } from 'vite'
import { globSync } from 'glob'
import path from 'path'
import fs from 'fs'

// Build configuration
import templateConfig from './template.config.js'
// Imported modules
import templateImports from './template_modules/template.imports.js'
// Generate editor settings
templateConfig.vscode.settings ? templateImports.vscodeSettings() : null
// Generate editor snippets
templateConfig.vscode.snippets ? templateImports.addSnippets() : null

// Video (Variant B)
import { videoOptimizerPlugin } from './template_modules/videos.js'
import { videoHtmlRewritePlugin } from './template_modules/video-html-rewrite.js'

// Create components page
templateConfig.devcomponents.enable
	? templateImports.createComponentsPage()
	: null

// Messages language
const lang = JSON.parse(
	fs.readFileSync(
		`./template_modules/languages/${templateConfig.lang}.json`,
		'UTF-8',
	),
)

// Logging
import logger from './template_modules/logger.js'

const isProduction = process.env.NODE_ENV === 'production'
const isInspect = process.argv.includes('--inspect')
const isWp = process.argv.includes('--wp')
const isGit = process.argv.includes('--git')
const isHost = process.argv.includes('--host')
const isZip = process.argv.includes('--zip')
const isFtp = process.argv.includes('--ftp')

import { ignoredDirs, ignoredFiles } from './template_modules/ignored.js'

import Inspect from 'vite-plugin-inspect'
import qrcode from 'qrcode-terminal'

const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

// Build Vite aliases
const makeAliases = aliases => {
	return Object.entries(aliases).reduce((acc, [key, value]) => {
		value = !value.startsWith(`./`) ? `./${value}` : value
		acc[key] = path.resolve(process.cwd(), value)
		return acc
	}, {})
}

const aliases = makeAliases(templateConfig.aliases)

export default defineConfig(({ command, mode, ssrBuild }) => {
	// ✅ Reliable build flag (don’t rely on NODE_ENV)
	const isBuild = command === 'build'

	return {
		define: {
			animLogging:
				isProduction && templateConfig.logger.console.removeonbuild
					? false
					: templateConfig.logger.console.enable,
			animLang:
				isProduction && templateConfig.logger.console.removeonbuild
					? false
					: lang,
			aliases: aliases,
		},
		resolve: {
			alias: {
				vue: 'vue/dist/vue.esm-bundler.js',
				...aliases,
			},
		},
		base: templateConfig.server.path,
		assetsInclude: ['src/components/**/*.html'],
		clearScreen: true,
		root: path.join(__dirname, 'src'),
		logLevel: 'silent',
		publicDir: false,
		server: {
			open: isWp ? 'http://localhost:8080' : true,
			host: templateConfig.server.hostname,
			port: templateConfig.server.port,
			proxy: {
				'/php': {
					target: `http://${templateConfig.php.hostname}:${templateConfig.php.port}`,
					changeOrigin: true,
					rewrite: path => path.replace(/^\/php/, ''),
					secure: false,
					ws: true,
					rewriteWsOrigin: true,
				},
			},
			watch: {
				ignored: [
					...ignoredDirs.map(dir => `**/${dir}/**`),
					...ignoredFiles.map(file => `**/${file}/**`),
				],
			},
		},
		plugins: [
			// HTML handling
			...templateImports.htmlPlugins,
			// Scripts handling
			...templateImports.scriptsPlugins,
			// Images handling
			...templateImports.imagePlugins,
			// Fonts handling
			...templateImports.fontPlugins,
			// Styles handling
			...templateImports.stylesPlugins,
			// PHP handling
			...templateImports.phpPlugins,

			// React processing
			...(templateConfig.js.react ? [templateImports.react()] : []),
			// Vue processing
			...(templateConfig.js.vue ? [templateImports.vue()] : []),

			// Project page generation
			...(isProduction && templateConfig.projectpage.enable
				? [templateImports.projectPage()]
				: []),

			// Coffee break time
			...(!isProduction && templateConfig.coffee.enable
				? [templateImports.coffeeTime()]
				: []),

			// Copy files
			// ✅ IMPORTANT: don’t copy raw "files/" when video optimizer is enabled (prevents conflicts/duplicates)
			...(isProduction &&
			templateConfig.server.copyfiles &&
			!templateConfig.video?.enable
				? [
						templateImports.viteStaticCopy({
							targets: [
								{
									src: 'files',
									dest: './',
								},
							],
							silent: true,
						}),
					]
				: []),

			// Statistics handling
			...templateImports.statPlugins,

			// Add file versioning
			...(isProduction && templateConfig.server.version
				? [
						{
							name: 'add-version',
							apply: 'build',
							transformIndexHtml(html) {
								const version = new Date().getTime()
								const regex =
									/<script[^>]*src\s*=\s*["']([^"']+\.js)["'][^>]*><\/script>|<link[^>]*href\s*=\s*["']([^"']+\.css)["'][^>]*>|<link[^>]*href\s*=\s*["']([^"']+\.js)["'][^>]*>/gi
								return html.replace(regex, code => {
									return code.replace(/\.css"|\.js"/gi, $0 => {
										return `${$0.replace('"', '')}?v=${version}"`
									})
								})
							},
						},
					]
				: []),

			// Browser reload
			{
				name: 'custom-hmr',
				enforce: 'post',
				handleHotUpdate({ file, server }) {
					if (
						file.endsWith('.html') ||
						file.endsWith('.json') ||
						file.endsWith('.php') ||
						file.includes('anim-theme')
					) {
						server.ws.send({ type: 'full-reload', path: '*' })
					}
				},
			},

			// Messages
			{
				name: 'message-dev',
				enforce: 'post',
				configureServer: {
					order: 'post',
					handler: server => {
						// Navigation panel messages
						if (!isWp) {
							if (templateConfig.navpanel.dev && !isProduction) {
								logger('_NAVPAN_DONE')
							} else if (templateConfig.navpanel.build && isProduction) {
								logger('_NAVPAN_WARN')
							}
						}
						// Add QR code to the terminal
						if (isHost) {
							setTimeout(() => {
								const urls = server.resolvedUrls || server.network
								for (const key in urls) {
									const element = urls[key]
									if (key === 'local') {
										logger(`_DEV_HOST_ADDRESS`, element[0])
									} else {
										element.forEach(item => {
											logger(`_DEV_HOST_IP_ADDRESS`, item)
											logger(`_DEV_HOST_QRCODE`)
											qrcode.generate(item, { small: true })
										})
									}
								}
								logger(`_DEV_DONE`)
							}, 1000)
						} else {
							logger(
								`_DEV_HOST_ADDRESS`,
								isWp
									? `http://localhost:8080`
									: `http://${templateConfig.server.hostname}:${templateConfig.server.port}`,
							)
							logger(`_DEV_DONE`)
						}
					},
				},
			},
			{
				name: 'message-build',
				apply: 'build',
				enforce: 'post',
				closeBundle: {
					order: 'pre',
					handler: async () => {
						logger(`_BUILD_DONE`)
					},
				},
			},

			// ✅ VIDEO (Variant B): 1) encode → 2) rewrite HTML (data-variants)
			videoOptimizerPlugin(templateConfig.video, {
				log: msg => console.log(`   ✔ ${msg}`),
				warn: msg => console.warn(`   ⚠ ${msg}`),
				error: msg => console.error(`   ✖ ${msg}`),
			}),

			...(isInspect ? [Inspect()] : []),

			// GitHub handling
			...(isProduction && isGit ? [...templateImports.gitPlugins] : []),
			// Archive handling
			...(isProduction && isZip ? [...templateImports.zipPlugin] : []),
			// FTP handling
			...(isProduction && isFtp ? [...templateImports.ftpPlugin] : []),
		],

		css: {
			devSourcemap: true,
			preprocessorOptions: {
				scss: {
					silenceDeprecations: [],
					additionalData: `
						@use "sass:math";
						@use "@styles/includes/index.scss" as *;
					`,
					sourceMap: true,
					quietDeps: true,
					api: 'modern-compiler',
				},
			},
		},

		build: {
			outDir: isWp
				? path.join(__dirname, 'src/components/wordpress/anim-theme/build')
				: path.join(__dirname, 'dist'),
			emptyOutDir: true,
			manifest: false,
			minify: !templateConfig.js.devfiles,
			cssMinify: !templateConfig.styles.devfiles,
			cssCodeSplit: templateConfig.styles.codesplit,
			assetsInlineLimit: 0,
			rollupOptions: {
				input: isWp
					? ['src/components/wordpress/anim-theme/assets/app.js']
					: globSync('./src/*.html', {
							ignore: [`./src/${templateConfig.devcomponents.filename}`],
						}),
				plugins: [templateImports.rollupPlugins],
				output: [
					{
						manualChunks(id) {
							if (
								templateConfig.js.bundle.enable ||
								templateConfig.server.buildforlocal
							) {
								return 'app'
							} else {
								if (id.includes('js/custom')) {
									const customName = id.split('/').pop().replace('.js', '')
									return customName
								}
								if (
									id.includes('/src/js/') &&
									/(^|\/)app(\.js)?$/.test(id.split(path.sep).pop())
								) {
									return 'common'
								}
							}
						},
						assetFileNames: asset => {
							let getPath =
								asset.originalFileNames[0] &&
								asset.names &&
								asset.names.length > 0
									? asset.originalFileNames[0].replace(`/${asset.names[0]}`, '')
									: ''
							let extType =
								asset.names && asset.names.length > 0
									? asset.names[0].split('.').pop()
									: ''
							if (/css/.test(extType)) {
								return templateConfig.js.bundle.enable ||
									templateConfig.server.buildforlocal
									? `${isAssets}css/app.min[extname]`
									: `${isAssets}css/[name].min[extname]`
							} else {
								if (/eot|otf|ttf|woff|woff2/.test(extType)) {
									extType = 'assets/fonts'
								} else {
									extType = getPath
								}
								return `${extType}/[name][extname]`
							}
						},
						entryFileNames() {
							return templateConfig.js.bundle.enable ||
								templateConfig.server.buildforlocal
								? `${isAssets}js/app.min.js`
								: `${isAssets}js/[name].min.js`
						},
						chunkFileNames() {
							return templateConfig.js.bundle.enable ||
								templateConfig.server.buildforlocal
								? `${isAssets}js/app.min.js`
								: `${isAssets}js/[name].min.js`
						},
					},
				],
			},
		},
	}
})
