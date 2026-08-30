import {defineType, defineField, defineArrayMember} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'
import {SECTION_TYPES} from './page'

/**
 * Local-SEO landing pages. Replaces /tree-surgeon-cornwall and /newquay-tree-surgeon,
 * and lets Tom add Truro, St Austell, Wadebridge and the rest from Studio
 * without a developer.
 */
export const locationPage = defineType({
  name: 'locationPage',
  title: 'Location page',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'town',
      title: 'Town or area',
      type: 'string',
      group: 'content',
      description: 'e.g. "Newquay", "Truro", "Cornwall"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      group: 'content',
      description: 'e.g. "Newquay Tree Surgeon"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'localIntro',
      title: 'Local intro',
      type: 'array',
      group: 'content',
      of: [{type: 'block'}],
      description:
        'The genuinely local paragraph — distance, landmarks, jobs done nearby. Pages that just swap the town name get treated as doorway pages and do not rank.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'nearbyAreas',
      title: 'Nearby areas served',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      group: 'content',
      of: SECTION_TYPES.map((type) => defineArrayMember({type})),
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: `/${slug ?? ''}`}),
  },
})
