import {defineType, defineField} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'

/** Written once, shown anywhere. Eight of these came across from the old homepage. */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({name: 'quote', type: 'text', rows: 5, validation: (r) => r.required()}),
    defineField({name: 'author', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'location',
      type: 'string',
      description: 'Town, or company name. e.g. "Four Seas Ltd, Helston"',
    }),
    defineField({
      name: 'date',
      type: 'date',
      options: {dateFormat: 'D MMMM YYYY'},
      description: 'Used to order "most recent" testimonial sections.',
    }),
    defineField({
      name: 'rating',
      type: 'number',
      options: {list: [1, 2, 3, 4, 5], layout: 'radio', direction: 'horizontal'},
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: 'service',
      title: 'Which service',
      type: 'string',
      description: 'Lets a service page show only relevant reviews.',
      options: {
        list: [
          {title: 'Tree surgery', value: 'tree-surgery'},
          {title: 'Grounds maintenance', value: 'grounds-maintenance'},
          {title: 'Forestry', value: 'forestry'},
          {title: 'Fencing & landscaping', value: 'fencing-landscaping'},
          {title: 'Ash dieback', value: 'ash-dieback'},
        ],
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'author', subtitle: 'quote', location: 'location'},
    prepare: ({title, subtitle, location}) => ({
      title: location ? `${title} — ${location}` : title,
      subtitle,
    }),
  },
})
