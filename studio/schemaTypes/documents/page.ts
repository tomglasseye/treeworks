import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'

/** Every section type is allowed on every page. Order and mix are the editor's call. */
export const SECTION_TYPES = [
  'hero',
  'statement',
  'richText',
  'textWithImage',
  'featureList',
  'serviceCards',
  'testimonials',
  'gallery',
  'callToAction',
  'contactForm',
  'contactDetails',
  'faq',
  'logoStrip',
  'stats',
  'imageBanner',
] as const

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      description:
        'The URL path. Existing slugs are carrying search rankings — do not change them without setting up a redirect.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isHomepage',
      title: 'This is the homepage',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      group: 'content',
      of: SECTION_TYPES.map((type) => defineArrayMember({type})),
      options: {insertMenu: {filter: true, groups: [
        {name: 'lead', title: 'Lead', of: ['hero', 'imageBanner', 'statement']},
        {name: 'body', title: 'Body', of: ['richText', 'textWithImage', 'featureList', 'serviceCards', 'faq']},
        {name: 'proof', title: 'Proof', of: ['testimonials', 'gallery', 'logoStrip', 'stats']},
        {name: 'convert', title: 'Convert', of: ['callToAction', 'contactForm', 'contactDetails']},
      ]}},
      validation: (r) => r.required().min(1),
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', home: 'isHomepage', sections: 'sections'},
    prepare: ({title, slug, home, sections}) => ({
      title: home ? `${title} (homepage)` : title,
      subtitle: `/${slug ?? ''} — ${sections?.length ?? 0} section(s)`,
    }),
  },
})
