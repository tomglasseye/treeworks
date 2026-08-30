import type {FaqSection} from '~/types'
import {Prose} from '../ui/Prose'
import {Section as Wrapper, toneRule} from '../ui/Section'

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
  const {heading, items = [], emitStructuredData, appearance} = section
  const tone = appearance?.tone
  const onDark = tone === 'bark'
  const rule = toneRule(tone)

  const jsonLd =
    emitStructuredData && items.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: {'@type': 'Answer', text: toPlainText(i.answer)},
          })),
        }
      : null

  return (
    <Wrapper appearance={appearance}>
      <div className="mx-auto max-w-[76ch]">
        {heading ? (
          <h2 className={`u-h2 mb-12 text-center ${onDark ? 'text-bone' : 'text-bark'}`}>
            {heading}
          </h2>
        ) : null}

        <div className={`border-t ${rule}`}>
          {items.map((it, i) => {
            return (
              <details key={it._key ?? i} className={`group border-b ${rule}`}>
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
