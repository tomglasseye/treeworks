import {useEffect, useRef, useState} from 'react'
import {Link, NavLink, useLocation} from 'react-router'
import type {Navigation, SiteSettings, NavItem} from '~/types'
import {Button, resolveHref, telHref} from './ui/Button'
import {formatAddress} from './sections/ContactDetails'

function PhoneIcon({className = ''}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}

export function Header({navigation, settings}: {navigation?: Navigation; settings?: SiteSettings}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const links: NavItem[] = navigation?.headerLinks ?? []
  // The bar shows the few flagged links; the overlay always shows everything.
  const barLinks = links.filter((l) => l.showInBar)
  const phone = settings?.phone

  // Close on navigation, so tapping a link in the overlay does the obvious thing.
  useEffect(() => setOpen(false), [location.pathname])

  // Lock the page behind the overlay and restore focus on close.
  useEffect(() => {
    if (!open) return
    const {overflow} = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
      toggleRef.current?.focus()
    }
  }, [open])

  return (
    // The overlay is a SIBLING of <header>, not a child. The header uses
    // backdrop-blur, and backdrop-filter creates a containing block for
    // fixed-position descendants — nesting the overlay inside clipped it to the
    // header's 80px instead of the viewport.
    <>
      <header className="sticky top-0 z-40 border-b border-rule/60 bg-bone/90 backdrop-blur-sm">
        <div className="u-container flex h-20 items-center gap-6">
          <Link to="/" className="shrink-0 font-display text-lg leading-tight text-bark no-underline md:text-xl">
            {settings?.businessName ?? 'Treeworks Cornwall'}
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex">
            {barLinks.map((item, i) => (
              <NavLink
                key={item._key ?? i}
                to={resolveHref({link: item.link}, settings)}
                className={({isActive}) =>
                  `whitespace-nowrap text-base no-underline transition-colors hover:text-canopy ${
                    isActive ? 'text-canopy' : 'text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={`flex items-center gap-3 ${barLinks.length ? '' : 'ml-auto'} lg:gap-5`}>
            {phone ? (
              <a
                href={telHref(phone)}
                className="hidden items-center gap-2 whitespace-nowrap text-base text-ink no-underline transition-colors hover:text-canopy md:inline-flex"
              >
                {phone}
                <PhoneIcon className="h-4 w-4" />
              </a>
            ) : null}

            {/* On phones the number collapses to just the icon — a tap target, not a line of text. */}
            {phone ? (
              <a
                href={telHref(phone)}
                aria-label={`Call ${settings?.phoneLabel ?? 'us'} on ${phone}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-rule text-ink md:hidden"
              >
                <PhoneIcon className="h-5 w-5" />
              </a>
            ) : null}

            <span className="hidden sm:inline-flex">
              <Button cta={navigation?.headerCta} settings={settings} />
            </span>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-input text-ink transition-colors hover:text-canopy"
            >
              <span className="sr-only">Open menu</span>
              <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>

      </header>

      <MenuOverlay
        open={open}
        onClose={() => setOpen(false)}
        links={links}
        navigation={navigation}
        settings={settings}
      />
    </>
  )
}

function MenuOverlay({
  open,
  onClose,
  links,
  navigation,
  settings,
}: {
  open: boolean
  onClose: () => void
  links: NavItem[]
  navigation?: Navigation
  settings?: SiteSettings
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const phone = settings?.phone

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  return (
    <div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      hidden={!open}
      className="fixed inset-0 z-50 bg-bark text-bone"
    >
      <div ref={panelRef} tabIndex={-1} className="flex h-full flex-col overflow-y-auto outline-none">
        <div className="u-container flex h-20 shrink-0 items-center justify-between">
          <Link to="/" onClick={onClose} className="font-display text-lg text-bone no-underline md:text-xl">
            {settings?.businessName ?? 'Treeworks Cornwall'}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-input text-bone transition-opacity hover:opacity-70"
          >
            <span className="sr-only">Close menu</span>
            <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="u-container flex flex-1 flex-col justify-center py-10">
          {phone ? (
            <a
              href={telHref(phone)}
              className="inline-flex w-fit items-center gap-3 font-display text-2xl text-bone no-underline transition-opacity hover:opacity-80 md:text-3xl"
            >
              {settings?.phoneLabel ? `Call ${settings.phoneLabel}: ` : 'Call '}
              {phone}
              <PhoneIcon className="h-6 w-6" />
            </a>
          ) : null}

          <nav aria-label="All pages" className="mt-10">
            <ul className="space-y-1">
              {links.map((item, i) => (
                <li key={item._key ?? i}>
                  <Link
                    to={resolveHref({link: item.link}, settings)}
                    onClick={onClose}
                    className="block py-2 text-lg text-bone/70 no-underline transition-colors hover:text-bone md:text-xl"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {navigation?.headerCta?.label ? (
            <div className="mt-10">
              <Button cta={navigation.headerCta} settings={settings} tone="bark" />
            </div>
          ) : null}

          <div className="mt-12 space-y-1 border-t border-bone/15 pt-8 text-sm text-bone/60">
            {settings?.email ? (
              <p>
                <a href={`mailto:${settings.email}`} className="text-bone/60 no-underline hover:text-bone">
                  {settings.email}
                </a>
              </p>
            ) : null}
            {settings?.address ? <address className="not-italic">{formatAddress(settings.address)}</address> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
