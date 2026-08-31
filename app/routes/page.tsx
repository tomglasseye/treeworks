import type {Route} from './+types/page'
import {isPreviewEnabled, loadContent} from '~/sanity/preview.server'
import {useQuery} from '~/sanity/loader'
import {SLUG_QUERY, SITE_QUERY} from '~/sanity/queries'
import {SectionRenderer} from '~/components/SectionRenderer'
import {SiteLayout} from '~/components/SiteLayout'
import {Prose} from '~/components/ui/Prose'
import {buildMeta} from '~/seo'
import type {PageDoc, SiteData} from '~/types'

export async function loader({request, params}: Route.LoaderArgs) {
  const preview = await isPreviewEnabled(request)
  const queryParams = {slug: params.slug}

  const [page, site] = await Promise.all([
    loadContent<PageDoc | null>(SLUG_QUERY, queryParams, preview),
    loadContent<SiteData>(SITE_QUERY, {}, preview),
  ])

  if (!page.data) {
    throw new Response('Not found', {status: 404})
  }

  return {
    initial: page,
    site: site.data,
    query: SLUG_QUERY,
    params: queryParams,
    preview,
  }
}

export function meta({loaderData}: Route.MetaArgs) {
  return buildMeta(loaderData?.initial?.data, loaderData?.site?.settings)
}

export default function Page({loaderData}: Route.ComponentProps) {
  const {initial, site, query, params, preview} = loaderData

  const {data} = useQuery<PageDoc | null>(query, params, {initial})
  const page = (preview ? (data ?? initial.data) : initial.data) as PageDoc

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
