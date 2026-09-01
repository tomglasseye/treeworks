/**
 * Deploy the Sanity-hosted copy at treeworks-cornwall.sanity.studio.
 *
 * That host serves the Studio from its root, whereas every other build targets
 * the site's own /studio. Rather than leaving SANITY_STUDIO_BASE_PATH set in an
 * env file — where it would silently break the Netlify build and any local
 * `npm run build` — it is set here, for this one command.
 *
 * Spawned through a shell on Windows so the .cmd shim npm puts on PATH resolves.
 */
import {spawnSync} from 'node:child_process'

const result = spawnSync('sanity', ['deploy', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {...process.env, SANITY_STUDIO_BASE_PATH: '/'},
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}
process.exit(result.status ?? 1)
