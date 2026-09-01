import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, SINGLETONS} from './structure'
import {resolve} from './presentation/resolve'

/**
 * Built by the Sanity CLI, which exposes only SANITY_STUDIO_* to the bundle.
 *
 * The literals matter: .env is gitignored, so a Netlify build has no env file
 * to read and would otherwise have no project to point at.
 */
const env = (import.meta.env ?? {}) as Record<string, string | undefined>

const projectId = env.SANITY_STUDIO_PROJECT_ID ?? 'bb392mn5'
const dataset = env.SANITY_STUDIO_DATASET ?? 'production'

/**
 * Preview origin for the Presentation tool.
 *
 * Undefined means "my own origin", which is correct for the copy served from
 * the site's own /studio — the preview target is the same host. A standalone
 * *.sanity.studio deploy genuinely is a different host, so that one needs
 * SANITY_STUDIO_PREVIEW_ORIGIN set to the site's URL.
 */
const previewOrigin = env.SANITY_STUDIO_PREVIEW_ORIGIN

/**
 * No `basePath` here on purpose. The CLI config sets the project base path and
 * Sanity joins the two, so setting it in both places serves the Studio at
 * /studio/studio.
 */
export default defineConfig({
  name: 'treeworks',
  title: 'Treeworks Cornwall',
  projectId,
  dataset,

  plugins: [
    presentationTool({
      resolve,
      previewUrl: {
        ...(previewOrigin ? {origin: previewOrigin} : {}),
        previewMode: {
          enable: '/api/preview/enable',
          disable: '/api/preview/disable',
        },
      },
    }),
    structureTool({structure}),
    visionTool(),
  ],

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
