import {stegaClean} from '@sanity/client/stega'
import type {PageDoc, SiteSettings} from './types'
import {urlFor} from './sanity/image'

/**
 * Where the page lives, and whether search engines may index it — both come
 * from `seoContext()` in siteUrl.server.ts.
 */
export type SeoContext = {canonicalUrl?: string; indexable?: boolean}

/**
 * A crop of the image at exactly this size. `fit('crop')` with the focal point
 * matters: with only a width and a height the CDN shrinks the picture to fit
 * inside the box, so a square photo would come out 630 x 630 rather than the
 * 1200 x 630 the share tags promise.
 */
function shareImageUrl(image: unknown, width: number, height: number) {
  return urlFor(image as never)
    .width(width)
    .height(height)
    .fit('crop')
    .crop('focalpoint')
    .url()
}

/** Meta tags for a page, falling back to the site defaults from Studio. */
export function buildMeta(page?: PageDoc | null, settings?: SiteSettings, seo?: SeoContext) {
  // Everything here lands in <head>. Stega markers there would show up in
  // Google's snippet and in the browser tab, so strip them unconditionally —
  // there is nothing to click-to-edit inside a meta tag anyway.
  const business = stegaClean(settings?.businessName) ?? 'Treeworks Cornwall'
  const title = stegaClean(
    page?.seo?.title || (page?.title ? `${page.title} | ${business}` : business),
  )
  const description = stegaClean(
    page?.seo?.description || settings?.seo?.description || settings?.tagline || '',
  )
  const share = page?.seo?.shareImage ?? settings?.seo?.shareImage
  const imageUrl = share?.asset ? shareImageUrl(share, 1200, 630) : undefined
  const imageAlt = stegaClean(share?.alt) || undefined

  const tags: Record<string, string>[] = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: business},
    {property: 'og:locale', content: 'en_GB'},
    {name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary'},
  ]

  // One address per page. The redirect for trailing slashes lives in the root
  // loader; this tells search engines which URL to credit if a variant (a
  // tracking parameter, say) ever reaches them anyway.
  if (seo?.canonicalUrl) {
    tags.push({tagName: 'link', rel: 'canonical', href: seo.canonicalUrl})
    tags.push({property: 'og:url', content: seo.canonicalUrl})
  }

  if (imageUrl) {
    tags.push({property: 'og:image', content: imageUrl})
    tags.push({property: 'og:image:width', content: '1200'})
    tags.push({property: 'og:image:height', content: '630'})
    if (imageAlt) tags.push({property: 'og:image:alt', content: imageAlt})
  }

  // Kept out of search results when Studio says so, or when this isn't the
  // public site at all (deploy previews, the netlify.app address, local dev).
  if (page?.seo?.noIndex || seo?.indexable === false) {
    tags.push({name: 'robots', content: 'noindex, nofollow'})
  }

  return tags
}

/**
 * LocalBusiness structured data — absent from the old site entirely, and one of
 * the higher-leverage SEO additions for a trade operating across a region.
 */
export function localBusinessJsonLd(settings?: SiteSettings, siteUrl?: string) {
  if (!settings) return null

  // Structured data is machine-read; stega would corrupt it.
  settings = stegaClean(settings) as SiteSettings

  // The site-wide share photo doubles as the business photo: one square and one
  // wide crop, which is what Google asks for. A real logo, once one is uploaded
  // in Studio, goes in `logo` — a photograph does not belong there.
  const share = settings.seo?.shareImage
  const photos = share?.asset
    ? [shareImageUrl(share, 1200, 1200), shareImageUrl(share, 1200, 630)]
    : undefined

  const areas = [
    settings.serviceArea ? {'@type': 'AdministrativeArea', name: settings.serviceArea} : null,
    ...(settings.areasServed ?? []).map((name) => ({'@type': 'City', name})),
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    // A stable identity for the business, so any other structured data on the
    // site can point at this node instead of describing it a second time.
    '@id': siteUrl ? `${siteUrl}/#business` : undefined,
    name: settings.businessName,
    description: settings.tagline,
    telephone: settings.phone,
    email: settings.email,
    url: siteUrl,
    // The GROQ projection yields null rather than undefined when nothing has
    // been uploaded, and JSON.stringify keeps null while dropping undefined —
    // so each of these falls back to undefined, never null.
    image: photos ?? settings.logoUrl ?? undefined,
    logo: settings.logoUrl ?? undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: [settings.address.line1, settings.address.line2]
            .filter(Boolean)
            .join(', '),
          addressLocality: settings.address.town,
          addressRegion: settings.address.county,
          postalCode: settings.address.postcode,
          addressCountry: 'GB',
        }
      : undefined,
    areaServed: areas.length ? areas : undefined,
    openingHoursSpecification: settings.openingHours?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      description: h.hours,
    })),
    sameAs: [
      settings.instagramHandle ? `https://instagram.com/${settings.instagramHandle}` : null,
      settings.facebookUrl ?? null,
    ].filter(Boolean),
  }
}

/**
 * Breadcrumb trail for a single page.
 *
 * Google uses this to replace the bare URL in a search result with a readable
 * trail, so it earns its place even though the site has no visible breadcrumb
 * UI and no nesting to describe — every page sits one level under the
 * homepage, and that is exactly what this says.
 *
 * Returns null for the homepage: a single-item trail describes nothing, and
 * Google discards it.
 */
export function breadcrumbJsonLd(page: PageDoc | null | undefined, siteUrl: string) {
  if (!page || page.isHomepage) return null

  // Same reason as above — stega markers are invisible characters that would
  // ride along into the breadcrumb text Google reads.
  const slug = stegaClean(page.slug)
  // seo.title is deliberately not used: it carries the "| Treeworks Cornwall"
  // suffix meant for a browser tab, which would read as a duplicate inside a
  // trail that already starts at the site root.
  const name = stegaClean(page.title)
  if (!slug || !name) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/`},
      {'@type': 'ListItem', position: 2, name, item: `${siteUrl}/${slug}`},
    ],
  }
}
