import imageUrlBuilder from '@sanity/image-url'
import {client} from './client'
import type {SanityImage} from '~/types'

const builder = imageUrlBuilder(client)

// Derived from the builder rather than imported: the type's module path has
// moved between @sanity/image-url majors, this never breaks.
type ImageSource = Parameters<typeof builder.image>[0]

/** Quality 78 is the point where the next step down starts to show on foliage. */
const QUALITY = 78

/**
 * Candidate widths. Deliberately coarse — every extra step is another cache
 * entry on Sanity's CDN for a file almost nobody requests, and the browser only
 * ever picks one.
 */
const WIDTHS = [400, 640, 828, 1080, 1400, 1920, 2400]

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
