const fs = require('node:fs')
const path = require('node:path')
const vscode = require('vscode')

const WEBVIEW_VIEW_ID = 'weaviate-ui.workbench'

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
    wireFetchBridge(panel.webview)
  })

  const sidebarProvider = new WeaviateWorkbenchViewProvider(context)

  context.subscriptions.push(
    disposable,
    vscode.window.registerWebviewViewProvider(WEBVIEW_VIEW_ID, sidebarProvider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }),
  )
}

class WeaviateWorkbenchViewProvider {
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
        method: init?.method || 'GET',
        headers: init?.headers,
        body: init?.body,
      })

      const body = await response.text()
      webview.postMessage({
        type: 'weaviate.fetch.result',
        id,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body,
      })
    } catch (error) {
      webview.postMessage({
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
      '<h1>Weaviate DB assets are missing.</h1>',
      '<p>Reinstall the extension from the Marketplace, Open VSX, or a freshly packaged VSIX.</p>',
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

  const bridgeBootstrap = `<script nonce="${nonce}">(function(){
    if (typeof acquireVsCodeApi !== 'function') return;
    const vscode = acquireVsCodeApi();
    const originalFetch = window.fetch.bind(window);
    const pending = new Map();
    let counter = 0;

    function normalizeHeaders(headers) {
      if (!headers) return {};
      if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
      }
      if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
      }
      return headers;
    }

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.type !== 'weaviate.fetch.result') return;
      const resolve = pending.get(data.id);
      if (!resolve) return;
      pending.delete(data.id);
      resolve(data);
    });

    window.fetch = async function(input, init) {
      const requestUrl = typeof input === 'string' ? input : input && input.url ? input.url : '';
      const shouldBridge = /^https:\/\//i.test(requestUrl) && !/https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(requestUrl);

      if (!shouldBridge) {
        return originalFetch(input, init);
      }

      const id = 'req_' + (++counter);
      const payload = {
        type: 'weaviate.fetch',
        id,
        url: requestUrl,
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

  html = html.replace('</head>', `${bridgeBootstrap}</head>`)

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
