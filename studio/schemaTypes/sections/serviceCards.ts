import {defineType, defineField} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

/** The homepage's five cards that link off to the service pages. */
export const serviceCards = defineType({
  name: 'serviceCards',
  title: 'Service cards',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'intro', type: 'text', rows: 2}),
    defineField({
      name: 'cards',
      type: 'array',
      validation: (r) => r.min(1).max(6),
      of: [
        {
          type: 'object',
          name: 'serviceCard',
          fields: [
            defineField({
              name: 'page',
              title: 'Links to',
              type: 'reference',
              to: [{type: 'page'}],
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'title',
              type: 'string',
              description: 'Leave blank to use the linked page title.',
            }),
            defineField({name: 'summary', type: 'text', rows: 4, validation: (r) => r.required()}),
            defineField({name: 'image', type: 'figure'}),
          ],
          preview: {
            select: {title: 'title', pageTitle: 'page.title', media: 'image', subtitle: 'summary'},
            prepare: ({title, pageTitle, media, subtitle}) => ({
              title: title || pageTitle || 'Card',
              subtitle,
              media,
            }),
          },
        },
      ],
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', cards: 'cards'},
    prepare: ({title, cards}) => ({
      title: title || 'Service cards',
      subtitle: `Service cards — ${cards?.length ?? 0}`,
    }),
  },
})
