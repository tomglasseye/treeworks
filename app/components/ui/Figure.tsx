import type {SanityImage} from '~/types'
import {urlFor, srcSetFor} from '~/sanity/image'

type Props = {
  image?: SanityImage
  className?: string
  imgClassName?: string
  sizes?: string
  width?: number
  priority?: boolean
  rounded?: boolean
}

/**
 * Alt text is enforced in the schema, so it is trusted here. A decorative image
 * gets alt="" and is hidden from assistive tech.
 */
export function Figure({
  image,
  className = '',
  imgClassName = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  width = 1440,
  priority = false,
  rounded = true,
}: Props) {
  if (!image?.asset && !image?.url) return null

  const src = image.asset ? urlFor(image as never).width(width).url() : image.url!
  const srcSet = image.asset ? srcSetFor(image as never) : undefined
  const ratio = image.dimensions?.aspectRatio

  return (
    <figure className={className}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={image.decorative ? '' : (image.alt ?? '')}
        aria-hidden={image.decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        width={image.dimensions?.width}
        height={image.dimensions?.height}
        style={{
          aspectRatio: ratio ? String(ratio) : undefined,
          backgroundImage: image.lqip ? `url(${image.lqip})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className={`h-full w-full object-cover ${rounded ? 'rounded-panel' : ''} ${imgClassName}`}
      />
      {image.caption ? (
        <figcaption className="mt-3 text-sm text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  )
}
