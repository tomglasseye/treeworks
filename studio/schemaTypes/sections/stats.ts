import {defineType, defineField} from 'sanity'
import {BarChartIcon} from '@sanity/icons/BarChart'

/** e.g. "16+ years experience" · "24/7 call-out" · "Fully insured". */
export const stats = defineType({
  name: 'stats',
  title: 'Stats',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'items',
      type: 'array',
      validation: (r) => r.min(2).max(4),
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({name: 'value', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        },
      ],
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({title: 'Stats', subtitle: items?.map((i: any) => i.value).join(' · ')}),
  },
})
