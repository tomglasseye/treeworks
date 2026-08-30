import {defineQuery} from 'groq'

/* ---------------------------------------------------------------- fragments */

const imageFragment = /* groq */ `
  ...,
  "url": asset->url,
  "dimensions": asset->metadata.dimensions,
  "lqip": asset->metadata.lqip,
  alt,
  caption,
  decorative
`

/** Resolves any link kind down to a single href the component can use. */
const linkFragment = /* groq */ `
  ...,
  "href": select(
    kind == "internal" => "/" + coalesce(page->slug.current, ""),
    kind == "external" => url,
    kind == "tel"      => "tel:" + coalesce(phone, ""),
    kind == "email"    => "mailto:" + coalesce(email, ""),
    "#"
  ),
  "needsSiteContact": kind in ["tel", "email"] && !defined(phone) && !defined(email)
`

const ctaFragment = /* groq */ `
  _key, label, variant,
  link { ${linkFragment} }
`

const appearanceFragment = /* groq */ `appearance { tone, spacing, anchorId }`

/**
 * Section expansion. Only the section types that contain references or images
 * need explicit projections; the rest come through on `...`.
 */
const sectionsFragment = /* groq */ `
  sections[] {
    _key,
    _type,
    ...,
    ${appearanceFragment},
    buttons[] { ${ctaFragment} },

    _type == "hero" => { image { ${imageFragment} } },

    _type == "textWithImage" => { image { ${imageFragment} } },

    _type == "imageBanner" => { image { ${imageFragment} } },

    _type == "featureList" => {
      items[] {
        _key, title, body,
        image { ${imageFragment} },
        button { ${ctaFragment} }
      }
    },

    _type == "serviceCards" => {
      cards[] {
        _key, summary,
        "title": coalesce(title, page->title),
        "href": "/" + page->slug.current,
        image { ${imageFragment} }
      }
    },

    _type == "testimonials" => {
      "items": select(
        mode == "selected" => selected[]-> { _id, quote, author, location, date, rating },
        *[_type == "testimonial"] | order(coalesce(date, _createdAt) desc) [0...12] {
          _id, quote, author, location, date, rating
        }
      )
    },

    _type == "gallery" => {
      images[] { ${imageFragment} },
      fallbackImages[] { ${imageFragment} }
    },

    _type == "logoStrip" => {
      logos[] { _key, name, image { ${imageFragment} }, link { ${linkFragment} } }
    },

    _type == "richText" => {
      body[] {
        ...,
        _type == "figure" => { ${imageFragment} },
        markDefs[] { ..., _type == "link" => { link { ${linkFragment} } } }
      }
    }
  }
`

const seoFragment = /* groq */ `
  seo {
    title, description, noIndex,
    shareImage { ${imageFragment} }
  }
`

/* ------------------------------------------------------------------ queries */

export const SITE_QUERY = defineQuery(/* groq */ `{
  "settings": *[_type == "siteSettings"][0] {
    businessName, tagline, companyNumber,
    phone, phoneLabel, secondaryPhone, secondaryPhoneLabel, emergencyPhone,
    email, address, serviceArea, openingHours,
    instagramHandle, facebookUrl,
    "logoUrl": logo.asset->url,
    ${seoFragment}
  },
  "navigation": *[_type == "navigation"][0] {
    headerLinks[] {
      _key, label,
      link { ${linkFragment} },
      children[] { _key, label, link { ${linkFragment} } }
    },
    headerCta { ${ctaFragment} },
    footerColumns[] {
      _key, heading,
      links[] { _key, label, link { ${linkFragment} } }
    },
    legalLinks[] { _key, label, link { ${linkFragment} } }
  }
}`)

export const HOME_QUERY = defineQuery(/* groq */ `
  *[_type == "page" && isHomepage == true][0] {
    _id, _type, title,
    "slug": slug.current,
    ${sectionsFragment},
    ${seoFragment}
  }
`)

export const PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug][0] {
    _id, _type, title,
    "slug": slug.current,
    ${sectionsFragment},
    ${seoFragment}
  }
`)

export const LOCATION_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "locationPage" && slug.current == $slug][0] {
    _id, _type, title, town, localIntro, nearbyAreas,
    "slug": slug.current,
    ${sectionsFragment},
    ${seoFragment}
  }
`)

/** One round trip for an unknown slug: whichever type owns it wins. */
export const SLUG_QUERY = defineQuery(/* groq */ `
  coalesce(
    *[_type == "page" && slug.current == $slug][0] {
      _id, _type, title, "slug": slug.current, ${sectionsFragment}, ${seoFragment}
    },
    *[_type == "locationPage" && slug.current == $slug][0] {
      _id, _type, title, town, localIntro, nearbyAreas,
      "slug": slug.current, ${sectionsFragment}, ${seoFragment}
    }
  )
`)

/** Used to prerender/validate routes at build time. */
export const ALL_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type in ["page", "locationPage"] && defined(slug.current)].slug.current
`)
