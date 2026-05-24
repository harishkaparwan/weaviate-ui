# Weaviate UI - Desktop Application Setup Guide

This guide documents the step-by-step process of integrating, running, and packaging a native cross-platform desktop application for **Weaviate UI** using **Tauri v2** and **Vite**.

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Prerequisites](#-prerequisites)
3. [Setup Steps (Chronological)](#-setup-steps-chronological)
4. [Development Guide](#-development-guide)
5. [Production Build & Packaging](#-production-build--packaging)
6. [Architecture & Optimizations](#-architecture--optimizations)

---

## 🔍 Overview
By wrapping the React + Vite frontend with **Tauri**, Weaviate UI functions as a completely standalone native application. 
- **Lightweight**: Uses native webviews (Webkit on macOS, WebView2 on Windows), resulting in small bundles (~10MB) and very low RAM consumption.
- **Standalone**: Users do not need a web browser or web server to run it.

---

## 🛠 Prerequisites

### 1. Rust (Backend Compilation)
Tauri requires Rust to compile the native wrapper.
- **macOS / Linux**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  ```
- **Windows**: Download and run the `rustup-init.exe` installer from [rustup.rs](https://rustup.rs/).

After installation, reload your shell path or source the environment:
```bash
source "$HOME/.cargo/env"
```

### 2. Node.js & npm
Ensure you have Node.js and npm installed.

---

## ⚙️ Setup Steps (Chronological)

If you are setting this up from scratch or on a new machine, these are the commands that were executed to establish the desktop app layer:

### Step 1: Install Tauri CLI
Install the Tauri Command Line Interface as a development dependency:
```bash
npm install -D @tauri-apps/cli@latest
```

### Step 2: Initialize Tauri
Initialize the Tauri backend structure within your existing project:
```bash
npx tauri init \
  --app-name "weaviate-ui" \
  --window-title "Weaviate UI" \
  --frontend-dist "../dist" \
  --dev-url "http://localhost:5173" \
  --before-dev-command "npm run dev" \
  --before-build-command "npm run build" \
  --ci
```
This command auto-generates the `src-tauri` directory containing your Rust integration, default icons, and configuration.

### Step 3: Configure Unique Bundle Identifier
Open `src-tauri/tauri.conf.json` and ensure the bundle identifier is unique (required for packaging standard production builds):
```json
"identifier": "com.weaviate.ui"
```

### Step 4: Configure Vite Integration
Update `vite.config.ts` to disable screen clearing (keeps Rust compiler logs visible) and prevent Vite from watching the `src-tauri` Rust directory to avoid infinite reload loops during development:
```typescript
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
```

### Step 5: Add Desktop Package Scripts
Add the running and building scripts to the `scripts` block in your root `package.json`:
```json
"scripts": {
  ...
  "desktop:dev": "tauri dev",
  "desktop:build": "tauri build"
}
```

---

## 💻 Development Guide

To run the application locally with hot-reloading (Vite changes will reflect inside the desktop window immediately):

```bash
# Ensure Rust cargo environment is active
source "$HOME/.cargo/env"

# Start the desktop dev server
npm run desktop:dev
```

---

## 📦 Production Build & Packaging

To compile a native executable and package standard installers for your specific Operating System:

```bash
# Ensure Rust cargo environment is active
source "$HOME/.cargo/env"

# Build production bundles
npm run desktop:build
```

### Generated Artifacts Location
Once the build command completes successfully, installers can be found under:
- **macOS App bundle**: `src-tauri/target/release/bundle/macos/weaviate-ui.app`
- **macOS DMG Installer**: `src-tauri/target/release/bundle/dmg/weaviate-ui_0.1.0_aarch64.dmg`
- **Windows MSI Installer**: `src-tauri/target/release/bundle/msi/...`
- **Linux DEB Installer**: `src-tauri/target/release/bundle/deb/...`

---

## 🧠 Architecture & Optimizations

- **Vite Integration**: The desktop app triggers a production build of the static web assets inside `/dist` prior to compiling the Rust binaries, bundling everything into a single offline-capable app bundle.
- **Native Webview**: No Chromium overhead. The app uses Apple's WKWebView on macOS and WebView2 (Edge) on Windows, reducing memory footprint by ~90% compared to typical Electron apps.
