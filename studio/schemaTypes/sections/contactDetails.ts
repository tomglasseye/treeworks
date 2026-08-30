import {defineType, defineField} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'

/**
 * The phone / email / address band that was hand-repeated on all eleven old pages.
 * Reads from Site Settings by default — change the number once, it changes everywhere.
 */
export const contactDetails = defineType({
  name: 'contactDetails',
  title: 'Contact details band',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'showPhone', type: 'boolean', initialValue: true}),
    defineField({name: 'showEmail', type: 'boolean', initialValue: true}),
    defineField({name: 'showAddress', type: 'boolean', initialValue: true}),
    defineField({name: 'showSocials', type: 'boolean', initialValue: true}),
    defineField({
      name: 'showMap',
      title: 'Show a map',
      type: 'boolean',
      initialValue: false,
      description: 'Static map image — no third-party script, no cookie banner.',
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {prepare: () => ({title: 'Contact details', subtitle: 'From Site Settings'})},
})
