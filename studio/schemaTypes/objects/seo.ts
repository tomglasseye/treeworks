import {defineType, defineField} from 'sanity'

/** Carries the Yoast values across from WordPress. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      description: 'Falls back to the page title. Aim for under 60 characters.',
      validation: (r) => r.max(60).warning('Google truncates past ~60 characters'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(160).warning('Google truncates past ~160 characters'),
    }),
    defineField({name: 'shareImage', title: 'Social share image', type: 'figure'}),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
