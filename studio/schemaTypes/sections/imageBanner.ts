import {defineType, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/** Full-bleed image break between sections. Inset with a 16px radius, Solterra-style. */
export const imageBanner = defineType({
  name: 'imageBanner',
  title: 'Image banner',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({name: 'image', type: 'figure', validation: (r) => r.required()}),
    defineField({
      name: 'height',
      type: 'string',
      initialValue: 'medium',
      options: {
        list: [
          {title: 'Short', value: 'short'},
          {title: 'Medium', value: 'medium'},
          {title: 'Tall', value: 'tall'},
        ],
        layout: 'radio',
      },
    }),
    defineField({name: 'overlayText', type: 'string'}),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {media: 'image', title: 'overlayText', alt: 'image.alt'},
    prepare: ({media, title, alt}) => ({title: title || alt || 'Image banner', subtitle: 'Image banner', media}),
  },
})
