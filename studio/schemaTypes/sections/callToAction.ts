import {defineType, defineField} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * The band that appears on nine of eleven old pages, sometimes twice:
 * "Contact us today for a free site visit and a free, no obligation quotation".
 *
 * `urgent` tone covers the separate 24-hour emergency call-out band.
 */
export const callToAction = defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  icon: RocketIcon,
  fields: [
    defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'body', type: 'text', rows: 3}),
    defineField({name: 'buttons', type: 'array', of: [{type: 'cta'}], validation: (r) => r.max(2)}),
    defineField({
      name: 'tone',
      title: 'Emphasis',
      type: 'string',
      initialValue: 'standard',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Urgent (emergency call-out)', value: 'urgent'},
        ],
        layout: 'radio',
      },
      description: 'Urgent uses the warm accent colour and shows the phone number prominently.',
    }),
    defineField({
      name: 'showPhone',
      title: 'Show the phone number',
      type: 'boolean',
      initialValue: false,
      description: 'Uses the number from Site Settings.',
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', tone: 'tone'},
    prepare: ({title, tone}) => ({title, subtitle: `CTA${tone === 'urgent' ? ' — urgent' : ''}`}),
  },
})
