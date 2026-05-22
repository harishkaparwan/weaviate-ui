import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const extensionDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = resolve(extensionDir, '..')
const distDir = resolve(rootDir, 'dist')
const buildDir = resolve(extensionDir, 'build')
const manifestPath = resolve(extensionDir, 'manifest.json')
const backgroundPath = resolve(extensionDir, 'background.js')
const iconsDir = resolve(extensionDir, 'icons')

try {
  await stat(distDir)
} catch {
  throw new Error('Missing root dist directory. Run `npm run build` before syncing the Chrome extension UI.')
}

await rm(buildDir, { recursive: true, force: true })
await mkdir(buildDir, { recursive: true })
await cp(distDir, buildDir, { recursive: true })
await cp(manifestPath, resolve(buildDir, 'manifest.json'))
await cp(backgroundPath, resolve(buildDir, 'background.js'))
await cp(iconsDir, resolve(buildDir, 'icons'), { recursive: true })

console.log(`Synced ${distDir} to ${buildDir}`)
