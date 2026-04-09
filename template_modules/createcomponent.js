// Template configuration
import templateConfig from '../template.config.js'
// Logger
import logger from './logger.js'
import fs from 'fs'
import path from 'path'

async function createAnimComponent() {
	const name = process.argv[2].toLowerCase()
	if (!name || /[а-яА-ЯёЁіїєґІЇЄҐ0-9\s\p{P}]/gu.test(name)) {
		logger(`_CREATE_COMPONENT_ERROR`)
	} else {
		const folderPath = findFolderRecursive(`src/components`, name)
		if (fs.existsSync(`src/components/custom/${name}`) || folderPath) {
			logger(`_CREATE_COMPONENT_EXIST`, [name, folderPath])
		} else {
			fs.mkdirSync(`src/components/custom/${name}`)
			fs.writeFileSync(
				`src/components/custom/${name}/${name}.html`,
				`<section data-anim-${name} class="${name}">
	<div class="${name}__container">
		
	</div>
</section>`
			)
			fs.writeFileSync(`src/components/custom/${name}/${name}.scss`, '')
			fs.writeFileSync(
				`src/components/custom/${name}/${name}.js`,
				`// Importing functionality\nimport { addTouchAttr, addLoadedAttr, isMobile, ANIM } from "@js/common/functions.js"\n\nimport "./${name}.scss"`
			)
			logger(`_CREATE_COMPONENT_DONE`, name)
		}
	}
}

function findFolderRecursive(startPath, folderName) {
	if (!fs.existsSync(startPath)) {
		return false
	}
	const files = fs.readdirSync(startPath)
	for (const file of files) {
		const fullPath = path.join(startPath, file)
		const stat = fs.statSync(fullPath)
		if (stat.isDirectory()) {
			if (file === folderName) {
				return fullPath // Found the required folder
			}
			const found = findFolderRecursive(fullPath, folderName)
			if (found) return found
		}
	}
	return false
}

createAnimComponent()
