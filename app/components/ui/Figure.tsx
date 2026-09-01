import {useState} from 'react'
import type {SanityImage} from '~/types'
import {imageProps} from '~/sanity/image'

type Props = {
  image?: SanityImage
  className?: string
  imgClassName?: string
  /**
   * Tell the browser how wide this image will actually be rendered. Getting this
   * right is most of the win — a card that is 400px wide should never download
   * the 1920px file just because the viewport is wide.
   */
  sizes?: string
  /** Crop to a fixed ratio (width / height), honouring the Studio hotspot. */
  aspect?: number
  /** Above the fold: skip lazy-loading and fetch it early. */
  priority?: boolean
  rounded?: boolean
}

/**
 * Every image on the site goes through here.
 *
 * Alt text is enforced by the schema, so it is trusted. A decorative image gets
 * alt="" and is hidden from assistive tech.
 */
export function Figure({
  image,
  className = '',
  imgClassName = '',
  sizes = '100vw',
  aspect,
  priority = false,
  rounded = true,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const props = imageProps(image, {aspect})

  if (!props) return null

  return (
    <figure className={`relative overflow-hidden ${rounded ? 'rounded-panel' : ''} ${className}`}>
      {/* The LQIP sits behind the image rather than on it, so it can fade out
          cleanly instead of showing through a partially-decoded JPEG. */}
      {props.lqip ? (
        <span
          aria-hidden
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{backgroundImage: `url(${props.lqip})`}}
        />
      ) : null}

      <img
        src={props.src}
        srcSet={props.srcSet}
        sizes={sizes}
        alt={image?.decorative ? '' : (image?.alt ?? '')}
        aria-hidden={image?.decorative || undefined}
        width={props.width}
        height={props.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        // Server-rendered images are often already complete before React
        // hydrates, so onLoad never fires — check on mount too.
        ref={(node) => {
          if (node?.complete) setLoaded(true)
        }}
        data-loaded={loaded ? 'true' : undefined}
        className={`relative h-full w-full object-cover ${
          priority ? '' : 'u-img-fade'
        } ${imgClassName}`}
      />

      {image?.caption ? (
        <figcaption className="mt-3 text-sm text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  )
}
