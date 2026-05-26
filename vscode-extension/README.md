# Weaviate DB

<div align="center">

<img src="https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/vscode-extension/icon.png" width="96" alt="Weaviate DB logo" />

<h2><strong>Weaviate, unified.</strong><br><em>Your workbench, everywhere you code.</em></h2>

<p>Browse schemas · Query objects · Import data · Run GraphQL — all without leaving your editor.</p>

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/harishkaparwan.weaviate-db?label=VS%20Code%20Marketplace&color=007ACC&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=harishkaparwan.weaviate-db)
[![Open VSX](https://img.shields.io/open-vsx/v/harishkaparwan/weaviate-db?label=Open%20VSX&color=952fd3)](https://open-vsx.org/extension/harishkaparwan/weaviate-db)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](https://github.com/harishkaparwan/weaviate-ui/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/harishkaparwan/weaviate-ui)

</div>

---

## ✨ What is Weaviate DB?

**Weaviate DB** is a zero-config workbench extension for [Weaviate](https://weaviate.io) — the AI-native vector database. It lives inside VS Code (and any compatible editor) so you can inspect, query, and manage your Weaviate instance without switching context.

Whether you're running a local Docker instance or a production Weaviate Cloud cluster, Weaviate DB gives you a full-featured GUI in a single panel.

---

## 🚀 Quick Start

**1. Install the extension**

Search **`Weaviate DB`** in the Extensions panel (`Ctrl+Shift+X`) or install from the Marketplace:

```
ext install harishkaparwan.weaviate-db
```

**2. Start Weaviate** *(skip if you already have one running)*

```bash
docker run --rm -p 8083:8080 -p 50051:50051 \
  cr.weaviate.io/semitechnologies/weaviate:1.37.4
```

**3. Open the workbench**

Click the **Weaviate DB icon** in the Activity Bar, or run from the Command Palette:

```
Weaviate DB: Open Workbench
```

**4. Connect**

- **Local** → enter `http://localhost:8083` and click **Connect**
- **Cluster** → switch to Cluster mode, paste your REST host + API key, click **Connect**

That's it. Your schema, objects, and query interface load instantly.

---

## 🎬 See It In Action

### 💻 Local Instance — Movie Class

<div align="center">
<img src="https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/gif/weaviate-demo_local_laptop.gif" width="860" alt="Weaviate DB – local connection, Movie class: overview, schema, objects" />
</div>

### ☁️ Weaviate Cloud — Cluster Connection

<div align="center">
<img src="https://raw.githubusercontent.com/harishkaparwan/weaviate-ui/main/public/screenshots/gif/weaviate-demo_cluster_laptop.gif" width="860" alt="Weaviate DB – cluster connection, SampleProducts class" />
</div>

---

## 🔧 Features

| Capability | Details |
|---|---|
| 🔌 **Connect anywhere** | Local Docker, Weaviate Cloud, or any custom endpoint |
| 🗂 **Schema browser** | Explore classes, properties, vectorizers, and index config |
| 📦 **Object viewer** | Browse objects by class with configurable fetch limits |
| ➕ **Batch import** | Prepare and push inserts from JSON or CSV |
| 🔍 **GraphQL console** | Run queries directly against `/v1/graphql` |
| 🔑 **Cluster auth** | API key sent as `Authorization: Bearer` + `X-Weaviate-Api-Key` |
| 🌐 **Universal** | Works in VS Code, VSCodium, Cursor, and any VS Code-compatible editor |

---

## 🔗 Connection Modes

### Local
Connect to any Weaviate instance on your machine or network. No auth headers are added.

```
http://localhost:8083
```

> You can also point this to a local proxy like `http://localhost:8787`.

### Cluster (Weaviate Cloud)
Enter your cluster REST host and API key. The extension handles authentication automatically.

```
https://<cluster-id>.c0.<region>.gcp.weaviate.cloud
```

> Use the **REST host**, not the Weaviate Cloud Console URL.

---

## 📦 Also Available As

| Platform | Link |
|---|---|
| 🌐 **Chrome Extension** | [Source on GitHub](https://github.com/harishkaparwan/weaviate-ui/tree/main/chrome-extension) |
| 🖥 **macOS Desktop App** | [DMG download](https://harishkaparwan.github.io/weaviate-ui/desktop/mac/weaviate-ui_0.1.0_aarch64.dmg) · [Homebrew](https://github.com/harishkaparwan/weaviate-ui) |
| 🪟 **Windows Desktop App** | [EXE download](https://harishkaparwan.github.io/weaviate-ui/desktop/win/weaviate-ui_0.1.0_x64-setup.exe) |
| 🐳 **Docker / Podman** | `docker pull harishkaparwan/weaviate-ui:latest` |

```bash
# macOS via Homebrew
brew tap harishkaparwan/tap
brew install --cask weaviate-ui
```

```bash
# Docker
docker run --rm -p 8080:80 harishkaparwan/weaviate-ui:latest
```

---

## 🐛 Issues & Feedback

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/harishkaparwan/weaviate-ui/issues).

---

<div align="center">
  <sub>Built with ❤️ for the Weaviate community · <a href="https://github.com/harishkaparwan/weaviate-ui">harishkaparwan/weaviate-ui</a></sub>
</div>

