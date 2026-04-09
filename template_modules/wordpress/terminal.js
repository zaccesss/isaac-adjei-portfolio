import { exec } from 'child_process'

import logger from '../logger.js'

const args = process.argv.slice(2)

const isMacOS = process.platform === 'darwin'
const isLinux = process.platform === 'linux'

const isSudo = isMacOS || isLinux ? 'sudo ' : ''

const startScriptString = `${isSudo}docker compose up -d`
const stopScriptString = `${isSudo}docker compose down --volumes`

if (args.includes('up')) {
	dockerStart()
} else if (args.includes('down')) {
	dockerStop()
}

function dockerStart() {
	logger('(!)Starting Docker...')
	exec(startScriptString, (error, stdout, stderr) => {
		if (error) {
			logger(`(!!)Error: ${error.message}`)
			return
		}
		// if (stderr) {
		// 	logger(`Warning: ${stderr}`)
		// }
		logger(`Docker started`) //:\n${stdout}
	})
}

function dockerStop() {
	logger('(!)Stopping Docker...')
	exec(stopScriptString, (error, stdout, stderr) => {
		if (error) {
			logger(`(!!)Error: ${error.message}`)
			return
		}
		// if (stderr) {
		// 	logger(`Warning: ${stderr}`)
		// }
		logger(`Docker stopped`) //:\n${stdout}
	})
}
