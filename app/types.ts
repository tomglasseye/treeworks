import type {PortableTextBlock} from '@portabletext/react'

export type Tone = 'bone' | 'lichen' | 'bark'
export type Spacing = 'normal' | 'tight' | 'none'

export type Appearance = {
  tone?: Tone
  spacing?: Spacing
  anchorId?: string
}

export type SanityImage = {
  _type?: string
  asset?: {_ref?: string; _type?: string}
  url?: string
  alt?: string
  caption?: string
  decorative?: boolean
  hotspot?: {x: number; y: number}
  crop?: {top: number; bottom: number; left: number; right: number}
  lqip?: string
  dimensions?: {width: number; height: number; aspectRatio: number}
}

export type ResolvedLink = {
  kind?: 'internal' | 'external' | 'tel' | 'email'
  href?: string
  newTab?: boolean
  needsSiteContact?: boolean
}

export type Cta = {
  _key?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  link?: ResolvedLink
}

export type Address = {
  line1?: string
  line2?: string
  town?: string
  county?: string
  postcode?: string
}

export type SiteSettings = {
  businessName?: string
  tagline?: string
  companyNumber?: string
  phone?: string
  phoneLabel?: string
  secondaryPhone?: string
  secondaryPhoneLabel?: string
  emergencyPhone?: string
  email?: string
  address?: Address
  serviceArea?: string
  openingHours?: {_key?: string; days?: string; hours?: string}[] | null
  instagramHandle?: string
  facebookUrl?: string
  logoUrl?: string
  seo?: Seo
}

export type NavItem = {
  _key?: string
  label?: string
  link?: ResolvedLink
  children?: NavItem[] | null
}

export type Navigation = {
  headerLinks?: NavItem[] | null
  headerCta?: Cta
  footerColumns?: {_key?: string; heading?: string; links?: NavItem[] | null}[] | null
  legalLinks?: NavItem[] | null
}

export type Seo = {
  title?: string
  description?: string
  noIndex?: boolean
  shareImage?: SanityImage
}

export type Testimonial = {
  _id?: string
  quote?: string
  author?: string
  location?: string
  date?: string
  rating?: number
}

/** Every section shares these. Individual sections add their own fields. */
export type BaseSection = {
  _key: string
  _type: string
  appearance?: Appearance
  heading?: string
  eyebrow?: string
  intro?: string
  buttons?: Cta[] | null
}

export type Section = BaseSection & Record<string, unknown>

export type PageDoc = {
  _id?: string
  _type?: 'page' | 'locationPage'
  title?: string
  slug?: string
  town?: string
  localIntro?: PortableTextBlock[] | null
  nearbyAreas?: string[] | null
  sections?: Section[] | null
  seo?: Seo
}

export type SiteData = {
  settings?: SiteSettings
  navigation?: Navigation
}

/** Instagram post, normalised from the Behold feed. */
export type InstagramPost = {
  id: string
  permalink: string
  caption?: string
  altText?: string
  mediaType?: string
  thumb: string
  full: string
  width?: number
  height?: number
}

/* ---------------------------------------------------------------------------
   Per-section shapes.

   These replace blanket `as never` casts: each component destructures a real
   type, so layout unions narrow correctly and a typo in a field name is a
   compile error rather than a blank section in production.
--------------------------------------------------------------------------- */

export type HeroSection = BaseSection & {
  _type: 'hero'
  layout?: 'full' | 'split' | 'text'
  standfirst?: string
  image?: SanityImage
}

export type StatementSection = BaseSection & {
  _type: 'statement'
  leadIn?: string
  statement?: PortableTextBlock[] | null
}

export type RichTextSection = BaseSection & {
  _type: 'richText'
  body?: PortableTextBlock[] | null
  width?: 'narrow' | 'wide'
}

export type TextWithImageSection = BaseSection & {
  _type: 'textWithImage'
  body?: PortableTextBlock[] | null
  image?: SanityImage
  imagePosition?: 'left' | 'right'
}

export type FeatureItem = {
  _key?: string
  title?: string
  body?: PortableTextBlock[] | null
  image?: SanityImage
  button?: Cta
}

export type FeatureListSection = BaseSection & {
  _type: 'featureList'
  layout?: 'alternating' | 'numbered' | 'cards' | 'compact'
  items?: FeatureItem[] | null
}

export type ServiceCard = {
  _key?: string
  title?: string
  summary?: string
  href?: string
  image?: SanityImage
}

export type ServiceCardsSection = BaseSection & {
  _type: 'serviceCards'
  cards?: ServiceCard[] | null
}

export type TestimonialsSection = BaseSection & {
  _type: 'testimonials'
  mode?: 'latest' | 'selected'
  limit?: number
  layout?: 'grid' | 'carousel' | 'single'
  items?: Testimonial[] | null
}

export type GallerySection = BaseSection & {
  _type: 'gallery'
  source?: 'instagram' | 'sanity'
  limit?: number
  showCaptions?: boolean
  linkPostsToInstagram?: boolean
  images?: SanityImage[] | null
  fallbackImages?: SanityImage[] | null
  layout?: 'masonry' | 'grid' | 'strip'
  showFollowButton?: boolean
}

export type CallToActionSection = BaseSection & {
  _type: 'callToAction'
  body?: string
  tone?: 'standard' | 'urgent'
  showPhone?: boolean
}

export type ContactFormSection = BaseSection & {
  _type: 'contactForm'
  fields?: string[] | null
  serviceOptions?: string[] | null
  formName?: string
  submitLabel?: string
  successMessage?: string
  consentText?: string
  showContactDetailsAlongside?: boolean
}

export type ContactDetailsSection = BaseSection & {
  _type: 'contactDetails'
  showPhone?: boolean
  showEmail?: boolean
  showAddress?: boolean
  showSocials?: boolean
  showMap?: boolean
}

export type FaqItem = {_key?: string; question?: string; answer?: PortableTextBlock[] | null}

export type FaqSection = BaseSection & {
  _type: 'faq'
  items?: FaqItem[] | null
  emitStructuredData?: boolean
}

export type LogoItem = {_key?: string; name?: string; image?: SanityImage; link?: ResolvedLink}

export type LogoStripSection = BaseSection & {
  _type: 'logoStrip'
  logos?: LogoItem[] | null
}

export type StatItem = {_key?: string; value?: string; label?: string}

export type StatsSection = BaseSection & {
  _type: 'stats'
  items?: StatItem[] | null
}

export type ImageBannerSection = BaseSection & {
  _type: 'imageBanner'
  image?: SanityImage
  height?: 'short' | 'medium' | 'tall'
  overlayText?: string
}

export type AnySection =
  | HeroSection
  | StatementSection
  | RichTextSection
  | TextWithImageSection
  | FeatureListSection
  | ServiceCardsSection
  | TestimonialsSection
  | GallerySection
  | CallToActionSection
  | ContactFormSection
  | ContactDetailsSection
  | FaqSection
  | LogoStripSection
  | StatsSection
  | ImageBannerSection

export type SectionType = AnySection['_type']
