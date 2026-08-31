import {publicClient} from '~/sanity/loader.server'

type Entry = {slug: string; isHomepage?: boolean; updatedAt: string; noIndex?: boolean}

/** Only published, indexable pages. seo.noIndex keeps a page out. */
const SITEMAP_QUERY = /* groq */ `
  *[_type in ["page", "locationPage"]
    && defined(slug.current)
    && !(_id in path("drafts.**"))
    && seo.noIndex != true
  ]{
    "slug": slug.current,
    isHomepage,
    "updatedAt": _updatedAt
  } | order(slug asc)
`

function siteUrl(request: Request) {
  // Netlify sets URL/DEPLOY_PRIME_URL; fall back to the request's own origin so
  // this is correct in dev, on deploy previews and in production without config.
  const configured = process.env.SITE_URL ?? process.env.URL
  return (configured ?? new URL(request.url).origin).replace(/\/$/, '')
}

export async function loader({request}: {request: Request}) {
  const origin = siteUrl(request)
  const pages = await publicClient.fetch<Entry[]>(SITEMAP_QUERY)

  const urls = pages.map((page) => {
    const path = page.isHomepage ? '' : `/${page.slug}`
    return [
      '  <url>',
      `    <loc>${origin}${path}</loc>`,
      `    <lastmod>${page.updatedAt.slice(0, 10)}</lastmod>`,
      // The homepage and the service pages are the ones worth crawling often.
      `    <priority>${page.isHomepage ? '1.0' : '0.8'}</priority>`,
      '  </url>',
    ].join('\n')
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
    },
  })
}
