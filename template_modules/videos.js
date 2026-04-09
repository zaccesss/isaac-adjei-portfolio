import fg from 'fast-glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import ffs from 'node:fs'
import { spawnSync } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'

function hasAttr(tag, attrName) {
	const re = new RegExp(`\\b${attrName}\\b(?:\\s*=\\s*["'][^"']*["'])?`, 'i')
	return re.test(tag)
}

function extractVideoSrcsFromHtml(html, ignoreAttr) {
	const results = []

	// беремо блоки <video ...>...</video>
	const blocks = html.match(/<video\b[\s\S]*?<\/video>/gi) || []

	for (const block of blocks) {
		// якщо на <video> є ignore-атрибут — НЕ беремо src з цього блоку
		if (ignoreAttr && hasAttr(block, ignoreAttr)) continue

		// 1) src="" на <video>
		const mVideoSrc = block.match(/\bsrc=["']([^"']+)["']/i)
		if (mVideoSrc?.[1]) results.push(mVideoSrc[1])

		// 2) src="" на <source>
		const sources = block.match(/<source\b[^>]*>/gi) || []
		for (const s of sources) {
			const m = s.match(/\bsrc=["']([^"']+)["']/i)
			if (m?.[1]) results.push(m[1])
		}
	}

	return results
}

