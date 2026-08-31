import type {StatsSection} from '~/types'
import {Section as Wrapper, toneMuted} from '../ui/Section'
import {opt} from '~/lib/stega'
import {Reveal} from '../ui/Reveal'

export function Stats({section}: {section: StatsSection}) {
  const {heading, appearance} = section
  const items = section.items ?? []
  const tone = opt(appearance?.tone)
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)

  return (
    <Wrapper appearance={appearance} grainSeed={section._key} reveal={false}>
      {heading ? (
        <h2 className={`u-h3 mb-12 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
      ) : null}
      <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => {
          return (
            <Reveal key={s._key ?? i} delay={Math.min(i, 3) * 110}>
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
            </Reveal>
          )
        })}
      </dl>
    </Wrapper>
  )
}
