import {defineType, defineField} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'

/** Prose with headings, lists, links and pull-quotes. Covers the Ash Dieback page. */
export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading', value: 'h2'},
            {title: 'Subheading', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            annotations: [
              {name: 'link', type: 'object', title: 'Link', fields: [{name: 'link', type: 'link'}]},
            ],
          },
        },
        {type: 'figure'},
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'width',
      title: 'Measure',
      type: 'string',
      initialValue: 'narrow',
      options: {
        list: [
          {title: 'Narrow (comfortable reading)', value: 'narrow'},
          {title: 'Wide', value: 'wide'},
        ],
        layout: 'radio',
      },
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', body: 'body'},
    prepare: ({title, body}) => ({
      title: title || body?.[0]?.children?.map((c: any) => c.text).join('') || 'Rich text',
      subtitle: 'Rich text',
    }),
  },
})
