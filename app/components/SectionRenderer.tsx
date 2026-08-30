import type {AnySection, SectionType, Section, SiteSettings} from '~/types'

import {Hero} from './sections/Hero'
import {Statement} from './sections/Statement'
import {RichText} from './sections/RichText'
import {TextWithImage} from './sections/TextWithImage'
import {FeatureList} from './sections/FeatureList'
import {ServiceCards} from './sections/ServiceCards'
import {Testimonials} from './sections/Testimonials'
import {Gallery} from './sections/Gallery'
import {CallToAction} from './sections/CallToAction'
import {ContactForm} from './sections/ContactForm'
import {ContactDetails} from './sections/ContactDetails'
import {Faq} from './sections/Faq'
import {LogoStrip} from './sections/LogoStrip'
import {Stats} from './sections/Stats'
import {ImageBanner} from './sections/ImageBanner'

/** Each component receives exactly the section shape its `_type` implies. */
type SectionComponents = {
  [K in SectionType]: React.ComponentType<{
    section: Extract<AnySection, {_type: K}>
    settings?: SiteSettings
  }>
}

/**
 * One entry per section `_type` in the Sanity schema.
 *
 * Adding a section type is: one schema file, one component, one line here.
 * No page changes. The mapped type above means a mismatch between a key and
 * the component's expected props is a compile error, not a runtime surprise.
 */
const REGISTRY: SectionComponents = {
  hero: Hero,
  statement: Statement,
  richText: RichText,
  textWithImage: TextWithImage,
  featureList: FeatureList,
  serviceCards: ServiceCards,
  testimonials: Testimonials,
  gallery: Gallery,
  callToAction: CallToAction,
  contactForm: ContactForm,
  contactDetails: ContactDetails,
  faq: Faq,
  logoStrip: LogoStrip,
  stats: Stats,
  imageBanner: ImageBanner,
}

/**
 * The one cast in the renderer. GROQ hands back loosely-typed JSON, so the
 * `_type` string is checked against the registry at runtime and the matching
 * component is trusted to receive its own shape. Narrowing per branch would
 * need a fifteen-case switch that repeats what the registry already states.
 */
type LooseSectionComponent = React.ComponentType<{
  section: never
  settings?: SiteSettings
}>

export function SectionRenderer({
  sections,
  settings,
}: {
  sections?: Section[] | null
  settings?: SiteSettings
}) {
  if (!sections?.length) return null

  return (
    <>
      {sections.map((section) => {
        const Component = REGISTRY[section._type as SectionType] as
          | LooseSectionComponent
          | undefined

        if (!Component) {
          // A section type exists in Sanity but not here — usually a schema
          // change that has not been deployed yet. Never crash the page.
          if (import.meta.env.DEV) {
            return (
              <div
                key={section._key}
                className="u-container my-8 rounded-panel border border-sap bg-sap/10 p-6 text-sm"
              >
                No component registered for section type <code>{section._type}</code>. Add it to{' '}
                <code>app/components/SectionRenderer.tsx</code>.
              </div>
            )
          }
          return null
        }

        return (
          <Component key={section._key} section={section as never} settings={settings} />
        )
      })}
    </>
  )
}

export const REGISTERED_SECTION_TYPES = Object.keys(REGISTRY) as SectionType[]
