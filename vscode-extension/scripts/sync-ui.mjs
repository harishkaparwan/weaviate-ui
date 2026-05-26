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

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run `npm run build` from workspace root first.')
}

fs.mkdirSync(mediaDir, { recursive: true })
fs.writeFileSync(path.join(mediaDir, 'index.html'), fs.readFileSync(path.join(distDir, 'index.html'), 'utf8'))

if (fs.existsSync(assetsDestDir)) {
  fs.rmSync(assetsDestDir, { recursive: true, force: true })
}

if (!fs.existsSync(assetsSrcDir)) {
  throw new Error('dist/assets is missing. Build output is incomplete.')
}

fs.cpSync(assetsSrcDir, assetsDestDir, { recursive: true })

for (const logoName of ['weaviate-db-logo.png', 'weaviate-db-logo.svg']) {
  const logoSrc = path.join(workspaceRoot, 'public', logoName)
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, path.join(mediaDir, logoName))
  }
}

const activitybarSvg = `<svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path d="M290 87L211 258H286L242 420L333 224H257L290 87Z" fill="currentColor"/>
</svg>`
fs.writeFileSync(path.join(mediaDir, 'activitybar.svg'), activitybarSvg)

console.log('Synced UI assets into vscode-extension/media')
