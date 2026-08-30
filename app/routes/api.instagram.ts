import type {Route} from './+types/api.instagram'
import type {InstagramPost} from '~/types'

/**
 * Server-side proxy for the Behold JSON feed.
 *
 * Behold owns the Meta app and refreshes the Instagram tokens, so there is no
 * secret here and nothing to rotate. Proxying anyway buys three things:
 * the feed URL stays out of the client bundle (so it cannot be scraped and
 * burned against our view quota), the payload is trimmed to what the gallery
 * actually renders, and one shared cache entry serves every visitor.
 */

type BeholdImage = {url?: string; width?: number; height?: number}
type BeholdPost = {
  id: string
  permalink: string
  caption?: string
  prunedCaption?: string
  altText?: string
  mediaType?: string
  mediaUrl?: string
  thumbnailUrl?: string
  sizes?: {small?: BeholdImage; medium?: BeholdImage; large?: BeholdImage; full?: BeholdImage}
}

let cache: {at: number; posts: InstagramPost[]} | null = null
const TTL_MS = 15 * 60 * 1000

function normalise(post: BeholdPost): InstagramPost {
  const medium = post.sizes?.medium ?? post.sizes?.large ?? post.sizes?.small
  const full = post.sizes?.full ?? post.sizes?.large ?? medium
  return {
    id: post.id,
    permalink: post.permalink,
    caption: post.prunedCaption ?? post.caption,
    altText: post.altText,
    mediaType: post.mediaType,
    thumb: medium?.url ?? post.thumbnailUrl ?? post.mediaUrl ?? '',
    full: full?.url ?? post.mediaUrl ?? '',
    width: medium?.width,
    height: medium?.height,
  }
}

export async function loader({request}: Route.LoaderArgs) {
  const feedUrl = process.env.VITE_BEHOLD_FEED_URL ?? import.meta.env.VITE_BEHOLD_FEED_URL

  if (!feedUrl) {
    // Not configured yet — the gallery falls back to its Sanity images.
    return Response.json({posts: [], reason: 'no-feed-url'}, {status: 200})
  }

  const limit = Math.min(Number(new URL(request.url).searchParams.get('limit') ?? 12) || 12, 50)

  if (cache && Date.now() - cache.at < TTL_MS) {
    return Response.json(
      {posts: cache.posts.slice(0, limit), cached: true},
      {headers: {'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'}},
    )
  }

  try {
    const response = await fetch(feedUrl, {signal: AbortSignal.timeout(8000)})
    if (!response.ok) throw new Error(`Behold responded ${response.status}`)

    const data = (await response.json()) as {posts?: BeholdPost[]}
    const posts = (data.posts ?? []).map(normalise).filter((p) => p.thumb)

    cache = {at: Date.now(), posts}

    return Response.json(
      {posts: posts.slice(0, limit)},
      {headers: {'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'}},
    )
  } catch (error) {
    // Serve stale rather than nothing — a gallery of yesterday's photos beats
    // an empty page.
    if (cache) {
      return Response.json({posts: cache.posts.slice(0, limit), stale: true})
    }
    console.error('[instagram] feed unavailable:', error)
    return Response.json({posts: [], error: 'unavailable'}, {status: 200})
  }
}
