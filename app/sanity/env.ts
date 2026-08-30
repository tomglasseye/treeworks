/**
 * Browser-safe values only.
 *
 * Anything reachable from a route component ends up in the client bundle, where
 * `process.env` does not exist. Secrets are read from `process.env` inside
 * *.server.ts files only — never re-exported from here.
 */
export const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string
export const dataset = (import.meta.env.VITE_SANITY_DATASET as string) ?? 'production'
export const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION as string) ?? '2026-08-01'
export const studioUrl = (import.meta.env.VITE_SANITY_STUDIO_URL as string) ?? '/studio'

if (!projectId) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID. Copy .env.example to .env and fill it in.')
}
