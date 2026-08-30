import {defineType, defineField} from 'sanity'

/**
 * Every image on the site goes through here so alt text is never optional.
 * The old WordPress library had 170 images and almost no alt text — this is the fix.
 */
export const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Describe the image for screen readers and search engines. e.g. "Crown reduction on a mature oak in St Columb". Leave blank ONLY if the image is purely decorative.',
      validation: (r) =>
        r.custom((v, ctx) =>
          (ctx.parent as any)?.decorative || v ? true : 'Add alt text, or tick "decorative"',
        ),
    }),
    defineField({name: 'decorative', title: 'Decorative only', type: 'boolean', initialValue: false}),
    defineField({name: 'caption', type: 'string'}),
  ],
  preview: {
    select: {media: 'asset', title: 'alt', subtitle: 'caption'},
  },
})
