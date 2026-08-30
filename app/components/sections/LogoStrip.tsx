import type {LogoStripSection} from '~/types'
import {Figure} from '../ui/Figure'
import {Section as Wrapper} from '../ui/Section'

export function LogoStrip({section}: {section: LogoStripSection}) {
  const {heading, logos = [], appearance} = section
  const onDark = appearance?.tone === 'bark'

  return (
    <Wrapper appearance={appearance}>
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
              width={320}
              sizes="200px"
              className="h-14 w-auto"
              imgClassName={`h-14 w-auto object-contain ${onDark ? 'brightness-0 invert' : ''}`}
            />
          )
          return (
            <li key={l._key ?? i} title={l.name}>
              {l.link?.href ? (
                <a href={l.link.href} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          )
        })}
      </ul>
    </Wrapper>
  )
}
