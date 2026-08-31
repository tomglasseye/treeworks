import type {TextWithImageSection, SiteSettings} from '~/types'
import {Figure} from '../ui/Figure'
import {Prose} from '../ui/Prose'
import {ButtonRow} from '../ui/Button'
import {Section as Wrapper} from '../ui/Section'
import {opt} from '~/lib/stega'

export function TextWithImage({section, settings}: {section: TextWithImageSection; settings?: SiteSettings}) {
  const {eyebrow, heading, body, image, buttons, appearance} = section
  const onDark = opt(appearance?.tone) === 'bark'
  const imageFirst = opt(section.imagePosition) === 'left'

  return (
    <Wrapper appearance={appearance} grainSeed={section._key}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={imageFirst ? 'lg:order-2' : ''}>
          {eyebrow ? (
            <p className={`u-eyebrow mb-4 ${onDark ? 'text-bone/70' : 'text-muted'}`}>{eyebrow}</p>
          ) : null}
          <h2 className={`u-h3 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
          <Prose value={body} className={`mt-5 ${onDark ? 'text-bone/85' : 'text-ink'}`} />
          <ButtonRow
            buttons={buttons}
            settings={settings}
            tone={appearance?.tone}
            className="mt-8"
          />
        </div>
        <Figure
          image={image}
          aspect={4 / 3}
          className={`aspect-[4/3] ${imageFirst ? 'lg:order-1' : ''}`}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </Wrapper>
  )
}
