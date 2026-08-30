import {Link} from 'react-router'
import type {Cta, SiteSettings, Tone} from '~/types'

type Props = {
  cta?: Cta
  settings?: SiteSettings
  tone?: Tone
  className?: string
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-base transition-colors duration-200 no-underline'

function classesFor(variant: string, tone?: Tone) {
  const onDark = tone === 'bark'
  switch (variant) {
    case 'secondary':
      return onDark
        ? `${BASE} border border-bone/40 text-bone hover:bg-bone hover:text-bark`
        : `${BASE} border border-canopy text-canopy hover:bg-canopy hover:text-bone`
    case 'ghost':
      return onDark
        ? 'inline-flex items-center gap-2 text-bone underline underline-offset-4 hover:text-lichen'
        : 'inline-flex items-center gap-2 text-canopy underline underline-offset-4 hover:text-bark'
    default:
      return onDark
        ? `${BASE} bg-bone text-bark hover:bg-lichen`
        : `${BASE} bg-bark text-bone hover:bg-bark-soft`
  }
}

/**
 * Resolves the link. A tel:/mailto: link left blank in Studio falls back to the
 * number or address in Site Settings — that is the "change it once" promise.
 */
export function resolveHref(cta?: Cta, settings?: SiteSettings): string {
  const link = cta?.link
  if (!link) return '#'

  if (link.needsSiteContact) {
    if (link.kind === 'tel' && settings?.phone) return telHref(settings.phone)
    if (link.kind === 'email' && settings?.email) return `mailto:${settings.email}`
  }

  // GROQ has no string-replace in this API version, so tel: hrefs arrive with
  // the number formatted for reading. Strip the spaces here instead.
  if (link.href?.startsWith('tel:')) return telHref(link.href.slice(4))

  return link.href || '#'
}

/** "07880 335025" -> "tel:07880335025" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function Button({cta, settings, tone, className = ''}: Props) {
  if (!cta?.label) return null

  const href = resolveHref(cta, settings)
  const classes = `${classesFor(cta.variant ?? 'primary', tone)} ${className}`
  const isInternal = href.startsWith('/') && !href.startsWith('//')

  if (isInternal) {
    return (
      <Link to={href} className={classes}>
        {cta.label}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={classes}
      {...(cta.link?.newTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
    >
      {cta.label}
    </a>
  )
}

export function ButtonRow({
  buttons,
  settings,
  tone,
  className = '',
}: {
  buttons?: Cta[]
  settings?: SiteSettings
  tone?: Tone
  className?: string
}) {
  if (!buttons?.length) return null
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {buttons.map((cta, i) => (
        <Button key={cta._key ?? i} cta={cta} settings={settings} tone={tone} />
      ))}
    </div>
  )
}
