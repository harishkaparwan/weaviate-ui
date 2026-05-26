const fs = require('node:fs')
const path = require('node:path')
const vscode = require('vscode')

const VIEW_ID = 'weaviate-ui.workbench'

function activate(context) {
  const openCommand = vscode.commands.registerCommand('weaviate-ui.open', () => {
    const panel = vscode.window.createWebviewPanel('weaviateUi', 'Weaviate DB', vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
      retainContextWhenHidden: true,
    })

    panel.webview.html = getWebviewHtml(context, panel.webview)
    wireFetchBridge(panel.webview)
  })

  const viewProvider = new WeaviateViewProvider(context)
  const sidebarRegistration = vscode.window.registerWebviewViewProvider(VIEW_ID, viewProvider, {
    webviewOptions: {
      retainContextWhenHidden: true,
    },
  })

  context.subscriptions.push(openCommand, sidebarRegistration)
}

class WeaviateViewProvider {
  constructor(context) {
    this.context = context
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))],
    }

    webviewView.webview.html = getWebviewHtml(this.context, webviewView.webview)
    wireFetchBridge(webviewView.webview)
  }
}

function wireFetchBridge(webview) {
  webview.onDidReceiveMessage(async (message) => {
    if (!message || message.type !== 'weaviate.fetch') {
      return
    }

    const { id, url, init } = message

    try {
      const response = await fetch(url, {
        method: init && init.method ? init.method : 'GET',
        headers: init ? init.headers : undefined,
        body: init ? init.body : undefined,
      })

      const body = await response.text()
      await webview.postMessage({
        type: 'weaviate.fetch.result',
        id,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body,
      })
    } catch (error) {
      await webview.postMessage({
        type: 'weaviate.fetch.result',
        id,
        error: error instanceof Error ? error.message : 'Bridge request failed',
      })
    }
  })
}

function getWebviewHtml(context, webview) {
  const mediaRoot = path.join(context.extensionPath, 'media')
  const indexPath = path.join(mediaRoot, 'index.html')

  if (!fs.existsSync(indexPath)) {
    return [
      '<!doctype html>',
      '<html lang="en">',
      '<body>',
      '<h2>Weaviate DB assets are missing.</h2>',
      '<p>Run <code>npm run extension:package</code> from the project root and reinstall the VSIX.</p>',
      '</body>',
      '</html>',
    ].join('')
  }

  const nonce = getNonce()
  let html = fs.readFileSync(indexPath, 'utf8')

  html = html.replace(/(src|href)="([^"]+)"/g, (full, attr, assetPath) => {
    if (/^(https?:|data:|#)/.test(assetPath)) {
      return full
    }

    const cleanPath = assetPath.replace(/^\//, '')
    const assetUri = webview.asWebviewUri(vscode.Uri.file(path.join(mediaRoot, cleanPath))).toString()
    return `${attr}="${assetUri}"`
  })

  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src http://localhost:* http://127.0.0.1:* https:;">`
  html = html.replace('<head>', `<head>${csp}`)

  const logoPath = path.join(mediaRoot, 'weaviate-db-logo.png')
  const logoUri = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : ''

  const bridgeScript = `<script nonce="${nonce}">(function(){
    if (${JSON.stringify(logoUri)}) { window.__WEAVIATE_LOGO_URI__ = ${JSON.stringify(logoUri)}; }
    if (typeof acquireVsCodeApi !== 'function') return;
    const vscode = acquireVsCodeApi();
    const nativeFetch = window.fetch.bind(window);
    const pending = new Map();
    let sequence = 0;

    function normalizeHeaders(headers) {
      if (!headers) return {};
      if (headers instanceof Headers) return Object.fromEntries(headers.entries());
      if (Array.isArray(headers)) return Object.fromEntries(headers);
      return headers;
    }

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.type !== 'weaviate.fetch.result') return;
      const resolver = pending.get(data.id);
      if (!resolver) return;
      pending.delete(data.id);
      resolver(data);
    });

    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input && input.url ? input.url : '';
      const useBridge = /^https:\/\//i.test(url) && !/https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url);

      if (!useBridge) {
        return nativeFetch(input, init);
      }

      const id = 'req_' + (++sequence);
      const payload = {
        type: 'weaviate.fetch',
        id,
        url,
        init: {
          method: (init && init.method) || 'GET',
          headers: normalizeHeaders(init && init.headers),
          body: init && init.body ? init.body : undefined,
        },
      };

      const result = await new Promise((resolve) => {
        pending.set(id, resolve);
        vscode.postMessage(payload);
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return new Response(result.body || '', {
        status: result.status,
        statusText: result.statusText || '',
        headers: result.headers || {},
      });
    };
  })();</script>`

  html = html.replace('</head>', `${bridgeScript}</head>`)
  html = html.replace(/<script(?![^>]*\bnonce=) /g, `<script nonce="${nonce}" `)

  return html
}

function getNonce() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i += 1) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return result
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
