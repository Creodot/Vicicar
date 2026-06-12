/**
 * Prefix a /public asset path with the deployment base path.
 * Empty in dev and on root-hosted deploys; "/Vicicar" on GitHub Pages
 * (set via NEXT_PUBLIC_BASE_PATH in next.config.ts).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string): string => `${BASE_PATH}${path}`;
