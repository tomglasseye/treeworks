import {redirect} from 'react-router'
import {validatePreviewUrl, urlSearchParamPreviewPathname} from '@sanity/preview-url-secret'
import type {Route} from './+types/api.preview.enable'
import {previewAuthClient} from '~/sanity/loader.server'
import {previewCookie} from '~/sanity/preview.server'

/**
 * Presentation calls this with a single-use secret it just wrote to the dataset.
 * We check it against the Content Lake rather than trusting the URL, then set
 * the draft-mode cookie and bounce to the page being previewed.
 *
 * If anything fails we still redirect — just without the cookie. Presentation
 * then shows published content rather than a blank pane, which is a far more
 * useful failure than an error page inside an iframe. Draft access is never
 * granted on a failed check.
 */
export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url)
  const target = url.searchParams.get(urlSearchParamPreviewPathname) || '/'

  if (!process.env.SANITY_API_READ_TOKEN) {
    console.warn('[preview] SANITY_API_READ_TOKEN is not set — showing published content.')
    return redirect(target)
  }

  try {
    const {isValid, redirectTo = target} = await validatePreviewUrl(previewAuthClient, request.url)

    if (!isValid) {
      console.warn('[preview] Invalid or expired preview secret — showing published content.')
      return redirect(target)
    }

    return redirect(redirectTo, {
      headers: {'Set-Cookie': await previewCookie.serialize(true)},
    })
  } catch (error) {
    console.error(
      '[preview] Could not validate the preview secret. Usually the read token has been ' +
        'revoked — create a fresh Viewer token at sanity.io/manage.',
      error instanceof Error ? error.message : error,
    )
    return redirect(target)
  }
}
