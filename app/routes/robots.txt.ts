import {isIndexable, siteUrl} from '~/siteUrl.server'

/**
 * Served from a route rather than public/ so the Sitemap line always points at
 * the host actually being served — dev, a Netlify deploy preview, or production.
 */
export function loader({request}: {request: Request}) {
  const origin = siteUrl(request)

  // Deploy previews, branch builds and the netlify.app address must never be
  // indexed — they would compete with the real site for the same content. Pages
  // served from those hosts also carry a noindex meta tag (see buildMeta).
  const body = isIndexable(request)
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /studio',
        'Disallow: /api/',
        '',
        `Sitemap: ${origin}/sitemap.xml`,
        '',
      ].join('\n')
    : ['User-agent: *', 'Disallow: /', ''].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
