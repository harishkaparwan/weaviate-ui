# Weaviate DB

<h2 align="center">
  <strong>Weaviate, unified.</strong><br>
  <em>Your workbench, everywhere you code.</em>
</h2>

<p align="center">
  The fastest, most powerful way to inspect schemas, run queries, import data,<br>
  and build RAG apps with Weaviate — right inside your editor.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=harishkaparwan.weaviate-db">VS Code Marketplace</a> ·
  <a href="https://open-vsx.org/extension/harishkaparwan/weaviate-db">Open VSX</a> ·
  <a href="https://harishkaparwan.github.io/weaviate-ui/policy/privacy.html">Privacy Policy</a> ·
  <a href="https://github.com/harishkaparwan/weaviate-ui">GitHub</a>
</p>

## Downloads

Extension downloads:

- VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=harishkaparwan.weaviate-db
- Open VSX: https://open-vsx.org/extension/harishkaparwan/weaviate-db
- Privacy Policy (GitHub Pages): https://harishkaparwan.github.io/weaviate-ui/policy/privacy.html
- Privacy Policy (Repository file): https://github.com/harishkaparwan/weaviate-ui/blob/main/public/policy/privacy.html
- Chrome extension (Web Store): https://chromewebstore.google.com/detail/naooobcljglmgfefiblbgkdlcomgamhc?utm_source=item-share-cb

Chrome extension install:

```text
Build from chrome-extension/build and load it from chrome://extensions with Developer mode enabled.
```

Desktop app downloads:

- macOS DMG: https://harishkaparwan.github.io/weaviate-ui/desktop/mac/weaviate-ui_0.1.0_aarch64.dmg
- macOS App ZIP: https://harishkaparwan.github.io/weaviate-ui/desktop/mac/weaviate-ui_0.1.0_aarch64.app.zip
- Windows EXE: https://harishkaparwan.github.io/weaviate-ui/desktop/win/weaviate-ui_0.1.0_x64-setup.exe

Install on macOS with Homebrew (Apple Silicon):

```bash
brew tap harishkaparwan/tap
brew install --cask weaviate-ui
```

Update to a new version:

```bash
brew upgrade --cask weaviate-ui
```

Launch after install:

```bash
open /Applications/weaviate-ui.app
```

Or open it from Spotlight: `Cmd+Space` → type `weaviate-ui` → Enter.

Container image references:

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

## Prerequisite: Start Weaviate First

Before installing or opening Weaviate UI, make sure a Weaviate database is running. You can use an existing local or remote Weaviate server, or start one with Docker or Podman.

Docker:

```bash
docker run --rm -p 8083:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.37.4
```

Podman:

```bash
podman run --rm -p 8083:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.37.4
```

Then use `http://localhost:8083` in the connection panel. If you already have Weaviate running somewhere else, enter that endpoint instead.

## Features

- Connect to a Weaviate HTTP endpoint, defaulting to `http://localhost:8083`
- Browse schema classes, properties, vectorizer settings, and index metadata
- Load objects by class with a configurable limit
- Prepare batch inserts from JSON or CSV
- Run GraphQL queries against `/v1/graphql`
- Run as a local Vite app, a public OCI container image, or a VS Code webview extension

## Demo

![Weaviate DB – local connection, Movie class: overview, schema, objects](https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/gif/weaviate-demo_local.gif)

![Weaviate DB – cluster connection, SampleProducts class](https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/gif/weaviate-demo_cluster.gif)

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

## Free GitHub Pages Hosting

This repository includes `.github/workflows/deploy-pages.yml` to publish a static site to GitHub Pages for free.

1. Push your code to the `main` branch on GitHub.
2. Open GitHub repo settings: **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the `Deploy GitHub Pages` workflow to finish.

Your site will be available at:

```text
https://harishkaparwan.github.io/weaviate-ui/
```

The workflow builds the Vite app, uploads `dist/`, and deploys it with the official GitHub Pages Actions. Hosting and HTTPS are included at no cost for public repositories.

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

Publish to the VS Code Marketplace:

```bash
cd vscode-extension
VSCE_PAT=<azure-devops-marketplace-token> npm run publish:vscode
```

Or from the project root after the token is available in your shell:

```bash
npm run extension:publish:vscode
```

Publish to Open VSX for Windsurf:

```bash
cd vscode-extension
OVSX_PAT=<open-vsx-token> npm run publish:open-vsx
```

Or from the project root after the token is available in your shell:

```bash
npm run extension:publish:windsurf
```

Before the first Open VSX publish, create the namespace once:

```bash
cd vscode-extension
npx ovsx create-namespace harishkaparwan -p <open-vsx-token>
```

During extension development:

```bash
npm run build
npm run extension:sync
```

Then open `vscode-extension/` in VS Code and run the extension host. Use the command palette command `Weaviate DB: Open Workbench`.

## Chrome Extension

The Chrome extension lives in `chrome-extension/`. It opens the same built UI in a Chrome extension tab.

Install from Chrome Web Store:

```text
https://chromewebstore.google.com/detail/naooobcljglmgfefiblbgkdlcomgamhc?utm_source=item-share-cb
```

Build the unpacked extension:

```bash
npm run chrome:build
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select:

```text
chrome-extension/build
```

Package the extension as a zip:

```bash
npm run chrome:package
```

The zip is written to `chrome-extension/weaviate-db-chrome.zip`.

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
