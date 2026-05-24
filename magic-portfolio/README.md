# Magic Portfolio

A premium AI engineer portfolio built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Icons, and Three.js.

This version is grounded in the real work visible in this workspace:

- Weaviate UI browser workbench
- VS Code extension packaging and sync flow
- Chrome extension delivery
- GitHub Pages static hosting
- Container-based publishing

## Run Locally

From the repository root:

```bash
cd magic-portfolio
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Deploy to GitHub Pages

This repository is wired to publish the portfolio app with GitHub Actions from the root workflow at `.github/workflows/deploy-pages.yml`.

1. Push your changes to `main`.
2. In the GitHub repo, open **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the `Deploy GitHub Pages` workflow to finish.

The site will publish at the repository Pages URL, using the repo name as the base path.

## Production Build

```bash
npm run build
npm run start
```

## Notes

- The app uses a dark premium AI infrastructure visual style.
- The content is no longer placeholder/demo content; it references the real project surfaces and delivery paths in this workspace.
- If you want to customize it further, edit `src/app/page.tsx` and `src/app/globals.css`.
