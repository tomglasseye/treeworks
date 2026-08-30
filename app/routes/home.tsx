import type {Route} from './+types/home'
import {loadQuery} from '~/sanity/loader.server'
import {HOME_QUERY, SITE_QUERY} from '~/sanity/queries'
import {SectionRenderer} from '~/components/SectionRenderer'
import {SiteLayout} from '~/components/SiteLayout'
import {buildMeta} from '~/seo'
import type {PageDoc, SiteData} from '~/types'

export async function loader() {
  const [page, site] = await Promise.all([
    loadQuery<PageDoc | null>(HOME_QUERY, {}),
    loadQuery<SiteData>(SITE_QUERY, {}),
  ])
  return {page: page.data, site: site.data}
}

export function meta({loaderData}: Route.MetaArgs) {
  return buildMeta(loaderData?.page, loaderData?.site?.settings)
}

export default function Home({loaderData}: Route.ComponentProps) {
  const {page, site} = loaderData

  return (
    <SiteLayout site={site} includeJsonLd>
      {page ? (
        <SectionRenderer sections={page.sections} settings={site?.settings} />
      ) : (
        <EmptyState />
      )}
    </SiteLayout>
  )
}

function EmptyState() {
  return (
    <div className="u-container py-section">
      <p className="u-eyebrow text-muted">Nothing published yet</p>
      <h1 className="u-h2 mt-4 text-bark">No homepage found</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        Create a Page in Studio, tick <strong>This is the homepage</strong>, add some sections and
        publish it.
      </p>
      <a
        href="/studio"
        className="mt-8 inline-flex rounded-pill bg-bark px-6 py-3 text-bone no-underline"
      >
        Open Studio
      </a>
    </div>
  )
}
