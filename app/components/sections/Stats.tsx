import type {StatsSection} from '~/types'
import {Section as Wrapper, toneMuted} from '../ui/Section'

export function Stats({section}: {section: StatsSection}) {
  const {heading, appearance} = section
  const items = section.items ?? []
  const tone = appearance?.tone
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)

  return (
    <Wrapper appearance={appearance}>
      {heading ? (
        <h2 className={`u-h3 mb-12 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
      ) : null}
      <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => {
          return (
            <div key={s._key ?? i}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span
                  className={`block font-display text-3xl md:text-4xl ${
                    onDark ? 'text-bone' : 'text-bark'
                  }`}
                >
                  {s.value}
                </span>
                <span className={`mt-2 block text-sm ${muted}`}>{s.label}</span>
              </dd>
            </div>
          )
        })}
      </dl>
    </Wrapper>
  )
}
