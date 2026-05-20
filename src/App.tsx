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

type InsertResult = {
  success: number
  failed: number
  errors: string[]
}

const defaultEndpoint = 'http://localhost:8083'

function App() {
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
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
  const [insertFileName, setInsertFileName] = useState('')
  const [insertLoading, setInsertLoading] = useState(false)
  const [insertResult, setInsertResult] = useState<InsertResult | null>(null)
  const [insertError, setInsertError] = useState('')

  const classes = useMemo(() => schema?.classes ?? [], [schema])
  const activeClass = classes.find((item) => item.class === selectedClass) ?? classes[0]
  const baseUrl = endpoint.trim().replace(/\/$/, '')

  async function loadSchema() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseUrl}/v1/schema`)

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as WeaviateSchema
      setSchema(data)
      setSelectedClass('')
      setActiveTab('overview')
      if (data.classes?.[0]) {
        prepareClassWorkspace(data.classes[0])
      }
    } catch (err) {
      setSchema(null)
      setSelectedClass('')
      setError(err instanceof Error ? err.message : 'Unable to connect to Weaviate')
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
      const response = await fetch(`${baseUrl}/v1/objects?class=${encodeURIComponent(className)}&limit=${objectLimit}`)

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

  function buildInsertTemplate(item: WeaviateClass | undefined) {
    if (!item) return '{}'
    const sample: Record<string, unknown> = {}
    for (const property of item.properties ?? []) {
      const type = property.dataType?.[0] ?? 'text'
      if (type === 'int' || type === 'number') sample[property.name] = 0
      else if (type === 'boolean') sample[property.name] = false
      else if (type === 'date') sample[property.name] = new Date().toISOString()
      else if (type.startsWith('text[]') || type.endsWith('[]')) sample[property.name] = []
      else sample[property.name] = ''
    }
    return JSON.stringify([sample], null, 2)
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
    setInsertJson(buildInsertTemplate(item))
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
      setInsertJson(JSON.stringify(rows, null, 2))
    } else {
      setInsertJson(text)
    }
  }

  async function submitInsert() {
    if (!activeClass) return
    setInsertLoading(true)
    setInsertError('')
    setInsertResult(null)

    try {
      const parsed = JSON.parse(insertJson || '[]') as unknown
      const records = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[]
      if (!records.length) throw new Error('No objects to insert.')

      const payload = {
        objects: records.map((record) => ({
          class: activeClass.class,
          properties: record,
        })),
      }

      const response = await fetch(`${baseUrl}/v1/batch/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Weaviate returned ${response.status} ${response.statusText}`)
      }

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
      const response = await fetch(`${baseUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          <span className="brand-mark">W</span>
          <div>
            <strong>Weaver Compass</strong>
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
          <label htmlFor="endpoint">Connection URI</label>
          <input
            id="endpoint"
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder={defaultEndpoint}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
          {error ? <p className="error-message">{error}</p> : null}
        </form>

        <div className="nav-section">
          <div className="nav-heading">
            <span>Classes</span>
            <strong>{classes.length}</strong>
          </div>
          <div className="class-tree">
            {classes.map((item) => (
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
                <span className="collection-icon">◆</span>
                <span>
                  <strong>{item.class}</strong>
                  <small>{item.properties?.length ?? 0} fields</small>
                </span>
              </button>
            ))}
            {!classes.length ? <p className="muted-note">Connect to load classes.</p> : null}
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="top-bar">
          <div>
            <p className="breadcrumb">localhost / weaviate / {activeClass?.class ?? 'no class selected'}</p>
            <h1>{activeClass?.class ?? 'Weaviate Connection'}</h1>
          </div>
          <div className="status-pills">
            <span className={error ? 'offline' : schema ? 'online' : ''}>{error ? 'Offline' : schema ? 'Connected' : 'Idle'}</span>
            <span>{classes.reduce((total, item) => total + (item.properties?.length ?? 0), 0)} properties</span>
          </div>
        </header>

        <nav className="tabs">
          {(['overview', 'schema', 'objects', 'insert', 'graphql', 'raw'] as ViewTab[]).map((tab) => {
            const disabled = tab !== 'overview' && !activeClass
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
        ) : activeClass ? (
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
                    <h2>Insert into {activeClass.class}</h2>
                    <button type="button" onClick={() => void submitInsert()} disabled={insertLoading}>
                      {insertLoading ? 'Inserting...' : 'Insert'}
                    </button>
                  </div>
                  <div className="toolbar">
                    <label className="file-input">
                      <span>Import file (CSV / JSON)</span>
                      <input
                        type="file"
                        accept=".csv,.json,application/json,text/csv"
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
                        setInsertJson(buildInsertTemplate(activeClass))
                        setInsertFileName('')
                      }}
                    >
                      Reset template
                    </button>
                    {insertFileName ? <span className="file-name">{insertFileName}</span> : null}
                  </div>
                  <p className="hint">
                    Provide a JSON array of objects matching this class. CSV headers must match property names; array fields use <code>|</code> as a separator.
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
                    <p className="empty-state">Insert objects to see the result.</p>
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
