import type {StatementSection, SiteSettings} from '~/types'
import {Prose} from '../ui/Prose'
import {ButtonRow} from '../ui/Button'
import {Section as Wrapper} from '../ui/Section'
import {opt} from '~/lib/stega'

/**
 * Asymmetric: small lead-in left, large serif statement right with italic
 * emphasis carried by the `em` mark.
 */
export function Statement({section, settings}: {section: StatementSection; settings?: SiteSettings}) {
  const {leadIn, statement, buttons, appearance} = section
  const onDark = opt(appearance?.tone) === 'bark'

  return (
    <Wrapper appearance={appearance}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {leadIn ? (
          <p
            className={`text-base lg:col-span-4 ${onDark ? 'text-bone/70' : 'text-muted'}`}
          >
            {leadIn}
          </p>
        ) : null}
        <div className={leadIn ? 'lg:col-span-8' : 'lg:col-span-10 lg:col-start-2'}>
          <Prose
            value={statement}
            className={`u-h3 font-display [&_p]:mt-0 ${onDark ? 'text-bone' : 'text-bark'}`}
          />
          <ButtonRow
            buttons={buttons}
            settings={settings}
            tone={appearance?.tone}
            className="mt-8"
          />
        </div>
      </div>
    </Wrapper>
  )
}
