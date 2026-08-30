import {defineCliConfig} from 'sanity/cli'

// The CLI config runs in Node, so it reads process.env (the CLI loads .env for us).
const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID ?? 'bb392mn5'
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.VITE_SANITY_DATASET ?? 'production'

export default defineCliConfig({
  api: {projectId, dataset},
  // Subdomain for `npx sanity deploy` -> treeworks-cornwall.sanity.studio
  studioHost: 'treeworks-cornwall',
  autoUpdates: true,
})
