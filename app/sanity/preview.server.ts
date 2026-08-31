import {createCookie} from 'react-router'
import type {QueryResponseInitial} from '@sanity/react-loader'
import {loadQuery, publicClient} from './loader.server'

/**
 * Draft mode exists ONLY inside the Studio's Presentation iframe.
 *
 * The public site never sees drafts and never receives stega markers, even in
 * the same browser that has just been editing. That is enforced two ways:
 *
 *  1. `Sec-Fetch-Dest` must be `iframe` (the browser sets this on the iframe's
 *     own document request; a normal tab sends `document`).
 *  2. Opening the site in a normal tab actively CLEARS the cookie — see
 *     previewExitHeaders() — so there is nothing to leak and no exit button to
 *     press.
 */
export const previewCookie = createCookie('__treeworks_preview', {
  httpOnly: true,
  // The Studio is embedded at /studio, so the Presentation iframe is
  // same-origin and Lax is both sufficient and safer. A standalone
  // *.sanity.studio deploy would be cross-site and need SameSite=None.
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  // Session cookie: no maxAge, so it dies with the browser.
  secrets: [process.env.PREVIEW_COOKIE_SECRET ?? 'treeworks-dev-only-secret'],
})

async function hasPreviewCookie(request: Request) {
  const value = await previewCookie.parse(request.headers.get('Cookie'))
  return value === true
}

/** True only for the Presentation iframe's own document request. */
function isIframeRequest(request: Request) {
  const dest = request.headers.get('Sec-Fetch-Dest')
  // `iframe` is the iframe document; `empty` covers React Router's client-side
  // loader fetches made from within that iframe after it has loaded.
  return dest === 'iframe' || dest === 'empty'
}

/**
 * True whenever we are being rendered inside the Studio's preview iframe,
 * regardless of whether drafts are available.
 *
 * Presentation's overlay/navigation link is separate from draft access, so the
 * visual-editing runtime mounts on this rather than on `isPreviewEnabled` — a
 * missing or expired token then costs you draft content, not the whole
 * Presentation connection.
 */
export function isInPreviewFrame(request: Request): boolean {
  return isIframeRequest(request)
}

export async function isPreviewEnabled(request: Request): Promise<boolean> {
  if (!process.env.SANITY_API_READ_TOKEN) return false
  if (!isIframeRequest(request)) return false
  return hasPreviewCookie(request)
}

/**
 * If someone loads the site normally while a preview cookie is lying around,
 * clear it. This is what replaces the exit button: browsing the real site is
 * how you leave preview.
 */
export async function previewExitHeaders(request: Request): Promise<HeadersInit | undefined> {
  const isTopLevelDocument = request.headers.get('Sec-Fetch-Dest') === 'document'
  if (!isTopLevelDocument) return undefined
  if (!(await hasPreviewCookie(request))) return undefined
  return {'Set-Cookie': await previewCookie.serialize('', {maxAge: 0})}
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
 * Published content never touches the authenticated client, so a bad token
 * cannot take the site down. Preview falls back to published if the token is
 * rejected.
 */
export async function loadContent<T>(
  query: string,
  params: Record<string, unknown>,
  preview: boolean,
): Promise<QueryResponseInitial<T>> {
  if (!preview) return loadPublished<T>(query, params)

  try {
    return await loadQuery<T>(query, params, {perspective: 'drafts', stega: true, useCdn: false})
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
