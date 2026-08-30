import type {Route} from './+types/page'
import {loadQuery} from '~/sanity/loader.server'
import {SLUG_QUERY, SITE_QUERY} from '~/sanity/queries'
import {SectionRenderer} from '~/components/SectionRenderer'
import {SiteLayout} from '~/components/SiteLayout'
import {Prose} from '~/components/ui/Prose'
import {buildMeta} from '~/seo'
import type {PageDoc, SiteData} from '~/types'

export async function loader({params}: Route.LoaderArgs) {
  const slug = params.slug

  const [page, site] = await Promise.all([
    loadQuery<PageDoc | null>(SLUG_QUERY, {slug}),
    loadQuery<SiteData>(SITE_QUERY, {}),
  ])

  if (!page.data) {
    throw new Response('Not found', {status: 404})
  }

  return {page: page.data, site: site.data}
}

export function meta({loaderData}: Route.MetaArgs) {
  return buildMeta(loaderData?.page, loaderData?.site?.settings)
}

export default function Page({loaderData}: Route.ComponentProps) {
  const {page, site} = loaderData
  const isLocation = page._type === 'locationPage'

  return (
    <SiteLayout site={site}>
      <SectionRenderer sections={page.sections} settings={site?.settings} />

      {isLocation && page.localIntro ? (
        <section className="bg-bone py-20 md:py-section">
          <div className="u-container max-w-[68ch]">
            <Prose value={page.localIntro} />
            {page.nearbyAreas && page.nearbyAreas.length > 0 ? (
              <div className="mt-10">
                <h2 className="u-eyebrow mb-4 text-muted">Also serving</h2>
                <ul className="flex flex-wrap gap-2">
                  {page.nearbyAreas.map((area) => (
                    <li
                      key={area}
                      className="rounded-pill bg-lichen-soft px-4 py-1.5 text-sm text-bark"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  )
}
