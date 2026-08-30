import {defineType, defineField} from 'sanity'

/** A button. Label + link + visual weight. */
export const cta = defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (r) => r.required().max(40)}),
    defineField({name: 'link', type: 'link', validation: (r) => r.required()}),
    defineField({
      name: 'variant',
      title: 'Style',
      type: 'string',
      initialValue: 'primary',
      options: {
        list: [
          {title: 'Primary (solid)', value: 'primary'},
          {title: 'Secondary (outline)', value: 'secondary'},
          {title: 'Text only (arrow)', value: 'ghost'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'variant'},
  },
})
