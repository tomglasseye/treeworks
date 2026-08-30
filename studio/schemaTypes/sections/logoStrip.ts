import {defineType, defineField} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

/**
 * Accreditations and insurance marks. The old site showed none, which is a
 * missed trust signal for a trade where customers are choosing who to let up a tree.
 */
export const logoStrip = defineType({
  name: 'logoStrip',
  title: 'Accreditations',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Qualified and insured'}),
    defineField({
      name: 'logos',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        {
          type: 'object',
          name: 'logo',
          fields: [
            defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'image', type: 'figure', validation: (r) => r.required()}),
            defineField({name: 'link', type: 'link'}),
          ],
          preview: {select: {title: 'name', media: 'image'}},
        },
      ],
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', logos: 'logos'},
    prepare: ({title, logos}) => ({title, subtitle: `${logos?.length ?? 0} logo(s)`}),
  },
})
