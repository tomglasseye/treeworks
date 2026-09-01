import {defineCliConfig} from 'sanity/cli'

/**
 * The CLI runs in Node, so this reads process.env. It loads a .env file from
 * the folder the command runs in — which is this one, not the repository root.
 *
 * The literals are what make a Netlify build work: .env is gitignored, so the
 * build has no env file to read, and without them there is no project to point
 * at.
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'bb392mn5'
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

/**
 * Where the built Studio thinks it lives.
 *
 * The site serves it from /studio, so that is the default and the value every
 * `sanity build` uses. The Sanity-hosted copy at treeworks-cornwall.sanity.studio
 * is served from that host's root instead, so `npm run deploy` in this folder
 * overrides it to "/" — see scripts/deploy-standalone.mjs.
 *
 * Note this is the *project* base path. sanity.config.ts must not also set one:
 * Sanity joins the two, and you get /studio/studio.
 */
const basePath = process.env.SANITY_STUDIO_BASE_PATH ?? '/studio'

export default defineCliConfig({
  api: {projectId, dataset},
  project: {basePath},
  // Subdomain for `npm run deploy` -> treeworks-cornwall.sanity.studio
  studioHost: 'treeworks-cornwall',
  deployment: {
    // Sanity ships Studio patches to the built bundle without a redeploy. This
    // is the reason the Studio is compiled by the CLI rather than bundled into
    // the site's own React build, where auto-updates are unsupported.
    autoUpdates: true,
  },
})
