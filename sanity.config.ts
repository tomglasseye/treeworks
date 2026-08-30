import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './studio/schemaTypes'
import {structure, SINGLETONS} from './studio/structure'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string
const dataset = (import.meta.env.VITE_SANITY_DATASET as string) ?? 'production'

export default defineConfig({
  name: 'treeworks',
  title: 'Treeworks Cornwall',
  projectId,
  dataset,

  // Mounted inside the React Router app at /studio.
  basePath: '/studio',

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
