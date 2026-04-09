// Template configuration
import templateConfig from '../../template.config.js'

import fs from 'fs'
import path from 'path'
import posthtml from 'posthtml'
import { parser } from 'posthtml-parser'
import { match } from 'posthtml/lib/api'
import expressions from 'posthtml-expressions'
import replaceAliases from './aliases.js'
// import htmlTags from 'html-tags'

/**
 * Processes node attributes by replacing aliases.
 * @param {Object} attrs - Attributes object
 * @param {boolean} prependDot - Whether to prepend a dot before the value
 * @returns {string|false} - Found src/url value or false
 */
const processAttributes = (attrs, prependDot) => {
	let src = false
	for (const [attr, value] of Object.entries(attrs || {})) {
		if (typeof value === 'string') {
			attrs[attr] = replaceAliases(value, { prependDot })
			if (['src', 'url'].includes(attr) && !attrs[attr].startsWith('http'))
				src = attrs[attr]
		}
	}
	return src
}

/**
 * Processes tags and replaces aliases in attributes.
 * @param {Object} options
 * @returns {Function}
 */
export default (options = {}) => {
	let {
		root = './',
		encoding = 'utf-8',
		posthtmlExpressionsOptions = { locals: false },
	} = options

	return function posthtmlInclude(tree) {
		tree.parser = tree.parser || parser
		tree.match = tree.match || match

		tree.match({ attrs: true }, node => {
			if (!node.attrs) return node

			// For standard HTML tags prependDot = false, for others true
			const prependDot = false //!htmlTags.includes(node.tag)
			const src = processAttributes(node.attrs, prependDot)

			// Handle <include>
			if (node.tag === 'include' && src) {
				const filePath = path.resolve(root, src)

				let source = fs.readFileSync(filePath, encoding)

				// Include Tailwind CSS or Reset CSS
				if (filePath.endsWith('head.html')) {
					source = source.replace(
						'<head>',
						`<head>${
							templateConfig.styles.tailwindcss
								? `<link rel="stylesheet" href="@styles/libs/tailwind.css">`
								: `<link rel="stylesheet" href="@styles/libs/reset.css">`
						}`
					)
				}

				const exprOptions = {
					...posthtmlExpressionsOptions,
					...(options.delimiters && { delimiters: options.delimiters }),
				}

				try {
					const localsRaw =
						node.attrs.locals ||
						(node.content ? node.content.join('').replace(/\n/g, '') : false)
					if (localsRaw) {
						const localsJson = JSON.parse(localsRaw)
						exprOptions.locals = exprOptions.locals
							? { ...exprOptions.locals, ...localsJson }
							: localsJson
					}
				} catch {}

				if (exprOptions.locals) {
					source = posthtml()
						.use(expressions(exprOptions))
						.process(source, { sync: true }).html
				}

				const subtree = tree.parser(source)
				Object.assign(subtree, {
					match: tree.match,
					parser: tree.parser,
					messages: tree.messages,
				})
				const content = source.includes('include')
					? posthtmlInclude(subtree)
					: subtree

				tree.messages.push({ type: 'dependency', file: filePath })
				return { tag: false, content }
			}

			return node
		})

		return tree
	}
}
