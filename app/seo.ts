import {stegaClean} from '@sanity/client/stega'
import type {PageDoc, SiteSettings} from './types'
import {urlFor} from './sanity/image'

/** Meta tags for a page, falling back to the site defaults from Studio. */
export function buildMeta(page?: PageDoc | null, settings?: SiteSettings) {
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
  const imageUrl = share?.asset ? urlFor(share as never).width(1200).height(630).url() : undefined

  const tags: Record<string, string>[] = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary'},
  ]

  if (imageUrl) tags.push({property: 'og:image', content: imageUrl})
  if (page?.seo?.noIndex) tags.push({name: 'robots', content: 'noindex, nofollow'})

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

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.businessName,
    description: settings.tagline,
    telephone: settings.phone,
    email: settings.email,
    url: siteUrl,
    image: settings.logoUrl,
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
    areaServed: settings.serviceArea ? {'@type': 'Place', name: settings.serviceArea} : undefined,
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
