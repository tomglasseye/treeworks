import {defineType, defineField} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

/** Accordion. Restructures the Ash Dieback explainer nicely, and earns FAQ rich results. */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Frequently asked questions'}),
    defineField({
      name: 'items',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({name: 'question', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'answer',
              type: 'array',
              of: [{type: 'block'}],
              validation: (r) => r.required(),
            }),
          ],
          preview: {select: {title: 'question'}},
        },
      ],
    }),
    defineField({
      name: 'emitStructuredData',
      title: 'Add FAQ structured data',
      type: 'boolean',
      initialValue: true,
      description: 'Outputs FAQPage JSON-LD so answers can appear directly in Google.',
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', items: 'items'},
    prepare: ({title, items}) => ({title, subtitle: `FAQ — ${items?.length ?? 0} question(s)`}),
  },
})
