import {createCookie} from 'react-router'
import type {QueryResponseInitial} from '@sanity/react-loader'
import {loadQuery, publicClient} from './loader.server'

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
  maxAge: 60 * 60 * 24,
  secrets: [process.env.PREVIEW_COOKIE_SECRET ?? 'treeworks-dev-only-secret'],
})

/** Draft mode needs both the cookie and a token to read drafts with. */
export async function isPreviewEnabled(request: Request): Promise<boolean> {
  const value = await previewCookie.parse(request.headers.get('Cookie'))
  return value === true && Boolean(process.env.SANITY_API_READ_TOKEN)
}

function isAuthError(error: unknown): boolean {
  const e = error as {statusCode?: number; response?: {statusCode?: number}}
  const status = e?.statusCode ?? e?.response?.statusCode
  const message = error instanceof Error ? error.message : String(error)
  return status === 401 || status === 403 || /unauthor|session not found|permission/i.test(message)
}

async function loadPublished<T>(
  query: string,
  params: Record<string, unknown>,
): Promise<QueryResponseInitial<T>> {
  const data = await publicClient.fetch<T>(query, params)
  return {data, sourceMap: undefined, perspective: 'published'}
}

/**
 * Published content never touches the authenticated client. Preview does, and
 * falls back to published if the token is rejected — a stale token should
 * degrade preview, never 500 the page.
 */
export async function loadContent<T>(
  query: string,
  params: Record<string, unknown>,
  preview: boolean,
): Promise<QueryResponseInitial<T>> {
  if (!preview) return loadPublished<T>(query, params)

  try {
    return await loadQuery<T>(query, params, {
      perspective: 'drafts',
      stega: true,
      useCdn: false,
    })
  } catch (error) {
    if (isAuthError(error)) {
      console.error(
        '[preview] Sanity rejected SANITY_API_READ_TOKEN — serving published content. ' +
          'Create a fresh Viewer token at sanity.io/manage.',
      )
      return loadPublished<T>(query, params)
    }
    throw error
  }
}
