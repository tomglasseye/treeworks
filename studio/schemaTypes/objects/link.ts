import {defineType, defineField} from 'sanity'

/** One link primitive for the whole site: internal ref, external URL, tel: or mailto:. */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Link to',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'A page on this site', value: 'internal'},
          {title: 'An external URL', value: 'external'},
          {title: 'A phone number', value: 'tel'},
          {title: 'An email address', value: 'email'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}, {type: 'locationPage'}],
      hidden: ({parent}) => parent?.kind !== 'internal',
      validation: (r) =>
        r.custom((v, ctx) =>
          (ctx.parent as any)?.kind === 'internal' && !v ? 'Choose a page' : true,
        ),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.kind !== 'external',
      validation: (r) => r.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'phone',
      title: 'Phone number',
      description: 'Leave blank to use the main number from Site Settings.',
      type: 'string',
      hidden: ({parent}) => parent?.kind !== 'tel',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      description: 'Leave blank to use the main address from Site Settings.',
      type: 'string',
      hidden: ({parent}) => parent?.kind !== 'email',
    }),
    defineField({
      name: 'newTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.kind !== 'external',
    }),
  ],
})
