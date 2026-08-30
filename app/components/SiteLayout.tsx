import type {SiteData} from '~/types'
import {Header} from './Header'
import {Footer} from './Footer'
import {localBusinessJsonLd} from '~/seo'

export function SiteLayout({
  site,
  children,
  includeJsonLd = false,
}: {
  site?: SiteData
  children: React.ReactNode
  includeJsonLd?: boolean
}) {
  const jsonLd = includeJsonLd ? localBusinessJsonLd(site?.settings) : null

  return (
    <>
      <Header navigation={site?.navigation} settings={site?.settings} />
      <main id="main">{children}</main>
      <Footer navigation={site?.navigation} settings={site?.settings} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      ) : null}
    </>
  )
}
