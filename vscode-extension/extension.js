const fs = require('node:fs')
const path = require('node:path')
const vscode = require('vscode')

function activate(context) {
  const disposable = vscode.commands.registerCommand('weaviate-ui.open', () => {
    const panel = vscode.window.createWebviewPanel(
      'weaviateUi',
      'Weaviate UI',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
        retainContextWhenHidden: true,
      },
    )

    panel.webview.html = getWebviewHtml(context, panel.webview)
  })

  context.subscriptions.push(disposable)
}

function getWebviewHtml(context, webview) {
  const mediaRoot = path.join(context.extensionPath, 'media')
  const indexPath = path.join(mediaRoot, 'index.html')

  if (!fs.existsSync(indexPath)) {
    return [
      '<!doctype html>',
      '<html lang="en">',
      '<body>',
      '<h1>Weaviate UI has not been bundled yet.</h1>',
      '<p>Run <code>npm run extension:package</code> from the repository root.</p>',
      '</body>',
      '</html>',
    ].join('')
  }

  const nonce = getNonce()
  let html = fs.readFileSync(indexPath, 'utf8')

  html = html.replace(/(src|href)="([^"]+)"/g, (match, attribute, assetPath) => {
    if (/^(https?:|data:|#)/.test(assetPath)) {
      return match
    }

    const normalizedPath = assetPath.replace(/^\//, '')
    const assetUri = webview.asWebviewUri(vscode.Uri.file(path.join(mediaRoot, normalizedPath)))
    return `${attribute}="${assetUri}"`
  })

  html = html.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src http://localhost:* http://127.0.0.1:* https:;">`,
  )

  html = html.replace(/<script /g, `<script nonce="${nonce}" `)
  return html
}

function getNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let value = ''
  for (let i = 0; i < 32; i += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return value
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
