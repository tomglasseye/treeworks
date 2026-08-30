import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/react'
import {Link} from 'react-router'
import {Figure} from './Figure'
import type {SanityImage} from '~/types'

const components: PortableTextComponents = {
  types: {
    figure: ({value}: {value: SanityImage}) => (
      <Figure image={value} className="my-8" sizes="(min-width: 768px) 720px, 100vw" />
    ),
  },
  marks: {
    link: ({value, children}) => {
      const href: string = value?.link?.href ?? '#'
      if (href.startsWith('/') && !href.startsWith('//')) {
        return <Link to={href}>{children}</Link>
      }
      return (
        <a
          href={href}
          {...(value?.link?.newTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        >
          {children}
        </a>
      )
    },
    em: ({children}) => <em className="font-display italic">{children}</em>,
  },
}

export function Prose({
  value,
  className = '',
}: {
  value?: PortableTextBlock[] | null
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={`u-prose ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  )
}
