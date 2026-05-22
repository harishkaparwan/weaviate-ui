# Weaviate DB Chrome Extension

This folder wraps the Weaviate DB React workbench as a Chrome Manifest V3 extension.

The extension opens with a bundled demo workspace, so users can explore the UI immediately after installation. A real local or remote Weaviate endpoint is optional and can be entered from the connection panel.

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
