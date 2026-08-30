import {createClient} from '@sanity/client'
import {projectId, dataset, apiVersion} from './env'

/** Publishable client — safe to import from components. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
