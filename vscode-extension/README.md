# Weaviate DB

Weaviate DB is a self-contained workbench for inspecting and querying Weaviate from VS Code-compatible editors. It opens with a bundled demo workspace, so no npm, Vite, Docker, Podman, or local build step is required after installation.

## Features

- Connect to local or remote Weaviate endpoints, including `http://localhost:8083`
- Browse schema classes, properties, vectorizer settings, and index metadata
- View objects by class with configurable limits
- Prepare batch inserts from JSON or CSV
- Run GraphQL queries against `/v1/graphql`

## Usage

Open Weaviate DB from the Activity Bar, then use the **Workbench** view.

You can also open the full editor-tab workbench from the command palette:

```text
Weaviate UI: Open Workbench
```

The workbench opens in an editor tab. You can explore the bundled demo immediately, or enter a local or remote Weaviate endpoint to inspect a real database.

## Connection Notes

If your Weaviate instance runs on a different host or port, enter that endpoint in the connection field. Browser-based requests must be allowed by your Weaviate server configuration.
