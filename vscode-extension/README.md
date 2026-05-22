# Weaviate DB

Weaviate DB is a self-contained workbench for inspecting and querying Weaviate from VS Code-compatible editors.

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

![Weaviate DB insert workflow](https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/screenshot-1-1280x800.jpg)

![Weaviate DB object browser](https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/screenshot-2-1280x800.jpg)

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

If your Weaviate instance runs on a different host or port, enter that endpoint in the connection field. Browser-based requests must be allowed by your Weaviate server configuration.
