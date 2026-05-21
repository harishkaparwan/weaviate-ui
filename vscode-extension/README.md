# Weaviate UI for VS Code

Open the Weaviate UI workbench inside a VS Code webview.

The installed extension is self-contained. It includes the built web assets under `media/`, so users do not need npm, Vite, Podman, or any other external command after installing it from VS Code Marketplace, Open VSX, or a local VSIX.

## Development

From the repository root:

```bash
npm install
npm run build
npm run extension:sync
```

Then open the `vscode-extension` folder in VS Code and run the extension host.

## Package

```bash
npm run extension:package
```

The generated `.vsix` can be installed locally or published to the Visual Studio Marketplace after you create a publisher account.
