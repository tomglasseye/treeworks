import {defineType, defineField} from 'sanity'

/**
 * Shared by every section. Lets the page-builder set colour rhythm and spacing
 * without a developer. Values map onto the Tailwind @theme tokens.
 */
export const sectionAppearance = defineType({
  name: 'sectionAppearance',
  title: 'Appearance',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'tone',
      title: 'Background',
      type: 'string',
      initialValue: 'bone',
      options: {
        list: [
          {title: 'Bone (page default)', value: 'bone'},
          {title: 'Lichen (pale green panel)', value: 'lichen'},
          {title: 'Bark (dark green panel)', value: 'bark'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'spacing',
      title: 'Vertical space',
      type: 'string',
      initialValue: 'normal',
      options: {
        list: [
          {title: 'Normal', value: 'normal'},
          {title: 'Tight', value: 'tight'},
          {title: 'None (butt up against the next section)', value: 'none'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'pattern',
      title: 'Background pattern',
      type: 'string',
      initialValue: 'none',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Wood grain', value: 'grain'},
        ],
        layout: 'radio',
      },
      description: 'A faint wood-grain texture behind the section. Use sparingly.',
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      description: 'Optional. Lets a link jump to this section, e.g. "emergency".',
    }),
  ],
})
