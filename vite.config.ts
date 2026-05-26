import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
// TAURI_ENV_PLATFORM is injected by the Tauri CLI for all build/dev targets
const isTauriBuild = Boolean(process.env.TAURI_ENV_PLATFORM)

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  server: {
    // Tell vite to ignore watching src-tauri
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    rollupOptions: {
      // Only bundle @tauri-apps/api when building inside Tauri; treat it as
      // external in plain browser / extension builds so Vite never errors on it.
      external: isTauriBuild ? [] : [/^@tauri-apps\//],
    },
  },
})
