import imageUrlBuilder from '@sanity/image-url'
import {client} from './client'

const builder = imageUrlBuilder(client)

// Derived from the builder rather than imported: the type's module path has
// moved between @sanity/image-url majors, this never breaks.
type ImageSource = Parameters<typeof builder.image>[0]

export function urlFor(source: ImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/** Width-descriptor srcset for a responsive <img>. */
export function srcSetFor(source: ImageSource, widths: number[] = [480, 768, 1024, 1440, 1920]) {
  return widths.map((w) => `${urlFor(source).width(w).url()} ${w}w`).join(', ')
}
