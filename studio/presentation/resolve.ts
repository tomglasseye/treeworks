import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

/**
 * Tells Presentation where each document appears on the site, so an editor can
 * jump from a document straight to the page it renders on — and so the
 * "used on" list in the Structure tool is populated.
 */
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    page: defineLocations({
      select: {title: 'title', slug: 'slug.current', isHomepage: 'isHomepage'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled page',
            href: doc?.isHomepage ? '/' : `/${doc?.slug}`,
          },
        ],
      }),
    }),

    locationPage: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [{title: doc?.title || 'Untitled location', href: `/${doc?.slug}`}],
      }),
    }),

    // Testimonials have no page of their own — they surface wherever a
    // testimonials section pulls them in.
    testimonial: defineLocations({
      select: {author: 'author'},
      resolve: (doc) => ({
        locations: [
          {title: 'Homepage', href: '/'},
          {title: 'About Us', href: '/about-us'},
        ],
        message: doc?.author
          ? `Shown wherever a testimonials section includes ${doc.author}.`
          : undefined,
      }),
    }),

    // Settings and navigation are global.
    siteSettings: defineLocations({
      select: {},
      resolve: () => ({
        locations: [{title: 'Homepage', href: '/'}],
        message: 'Phone, email and address appear in the header, footer and every contact band.',
      }),
    }),

    navigation: defineLocations({
      select: {},
      resolve: () => ({
        locations: [{title: 'Homepage', href: '/'}],
        message: 'The header and footer menus on every page.',
      }),
    }),
  },
}
