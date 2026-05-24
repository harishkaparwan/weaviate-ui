import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "weaviate-ui";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubActions ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
