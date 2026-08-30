import {defineType, defineField} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'

/**
 * The most important section in the schema.
 *
 * Absorbs every repeating "heading + body + image" run on the old site:
 * Tree Surgery (11 items), Forestry (5), Grounds Maintenance (4),
 * Fencing (2), Ash Dieback (4). One type, four layouts.
 */
export const featureList = defineType({
  name: 'featureList',
  title: 'Feature list',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'intro', type: 'text', rows: 3}),
    defineField({
      name: 'layout',
      type: 'string',
      initialValue: 'alternating',
      options: {
        list: [
          {title: 'Alternating rows (image left / right)', value: 'alternating'},
          {title: 'Numbered columns (01 / 02 / 03)', value: 'numbered'},
          {title: 'Card grid', value: 'cards'},
          {title: 'Compact list (no images)', value: 'compact'},
        ],
      },
      description:
        'Alternating suits long service runs like Tree Surgery. Numbered suits 3–4 reasons-to-choose-us. Cards suit a services overview.',
    }),
    defineField({
      name: 'items',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'body',
              type: 'array',
              of: [{type: 'block', styles: [{title: 'Normal', value: 'normal'}]}],
            }),
            defineField({name: 'image', type: 'figure'}),
            defineField({
              name: 'button',
              type: 'cta',
              description: 'Optional — e.g. "Contact us" on a single service.',
            }),
          ],
          preview: {select: {title: 'title', media: 'image'}},
        },
      ],
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', layout: 'layout', items: 'items'},
    prepare: ({title, layout, items}) => ({
      title: title || 'Feature list',
      subtitle: `Feature list — ${layout}, ${items?.length ?? 0} item(s)`,
    }),
  },
})
