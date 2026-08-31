import {redirect} from 'react-router'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import type {Route} from './+types/api.preview.enable'
import {previewAuthClient} from '~/sanity/loader.server'
import {previewCookie} from '~/sanity/preview.server'

/**
 * Presentation calls this with a single-use secret it just wrote to the dataset.
 * We check it against the Content Lake rather than trusting the URL, then set
 * the draft-mode cookie and bounce to the page being previewed.
 */
export async function loader({request}: Route.LoaderArgs) {
  if (!process.env.SANITY_API_READ_TOKEN) {
    return new Response(
      'Preview is not configured: set SANITY_API_READ_TOKEN (a Viewer token) and restart.',
      {status: 501},
    )
  }

  let isValid = false
  let redirectTo = '/'

  try {
    const result = await validatePreviewUrl(previewAuthClient, request.url)
    isValid = result.isValid
    redirectTo = result.redirectTo ?? '/'
  } catch (error) {
    // Fail closed. A validation error must never fall through to draft mode.
    console.error('[preview] secret validation failed:', error)
    return new Response('Could not validate the preview secret', {status: 503})
  }

  if (!isValid) {
    return new Response('Invalid or expired preview secret', {status: 401})
  }

  return redirect(redirectTo, {
    headers: {'Set-Cookie': await previewCookie.serialize(true)},
  })
}
