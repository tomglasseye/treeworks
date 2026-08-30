import {useEffect, useState} from 'react'
import type {GallerySection, SiteSettings, InstagramPost, SanityImage} from '~/types'
import {Figure} from '../ui/Figure'
import {Section as Wrapper, toneMuted} from '../ui/Section'

const LAYOUTS: Record<string, string> = {
  masonry: 'columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid',
  grid: 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
  strip: 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]',
}

/**
 * Instagram via Behold, fetched client-side from our own /api/instagram route.
 * Client-side because Behold's image URLs are short-lived: rendering them into
 * the SSR HTML would cache stale links at the CDN. The section degrades to the
 * fallback images if the feed is unavailable.
 */
export function Gallery({section, settings}: {section: GallerySection; settings?: SiteSettings}) {
  const {
    heading,
    intro,
    source = 'instagram',
    limit = 12,
    showCaptions,
    linkPostsToInstagram = true,
    images = [],
    fallbackImages = [],
    layout = 'masonry',
    showFollowButton = true,
    appearance,
  } = section

  const tone = appearance?.tone
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)

  const [posts, setPosts] = useState<InstagramPost[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (source !== 'instagram') return
    let cancelled = false
    fetch(`/api/instagram?limit=${limit}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: {posts: InstagramPost[]}) => {
        if (!cancelled) setPosts(data.posts ?? [])
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [source, limit])

  const useSanityImages = source === 'sanity' || failed || posts?.length === 0
  const sanityList: SanityImage[] = source === 'sanity' ? images : fallbackImages
  const containerClass = LAYOUTS[layout] ?? LAYOUTS.masonry
  const itemClass = layout === 'strip' ? 'w-[70vw] shrink-0 snap-start md:w-[22rem]' : ''

  return (
    <Wrapper appearance={appearance}>
      {heading || intro ? (
        <div className="mb-12 max-w-[60ch]">
          {heading ? (
            <h2 className={`u-h2 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
          ) : null}
          {intro ? <p className={`mt-4 text-lg ${muted}`}>{intro}</p> : null}
        </div>
      ) : null}

      {useSanityImages ? (
        <div className={containerClass}>
          {sanityList.map((img, i) => (
            <Figure
              key={i}
              image={img}
              className={itemClass}
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ))}
        </div>
      ) : posts === null ? (
        <div className={containerClass} aria-busy="true">
          {Array.from({length: Math.min(limit, 8)}).map((_, i) => (
            <div
              key={i}
              className={`aspect-square animate-pulse rounded-panel ${itemClass} ${
                onDark ? 'bg-bone/10' : 'bg-lichen-soft'
              }`}
            />
          ))}
        </div>
      ) : (
        <ul className={containerClass}>
          {posts.map((post) => {
            const img = (
              <img
                src={post.thumb}
                alt={post.altText || post.caption?.slice(0, 120) || 'Treeworks Cornwall on Instagram'}
                loading="lazy"
                decoding="async"
                width={post.width}
                height={post.height}
                className="w-full rounded-panel object-cover"
              />
            )
            return (
              <li key={post.id} className={itemClass}>
                {linkPostsToInstagram ? (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-90"
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
                {showCaptions && post.caption ? (
                  <p className={`mt-2 text-sm ${muted}`}>{post.caption.slice(0, 140)}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {showFollowButton && settings?.instagramHandle ? (
        <div className="mt-12">
          <a
            href={`https://instagram.com/${settings.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-pill px-6 py-3 no-underline transition-colors ${
              onDark ? 'bg-bone text-bark hover:bg-lichen' : 'bg-bark text-bone hover:bg-bark-soft'
            }`}
          >
            Follow @{settings.instagramHandle}
          </a>
        </div>
      ) : null}
    </Wrapper>
  )
}
