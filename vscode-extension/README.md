# Weaviate DB

Weaviate DB opens a self-contained Weaviate workbench inside VS Code-compatible editors, including VS Code and Windsurf.

## Features

- Connect to a Weaviate endpoint such as `http://localhost:8083`
- Browse schema classes and properties
- View objects by class
- Prepare JSON or CSV batch inserts
- Run GraphQL queries from an editor webview

## Usage

After installing the extension, open the command palette and run:

```text
Weaviate UI: Open Workbench
```

The extension opens the bundled workbench in an editor tab. No npm, Vite, Podman, Docker, or external command is required after installation.

## Notes

If your Weaviate instance runs on a different host or port, enter that endpoint in the connection field. Browser-based requests must be allowed by your Weaviate server configuration.
