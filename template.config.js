//Full Documentation: https://animmaster.github.io/docs/settings.html

import path from 'path'

// Get current project folder name
const projectName = path.basename(path.resolve()).toLowerCase()

// Environment flags
const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

export default {
	// Default HTML language
	lang: 'en',

	// VS Code helper settings
	vscode: {
		// Auto setup path aliases
		settings: true,
		// Add project snippets
		snippets: true,
	},

	// Components playground (dev only)
	devcomponents: {
		// Enable components page
		enable: false,
		// Components page filename
		filename: '_components.html',
	},

	// New page generator
	newpage: {
		// Copy content from index.html
		copyfromindex: false,
		// Template name if copyfromindex is false
		usetemplate: 'main',
	},

	// GitHub publishing settings
	git: {
		// Repository path or URL
		repo: ``,
		// Target branch
		branch: `main`,
	},

	// Development navigation panel
	navpanel: {
		// Show panel in dev mode
		dev: true,
		// Show panel in production
		build: false,
		// Panel position
		position: 'left',
		// Text color
		color: '#ffffff',
		// Background color
		background: 'rgba(51, 51, 51, 0.5)',
		// Animation speed (ms)
		transition: '300',
	},

	// Project statistics
	statistics: {
		// Enable statistics
		enable: false,
		// Show stats after build
		showonbuild: false,
	},

	// Local server settings
	server: {
		// Asset path format
		path: './',
		// Put CSS/JS into dist/assets
		isassets: false,
		// Build for local file opening
		buildforlocal: false,
		// Copy src/files to dist/files
		copyfiles: true,
		// Enable cache busting
		version: true,
		// Server hostname
		hostname: 'localhost',
		// Server port
		port: '1111',
	},

	// HTML formatting
	html: {
		beautify: {
			// Enable HTML formatting
			enable: true,
			// Indent style
			indent: 'tab',
		},
	},

	// Styles and SCSS pipeline
	styles: {
		// Enable Tailwind CSS
		tailwindcss: false,
		// Convert px to rem
		pxtorem: true,
		// Generate critical CSS
		critical: false,
		// Split CSS by pages
		codesplit: true,
		// Keep unminified CSS in prod
		devfiles: true,
	},

	// Fonts processing
	fonts: {
		// Generate icon font from SVGs
		iconsfont: false,
		// Download remote fonts locally
		download: false,
	},

	// All video files must be on files folder!!
	video: {
		enable: true, // enable video optimization on build
		srcDir: 'src/files', // raw video source directory
		onlyUsedInHtml: true, // encode only video that is actually in the HTML
		vidignore: 'data-anim-video-ignore', // skip optimization for videos with this attr
		outSubdir: 'files', // output directory inside dist
		patterns: ['**/*.mp4', '**/*.mov'],
		sizes: [1080, 720], // heights to generate / all sizes
		codecs: {
			mp4: true,
			webm: true,
			av1: false,
		},
		crf: {
			// Constant Rate Factor — controls video quality vs file size.
			// Lower value = higher quality + larger file
			// Higher value = lower quality + smaller file
			mp4: 25,
			webm: 50,
			av1: 35, //conversion to av1 takes longer
		},
		removeAudio: true, // required for autoplay
	},

	// Images optimization
	images: {
		// Generate SVG sprite
		svgsprite: false,
		optimize: {
			// Enable image optimization
			enable: true,
			// Update HTML attributes
			edithtml: true,
			// Responsive image sizes
			sizes: [600, 1200],
			// DPI multipliers [2, 3] exmpl
			dpi: [],
			// Skip images with this attribute
			attrignore: 'data-anim-image-ignore',
			modernformat: {
				// Enable modern formats
				enable: true,
				// webp or avif
				type: 'webp',
				// Keep only modern files
				only: true,
				// Image quality
				quality: 80,
			},
			// JPEG quality
			jpeg: {
				quality: 80,
			},
			// PNG quality
			png: {
				quality: 80,
			},
		},
	},

	// JavaScript pipeline
	js: {
		// Auto connect JS modules
		hotmodules: true,
		// Keep unminified JS in prod
		devfiles: true,
		bundle: {
			// Force single JS and CSS file
			enable: false,
		},
		// Enable React support
		react: false,
		// Enable Vue support
		vue: false,
	},

	// Local PHP server
	php: {
		// Enable PHP server
		enable: false,
		// PHP files base folder
		base: './src/php/',
		// PHP hostname
		hostname: 'localhost',
		// PHP port
		port: '1110',
		// Path to PHP binary
		binary: 'C:\\php\\php.exe',
		// Path to php.ini
		ini: 'template_modules/assets/php.ini',
	},

	// PUG preprocessor
	pug: {
		// Enable PUG
		enable: false,
	},

	// FTP deployment
	ftp: {
		// FTP host
		host: '127.0.0.1',
		// FTP port
		port: 21,
		// Remote directory
		remoteDir: `/www/.../${projectName}`,
		// FTP user
		user: 'root',
		// FTP password (do not commit real credentials)
		password: '123456',
	},

	// Logging settings
	logger: {
		// Terminal logs
		terminal: true,
		// Browser console logs
		console: {
			// Enable console logs
			enable: true,
			// Remove logs in production
			removeonbuild: true,
		},
	},

	// Project page generator
	projectpage: {
		// Enable project page
		enable: false,
		// Project title
		projectname: '',
		// Template path
		template: 'src/projectpage/projectpage.html',
		// Output filename
		outfilename: '',
	},

	// Path aliases
	aliases: {
		// Components
		'@components': 'src/components',
		// Scripts
		'@js': 'src/js',
		// Styles
		'@styles': 'src/styles',
		// SVG
		'@svg': 'src/assets/svgicons',
		// Fonts
		'@fonts': 'src/assets/fonts',
		// Images (WP aware)
		'@img':
			isWp && !isProduction
				? 'src/wp-content/themes/anim-theme/assets/img'
				: 'src/assets/img',
		// Video files
		'@video': 'src/assets/video',
		// Static files
		'@files': 'src/files',
		// PUG files
		'@pug': 'src/pug',
	},

	// Break reminder
	coffee: {
		// Enable reminder
		enable: false,
		// Reminder text
		text: `(!!)Stop working, take a break ☕️`,
		// Interval in minutes
		interval: 30,
	},
}
