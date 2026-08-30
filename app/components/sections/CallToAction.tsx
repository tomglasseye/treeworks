import type {CallToActionSection, SiteSettings} from '~/types'
import {ButtonRow} from '../ui/Button'

/**
 * The band that was hand-repeated on nine of the eleven old pages.
 * `urgent` covers the separate 24-hour emergency call-out block.
 */
export function CallToAction({section, settings}: {section: CallToActionSection; settings?: SiteSettings}) {
  const {heading, body, buttons, tone = 'standard', showPhone, appearance} = section
  const urgent = tone === 'urgent'
  const phone = settings?.emergencyPhone || settings?.phone

  const panel = urgent
    ? 'bg-sap text-bone'
    : appearance?.tone === 'bark'
      ? 'bg-bark text-bone'
      : 'bg-lichen text-bark'

  return (
    <section id={appearance?.anchorId} className="bg-bone py-12 md:py-section-tight">
      <div className="u-container">
        <div className={`rounded-panel px-6 py-12 md:px-14 md:py-16 ${panel}`}>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div>
              {urgent ? (
                <p className="u-eyebrow mb-4 text-bone/80">24 hours a day, 365 days a year</p>
              ) : null}
              <h2 className={`u-h3 max-w-[24ch] ${urgent ? 'text-bone' : ''}`}>{heading}</h2>
              {body ? (
                <p
                  className={`mt-5 max-w-[62ch] ${
                    urgent ? 'text-bone/85' : appearance?.tone === 'bark' ? 'text-bone/80' : 'text-bark/75'
                  }`}
                >
                  {body}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              {showPhone && phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className={`font-display text-3xl no-underline transition-opacity hover:opacity-80 ${
                    urgent ? 'text-bone' : 'text-bark'
                  }`}
                >
                  {phone}
                </a>
              ) : null}
              <ButtonRow
                buttons={buttons}
                settings={settings}
                tone={urgent || appearance?.tone === 'bark' ? 'bark' : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
