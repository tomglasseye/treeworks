import {useState} from 'react'
import {Link, NavLink} from 'react-router'
import type {Navigation, SiteSettings} from '~/types'
import {Button, resolveHref} from './ui/Button'

export function Header({
  navigation,
  settings,
}: {
  navigation?: Navigation
  settings?: SiteSettings
}) {
  const [open, setOpen] = useState(false)
  const links = navigation?.headerLinks ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-rule/60 bg-bone/90 backdrop-blur-sm">
      <div className="u-container flex h-20 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl text-bark no-underline">
          {settings?.businessName ?? 'Treeworks Cornwall'}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map((item, i) => (
            <NavLink
              key={item._key ?? i}
              to={resolveHref({link: item.link}, settings)}
              className={({isActive}) =>
                `text-base no-underline transition-colors hover:text-canopy ${
                  isActive ? 'text-canopy' : 'text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {settings?.phone ? (
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="text-base text-ink no-underline transition-colors hover:text-canopy"
            >
              {settings.phone}
            </a>
          ) : null}
          <Button cta={navigation?.headerCta} settings={settings} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="rounded-input p-2 lg:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden className="block text-2xl leading-none">
            {open ? '×' : '☰'}
          </span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-rule/60 lg:hidden">
          <div className="u-container flex flex-col gap-1 py-4">
            {links.map((item, i) => (
              <Link
                key={item._key ?? i}
                to={resolveHref({link: item.link}, settings)}
                onClick={() => setOpen(false)}
                className="py-3 text-lg text-ink no-underline"
              >
                {item.label}
              </Link>
            ))}
            {settings?.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="py-3 font-display text-xl text-bark no-underline"
              >
                {settings.phone}
              </a>
            ) : null}
            <div className="pt-3">
              <Button cta={navigation?.headerCta} settings={settings} />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
