import type {Route} from './+types/api.preview.status'
import {previewAuthClient} from '~/sanity/loader.server'
import {
  isInPreviewFrame,
  isPreviewEnabled,
  isTokenStale,
  tokenFingerprint,
} from '~/sanity/preview.server'

/**
 * Is live preview actually going to work?
 *
 * Reports on the read token without ever revealing it. Worth having because the
 * failure modes look identical from the outside: a revoked token, a token for
 * the wrong project, and a dev server that has not been restarted since .env
 * changed all present as "preview silently shows published content".
 */
export async function loader({request}: Route.LoaderArgs) {
  const token = process.env.SANITY_API_READ_TOKEN

  // A short hash, never the value. Comparing this against the same hash of the
  // .env file tells you whether the running process has actually picked up an
  // edited .env — env vars are read once at startup, so an unrestarted dev
  // server looks exactly like a bad credential.
  const fingerprint = token ? tokenFingerprint(token) : null

  const base = {
    configured: Boolean(token),
    length: token?.length ?? 0,
    fingerprint,
    inPreviewFrame: isInPreviewFrame(request),
    draftModeActive: await isPreviewEnabled(request),
    // True when .env has been edited since this process booted (dev only).
    stale: isTokenStale(),
  }

  if (!token) {
    return Response.json({
      ...base,
      valid: false,
      verdict: 'No SANITY_API_READ_TOKEN. Add one and restart the dev server.',
    })
  }

  try {
    // Cheap authenticated read. Drafts are only visible with a valid token, so
    // this proves the token works rather than just that Sanity is reachable.
    await previewAuthClient.fetch('count(*[_id in path("drafts.**")])')
    return Response.json({
      ...base,
      valid: true,
      verdict: base.draftModeActive
        ? 'Preview is working.'
        : 'Token is valid. Open Studio → Presentation to start a preview session.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({
      ...base,
      valid: false,
      error: message.slice(0, 200),
      verdict: base.stale
        ? '.env holds a different token from the one this dev server started with. ' +
          'Restart it — env vars are read once at startup.'
        : 'Sanity rejected the token. Either it was revoked or it belongs to ' +
          'another project.',
    })
  }
}
