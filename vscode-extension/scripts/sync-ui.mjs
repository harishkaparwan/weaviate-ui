import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionRoot = path.resolve(__dirname, '..')
const workspaceRoot = path.resolve(extensionRoot, '..')
const distDir = path.join(workspaceRoot, 'dist')
const mediaDir = path.join(extensionRoot, 'media')
const assetsSrcDir = path.join(distDir, 'assets')
const assetsDestDir = path.join(mediaDir, 'assets')

if (!fs.existsSync(distDir)) {
  throw new Error('dist folder not found. Run `npm run build` in workspace root first.')
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('dist/index.html is missing. Build output is incomplete.')
}

fs.mkdirSync(mediaDir, { recursive: true })

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
fs.writeFileSync(path.join(mediaDir, 'index.html'), indexHtml)

if (fs.existsSync(assetsDestDir)) {
  fs.rmSync(assetsDestDir, { recursive: true, force: true })
}

if (!fs.existsSync(assetsSrcDir)) {
  throw new Error('dist/assets is missing. Build output is incomplete.')
}

fs.cpSync(assetsSrcDir, assetsDestDir, { recursive: true })

const logoSrc = path.join(workspaceRoot, 'public', 'weaviate-db-logo.png')
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(mediaDir, 'weaviate-db-logo.png'))
}

console.log('Synced UI assets into vscode-extension/media')
