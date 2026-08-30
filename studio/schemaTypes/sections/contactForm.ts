import {defineType, defineField} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

/**
 * Handled by Netlify Forms. Submissions land in the Netlify dashboard with
 * email notifications; spam filtering and the honeypot come free.
 *
 * Netlify detects forms by parsing static HTML at deploy time, which an SSR
 * app never emits — so `public/__forms.html` carries a hidden copy of every
 * field for the build-time parser, and the React form POSTs url-encoded data
 * with a matching `form-name`. Change the field list here and that file must
 * change too; `npm run check:forms` verifies they still agree.
 *
 * The old site had Ninja Forms installed but rendering nothing — this replaces it.
 */
export const contactForm = defineType({
  name: 'contactForm',
  title: 'Contact form',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Get in touch'}),
    defineField({
      name: 'intro',
      type: 'text',
      rows: 3,
      initialValue: 'Leave a message and we will get back to you ASAP.',
    }),
    defineField({
      name: 'fields',
      title: 'Show these fields',
      type: 'array',
      of: [{type: 'string'}],
      initialValue: ['name', 'email', 'phone', 'service', 'postcode', 'message'],
      options: {
        list: [
          {title: 'Name (always required)', value: 'name'},
          {title: 'Email', value: 'email'},
          {title: 'Phone', value: 'phone'},
          {title: 'Which service', value: 'service'},
          {title: 'Postcode', value: 'postcode'},
          {title: 'Message', value: 'message'},
          {title: 'How did you hear about us', value: 'source'},
          {title: 'Photo upload', value: 'photos'},
        ],
      },
      description:
        'Postcode matters for a Cornwall-wide trade — it tells Tom whether a job is worth the travel before he phones back.',
    }),
    defineField({
      name: 'serviceOptions',
      title: 'Service options',
      type: 'array',
      of: [{type: 'string'}],
      initialValue: [
        'Tree surgery',
        'Emergency call-out',
        'Hedge cutting / grounds maintenance',
        'Forestry / woodland management',
        'Fencing & landscaping',
        'Ash dieback',
        'Something else',
      ],
      hidden: ({parent}) => !parent?.fields?.includes('service'),
    }),
    defineField({
      name: 'formName',
      title: 'Netlify form name',
      type: 'string',
      initialValue: 'contact',
      readOnly: true,
      description:
        'Must match the form-name in public/__forms.html. Changing it detaches the form from its existing submissions.',
    }),
    defineField({name: 'submitLabel', type: 'string', initialValue: 'Send enquiry'}),
    defineField({
      name: 'successMessage',
      type: 'text',
      rows: 2,
      initialValue: 'Thanks — we have got your message and will come back to you as soon as we can.',
    }),
    defineField({
      name: 'consentText',
      title: 'Consent line',
      type: 'text',
      rows: 2,
      initialValue:
        'We will only use your details to respond to this enquiry. See our privacy policy.',
    }),
    defineField({
      name: 'showContactDetailsAlongside',
      title: 'Show phone / email / address beside the form',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', fields: 'fields'},
    prepare: ({title, fields}) => ({
      title: title || 'Contact form',
      subtitle: `Contact form — ${fields?.length ?? 0} fields`,
    }),
  },
})
