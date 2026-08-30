import {createCookie} from 'react-router'

/**
 * Draft mode, held in one httpOnly cookie.
 *
 * React Router has no built-in draftMode(), so this is the equivalent: the
 * Presentation tool hits /api/preview/enable with a single-use secret, we
 * validate it against the Content Lake, and set this cookie. Nothing else can
 * turn drafts on — a visitor cannot opt themselves into unpublished content.
 */
export const previewCookie = createCookie('__treeworks_preview', {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24, // a working day; re-enter Presentation to refresh
  secrets: [process.env.PREVIEW_COOKIE_SECRET ?? 'treeworks-dev-only-secret'],
})

export async function isPreviewEnabled(request: Request): Promise<boolean> {
  const value = await previewCookie.parse(request.headers.get('Cookie'))
  return value === true
}

/**
 * Options handed to every loadQuery call.
 *
 * Outside preview: published content, no stega, CDN on.
 * Inside preview: drafts, stega markers for click-to-edit, CDN off.
 */
export function queryOptions(preview: boolean) {
  return preview
    ? ({perspective: 'drafts', stega: true, useCdn: false} as const)
    : ({perspective: 'published', stega: false, useCdn: true} as const)
}