function resolveSrcToAbs(projectRoot, srcDirAbs, srcAttr) {
	// alias @files/
	if (srcAttr.startsWith('@files/')) {
		return path.join(projectRoot, 'src/files', srcAttr.replace('@files/', ''))
	}

	// ./files/...
	if (srcAttr.startsWith('./files/')) {
		return path.join(projectRoot, 'src', srcAttr.replace('./', ''))
	}

	// /files/...
	if (srcAttr.startsWith('/files/')) {
		return path.join(projectRoot, 'src', srcAttr.replace(/^\//, ''))
	}

	// src/...
	if (srcAttr.startsWith('src/')) return path.join(projectRoot, srcAttr)

	// якщо просто "aaa.mov" — вважаємо що це в srcDir
	if (!srcAttr.includes('/')) return path.join(srcDirAbs, srcAttr)

	return null
}

export function videoOptimizerPlugin(userCfg = {}, logger = console) {
	const cfg = {
		enable: true,
		srcDir: 'src/files',
		outSubdir: 'files',
		patterns: ['**/*.mp4', '**/*.mov'],
		ignore: [],
		sizes: [1080, 720, 480],
		codecs: { mp4: true, webm: true, av1: false },
		crf: { mp4: 23, webm: 33, av1: 35 },
		removeAudio: true,

		// ✅ нове: кодувати тільки те, що використано в HTML
		onlyUsedInHtml: false,

		...userCfg,
	}

	let outDir = 'dist'

	const L = {
		start: msg =>
			typeof logger?.start === 'function'
				? logger.start(msg)
				: logger?.log?.(msg),
		file: msg =>
			typeof logger?.file === 'function'
				? logger.file(msg)
				: logger?.log?.(msg),
		done: msg =>
			typeof logger?.done === 'function'
				? logger.done(msg)
				: logger?.log?.(msg),
		warn: msg =>
			typeof logger?.warn === 'function' ? logger.warn(msg) : console.warn(msg),
		error: msg =>
			typeof logger?.error === 'function'
				? logger.error(msg)
				: console.error(msg),
	}

	const ensureDir = p => fs.mkdir(p, { recursive: true })

	const fileExists = async p =>
		new Promise(r => ffs.access(p, ffs.constants.F_OK, e => r(!e)))

	function runFfmpeg(args) {
		const res = spawnSync(ffmpegPath, args, { stdio: 'ignore' })
		return res.status === 0
	}

	function encodeVariant(input, output, { height, codec, crf, removeAudio }) {
		const vf = `scale=-2:${height}`
		const args = ['-y', '-i', input, '-vf', vf]

		if (codec === 'mp4') {
			args.push(
				'-c:v',
				'libx264',
				'-preset',
				'slow',
				'-crf',
				String(crf),
				'-pix_fmt',
				'yuv420p',
				'-movflags',
				'+faststart',
			)
		} else if (codec === 'webm') {
			args.push(
				'-c:v',
				'libvpx-vp9',
				'-b:v',
				'0',
				'-crf',
				String(crf),
				'-row-mt',
				'1',
				'-pix_fmt',
				'yuv420p',
			)
		} else if (codec === 'av1') {
			args.push(
				'-c:v',
				'libaom-av1',
				'-b:v',
				'0',
				'-crf',
				String(crf),
				'-cpu-used',
				'4',
				'-pix_fmt',
				'yuv420p',
			)
		}

		if (removeAudio) args.push('-an')
		args.push(output)

		return runFfmpeg(args)
	}

	function outPathFor(input, height, ext, outRoot) {
		const rel = path.relative(cfg.srcDir, input)
		const dir = path.join(outRoot, path.dirname(rel))
		const base = path.parse(rel).name
		const out = path.join(dir, `${base}-${height}.${ext}`)
		return { dir, out, base }
	}

	function originalOutPath(input, outRoot) {
		const rel = path.relative(cfg.srcDir, input)
		const dir = path.join(outRoot, path.dirname(rel))
		const base = path.parse(rel).name
		const out = path.join(dir, `${base}.mp4`)
		return { dir, out }
	}

	async function processOne(input, outRoot) {
		const { dir: origDir, out: origOut } = originalOutPath(input, outRoot)
		await ensureDir(origDir)
		if (!(await fileExists(origOut))) {
			await fs.copyFile(input, origOut).catch(() => {})
		}

		for (const h of cfg.sizes) {
			if (cfg.codecs.mp4) {
				const { dir, out, base } = outPathFor(input, h, 'mp4', outRoot)
				await ensureDir(dir)
				if (!(await fileExists(out))) {
					const ok = encodeVariant(input, out, {
						height: h,
						codec: 'mp4',
						crf: cfg.crf.mp4,
						removeAudio: cfg.removeAudio,
					})
					if (ok) L.file(`${base}-${h}.mp4`)
					else L.warn(`[video] ffmpeg mp4 failed: ${input}`)
				}
			}

			if (cfg.codecs.webm) {
				const { dir, out, base } = outPathFor(input, h, 'webm', outRoot)
				await ensureDir(dir)
				if (!(await fileExists(out))) {
					const ok = encodeVariant(input, out, {
						height: h,
						codec: 'webm',
						crf: cfg.crf.webm,
						removeAudio: cfg.removeAudio,
					})
					if (ok) L.file(`${base}-${h}.webm`)
					else L.warn(`[video] ffmpeg webm failed: ${input}`)
				}
			}

			if (cfg.codecs.av1) {
				// опційно (якщо захочеш)
			}
		}
	}

	return {
		name: 'video-optimizer',
		apply: 'build',
		enforce: 'post',
		configResolved(config) {
			outDir = config.build.outDir || outDir
		},

		async writeBundle() {
			if (!cfg.enable) return

			const root = process.cwd()
			const srcDirAbs = path.resolve(root, cfg.srcDir)
			const ignoreAttr = cfg.vidignore || 'data-anim-video-ignore'

			let files = []

			if (cfg.onlyUsedInHtml) {
				// ✅ шукаємо html і в корені, і в компонентах
				const htmlFiles = fg.sync(['src/*.html', 'src/components/**/*.html'], {
					cwd: root,
					dot: false,
				})

				const used = new Set()

				for (const hf of htmlFiles) {
					const html = await fs.readFile(path.join(root, hf), 'utf-8')
					const srcs = extractVideoSrcsFromHtml(html, ignoreAttr)

					for (const s of srcs) {
						const abs = resolveSrcToAbs(root, srcDirAbs, s)
						if (abs) used.add(abs)
					}
				}

				files = [...used].filter(p => /\.(mp4|mov)$/i.test(p))
			} else {
				// ✅ старий режим: усі файли з папки
				const patterns = cfg.patterns.map(p =>
					path.posix.join(cfg.srcDir.replace(/\\/g, '/'), p),
				)

				files = await fg(patterns, {
					dot: false,
					ignore: cfg.ignore || [],
				})
			}

			if (!files.length) {
				L.warn('Video optimization: no videos found')
				return
			}

			L.start(
				`Video optimization: ${cfg.sizes.join(', ')}p | codecs: ${Object.keys(
					cfg.codecs,
				)
					.filter(k => cfg.codecs[k])
					.join(', ')}`,
			)

			const outRoot = path.join(outDir, cfg.outSubdir)
			await ensureDir(outRoot)

			for (const file of files) {
				try {
					await processOne(file, outRoot)
				} catch (e) {
					L.error(`Video optimization failed: ${file} — ${e?.message || e}`)
				}
			}

			L.done('Video optimization completed')
		},
	}
}
