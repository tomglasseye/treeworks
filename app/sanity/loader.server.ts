import {createClient} from '@sanity/client'
import {loadQuery, setServerClient} from './loader'
import {projectId, dataset, apiVersion, studioUrl} from './env'

// Read the token straight from process.env. Importing it from env.ts would leak
// it into the client bundle the moment a component touched that module.
const token = process.env.SANITY_API_READ_TOKEN
const previewEnabled = process.env.SANITY_PREVIEW === 'true'

const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !previewEnabled,
  token,
  stega: {
    // Stega markers leak into copy/paste and screen readers, so they stay off
    // unless we are actually previewing.
    enabled: previewEnabled,
    studioUrl,
  },
})

setServerClient(serverClient)

export {loadQuery, serverClient}
