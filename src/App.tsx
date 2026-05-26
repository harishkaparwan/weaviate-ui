import { useMemo, useState } from 'react'
import './App.css'

type WeaviateProperty = {
  name: string
  dataType?: string[]
  description?: string
  indexFilterable?: boolean
  indexSearchable?: boolean
  tokenization?: string
  moduleConfig?: Record<string, unknown>
}

type WeaviateClass = {
  class: string
  description?: string
  vectorizer?: string
  vectorIndexType?: string
  replicationConfig?: {
    factor?: number
  }
  properties?: WeaviateProperty[]
}

type WeaviateSchema = {
  classes?: WeaviateClass[]
}

type WeaviateObject = {
  id?: string
  class?: string
  properties?: Record<string, unknown>
  vectorWeights?: Record<string, unknown>
  creationTimeUnix?: number
  lastUpdateTimeUnix?: number
}

type WeaviateObjectsResponse = {
  objects?: WeaviateObject[]
}

type GraphQlResponse = {
  data?: unknown
  errors?: unknown
}

type ViewTab = 'overview' | 'schema' | 'objects' | 'insert' | 'graphql' | 'raw'
type InsertMode = 'schema' | 'object' | 'batch'
type ConnectionType = 'local' | 'cluster'

type InsertResult = {
  success: number
  failed: number
  errors: string[]
}

const defaultEndpoint = 'http://localhost:8083'
const defaultEnvEndpoint = (import.meta.env.VITE_WEAVIATE_URL as string | undefined) ?? ''
const defaultEnvApiKey = (import.meta.env.VITE_WEAVIATE_API_KEY as string | undefined) ?? ''

type NativeHttpRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

type NativeHttpResponse = {
  ok: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  error?: string
}

type TauriInvoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
    __WEAVIATE_LOGO_URI__?: string
  }
}

let tauriInvoke: TauriInvoke | null = null

function isTauriRuntime() {
  return typeof window !== 'undefined' && typeof window.__TAURI_INTERNALS__ !== 'undefined'
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]))
}

function normalizeBody(body: BodyInit | null | undefined): string | undefined {
  if (body == null) return undefined
  if (typeof body === 'string') return body
  return String(body)
}

async function getTauriInvoke(): Promise<TauriInvoke | null> {
  if (!isTauriRuntime()) {
    return null
  }
  if (tauriInvoke) {
    return tauriInvoke
  }
  const module = await import('@tauri-apps/api/core')
  tauriInvoke = module.invoke as TauriInvoke
  return tauriInvoke
}

function shouldUseNativeBridge(requestUrl: string) {
  return /^https:\/\//i.test(requestUrl) && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(requestUrl)
}

async function weaviateFetch(input: RequestInfo | URL, init?: RequestInit) {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  if (!shouldUseNativeBridge(requestUrl)) {
    return fetch(input, init)
  }

  const invoke = await getTauriInvoke()
  if (!invoke) {
    return fetch(input, init)
  }

  const request: NativeHttpRequest = {
    url: requestUrl,
    method: init?.method ?? 'GET',
    headers: normalizeHeaders(init?.headers),
    body: normalizeBody(init?.body),
  }

  const result = await invoke<NativeHttpResponse>('native_http_fetch', { request })
  if (result.error) {
    throw new Error(result.error)
  }

  return new Response(result.body ?? '', {
    status: result.status,
    statusText: result.statusText,
    headers: result.headers,
  })
}

function SchemaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5.7" rx="6.6" ry="2.3" />
        <path d="M5.4 5.7v3.7c0 1.2 2.95 2.3 6.6 2.3s6.6-1.1 6.6-2.3V5.7" />
        <path d="M5.4 9.4v3.7c0 1.2 2.95 2.3 6.6 2.3s6.6-1.1 6.6-2.3V9.4" />
        <path d="M5.4 13.1v3.7c0 1.2 2.95 2.3 6.6 2.3s6.6-1.1 6.6-2.3v-3.7" />
      </g>
    </svg>
  )
}

