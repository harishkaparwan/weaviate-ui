import { createServer } from 'node:http'

const upstreamInput = process.env.WEAVIATE_URL?.trim()
const apiKey = process.env.WEAVIATE_API_KEY?.trim() ?? ''
const port = Number(process.env.WEAVIATE_PROXY_PORT ?? '8787')

if (!upstreamInput) {
  console.error('Missing WEAVIATE_URL. Example: WEAVIATE_URL=cluster.weaviate.cloud npm run proxy:weaviate')
  process.exit(1)
}

const upstreamWithProtocol = /^https?:\/\//i.test(upstreamInput) ? upstreamInput : `https://${upstreamInput}`
const upstreamBase = upstreamWithProtocol.replace(/\/$/, '').replace(/\/v1(?:\/schema|\/objects|\/batch\/objects|\/graphql)?$/i, '')

const proxyServer = createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (reqUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, upstreamBase }))
    return
  }

  if (!reqUrl.pathname.startsWith('/v1/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Use /v1/* paths. Example: /v1/schema or /v1/graphql' }))
    return
  }

  const targetUrl = `${upstreamBase}${reqUrl.pathname}${reqUrl.search}`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    const normalized = key.toLowerCase()
    if (normalized === 'host' || normalized === 'origin' || normalized === 'content-length' || normalized === 'connection') {
      continue
    }
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }

  if (apiKey) {
    headers.set('Authorization', `Bearer ${apiKey}`)
    headers.set('X-Weaviate-Api-Key', apiKey)
  }

  let body
  if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    body = Buffer.concat(chunks)
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'follow',
    })

    res.statusCode = upstreamResponse.status
    for (const [key, value] of upstreamResponse.headers.entries()) {
      const normalized = key.toLowerCase()
      if (normalized === 'content-encoding' || normalized === 'transfer-encoding') {
        continue
      }
      res.setHeader(key, value)
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer()
    res.end(Buffer.from(arrayBuffer))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error'
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `Proxy request failed: ${message}` }))
  }
})

proxyServer.listen(port, () => {
  console.log(`Weaviate proxy running at http://localhost:${port}`)
  console.log(`Forwarding requests to ${upstreamBase}/v1/*`)
  console.log('Health check: GET http://localhost:' + port + '/health')
})
