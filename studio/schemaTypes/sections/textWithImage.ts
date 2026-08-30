import {defineType, defineField} from 'sanity'
import {SplitVerticalIcon} from '@sanity/icons/SplitVertical'

/** One heading + body + image pair. The workhorse of the inner pages. */
export const textWithImage = defineType({
  name: 'textWithImage',
  title: 'Text with image',
  type: 'object',
  icon: SplitVerticalIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'body',
      type: 'array',
      of: [{type: 'block', styles: [{title: 'Normal', value: 'normal'}]}],
    }),
    defineField({name: 'image', type: 'figure'}),
    defineField({
      name: 'imagePosition',
      type: 'string',
      initialValue: 'right',
      options: {
        list: [
          {title: 'Image right', value: 'right'},
          {title: 'Image left', value: 'left'},
        ],
        layout: 'radio',
      },
    }),
    defineField({name: 'buttons', type: 'array', of: [{type: 'cta'}], validation: (r) => r.max(2)}),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', media: 'image', pos: 'imagePosition'},
    prepare: ({title, media, pos}) => ({title, subtitle: `Text with image — ${pos}`, media}),
  },
})
