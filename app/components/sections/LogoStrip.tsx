import type {LogoStripSection} from '~/types'
import {Figure} from '../ui/Figure'
import {Section as Wrapper} from '../ui/Section'
import {opt} from '~/lib/stega'
import {Reveal} from '../ui/Reveal'

export function LogoStrip({section}: {section: LogoStripSection}) {
  const {heading, appearance} = section
  const logos = section.logos ?? []
  const onDark = opt(appearance?.tone) === 'bark'

  return (
    <Wrapper appearance={appearance} grainSeed={section._key} reveal={false}>
      {heading ? (
        <h2 className={`u-h3 mb-12 text-center ${onDark ? 'text-bone' : 'text-bark'}`}>
          {heading}
        </h2>
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
        {logos.map((l, i) => {
          const img = (
            <Figure
              image={l.image}
              rounded={false}
              sizes="200px"
              className="h-14 w-auto"
              imgClassName={`h-14 w-auto object-contain ${onDark ? 'brightness-0 invert' : ''}`}
            />
          )
          return (
            <Reveal key={l._key ?? i} as="li" delay={Math.min(i, 5) * 80} className="list-none">
              {l.link?.href ? (
                <a href={l.link.href} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
            </Reveal>
          )
        })}
      </ul>
    </Wrapper>
  )
}
