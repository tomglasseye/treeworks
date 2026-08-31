import type {FaqSection} from '~/types'
import {Prose} from '../ui/Prose'
import {Section as Wrapper, toneRule} from '../ui/Section'
import {opt} from '~/lib/stega'
import {stegaClean} from '@sanity/client/stega'
import {Reveal} from '../ui/Reveal'

function toPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((b) =>
      b && typeof b === 'object' && 'children' in b && Array.isArray((b as never)['children'])
        ? ((b as {children: {text?: string}[]}).children ?? []).map((c) => c.text ?? '').join('')
        : '',
    )
    .join(' ')
    .trim()
}

export function Faq({section}: {section: FaqSection}) {
  const {heading, emitStructuredData, appearance} = section
  const items = section.items ?? []
  const tone = opt(appearance?.tone)
  const onDark = tone === 'bark'
  const rule = toneRule(tone)

  const jsonLd =
    emitStructuredData && items.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((i) => ({
            '@type': 'Question',
            name: stegaClean(i.question),
            acceptedAnswer: {'@type': 'Answer', text: stegaClean(toPlainText(i.answer))},
          })),
        }
      : null

  return (
    <Wrapper appearance={appearance} grainSeed={section._key} reveal={false}>
      <div className="mx-auto max-w-[76ch]">
        {heading ? (
          <h2 className={`u-h2 mb-12 text-center ${onDark ? 'text-bone' : 'text-bark'}`}>
            {heading}
          </h2>
        ) : null}

        <div className={`border-t ${rule}`}>
          {items.map((it, i) => {
            return (
              <Reveal key={it._key ?? i} delay={Math.min(i, 5) * 60}>
              <details className={`group border-b ${rule}`}>
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-display marker:hidden ${
                    onDark ? 'text-bone' : 'text-bark'
                  }`}
                >
                  {it.question}
                  <span
                    aria-hidden
                    className="shrink-0 text-2xl leading-none transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-6">
                  <Prose
                    value={it.answer}
                    className={onDark ? 'text-bone/85' : 'text-ink'}
                  />
                </div>
              </details>
              </Reveal>
            )
          })}
        </div>
      </div>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      ) : null}
    </Wrapper>
  )
}
