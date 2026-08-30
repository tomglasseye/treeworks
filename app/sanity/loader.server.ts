import {createClient} from '@sanity/client'
import {loadQuery, setServerClient} from './loader'
import {projectId, dataset, apiVersion, studioUrl} from './env'

// Read the token straight from process.env. Importing it from env.ts would leak
// it into the client bundle the moment a component touched that module.
// Reading drafts requires a token with Viewer access. Without one the site
// still works; Presentation just shows published content.
const token = process.env.SANITY_API_READ_TOKEN

const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token,
  // Stega markers leak into copy/paste and screen readers, so the client
  // default is off. Each loadQuery turns it on per request when the draft-mode
  // cookie is present — see queryOptions() in preview.server.ts.
  stega: {enabled: false, studioUrl},
})

setServerClient(serverClient)

export {loadQuery, serverClient}
