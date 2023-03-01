import * as fs from 'node:fs'
import * as path from 'node:path'
import { exec } from 'node:child_process'

function run(command) {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error, { cause: stdout }))
      } else {
        resolve({ stdout, stderr })
      }
    })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  })
}

/**
 * Get the lifecycle stage from the filename
 * @returns {HookStage}
 */
function getLifecycleStage(lifecycleEventFileURL = import.meta.url) {
  const url = new URL(lifecycleEventFileURL)
  const filename = path.basename(url.pathname, '.js')
  const [stage] = filename.split('-')
  return stage
}

/**
 * @returns {HookData}
 */
function getParameters() {
  return JSON.parse(fs.readFileSync(0, { encoding: 'utf8' }))
}

/**
 * @param {HookEvent} event
 */
async function handler(event) {
  const { data, error } = event
  const { command } = data.amplify
  const stage = getLifecycleStage(event.url)
  // console.log({ data, stage, error })
  const message = `${stage} ${command}`
  try {
    await run(`git add .; git commit -m "${message}"`)
  } catch (error) {
    if (error.cause.includes('nothing to commit')) {
      console.log('[autogit] Skipping, nothing to commit')
    } else {
      console.error(error)
      process.exit(1)
    }
  }
}

export function autogit(lifecycleEventFileURL) {
  const event = getParameters()
  event.url = lifecycleEventFileURL
  handler(event)
}