function App() {
  const brandLogoSrc = typeof window !== 'undefined' && window.__WEAVIATE_LOGO_URI__
    ? window.__WEAVIATE_LOGO_URI__
    : 'weaviate-db-logo.svg'

  const [endpoint, setEndpoint] = useState(defaultEnvEndpoint || defaultEndpoint)
  const [connectionType, setConnectionType] = useState<ConnectionType>(defaultEnvEndpoint ? 'cluster' : 'local')
  const [apiKey, setApiKey] = useState(defaultEnvApiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [targetClass, setTargetClass] = useState('')
  const [classSearch, setClassSearch] = useState('')
  const [schema, setSchema] = useState<WeaviateSchema | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [activeTab, setActiveTab] = useState<ViewTab>('overview')
  const [objects, setObjects] = useState<WeaviateObject[]>([])
  const [objectsLoading, setObjectsLoading] = useState(false)
  const [objectsError, setObjectsError] = useState('')
  const [objectLimit, setObjectLimit] = useState(10)
  const [graphqlQuery, setGraphqlQuery] = useState('')
  const [graphqlResult, setGraphqlResult] = useState<GraphQlResponse | null>(null)
  const [graphqlLoading, setGraphqlLoading] = useState(false)
  const [graphqlError, setGraphqlError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insertJson, setInsertJson] = useState('')
  const [insertMode, setInsertMode] = useState<InsertMode>('batch')
  const [insertFileName, setInsertFileName] = useState('')
  const [insertLoading, setInsertLoading] = useState(false)
  const [insertResult, setInsertResult] = useState<InsertResult | null>(null)
  const [insertError, setInsertError] = useState('')

  const classes = useMemo(() => schema?.classes ?? [], [schema])
  const filteredClasses = useMemo(() => {
    let next = classes
    if (targetClass.trim()) {
      next = next.filter((item) => item.class.toLowerCase() === targetClass.trim().toLowerCase())
    }
    if (classSearch.trim()) {
      const search = classSearch.trim().toLowerCase()
      next = next.filter((item) => item.class.toLowerCase().includes(search))
    }
    return next
  }, [classes, targetClass, classSearch])
  const activeClass = classes.find((item) => item.class === selectedClass) ?? classes[0]
  const isClusterConnection = connectionType === 'cluster'
  const baseUrl = useMemo(() => {
    const raw = endpoint.trim()
    if (!raw) return defaultEndpoint
    const localHostPattern = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `${localHostPattern.test(raw) ? 'http' : 'https'}://${raw}`
    return withProtocol.replace(/\/$/, '').replace(/\/v1(?:\/schema|\/objects|\/batch\/objects|\/graphql)?$/i, '')
  }, [endpoint])

  const baseHostname = useMemo(() => {
    try {
      return new URL(baseUrl).hostname.toLowerCase()
    } catch {
      return ''
    }
  }, [baseUrl])

  const requestHeaders = useMemo<Record<string, string>>(() => ({
    ...(isClusterConnection && apiKey.trim()
      ? {
          Authorization: `Bearer ${apiKey.trim()}`,
          'X-Weaviate-Api-Key': apiKey.trim(),
        }
      : {}),
  }), [isClusterConnection, apiKey])

  function toUserError(err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to Weaviate'
    if (isClusterConnection && message.includes('Weaviate returned 404')) {
      return `Weaviate returned 404 Not Found. This usually means the cluster endpoint is incorrect. Use your cluster REST host (example: https://<cluster-id>.c0.<region>.gcp.weaviate.cloud), not the console URL.`
    }
    if (/Failed to fetch|Load failed|NetworkError/i.test(message)) {
      return isClusterConnection
        ? isTauriRuntime()
          ? 'Network request failed from desktop app. Verify cluster URL/API key and internet connectivity.'
          : 'Failed to fetch. This is usually a CORS restriction from the cluster origin policy. Endpoint/key may be valid, but browser requests are blocked.'
        : 'Failed to fetch. Check local endpoint and whether Weaviate is running.'
    }
    return message
  }

  async function loadSchema() {
    setLoading(true)
    setError('')

    try {
      if (isClusterConnection && !apiKey.trim()) {
        throw new Error('API key is required for Cluster connection type.')
      }
      if (isClusterConnection) {
        const raw = endpoint.trim().toLowerCase()
        if (raw.endsWith('.gc')) {
          throw new Error('Cluster endpoint looks incomplete. Did you mean ...gcp.weaviate.cloud?')
        }
        if (raw.includes('cluster-id') || raw.includes('<cluster-id>') || raw.includes('region') || raw.includes('<region>')) {
          throw new Error('You are using the example host. Replace it with your real cluster REST host from Weaviate Cloud.')
        }
        if (baseHostname === 'console.weaviate.cloud') {
          throw new Error('Use your cluster REST endpoint host, not console.weaviate.cloud.')
        }
        if (!baseHostname.endsWith('.weaviate.cloud')) {
          throw new Error('Cluster host must end with .weaviate.cloud and include your real cluster id and region.')
        }
      }
      const className = targetClass.trim()
      const response = await weaviateFetch(className ? `${baseUrl}/v1/schema/${encodeURIComponent(className)}` : `${baseUrl}/v1/schema`, {
        headers: requestHeaders,
      })

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

      const payload = (await response.json()) as WeaviateSchema | WeaviateClass
      const data = className ? ({ classes: [payload as WeaviateClass] } satisfies WeaviateSchema) : (payload as WeaviateSchema)
      setSchema(data)
      setSelectedClass(data.classes?.[0]?.class ?? '')
      setActiveTab('overview')
      if (data.classes?.[0]) {
        prepareClassWorkspace(data.classes[0])
      }
    } catch (err) {
      setSchema(null)
      setSelectedClass('')
      setError(toUserError(err))
    } finally {
      setLoading(false)
    }
  }

  async function loadObjects(className = activeClass?.class) {
    if (!className) {
      setObjects([])
      return
    }

    setObjectsLoading(true)
    setObjectsError('')

    try {
      const response = await weaviateFetch(`${baseUrl}/v1/objects?class=${encodeURIComponent(className)}&limit=${objectLimit}`, {
        headers: requestHeaders,
      })

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as WeaviateObjectsResponse
      setObjects(data.objects ?? [])
    } catch (err) {
      setObjects([])
      setObjectsError(err instanceof Error ? err.message : 'Unable to load objects')
    } finally {
      setObjectsLoading(false)
    }
  }

  function buildPropertiesTemplate(item: WeaviateClass | undefined) {
    const sample: Record<string, unknown> = {}
    for (const property of item?.properties ?? []) {
      const type = property.dataType?.[0] ?? 'text'
      if (type === 'int' || type === 'number') sample[property.name] = 0
      else if (type === 'boolean') sample[property.name] = false
      else if (type === 'date') sample[property.name] = new Date().toISOString()
      else if (type.startsWith('text[]') || type.endsWith('[]')) sample[property.name] = []
      else sample[property.name] = ''
    }
    return sample
  }

  function buildInsertTemplate(mode: InsertMode, item: WeaviateClass | undefined) {
    if (mode === 'schema') {
      return JSON.stringify(
        {
          class: 'MyClass',
          description: 'Describe this class',
          vectorizer: 'none',
          properties: [
            {
              name: 'title',
              dataType: ['text'],
              description: 'Sample text field',
            },
          ],
        },
        null,
        2,
      )
    }

    if (mode === 'object') {
      return JSON.stringify(
        {
          class: item?.class ?? 'MyClass',
          properties: buildPropertiesTemplate(item),
        },
        null,
        2,
      )
    }

    if (!item) {
      return JSON.stringify(
        {
          objects: [
            {
              class: 'MyClass',
              properties: {
                title: 'Sample title',
              },
            },
          ],
        },
        null,
        2,
      )
    }

    return JSON.stringify([buildPropertiesTemplate(item)], null, 2)
  }

  function buildGraphQlQuery(item: WeaviateClass) {
    const propertyNames = item.properties?.map((property) => property.name) ?? []
    return `{
  Get {
    ${item.class}(limit: 5) {
${propertyNames.slice(0, 5).map((name) => `      ${name}`).join('\n') || '      _additional { id }'}
      _additional {
        id
        distance
      }
    }
  }
}`
  }

  function prepareClassWorkspace(item: WeaviateClass) {
    setInsertJson(buildInsertTemplate(insertMode, item))
    setInsertFileName('')
    setInsertResult(null)
    setInsertError('')
    setGraphqlQuery(buildGraphQlQuery(item))
    setGraphqlResult(null)
    setGraphqlError('')
  }

  function parseCsv(text: string): Record<string, unknown>[] {
    const rows: string[][] = []
    let current: string[] = []
    let value = ''
    let inQuotes = false
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      if (inQuotes) {
        if (char === '"' && text[i + 1] === '"') {
          value += '"'
          i += 1
        } else if (char === '"') {
          inQuotes = false
        } else {
          value += char
        }
      } else if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        current.push(value)
        value = ''
      } else if (char === '\n' || char === '\r') {
        if (value.length || current.length) {
          current.push(value)
          rows.push(current)
          current = []
          value = ''
        }
        if (char === '\r' && text[i + 1] === '\n') i += 1
      } else {
        value += char
      }
    }
    if (value.length || current.length) {
      current.push(value)
      rows.push(current)
    }
    if (!rows.length) return []
    const headers = rows[0].map((header) => header.trim())
    const propertyMap = new Map<string, WeaviateProperty>()
    for (const property of activeClass?.properties ?? []) {
      propertyMap.set(property.name, property)
    }
    return rows.slice(1).map((row) => {
      const entry: Record<string, unknown> = {}
      headers.forEach((header, index) => {
        const raw = row[index] ?? ''
        const property = propertyMap.get(header)
        const type = property?.dataType?.[0] ?? 'text'
        if (raw === '') return
        if (type === 'int') entry[header] = parseInt(raw, 10)
        else if (type === 'number') entry[header] = Number(raw)
        else if (type === 'boolean') entry[header] = raw.toLowerCase() === 'true'
        else if (type.endsWith('[]')) entry[header] = raw.split('|').map((piece) => piece.trim())
        else entry[header] = raw
      })
      return entry
    })
  }

  async function handleInsertFile(file: File) {
    setInsertFileName(file.name)
    const text = await file.text()
    if (file.name.toLowerCase().endsWith('.csv')) {
      const rows = parseCsv(text)
      if (insertMode === 'object') {
        setInsertJson(JSON.stringify(rows[0] ?? {}, null, 2))
      } else {
        setInsertJson(JSON.stringify(rows, null, 2))
      }
    } else {
      setInsertJson(text)
    }
  }

  async function submitInsert() {
    setInsertLoading(true)
    setInsertError('')
    setInsertResult(null)

    try {
      const parsed = JSON.parse(insertJson || '{}') as unknown
      let response: Response

      if (insertMode === 'schema') {
        response = await weaviateFetch(`${baseUrl}/v1/schema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...requestHeaders },
          body: JSON.stringify(parsed),
        })
      } else if (insertMode === 'object') {
        const record = parsed as Record<string, unknown>
        const payload =
          record.class && record.properties
            ? record
            : {
                class: activeClass?.class,
                properties: record,
              }

        if (!payload.class) {
          throw new Error('Class is required for object insert. Select a class or include class in JSON.')
        }

        response = await weaviateFetch(`${baseUrl}/v1/objects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...requestHeaders },
          body: JSON.stringify(payload),
        })
      } else {
        const batchInput = parsed as Record<string, unknown> | Array<Record<string, unknown>>
        let payload: { objects: Array<Record<string, unknown>> }

        if (!Array.isArray(batchInput) && Array.isArray((batchInput as { objects?: unknown }).objects)) {
          payload = { objects: (batchInput as { objects: Array<Record<string, unknown>> }).objects }
        } else {
          const rows = (Array.isArray(batchInput) ? batchInput : [batchInput]) as Array<Record<string, unknown>>
          if (!rows.length) throw new Error('No objects to insert.')
          payload = {
            objects: rows.map((row) => {
              if (row.class && row.properties) return row
              if (!activeClass?.class) {
                throw new Error('Class is required for batch insert. Select a class or use {"objects":[{"class":"...","properties":{...}}]} format.')
              }
              return {
                class: activeClass.class,
                properties: row,
              }
            }),
          }
        }

        response = await weaviateFetch(`${baseUrl}/v1/batch/objects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...requestHeaders },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

      if (insertMode === 'batch') {
        const data = (await response.json()) as Array<{ result?: { status?: string; errors?: { error?: Array<{ message?: string }> } } }>
        const errors: string[] = []
        let success = 0
        let failed = 0
        for (const item of data) {
          if (item.result?.status === 'SUCCESS') {
            success += 1
          } else {
            failed += 1
            for (const err of item.result?.errors?.error ?? []) {
              if (err.message) errors.push(err.message)
            }
          }
        }
        setInsertResult({ success, failed, errors })
      } else {
        setInsertResult({ success: 1, failed: 0, errors: [] })
        if (insertMode === 'schema') {
          void loadSchema()
        }
      }
    } catch (err) {
      setInsertError(err instanceof Error ? err.message : 'Unable to insert objects')
    } finally {
      setInsertLoading(false)
    }
  }

  async function runGraphQlQuery() {
    setGraphqlLoading(true)
    setGraphqlError('')
    setGraphqlResult(null)

    try {
      const response = await weaviateFetch(`${baseUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...requestHeaders,
        },
        body: JSON.stringify({ query: graphqlQuery }),
      })

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

      setGraphqlResult((await response.json()) as GraphQlResponse)
    } catch (err) {
      setGraphqlError(err instanceof Error ? err.message : 'Unable to run GraphQL query')
    } finally {
      setGraphqlLoading(false)
    }
  }

  return (
    <main className="compass-shell">
      <aside className="left-rail">
        <div className="brand-block">
          <img className="brand-mark" src={brandLogoSrc} alt="Weaviate DB logo" />
          <div>
            <strong>Weaviate DB</strong>
            <p>Vector DB Workbench</p>
          </div>
        </div>

        <form
          className="connection-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void loadSchema()
          }}
        >
          <label>Connection Type</label>
          <div className="connection-type-group" role="radiogroup" aria-label="Connection Type">
            <label className="connection-type-option">
              <input
                type="radio"
                name="connectionType"
                value="local"
                checked={connectionType === 'local'}
                onChange={() => {
                  setConnectionType('local')
                  if (!endpoint.trim() || endpoint.includes('weaviate.cloud')) {
                    setEndpoint(defaultEndpoint)
                  }
                }}
              />
              <span>Local</span>
            </label>
            <label className="connection-type-option">
              <input
                type="radio"
                name="connectionType"
                value="cluster"
                checked={connectionType === 'cluster'}
                onChange={() => {
                  setConnectionType('cluster')
                }}
              />
              <span>Cluster</span>
            </label>
          </div>
          <label htmlFor="endpoint">Connection URI</label>
          <input
            id="endpoint"
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder={defaultEndpoint}
          />
          {isClusterConnection ? (
            <>
              <label htmlFor="apiKey">API Key</label>
              <div className="input-with-action">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Enter Weaviate Cloud API key"
                  autoComplete="off"
                />
                <button type="button" className="icon-btn" onClick={() => setShowApiKey((value) => !value)}>
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </>
          ) : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
          <label htmlFor="targetClass">Target Class (optional)</label>
          <select id="targetClass" value={targetClass} onChange={(event) => setTargetClass(event.target.value)}>
            <option value="">All Classes</option>
            {classes.map((item) => (
              <option key={item.class} value={item.class}>
                {item.class}
              </option>
            ))}
          </select>
          <p className="connection-help">
            Leave empty or choose <strong>All Classes</strong> to load everything. Selecting one class loads only its schema and objects.
          </p>
          <p className="connection-help">
            {isClusterConnection
              ? 'Cluster mode sends your API key as Authorization Bearer and X-Weaviate-Api-Key automatically.'
              : 'Local mode: connects directly without custom auth headers. You can also point it to a local proxy like http://localhost:8787.'}
          </p>
          {isClusterConnection ? (
            <p className="connection-help">Expected cluster host format: https://&lt;cluster-id&gt;.c0.&lt;region&gt;.gcp.weaviate.cloud</p>
          ) : null}
          {error ? <p className="error-message">{error}</p> : null}
        </form>

        <div className="nav-section">
          <div className="nav-heading sidebar-heading">
            <span>Classes ({classes.length}){targetClass ? ` • Filtered to: ${targetClass}` : ''}</span>
            <button className="refresh-chip" type="button" onClick={() => void loadSchema()} disabled={loading || !schema}>
              ↻
            </button>
          </div>
          <input
            className="class-search"
            value={classSearch}
            onChange={(event) => setClassSearch(event.target.value)}
            placeholder="Search classes..."
          />
          <div className="class-tree">
            {filteredClasses.map((item) => (
              <button
                key={item.class}
                className={activeClass?.class === item.class ? 'active' : ''}
                type="button"
                onClick={() => {
                  setSelectedClass(item.class)
                  prepareClassWorkspace(item)
                  if (activeTab === 'overview') {
                    setActiveTab('schema')
                  }
                }}
              >
                <span className="collection-icon">
                  <SchemaIcon className="schema-icon" />
                </span>
                <span className="class-meta">
                  <strong>{item.class}</strong>
                  <small>{item.properties?.length ?? 0} fields</small>
                </span>
              </button>
            ))}
            {!classes.length ? <p className="muted-note">Connect to load classes.</p> : null}
            {classes.length && !filteredClasses.length ? <p className="muted-note">No classes match your filter.</p> : null}
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="top-bar">
          <div className="top-title-wrap">
            <p className="breadcrumb">localhost / weaviate / {activeClass?.class ?? 'no class selected'}</p>
            <div className="title-row">
              <span className="header-class-icon">
                <SchemaIcon className="schema-icon" />
              </span>
              <h1 className="header-title">{activeClass?.class ?? 'Weaviate Connection'}</h1>
            </div>
          </div>
          <div className="status-pills">
            <span className={error ? 'offline' : schema ? 'online' : ''}>{error ? 'Offline' : schema ? 'Connected' : 'Idle'}</span>
            <span>{classes.reduce((total, item) => total + (item.properties?.length ?? 0), 0)} properties</span>
          </div>
        </header>

        <nav className="tabs">
          {(['overview', 'schema', 'objects', 'insert', 'graphql', 'raw'] as ViewTab[]).map((tab) => {
            const disabled = tab === 'schema' || tab === 'objects' || tab === 'graphql' || tab === 'raw' ? !activeClass : tab === 'insert' ? !schema : false
            return (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setActiveTab(tab)
                  if (tab === 'objects') {
                    void loadObjects()
                  }
                }}
              >
                {tab}
              </button>
            )
          })}
        </nav>

        {activeTab === 'overview' ? (
          <section className="content-panel">
            {schema ? (
              classes.length ? (
                <>
                  <div className="summary-grid">
                    <article>
                      <span>Classes</span>
                      <strong>{classes.length}</strong>
                    </article>
                    <article>
                      <span>Total properties</span>
                      <strong>{classes.reduce((total, item) => total + (item.properties?.length ?? 0), 0)}</strong>
                    </article>
                    <article>
                      <span>Endpoint</span>
                      <strong>{baseUrl}</strong>
                    </article>
                  </div>

                  <div className="overview-list">
                    {classes.map((item) => (
                      <article key={item.class} className="overview-card">
                        <header>
                          <div>
                            <h2>{item.class}</h2>
                            <p>{item.description || 'No description'}</p>
                          </div>
                          <div className="overview-meta">
                            <span>{item.vectorizer || 'no vectorizer'}</span>
                            <span>{item.vectorIndexType || 'default index'}</span>
                            <span>{item.properties?.length ?? 0} fields</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClass(item.class)
                              prepareClassWorkspace(item)
                              setActiveTab('schema')
                            }}
                          >
                            Open
                          </button>
                        </header>
                        <div className="data-table">
                          <div className="table-header schema-header">
                            <span>Field</span>
                            <span>Type</span>
                            <span>Tokenization</span>
                            <span>Filter</span>
                            <span>Search</span>
                          </div>
                          {(item.properties ?? []).map((property) => (
                            <div key={property.name} className="table-row schema-row">
                              <span>
                                <strong>{property.name}</strong>
                                <small>{property.description || 'No description'}</small>
                              </span>
                              <code>{property.dataType?.join(', ') || 'unknown'}</code>
                              <span>{property.tokenization || 'default'}</span>
                              <span>{property.indexFilterable === false ? 'Off' : 'On'}</span>
                              <span>{property.indexSearchable === false ? 'Off' : 'On'}</span>
                            </div>
                          ))}
                          {!item.properties?.length ? <p className="empty-state">No properties.</p> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-state large">Connected, but no classes are defined in this Weaviate instance yet.</p>
              )
            ) : (
              <p className="empty-state large">Click <strong>Connect</strong> to load the schema from Weaviate.</p>
            )}
          </section>
        ) : activeClass || activeTab === 'insert' ? (
          <section className="content-panel">
            {activeTab === 'schema' ? (
              <>
                <div className="summary-grid">
                  <article>
                    <span>Vectorizer</span>
                    <strong>{activeClass.vectorizer || 'none'}</strong>
                  </article>
                  <article>
                    <span>Vector index</span>
                    <strong>{activeClass.vectorIndexType || 'default'}</strong>
                  </article>
                  <article>
                    <span>Replication</span>
                    <strong>{activeClass.replicationConfig?.factor ?? 'default'}</strong>
                  </article>
                </div>

                <div className="data-table">
                  <div className="table-header schema-header">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Tokenization</span>
                    <span>Filter</span>
                    <span>Search</span>
                  </div>
                  {(activeClass.properties ?? []).map((property) => (
                    <div key={property.name} className="table-row schema-row">
                      <span>
                        <strong>{property.name}</strong>
                        <small>{property.description || 'No description'}</small>
                      </span>
                      <code>{property.dataType?.join(', ') || 'unknown'}</code>
                      <span>{property.tokenization || 'default'}</span>
                      <span>{property.indexFilterable === false ? 'Off' : 'On'}</span>
                      <span>{property.indexSearchable === false ? 'Off' : 'On'}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {activeTab === 'objects' ? (
              <>
                <div className="toolbar">
                  <label>
                    Limit
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={objectLimit}
                      onChange={(event) => setObjectLimit(Number(event.target.value))}
                    />
                  </label>
                  <button type="button" onClick={() => void loadObjects()} disabled={objectsLoading}>
                    {objectsLoading ? 'Loading...' : 'Find'}
                  </button>
                </div>
                {objectsError ? <p className="error-message">{objectsError}</p> : null}
                <div className="json-list">
                  {objects.map((object, index) => (
                    <pre key={object.id ?? index}>{JSON.stringify(object, null, 2)}</pre>
                  ))}
                  {!objects.length && !objectsLoading ? <p className="empty-state">No objects loaded.</p> : null}
                </div>
              </>
            ) : null}

            {activeTab === 'insert' ? (
              <div className="insert-grid">
                <section>
                  <div className="panel-title">
                    <h2>
                      {insertMode === 'schema'
                        ? 'Create schema/class'
                        : insertMode === 'object'
                          ? `Create object${activeClass ? ` in ${activeClass.class}` : ''}`
                          : `Insert batch${activeClass ? ` into ${activeClass.class}` : ''}`}
                    </h2>
                    <button type="button" onClick={() => void submitInsert()} disabled={insertLoading}>
                      {insertLoading ? 'Submitting...' : insertMode === 'schema' ? 'Create' : insertMode === 'object' ? 'Create' : 'Insert'}
                    </button>
                  </div>
                  <div className="toolbar insert-toolbar">
                    <label className="field-group mode-group">
                      Mode
                      <select
                        value={insertMode}
                        onChange={(event) => {
                          const mode = event.target.value as InsertMode
                          setInsertMode(mode)
                          setInsertJson(buildInsertTemplate(mode, activeClass))
                          setInsertFileName('')
                          setInsertResult(null)
                          setInsertError('')
                        }}
                      >
                        <option value="schema">Schema/Class</option>
                        <option value="object">Single object</option>
                        <option value="batch">Batch objects</option>
                      </select>
                    </label>
                    <label className="file-input">
                      <span>Import file (CSV / JSON)</span>
                      <input
                        type="file"
                        accept=".csv,.json,application/json,text/csv"
                        disabled={insertMode === 'schema'}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) void handleInsertFile(file)
                          event.target.value = ''
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setInsertJson(buildInsertTemplate(insertMode, activeClass))
                        setInsertFileName('')
                      }}
                    >
                      Reset template
                    </button>
                    {insertFileName ? <span className="file-name">{insertFileName}</span> : null}
                  </div>
                  <p className="hint">
                    {insertMode === 'schema'
                      ? 'Provide a Weaviate class schema object and submit to /v1/schema.'
                      : insertMode === 'object'
                        ? 'Provide one object payload. Use either { class, properties } or plain properties JSON. CSV import uses the first row.'
                        : 'Provide a JSON array of objects. CSV headers should match property names; array fields use | as separator.'}
                  </p>
                  <textarea value={insertJson} onChange={(event) => setInsertJson(event.target.value)} />
                </section>
                <section>
                  <h2>Result</h2>
                  {insertError ? <p className="error-message">{insertError}</p> : null}
                  {insertResult ? (
                    <div className="insert-result">
                      <div className="summary-grid">
                        <article>
                          <span>Inserted</span>
                          <strong>{insertResult.success}</strong>
                        </article>
                        <article>
                          <span>Failed</span>
                          <strong>{insertResult.failed}</strong>
                        </article>
                        <article>
                          <span>Errors</span>
                          <strong>{insertResult.errors.length}</strong>
                        </article>
                      </div>
                      {insertResult.errors.length ? (
                        <pre>{insertResult.errors.join('\n')}</pre>
                      ) : (
                        <p className="empty-state">No errors reported.</p>
                      )}
                    </div>
                  ) : (
                    <p className="empty-state">Submit a request to see the result.</p>
                  )}
                </section>
              </div>
            ) : null}

            {activeTab === 'graphql' ? (
              <div className="query-grid">
                <section>
                  <div className="panel-title">
                    <h2>GraphQL Query</h2>
                    <button type="button" onClick={() => void runGraphQlQuery()} disabled={graphqlLoading}>
                      {graphqlLoading ? 'Running...' : 'Run query'}
                    </button>
                  </div>
                  <textarea value={graphqlQuery} onChange={(event) => setGraphqlQuery(event.target.value)} />
                </section>
                <section>
                  <h2>Result</h2>
                  {graphqlError ? <p className="error-message">{graphqlError}</p> : null}
                  <pre>{graphqlResult ? JSON.stringify(graphqlResult, null, 2) : 'Run a query to see results.'}</pre>
                </section>
              </div>
            ) : null}

            {activeTab === 'raw' ? <pre className="raw-schema">{JSON.stringify(activeClass, null, 2)}</pre> : null}
          </section>
        ) : (
          <section className="content-panel empty-state large">Connect to Weaviate to begin exploring your vector database.</section>
        )}
      </section>
    </main>
  )
}

export default App
