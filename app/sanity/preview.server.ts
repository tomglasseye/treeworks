import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {createCookie} from 'react-router'
import type {QueryResponseInitial} from '@sanity/react-loader'
import {loadQuery, previewAuthClient, publicClient} from './loader.server'

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
/**
 * Signing secret for both preview cookies.
 *
 * The dev fallback must not survive into production: these cookies are what
 * grant draft access, and a secret published in the repository would let
 * anyone forge one. Failing the boot is the right outcome — a site that
 * silently trusts a known secret is worse than one that will not start.
 */
function cookieSecret(): string {
  const secret = process.env.PREVIEW_COOKIE_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PREVIEW_COOKIE_SECRET is not set. Add it to the deploy environment — ' +
        'it signs the cookies that grant draft access.',
    )
  }
  return 'treeworks-dev-only-secret'
}

export const previewCookie = createCookie('__treeworks_preview', {
  httpOnly: true,
  // The Studio is embedded at /studio, so the Presentation iframe is
  // same-origin and Lax is both sufficient and safer. A standalone
  // *.sanity.studio deploy would be cross-site and need SameSite=None.
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  // Session cookie: no maxAge, so it dies with the browser.
  secrets: [cookieSecret()],
})

/**
 * Marks the browsing context as the Studio's preview iframe, separately from
 * whether drafts are available.
 *
 * Only /api/preview/enable sets it, and only Presentation calls that route, so
 * its presence is proof we are inside the Studio. It is set even when the read
 * token is rejected: Presentation's navigation sync and the "drafts are not
 * loading" notice both need to work in exactly that case.
 */
export const previewFrameCookie = createCookie('__treeworks_preview_frame', {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  secrets: [cookieSecret()],
})

async function hasPreviewCookie(request: Request) {
  const value = await previewCookie.parse(request.headers.get('Cookie'))
  return value === true
}

async function hasPreviewFrameCookie(request: Request) {
  const value = await previewFrameCookie.parse(request.headers.get('Cookie'))
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
export async function isInPreviewFrame(request: Request): Promise<boolean> {
  // Sec-Fetch-Dest alone is not enough: React Router's client-side loader
  // fetches send `empty` on the public site too, so testing the header by
  // itself mounted visual editing for ordinary visitors the moment they
  // clicked a link. The cookie is what actually distinguishes the Studio.
  if (!isIframeRequest(request)) return false
  return (await hasPreviewFrameCookie(request)) || (await hasPreviewCookie(request))
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

  const cookies: string[] = []
  if (await hasPreviewCookie(request)) {
    cookies.push(await previewCookie.serialize('', {maxAge: 0}))
  }
  if (await hasPreviewFrameCookie(request)) {
    cookies.push(await previewFrameCookie.serialize('', {maxAge: 0}))
  }
  if (cookies.length === 0) return undefined
  return cookies.map((value) => ['Set-Cookie', value] as [string, string])
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

export type PreviewTokenStatus =
  | {ok: true}
  | {ok: false; reason: 'missing' | 'rejected' | 'stale'; detail?: string}

/** A short hash of a credential, safe to compare and to log. Never the value. */
export function tokenFingerprint(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 10)
}

/**
 * The token sitting in .env right now, hashed — which is not necessarily the
 * one this process is using. Vite reads .env once at boot, so editing it and
 * reloading the page changes nothing, and the symptom is identical to a bad
 * credential. Comparing the two hashes tells those apart.
 *
 * Development only: in production there is no .env to read and no way to
 * restart from a browser tab.
 */
function envFileFingerprint(): string | null {
  if (process.env.NODE_ENV === 'production') return null
  try {
    for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('SANITY_API_READ_TOKEN=')) continue
      const value = trimmed.slice('SANITY_API_READ_TOKEN='.length).trim().replace(/^["']|["']$/g, '')
      return value ? tokenFingerprint(value) : null
    }
  } catch {
    // No .env, or not readable from the working directory. Nothing to compare.
  }
  return null
}

/** True when .env holds a different token from the one this process booted with. */
export function isTokenStale(): boolean {
  const running = process.env.SANITY_API_READ_TOKEN
  if (!running) return false
  const onDisk = envFileFingerprint()
  return Boolean(onDisk) && onDisk !== tokenFingerprint(running)
}

let cached: {at: number; result: Promise<PreviewTokenStatus>} | undefined
const CACHE_MS = 30_000

/**
 * Can we actually load drafts?
 *
 * Presentation fails silently when the token is wrong: the page renders
 * perfectly from published content, but with no content source map nothing is
 * clickable and the Studio reports no matching documents. That looks like a
 * broken Presentation tool rather than a credential problem, so we check up
 * front and say so in the iframe.
 *
 * Cached briefly: this runs on preview-frame requests only, and the answer
 * cannot change without a restart anyway (env is read once at boot).
 */
export function checkPreviewToken(): Promise<PreviewTokenStatus> {
  if (!process.env.SANITY_API_READ_TOKEN) {
    return Promise.resolve({ok: false, reason: 'missing'} as const)
  }

  const now = Date.now()
  if (cached && now - cached.at < CACHE_MS) return cached.result

  const result = previewAuthClient
    .fetch('count(*[_id in path("drafts.**")])')
    .then(() => ({ok: true}) as PreviewTokenStatus)
    .catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : String(error)
      // A network blip should not be cached as a credential failure.
      if (!isAuthError(error)) cached = undefined
      // An edited .env that the running process has not seen is a restart, not
      // a bad token — worth saying, because the two look identical otherwise.
      const reason = isTokenStale() ? 'stale' : 'rejected'
      return {ok: false, reason, detail: detail.slice(0, 160)} as PreviewTokenStatus
    })

  cached = {at: now, result}
  return result
}
