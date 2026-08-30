import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './studio/schemaTypes'
import {structure, SINGLETONS} from './studio/structure'

/**
 * One config, two build toolchains.
 *
 * The React Router build (Vite) exposes only `VITE_*`; the Sanity CLI build
 * exposes only `SANITY_STUDIO_*`. So read both, and fall back to the literal
 * values — projectId and dataset are publishable, not secrets.
 */
const env = (import.meta.env ?? {}) as Record<string, string | undefined>

const projectId = env.SANITY_STUDIO_PROJECT_ID ?? env.VITE_SANITY_PROJECT_ID ?? 'bb392mn5'
const dataset = env.SANITY_STUDIO_DATASET ?? env.VITE_SANITY_DATASET ?? 'production'

/**
 * Embedded in the site, the Studio lives under /studio. Deployed standalone to
 * *.sanity.studio it is served from the host root, so the base path must change.
 * `.env` sets SANITY_STUDIO_BASE_PATH=/ which only the Sanity CLI build can see.
 */
const basePath = env.SANITY_STUDIO_BASE_PATH ?? '/studio'

export default defineConfig({
  name: 'treeworks',
  title: 'Treeworks Cornwall',
  projectId,
  dataset,
  basePath,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Singletons are reachable only from the pinned structure items.
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.includes(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(
            ({action}) => action && !['unpublish', 'delete', 'duplicate'].includes(action),
          )
        : actions,
  },
})
