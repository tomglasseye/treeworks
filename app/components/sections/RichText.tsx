import type {RichTextSection} from '~/types'
import {Prose} from '../ui/Prose'
import {Section as Wrapper} from '../ui/Section'

export function RichText({section}: {section: RichTextSection}) {
  const {heading, body, width = 'narrow', appearance} = section
  const onDark = appearance?.tone === 'bark'

  return (
    <Wrapper appearance={appearance}>
      <div className={width === 'narrow' ? 'max-w-[68ch]' : 'max-w-[90ch]'}>
        {heading ? (
          <h2 className={`u-h3 mb-6 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
        ) : null}
        <Prose value={body} className={onDark ? 'text-bone/85' : 'text-ink'} />
      </div>
    </Wrapper>
  )
}
