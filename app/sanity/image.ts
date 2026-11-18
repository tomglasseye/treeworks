import {createImageUrlBuilder} from '@sanity/image-url'
import {client} from './client'
import type {SanityImage} from '~/types'

const builder = createImageUrlBuilder(client)

// Derived from the builder rather than imported: the type's module path has
// moved between @sanity/image-url majors, this never breaks.
type ImageSource = Parameters<typeof builder.image>[0]

/** Quality 78 is the point where the next step down starts to show on foliage. */
const QUALITY = 78

/**
 * Candidate widths. Deliberately coarse — every extra step is another cache
 * entry on Sanity's CDN for a file almost nobody requests, and the browser only
 * ever picks one. 480 is the exception: a three-up card at a 1350px desktop
 * (Lighthouse's desktop profile) needs ~402px, just past 400, which otherwise
 * jumped straight to 640.
 */
const WIDTHS = [400, 480, 640, 828, 1080, 1400, 1920, 2400]

/**
 * `sizes` values, worked out from the real layout rather than the viewport.
 *
 * `100vw` / `33vw` overstate every image: they ignore the page gutter
 * (1.5rem, 3rem from 64rem), the 90rem container cap and the grid gaps. On a
 * phone that tipped cards from the 640 file to the 828; on a wide desktop a
 * 432px card asked for 33vw = 564px and got the 1400 file. Keep these in step
 * with .u-container in app.css and the gap classes in the sections.
 */
export const SIZES = {
  /** Full width inside the container: Hero (full), ImageBanner. */
  container: '(min-width: 90rem) 84rem, (min-width: 64rem) calc(100vw - 6rem), calc(100vw - 3rem)',
  /** One half of a lg:grid-cols-2 lg:gap-16 split; full width below lg. */
  half: '(min-width: 90rem) 40rem, (min-width: 64rem) calc((100vw - 10rem) / 2), calc(100vw - 3rem)',
  /** Card in a 1 / md:2 / lg:3 column grid with gap-6. */
  third: '(min-width: 90rem) 27rem, (min-width: 64rem) calc((100vw - 9rem) / 3), (min-width: 48rem) calc((100vw - 4.5rem) / 2), calc(100vw - 3rem)',
  /** Gallery tile: 2 / md:3 columns with gap-4. */
  galleryTile: '(min-width: 90rem) 27.4rem, (min-width: 64rem) calc((100vw - 8rem) / 3), (min-width: 48rem) calc((100vw - 5rem) / 3), calc((100vw - 4rem) / 2)',
  /** Gallery strip item: w-[70vw] md:w-[22rem]. */
  galleryStrip: '(min-width: 48rem) 22rem, 70vw',
  /** Image inside rich text, capped at 720px. */
  prose: '(min-width: 48rem) 720px, calc(100vw - 3rem)',
} as const

export function urlFor(source: ImageSource) {
  return builder.image(source).auto('format').quality(QUALITY)
}

type BuildOptions = {
  /** Force a crop to this ratio (width / height). Omit to keep the original. */
  aspect?: number
  /** Never request wider than the source; pass its natural width to cap. */
  maxWidth?: number
}

/**
 * Sanity's builder honours the hotspot and crop set in Studio, but only when
 * `fit: 'crop'` is combined with an explicit height — otherwise the editor's
 * chosen focal point is silently ignored and the middle of the photo wins.
 */
function sized(source: ImageSource, width: number, {aspect}: BuildOptions) {
  const url = urlFor(source).width(width)
  return aspect
    ? url.height(Math.round(width / aspect)).fit('crop').crop('focalpoint').url()
    : url.fit('max').url()
}

export function imageProps(image: SanityImage | undefined, options: BuildOptions = {}) {
  if (!image?.asset) return null

  const source = image as unknown as ImageSource
  const natural = image.dimensions?.width ?? Math.max(...WIDTHS)
  const cap = Math.min(options.maxWidth ?? natural, natural)

  // Always keep at least one candidate, even for a small source image.
  const widths = WIDTHS.filter((w) => w <= cap)
  if (widths.length === 0) widths.push(cap)

  const largest = widths[widths.length - 1]

  return {
    src: sized(source, largest, options),
    srcSet: widths.map((w) => `${sized(source, w, options)} ${w}w`).join(', '),
    width: largest,
    height: options.aspect
      ? Math.round(largest / options.aspect)
      : image.dimensions
        ? Math.round(largest / image.dimensions.aspectRatio)
        : undefined,
    lqip: image.lqip,
  }
}
