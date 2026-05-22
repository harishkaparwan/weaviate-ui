# Weaviate DB Chrome Extension

This folder wraps the Weaviate DB React workbench as a Chrome Manifest V3 extension.

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

After Weaviate is running, load the extension and connect to `http://localhost:8083`. If your Weaviate server is already running on another host or port, enter that endpoint in the connection panel.

## Build

From the repository root:

```bash
npm run chrome:build
```

The unpacked extension is written to:

```text
chrome-extension/build
```

## Load Locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `chrome-extension/build`
5. Click the Weaviate DB toolbar icon to open the workbench

The extension logo lives in `chrome-extension/icons/`. Use `icon-128.png` for the Chrome Web Store item icon.

## Package

From the repository root:

```bash
npm run chrome:package
```

The packaged extension zip is written to:

```text
chrome-extension/weaviate-db-chrome.zip
```
