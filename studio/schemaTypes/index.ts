// Shared objects
import {link} from './objects/link'
import {cta} from './objects/cta'
import {figure} from './objects/figure'
import {seo} from './objects/seo'
import {sectionAppearance} from './objects/sectionAppearance'

// Page-builder sections
import {hero} from './sections/hero'
import {statement} from './sections/statement'
import {richText} from './sections/richText'
import {textWithImage} from './sections/textWithImage'
import {featureList} from './sections/featureList'
import {serviceCards} from './sections/serviceCards'
import {testimonials} from './sections/testimonials'
import {gallery} from './sections/gallery'
import {callToAction} from './sections/callToAction'
import {contactForm} from './sections/contactForm'
import {contactDetails} from './sections/contactDetails'
import {faq} from './sections/faq'
import {logoStrip} from './sections/logoStrip'
import {stats} from './sections/stats'
import {imageBanner} from './sections/imageBanner'

// Documents
import {page} from './documents/page'
import {locationPage} from './documents/locationPage'
import {testimonial} from './documents/testimonial'
import {siteSettings} from './documents/siteSettings'
import {navigation} from './documents/navigation'

export const objects = [link, cta, figure, seo, sectionAppearance]

export const sections = [
  hero,
  statement,
  richText,
  textWithImage,
  featureList,
  serviceCards,
  testimonials,
  gallery,
  callToAction,
  contactForm,
  contactDetails,
  faq,
  logoStrip,
  stats,
  imageBanner,
]

export const documents = [
  page,
  locationPage,
  testimonial,
  siteSettings,
  navigation,
]

export const schemaTypes = [...objects, ...sections, ...documents]
