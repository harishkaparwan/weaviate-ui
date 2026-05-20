# Weaviate UI

A lightweight React workbench for browsing a local or remote Weaviate instance. It can inspect schema classes, view objects, prepare inserts from JSON or CSV, and run GraphQL queries from a focused browser UI.

## Features

- Connect to a Weaviate HTTP endpoint, defaulting to `http://localhost:8083`
- Browse schema classes, properties, vectorizer settings, and index metadata
- Load objects by class with a configurable limit
- Prepare batch inserts from JSON or CSV
- Run GraphQL queries against `/v1/graphql`
- Run as a local Vite app, a public OCI container image, or a VS Code webview extension

## Local Development

```bash
npm install
npm run dev
```

The Vite dev server prints the local URL. The UI connects directly to the endpoint entered in the connection panel, so your Weaviate instance must allow browser requests from that origin.

## Production Build

```bash
npm run build
npm run preview
```

The static build is written to `dist/`.

## Podman

Build the image locally:

```bash
npm run podman:build
```

Run it:

```bash
npm run podman:run
```

Then open `http://localhost:8080`.

## Public Image

The GitHub Actions workflow in `.github/workflows/container-publish.yml` uses Podman-compatible Buildah actions and publishes to GitHub Container Registry when code is pushed to `main` or a version tag.

After the repository is public and GitHub Actions has run, the image will be available as:

```bash
podman pull ghcr.io/harishkaparwan/weaviate-ui:latest
podman run --rm -p 8080:80 ghcr.io/harishkaparwan/weaviate-ui:latest
```

If the package is not visible publicly, open the package settings in GitHub and change its visibility to public.

## VS Code Extension

The VS Code extension lives in `vscode-extension/`. It opens the same built UI inside a VS Code webview.

Package it locally:

```bash
npm run extension:package
```

That command builds the Vite app, syncs `dist/` into `vscode-extension/media/`, and creates a `.vsix` package from the extension folder.

During extension development:

```bash
npm run build
npm run extension:sync
```

Then open `vscode-extension/` in VS Code and run the extension host. Use the command palette command `Weaviate UI: Open Workbench`.

## GitHub Setup

This project is configured for:

- Repository: `https://github.com/harishkaparwan/weaviate-ui.git`
- Public container image: `ghcr.io/harishkaparwan/weaviate-ui`
- VS Code extension publisher id: `harishkaparwan`
- VS Code extension Marketplace id: `harishkaparwan.weaviate-db`

To publish the local folder:

```bash
git init
git remote add origin https://github.com/harishkaparwan/weaviate-ui.git
git add .
git commit -m "Prepare public release"
git branch -M main
git push -u origin main
```

## License

MIT
