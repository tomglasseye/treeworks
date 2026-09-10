import type {PageDoc, SiteData} from '~/types'
import {Header} from './Header'
import {Footer} from './Footer'
import {breadcrumbJsonLd, localBusinessJsonLd} from '~/seo'

/**
 * A structured-data block.
 *
 * `<` is escaped rather than the whole payload HTML-escaped, because the only
 * sequence that can break out of a script element is a literal `</script>` —
 * and any of this text can come from Studio, where an editor is free to type
 * one. < is still valid JSON, so parsers are unaffected.
 */
function JsonLd({data}: {data: unknown}) {
  if (!data) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
    />
  )
}

export function SiteLayout({
  site,
  siteUrl,
  page,
  children,
  includeJsonLd,
}: {
  site?: SiteData
  siteUrl?: string
  page?: PageDoc | null
  children: React.ReactNode
  includeJsonLd?: boolean
}) {
  // LocalBusiness describes the organisation rather than the page, so it ships
  // on the homepage alone — repeating it site-wide hands Google several copies
  // of one entity to reconcile.
  const business = includeJsonLd ? localBusinessJsonLd(site?.settings, siteUrl) : null
  const breadcrumbs = siteUrl ? breadcrumbJsonLd(page, siteUrl) : null

  return (
    <>
      <Header navigation={site?.navigation} settings={site?.settings} />
      <main id="main">{children}</main>
      <Footer navigation={site?.navigation} settings={site?.settings} />
      <JsonLd data={business} />
      <JsonLd data={breadcrumbs} />
    </>
  )
}
