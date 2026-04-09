// Template configuration
import templateConfig from '../template.config.js'
// Generate editor settings
import vscodeSettings from './vscode-settings.js'
// Generate editor snippets
import addSnippets from './snippets-generate.js'
// Create components page
import createComponentsPage from './createcomponentpage.js'
// Generate project page
import projectPage from './projectpage.js'
// Coffee break reminder
import coffeeTime from './coffeetime.js'
// QR code generation
import { qrcode } from 'vite-plugin-qrcode'
// React
import react from '@vitejs/plugin-react'
// Vue
import vue from '@vitejs/plugin-vue'
// Scripts handling
import { scriptsPlugins } from './scripts.js'
// Fonts handling
import { fontPlugins } from './fonts.js'
// Images handling
import { imagePlugins } from './images.js'
// HTML handling
import { htmlPlugins } from './html.js'
// Styles handling
import { stylesPlugins } from './styles.js'
// PHP handling
import { phpPlugins } from './php.js'
// Archive handling
import { zipPlugin } from './zip.js'
// FTP handling
import { ftpPlugin } from './ftp.js'
// Rollup plugins
import { rollupPlugins } from './rollup-plugins.js'
// Git handling
import { gitPlugins } from './git.js'
// File copying
import { viteStaticCopy } from 'vite-plugin-static-copy'
// Statistics handling
import { statPlugins } from './statistics.js'

export default {
	createComponentsPage,
	statPlugins,
	gitPlugins,
	viteStaticCopy,
	projectPage,
	rollupPlugins,
	coffeeTime,
	scriptsPlugins,
	qrcode,
	ftpPlugin,
	zipPlugin,
	addSnippets,
	vscodeSettings,
	fontPlugins,
	imagePlugins,
	htmlPlugins,
	stylesPlugins,
	phpPlugins,
	react,
	vue,
}
