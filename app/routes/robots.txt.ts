
/**
 * Served from a route rather than public/ so the Sitemap line always points at
 * the host actually being served — dev, a Netlify deploy preview, or production.
 */
export function loader({request}: {request: Request}) {
  const configured = process.env.SITE_URL ?? process.env.URL
  const origin = (configured ?? new URL(request.url).origin).replace(/\/$/, '')

  // Deploy previews and branch builds must never be indexed — they would
  // compete with the real site for the same content.
  const isProduction = process.env.CONTEXT === 'production' || !process.env.CONTEXT

  const body = isProduction
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
