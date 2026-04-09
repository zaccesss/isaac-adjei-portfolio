import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { globSync } from 'glob'
import { videoMarkupInit } from './videoMarkupInit.js'
import templateConfig from '../template.config.js'

function resolveSrcToSrcPath(projectRoot, srcAttr) {
	// прибираємо base типу "/something/" якщо є
	const base = templateConfig.server?.path || ''
	let clean = srcAttr

	if (
		base &&
		(clean.startsWith(base) || clean.startsWith(base.replace(/\/$/, '')))
	) {
		clean = clean.replace(base.replace(/\/$/, ''), '')
	}

	// нормалізуємо слеші
	clean = clean.replace(/^\/+/, '')

	if (clean.startsWith('@files/')) {
		return path.join(projectRoot, 'src/files', clean.replace('@files/', ''))
	}
	if (clean.startsWith('files/')) {
		return path.join(projectRoot, 'src', clean)
	}
	if (clean.startsWith('./files/')) {
		return path.join(projectRoot, 'src', clean.replace('./', ''))
	}
	if (clean.startsWith('/files/')) {
		return path.join(projectRoot, 'src', clean.replace(/^\//, ''))
	}
	if (clean.startsWith('src/')) {
		return path.join(projectRoot, clean)
	}
	return null
}

function hasAttr(tag, attrName) {
	const re = new RegExp(`\\b${attrName}\\b(?:\\s*=\\s*["'][^"']*["'])?`, 'i')
	return re.test(tag)
}

function pickSrcFromVideoBlock(videoBlock) {
	const m1 = videoBlock.match(/\bsrc=["']([^"']+)["']/i)
	if (m1?.[1]) return m1[1]

	const m2 = videoBlock.match(/<source[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
	if (m2?.[1]) return m2[1]

	return null
}

export function videoHtmlRewritePlugin() {
	const ignoreAttr = templateConfig.video?.vidignore || 'data-anim-video-ignore'
	const optimizeAttr = templateConfig.video?.optimizeAttr || 'data-optimize'
	const requireOptimizeAttr = !!templateConfig.video?.requireOptimizeAttr

	const extRe = /\.(mp4|mov)$/i

	return {
		name: 'video-html-rewrite',
		apply: 'build',
		enforce: 'post',

		async writeBundle(output) {
			const root = process.cwd()
			const outDir = output?.dir || path.resolve(root, 'dist') // fallback якщо dir не прийшов

			// ✅ шукаємо всі html рекурсивно
			const htmlFiles = globSync(`**/*.html`, { cwd: outDir, absolute: true })
			if (!htmlFiles.length) return

			for (const file of htmlFiles) {
				let html = fs.readFileSync(file, 'utf-8')

				html = html.replace(/<video\b[\s\S]*?<\/video>/gi, videoBlock => {
					if (hasAttr(videoBlock, ignoreAttr)) return videoBlock
					if (requireOptimizeAttr && !hasAttr(videoBlock, optimizeAttr))
						return videoBlock

					const srcAttr = pickSrcFromVideoBlock(videoBlock)
					if (!srcAttr || !extRe.test(srcAttr)) return videoBlock

					const full = resolveSrcToSrcPath(root, srcAttr)
					if (!full || !fs.existsSync(full)) return videoBlock

					const classMatch = videoBlock.match(/\bclass=["']([^"']+)["']/i)
					const className = classMatch ? classMatch[1] : ''

					const posterMatch = videoBlock.match(/\bposter=["']([^"']+)["']/i)
					const poster = posterMatch ? posterMatch[1] : null

					const preloadMatch = videoBlock.match(/\bpreload=["']([^"']+)["']/i)
					const preload = preloadMatch ? preloadMatch[1] : 'metadata'

					return videoMarkupInit(
						full.replace(`${root}${path.sep}`, '').replace(/\\/g, '/'),
						{
							sizes: templateConfig.video?.sizes || [1080, 720, 480],
							codecs: templateConfig.video?.codecs || {
								mp4: true,
								webm: true,
								av1: false,
							},
							attr: 'autoplay muted loop playsinline',
							className,
							poster,
							preload,
							controls: false,
						},
					)
				})

				await fsp.writeFile(file, html, 'utf-8')
			}
		},
	}
}
