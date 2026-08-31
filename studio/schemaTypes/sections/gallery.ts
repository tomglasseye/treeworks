import {defineType, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/**
 * Gallery.
 *
 * Instagram without touching the Meta API: Behold (behold.so) holds the
 * Instagram connection, owns the Meta app, and refreshes the tokens. It hands
 * back a plain public JSON feed with pre-optimised WebP images in four sizes,
 * alt text, captions and permalinks. The site fetches that URL in the route
 * loader — no token, no server secret, no refresh job.
 *
 * `source` keeps the escape hatch open: if the feed ever goes away, or the
 * post limit chafes, switch to `sanity` and the same section renders images
 * managed in Studio instead. Nothing else on the page changes.
 */
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Gallery'}),
    defineField({name: 'intro', type: 'text', rows: 2, initialValue: 'See our latest work'}),
    defineField({
      name: 'source',
      title: 'Where the images come from',
      type: 'string',
      initialValue: 'instagram',
      options: {
        list: [
          {title: 'Instagram feed', value: 'instagram'},
          {title: 'Images managed here', value: 'sanity'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'limit',
      title: 'How many posts',
      type: 'number',
      initialValue: 6,
      hidden: ({parent}) => parent?.source !== 'instagram',
      description:
        'Behold returns 6 posts on its free tier, so the grid is built for six — three across on desktop, two on mobile. Raise this cap here and in Gallery.tsx if the plan changes.',
      validation: (rule) => rule.min(2).max(6),
    }),
    defineField({
      name: 'showCaptions',
      title: 'Show captions',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.source !== 'instagram',
    }),
    defineField({
      name: 'linkPostsToInstagram',
      title: 'Clicking a post opens it on Instagram',
      type: 'boolean',
      initialValue: true,
      hidden: ({parent}) => parent?.source !== 'instagram',
      description: 'Off = opens in a lightbox on this site instead.',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'figure'}],
      hidden: ({parent}) => parent?.source !== 'sanity',
    }),
    defineField({
      name: 'fallbackImages',
      title: 'Fallback images',
      description:
        'Shown only if the Instagram feed cannot be reached. Worth adding six good photos so the page is never empty.',
      type: 'array',
      of: [{type: 'figure'}],
      hidden: ({parent}) => parent?.source !== 'instagram',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      initialValue: 'grid',
      options: {
        list: [
          {title: 'Grid (3 across, 2 on mobile)', value: 'grid'},
          {title: 'Masonry', value: 'masonry'},
          {title: 'Wide strip', value: 'strip'},
        ],
      },
    }),
    defineField({
      name: 'showFollowButton',
      title: 'Show "Follow on Instagram" button',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({name: 'appearance', type: 'sectionAppearance'}),
  ],
  preview: {
    select: {title: 'heading', source: 'source', limit: 'limit', layout: 'layout'},
    prepare: ({title, source, limit, layout}) => ({
      title: title || 'Gallery',
      subtitle:
        source === 'sanity'
          ? `Gallery — managed here, ${layout}`
          : `Gallery — Instagram, latest ${limit ?? 6}`,
      media: ImageIcon,
    }),
  },
})
