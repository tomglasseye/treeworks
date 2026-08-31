import {redirect} from 'react-router'
import type {Route} from './+types/api.preview.disable'
import {previewCookie, previewFrameCookie} from '~/sanity/preview.server'

/** Leave draft mode and go back to published content. */
export async function loader({request}: Route.LoaderArgs) {
  const back = new URL(request.url).searchParams.get('redirect') ?? '/'
  return redirect(back, {
    headers: [
      ['Set-Cookie', await previewCookie.serialize('', {maxAge: 0})],
      ['Set-Cookie', await previewFrameCookie.serialize('', {maxAge: 0})],
    ],
  })
}
