import type {ContactDetailsSection, SiteSettings, Address} from '~/types'
import {Section as Wrapper, toneMuted} from '../ui/Section'

export function formatAddress(address?: Address): string {
  if (!address) return ''
  return [address.line1, address.line2, address.town, address.county, address.postcode]
    .filter(Boolean)
    .join(', ')
}

export function ContactDetails({
  section,
  settings,
}: {
  section: ContactDetailsSection
  settings?: SiteSettings
}) {
  const {heading, showPhone = true, showEmail = true, showAddress = true, showSocials = true, appearance} =
    section
  const tone = appearance?.tone
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)
  const linkClass = `no-underline transition-opacity hover:opacity-70 ${
    onDark ? 'text-bone' : 'text-bark'
  }`

  return (
    <Wrapper appearance={appearance}>
      {heading ? (
        <h2 className={`u-h3 mb-12 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
      ) : null}

      <dl className="grid gap-10 md:grid-cols-3">
        {showPhone && settings?.phone ? (
          <div>
            <dt className={`u-eyebrow mb-3 ${muted}`}>Telephone</dt>
            <dd>
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className={`text-xl font-display ${linkClass}`}>
                {settings.phone}
              </a>
              {settings.phoneLabel ? (
                <span className={`ml-2 text-sm ${muted}`}>({settings.phoneLabel})</span>
              ) : null}
              {settings.secondaryPhone ? (
                <div className="mt-2">
                  <a
                    href={`tel:${settings.secondaryPhone.replace(/\s/g, '')}`}
                    className={`text-xl font-display ${linkClass}`}
                  >
                    {settings.secondaryPhone}
                  </a>
                  {settings.secondaryPhoneLabel ? (
                    <span className={`ml-2 text-sm ${muted}`}>({settings.secondaryPhoneLabel})</span>
                  ) : null}
                </div>
              ) : null}
            </dd>
          </div>
        ) : null}

        {showEmail && settings?.email ? (
          <div>
            <dt className={`u-eyebrow mb-3 ${muted}`}>Email</dt>
            <dd>
              <a href={`mailto:${settings.email}`} className={`break-words text-xl font-display ${linkClass}`}>
                {settings.email}
              </a>
            </dd>
          </div>
        ) : null}

        {showAddress && settings?.address ? (
          <div>
            <dt className={`u-eyebrow mb-3 ${muted}`}>Address</dt>
            <dd className={onDark ? 'text-bone/85' : 'text-ink'}>
              <address className="not-italic">{formatAddress(settings.address)}</address>
            </dd>
          </div>
        ) : null}
      </dl>

      {showSocials && (settings?.instagramHandle || settings?.facebookUrl) ? (
        <ul className="mt-12 flex gap-6">
          {settings.instagramHandle ? (
            <li>
              <a
                href={`https://instagram.com/${settings.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Instagram
              </a>
            </li>
          ) : null}
          {settings.facebookUrl ? (
            <li>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Facebook
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </Wrapper>
  )
}
