# Weaviate DB

Weaviate DB is a self-contained workbench for inspecting and querying Weaviate from VS Code-compatible editors.

<h1>Weaviate DB.<br>Your workbench.<br>Everywhere you code.</h1>

<p>The fastest, most powerful way to inspect schemas, run queries, import data, and build RAG apps with Weaviate from inside your editor.</p>

GitHub: https://github.com/harishkaparwan/weaviate-ui

## Downloads

Extension downloads:

- VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=harishkaparwan.weaviate-db
- Open VSX: https://open-vsx.org/extension/harishkaparwan/weaviate-db
- Chrome extension source: https://github.com/harishkaparwan/weaviate-ui/tree/main/chrome-extension

Chrome extension install:

```text
Build from chrome-extension/build and load it from chrome://extensions with Developer mode enabled.
```

Desktop app downloads:

- macOS DMG: https://harishkaparwan.github.io/weaviate-ui/desktop/mac/weaviate-ui_0.1.0_aarch64.dmg
- macOS App ZIP: https://harishkaparwan.github.io/weaviate-ui/desktop/mac/weaviate-ui_0.1.0_aarch64.app.zip
- Windows EXE: https://harishkaparwan.github.io/weaviate-ui/desktop/win/weaviate-ui_0.1.0_x64-setup.exe

Docker image references:

- Docker Hub: https://hub.docker.com/r/harishkaparwan/weaviate-ui
- GHCR: https://github.com/harishkaparwan/weaviate-ui/pkgs/container/weaviate-ui

Run with Podman:

```bash
podman pull ghcr.io/harishkaparwan/weaviate-ui:latest
podman run --rm -p 8080:80 ghcr.io/harishkaparwan/weaviate-ui:latest
```

Run with Docker:

```bash
docker pull harishkaparwan/weaviate-ui:latest
docker run --rm -p 8080:80 harishkaparwan/weaviate-ui:latest
```

## Before You Install

Start a Weaviate database first. You can use an existing local or remote Weaviate server, or start one with Docker or Podman.

Docker:

```bash
docker run --rm -p 8083:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.37.4
```

Podman:

```bash
podman run --rm -p 8083:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.37.4
```

After Weaviate is running, install or open the extension and connect to `http://localhost:8083`. If your Weaviate server is already running on another host or port, enter that endpoint in the connection panel.

## Screenshots

![Weaviate DB insert workflow](https://harishkaparwan.github.io/weaviate-ui/screenshots/screenshot-1-1280x800.jpg)

![Weaviate DB object browser](https://harishkaparwan.github.io/weaviate-ui/screenshots/screenshot-2-1280x800.jpg)

![Weaviate DB cluster connection](https://harishkaparwan.github.io/weaviate-ui/screenshots/weaver-cluser-image.jpg)

## Features

- Connect to local or remote Weaviate endpoints, including `http://localhost:8083`
- Browse schema classes, properties, vectorizer settings, and index metadata
- View objects by class with configurable limits
- Prepare batch inserts from JSON or CSV
- Run GraphQL queries against `/v1/graphql`

## Usage

After Weaviate is running, open Weaviate DB from the Activity Bar, then use the **Workbench** view.

You can also open the full editor-tab workbench from the command palette:

```text
Weaviate UI: Open Workbench
```

The workbench opens in an editor tab. Enter your local or remote Weaviate endpoint to inspect a real database.

## Connection Notes

Weaviate DB supports two connection types:

- `Local`: Use this for local instances such as `http://localhost:8083` or a local proxy endpoint.
- `Cluster`: Use this for Weaviate Cloud clusters. Enter your full REST host, for example `https://<cluster-id>.c0.<region>.gcp.weaviate.cloud`, and provide your API key.

If your Weaviate instance runs on a different host or port, enter that endpoint in the connection field.

Cluster notes:

- Use the cluster REST endpoint, not the console URL.
- The extension sends your API key as `Authorization: Bearer <key>` and `X-Weaviate-Api-Key` automatically.
- In desktop builds, cluster requests are routed through the native app backend to avoid webview CORS restrictions.

Repository URL:

- https://github.com/harishkaparwan/weaviate-ui
