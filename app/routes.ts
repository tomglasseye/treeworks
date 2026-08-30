import {type RouteConfig, index, route} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),

  // Sanity Studio, embedded in the same deploy.
  route('studio/*', 'routes/studio.tsx'),

  // Server-side Behold proxy for the Instagram gallery.
  route('api/instagram', 'routes/api.instagram.ts'),

  // Presentation tool draft-mode handshake.
  route('api/preview/enable', 'routes/api.preview.enable.ts'),
  route('api/preview/disable', 'routes/api.preview.disable.ts'),

  // Everything else is a Sanity page or location page, resolved by slug.
  // Declared last so it never shadows the routes above.
  route(':slug', 'routes/page.tsx'),
] satisfies RouteConfig
