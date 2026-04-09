/**
 * Universal function for replacing aliases in strings, objects, or arrays.
 * @param {string | object | Array} data - Data to process (string, object, or array).
 * @param {Object} options - Replacement options.
 * @param {boolean} [options.prependDot=false] - Whether to add a dot ('.') at the beginning of the path.
 * @param {boolean} [options.normalizePath=true] - Whether to normalize the path (remove duplicate slashes).
 * @param {boolean} [options.sortAliases=true] - Whether to sort aliases by length (longer first).
 * @param {boolean} [options.preserveOriginal=true] - Whether to return original data if there are no aliases.
 * @param {Function} [options.transformReplacement] - Function to transform the replacement value.
 * @returns {string | object | Array} - Processed data with aliases replaced.
 */
import templateCfg from '../../template.config.js'

const replaceAliases = (
	data,
	{
		prependDot = false,
		normalizePath = true,
		sortAliases = true,
		preserveOriginal = true,
		transformReplacement,
	} = {}
) => {
	const aliases = templateCfg.aliases || {}

	// If there are no aliases and preserveOriginal is enabled, return the original data
	if (preserveOriginal && Object.keys(aliases).length === 0) {
		return data
	}

	// Function to escape special characters in regular expressions
	const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	// String processing
	if (typeof data === 'string') {
		let result = data

		// Sort aliases by length (longer first) if sortAliases is enabled
		const sortedAliases = sortAliases
			? Object.keys(aliases).sort((a, b) => b.length - a.length)
			: Object.keys(aliases)

		sortedAliases.forEach(alias => {
			const regex = new RegExp(escapeRegExp(alias), 'g')
			if (result.match(regex)) {
				let replacement = aliases[alias]

				// Add a dot if needed
				if (prependDot) {
					replacement = `.${replacement}`
				}

				// Apply custom transform if provided
				if (typeof transformReplacement === 'function') {
					replacement = transformReplacement(replacement, alias)
				}

				result = result.replace(regex, replacement)
			}
		})

		// Normalize the path if needed
		if (normalizePath && !result.startsWith('http')) {
			result = result.replace(/\/+/g, '/')
		}

		// Remove SRC
		const src = new RegExp('src/', 'g')
		result = result.includes('src/') ? result.replace(src, '') : result

		return result
	}

	// Array processing
	if (Array.isArray(data)) {
		return data.map(item =>
			replaceAliases(item, {
				prependDot,
				normalizePath,
				sortAliases,
				preserveOriginal,
				transformReplacement,
			})
		)
	}

	// Object processing
	if (data && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				key,
				replaceAliases(value, {
					prependDot,
					normalizePath,
					sortAliases,
					preserveOriginal,
					transformReplacement,
				}),
			])
		)
	}

	// Return unchanged data if it's not a string, array, or object
	return data
}

export default replaceAliases
