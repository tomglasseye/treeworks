import {Link} from 'react-router'
import type {Navigation, SiteSettings} from '~/types'
import {resolveHref} from './ui/Button'
import {formatAddress} from './sections/ContactDetails'

export function Footer({
  navigation,
  settings,
}: {
  navigation?: Navigation
  settings?: SiteSettings
}) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-bark text-bone">
      <div className="u-container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl">{settings?.businessName ?? 'Treeworks Cornwall'}</p>
            {settings?.tagline ? (
              <p className="mt-3 max-w-[30ch] text-sm text-bone/70">{settings.tagline}</p>
            ) : null}
          </div>

          {(navigation?.footerColumns ?? []).map((column, i) => (
            <nav key={column._key ?? i} aria-label={column.heading ?? undefined}>
              {column.heading ? (
                <h2 className="u-eyebrow mb-4 text-bone/60">{column.heading}</h2>
              ) : null}
              <ul className="space-y-2.5">
                {(column.links ?? []).map((link, j) => (
                  <li key={link._key ?? j}>
                    <Link
                      to={resolveHref({link: link.link}, settings)}
                      className="text-sm text-bone/85 no-underline transition-colors hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="u-eyebrow mb-4 text-bone/60">Get in touch</h2>
            <ul className="space-y-2.5 text-sm">
              {settings?.phone ? (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="text-bone/85 no-underline hover:text-bone"
                  >
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings?.email ? (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-words text-bone/85 no-underline hover:text-bone"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings?.address ? (
                <li>
                  <address className="not-italic text-bone/70">
                    {formatAddress(settings.address)}
                  </address>
                </li>
              ) : null}
            </ul>

            <ul className="mt-5 flex gap-4 text-sm">
              {settings?.instagramHandle ? (
                <li>
                  <a
                    href={`https://instagram.com/${settings.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bone/85 no-underline hover:text-bone"
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
              {settings?.facebookUrl ? (
                <li>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bone/85 no-underline hover:text-bone"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bone/15 pt-8 text-sm text-bone/60 md:flex-row md:items-center md:justify-between">
          <p>
            {settings?.businessName ?? 'Treeworks Cornwall'} &copy;{year}
            {settings?.companyNumber ? ` | Company Number: ${settings.companyNumber}` : ''}
          </p>
          <ul className="flex flex-wrap gap-5">
            {(navigation?.legalLinks ?? []).map((link, i) => (
              <li key={link._key ?? i}>
                <Link
                  to={resolveHref({link: link.link}, settings)}
                  className="text-bone/60 no-underline hover:text-bone"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
