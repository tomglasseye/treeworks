import {defineType, defineField} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/**
 * Singleton. The contact details were hand-repeated on all eleven old pages —
 * here they live once.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'business', title: 'Business', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'social', title: 'Social'},
    {name: 'seo', title: 'Defaults'},
  ],
  fields: [
    defineField({
      name: 'businessName',
      type: 'string',
      group: 'business',
      initialValue: 'Treeworks Cornwall Ltd',
      validation: (r) => r.required(),
    }),
    defineField({name: 'logo', type: 'image', group: 'business'}),
    defineField({
      name: 'tagline',
      type: 'string',
      group: 'business',
      initialValue: 'Professional Tree Services in Cornwall',
    }),
    defineField({name: 'companyNumber', type: 'string', group: 'business', initialValue: '11472677'}),
    defineField({
      name: 'phone',
      title: 'Main phone',
      type: 'string',
      group: 'contact',
      initialValue: '07880 335025',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'phoneLabel',
      type: 'string',
      group: 'contact',
      initialValue: 'Tom',
      description: 'Shown as "Call Tom: 07880 335025".',
    }),
    defineField({name: 'secondaryPhone', type: 'string', group: 'contact'}),
    defineField({name: 'secondaryPhoneLabel', type: 'string', group: 'contact'}),
    defineField({
      name: 'emergencyPhone',
      type: 'string',
      group: 'contact',
      description: 'The 24-hour call-out number. Leave blank to use the main number.',
    }),
    defineField({
      name: 'email',
      type: 'string',
      group: 'contact',
      initialValue: 'info@treeworkscornwall.co.uk',
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: 'address',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'line1', type: 'string', initialValue: 'Avalen Farm'}),
        defineField({name: 'line2', type: 'string', initialValue: 'Tregonetha'}),
        defineField({name: 'town', type: 'string', initialValue: 'St Columb'}),
        defineField({name: 'county', type: 'string', initialValue: 'Cornwall'}),
        defineField({name: 'postcode', type: 'string', initialValue: 'TR9 6EN'}),
      ],
    }),
    defineField({
      name: 'serviceArea',
      type: 'string',
      group: 'contact',
      initialValue: 'Cornwall',
      description: 'Used in LocalBusiness structured data.',
    }),
    defineField({
      name: 'openingHours',
      type: 'array',
      group: 'contact',
      of: [
        {
          type: 'object',
          name: 'hours',
          fields: [
            defineField({name: 'days', type: 'string'}),
            defineField({name: 'hours', type: 'string'}),
          ],
          preview: {select: {title: 'days', subtitle: 'hours'}},
        },
      ],
    }),
    defineField({
      name: 'instagramHandle',
      type: 'string',
      group: 'social',
      initialValue: 'treeworks_cornwall',
      description: 'Without the @. Drives the gallery feed and the follow button.',
    }),
    defineField({name: 'facebookUrl', type: 'url', group: 'social'}),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      group: 'seo',
      description: 'Used when a page leaves its own SEO fields blank.',
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
