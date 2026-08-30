import {defineType, defineField} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

/**
 * The Solterra signature move: small lead-in copy on the left, a large serif
 * statement on the right with italic emphasis. Good for "We Love Trees".
 */
export const statement = defineType({
  name: 'statement',
  title: 'Statement',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'leadIn',
      title: 'Lead-in copy',
      type: 'text',
      rows: 3,
      description: 'Small paragraph set to the left of the statement. Optional.',
    }),
    defineField({
      name: 'statement',
      title: 'Statement',
      type: 'array',
      of: [{type: 'block', styles: [{title: 'Normal', value: 'normal'}], lists: [], marks: {decorators: [{title: 'Emphasis (italic serif)', value: 'em'}]}}],
      description: 'Large serif text. Italicise the phrases that should stand out.',
      validation: (r) => r.required(),
    }),
    defineField({name: 'buttons', type: 'array', of: [{type: 'cta'}], validation: (r) => r.max(1)}),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {blocks: 'statement'},
    prepare: ({blocks}) => ({
      title: blocks?.[0]?.children?.map((c: any) => c.text).join('') || 'Statement',
      subtitle: 'Statement',
    }),
  },
})
