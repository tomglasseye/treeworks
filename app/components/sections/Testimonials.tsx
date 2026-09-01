import type {TestimonialsSection, Testimonial} from '~/types'
import {Section as Wrapper, toneMuted} from '../ui/Section'
import {opt} from '~/lib/stega'
import {Reveal} from '../ui/Reveal'

function Stars({rating}: {rating?: number}) {
  if (!rating) return null
  return (
    <p className="mb-4 text-sap-ink" aria-label={`${rating} out of 5`}>
      <span aria-hidden>{'★'.repeat(rating)}</span>
    </p>
  )
}

function formatDate(date?: string) {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})
}

export function Testimonials({section}: {section: TestimonialsSection}) {
  const {heading, limit, appearance} = section
  const layout = opt(section.layout) ?? 'grid'
  const mode = opt(section.mode)
  const items = section.items ?? []
  const tone = opt(appearance?.tone)
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)

  const list: Testimonial[] = mode === 'selected' ? items : items.slice(0, limit ?? 6)
  if (!list.length) return null

  if (layout === 'single') {
    const t = list[0]
    return (
      <Wrapper appearance={appearance} grainSeed={section._key}>
        <blockquote className="mx-auto max-w-[46ch] text-center">
          <Stars rating={t.rating} />
          <p className={`u-h3 font-display ${onDark ? 'text-bone' : 'text-bark'}`}>
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className={`mt-6 text-sm ${muted}`}>
            {t.author}
            {t.location ? `, ${t.location}` : ''}
          </footer>
        </blockquote>
      </Wrapper>
    )
  }

  return (
    <Wrapper appearance={appearance} grainSeed={section._key} reveal={false}>
      {heading ? (
        <Reveal>
          <h2 className={`u-h2 mb-14 text-center ${onDark ? 'text-bone' : 'text-bark'}`}>
            {heading}
          </h2>
        </Reveal>
      ) : null}
      <div
        className={
          layout === 'carousel'
            ? 'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]'
            : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
        }
      >
        {list.map((t, i) => (
          <Reveal
            key={t._id ?? i}
            as="figure"
            delay={Math.min(i, 3) * 110}
            className={`rounded-panel p-6 ${
              layout === 'carousel' ? 'w-[85vw] shrink-0 snap-start md:w-[24rem]' : ''
            } ${onDark ? 'bg-bone/10' : 'bg-lichen-soft'}`}
          >
            <Stars rating={t.rating} />
            <blockquote
              className={`font-display text-lg ${onDark ? 'text-bone' : 'text-bark'}`}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className={`mt-5 text-sm ${muted}`}>
              <span className="block">{t.author}</span>
              {t.location ? <span className="block">{t.location}</span> : null}
              {formatDate(t.date) ? (
                <time dateTime={t.date} className="mt-1 block opacity-70">
                  {formatDate(t.date)}
                </time>
              ) : null}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </Wrapper>
  )
}
