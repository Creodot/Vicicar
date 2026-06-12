import type { NextConfig } from "next";

// GitHub Pages serves the site at https://creodot.github.io/Vicicar/ —
// static export under a /Vicicar base path, with API routes stripped by
// the deploy workflow (Pages is static-only). Normal builds are untouched.
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/Vicicar" : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
