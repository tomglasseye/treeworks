import {defineType, defineField} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'

/**
 * Pulls from the reusable `testimonial` documents.
 * Homepage shows the latest 8; About Us hand-picks 2. Same section, two modes.
 */
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Testimonials'}),
    defineField({
      name: 'mode',
      type: 'string',
      initialValue: 'latest',
      options: {
        list: [
          {title: 'Show the most recent', value: 'latest'},
          {title: 'Pick specific ones', value: 'selected'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'limit',
      title: 'How many',
      type: 'number',
      initialValue: 6,
      hidden: ({parent}) => parent?.mode !== 'latest',
      validation: (r) => r.min(1).max(24),
    }),
    defineField({
      name: 'selected',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'testimonial'}]}],
      hidden: ({parent}) => parent?.mode !== 'selected',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      initialValue: 'grid',
      options: {
        list: [
          {title: 'Grid', value: 'grid'},
          {title: 'Carousel', value: 'carousel'},
          {title: 'Single large quote', value: 'single'},
        ],
      },
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', mode: 'mode', limit: 'limit', selected: 'selected'},
    prepare: ({title, mode, limit, selected}) => ({
      title: title || 'Testimonials',
      subtitle: mode === 'latest' ? `Latest ${limit}` : `${selected?.length ?? 0} hand-picked`,
    }),
  },
})
