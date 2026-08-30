import type {FeatureListSection, FeatureItem, SiteSettings} from '~/types'
import {Figure} from '../ui/Figure'
import {Prose} from '../ui/Prose'
import {Button} from '../ui/Button'
import {Section as Wrapper, toneMuted, toneRule} from '../ui/Section'
import {opt} from '~/lib/stega'

/**
 * The workhorse. Four layouts over one shape, absorbing every repeating
 * "heading + body + image" run on the old site — Tree Surgery's eleven service
 * blocks, Forestry's five, Grounds Maintenance's four, Fencing's two.
 */
export function FeatureList({
  section,
  settings,
}: {
  section: FeatureListSection
  settings?: SiteSettings
}) {
  const {eyebrow, heading, intro, appearance} = section
  const layout = opt(section.layout) ?? 'alternating'
  const items = section.items ?? []
  const tone = opt(appearance?.tone)
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)
  const rule = toneRule(tone)
  const headingColor = onDark ? 'text-bone' : 'text-bark'
  const bodyColor = onDark ? 'text-bone/85' : 'text-ink'

  return (
    <Wrapper appearance={appearance}>
      {eyebrow || heading || intro ? (
        <div className={layout === 'numbered' ? 'mb-14 text-center' : 'mb-14 max-w-[60ch]'}>
          {eyebrow ? <p className={`u-eyebrow mb-4 ${muted}`}>{eyebrow}</p> : null}
          {heading ? <h2 className={`u-h2 ${headingColor}`}>{heading}</h2> : null}
          {intro ? <p className={`mt-5 text-lg ${muted}`}>{intro}</p> : null}
        </div>
      ) : null}

      {layout === 'alternating' ? (
        <div className="space-y-16 md:space-y-24">
          {items.map((item: FeatureItem, i: number) => {
            const flip = i % 2 === 1
            return (
              <div
                key={item._key ?? i}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div className={flip ? 'lg:order-2' : ''}>
                  <h3 className={`u-h4 ${headingColor}`}>{item.title}</h3>
                  <Prose value={item.body} className={`mt-4 ${bodyColor}`} />
                  {item.button?.label ? (
                    <div className="mt-6">
                      <Button cta={item.button} settings={settings} tone={tone} />
                    </div>
                  ) : null}
                </div>
                <Figure
                  image={item.image}
                  className={`aspect-[4/3] ${flip ? 'lg:order-1' : ''}`}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            )
          })}
        </div>
      ) : null}

      {layout === 'numbered' ? (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: FeatureItem, i: number) => (
            <div key={item._key ?? i}>
              <p className={`font-display text-2xl ${muted}`}>{String(i + 1).padStart(2, '0')}</p>
              <hr className={`my-5 border-t ${rule}`} />
              <h3 className={`font-display text-xl ${headingColor}`}>{item.title}</h3>
              <Prose value={item.body} className={`mt-3 text-sm ${muted}`} />
            </div>
          ))}
        </div>
      ) : null}

      {layout === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: FeatureItem, i: number) => (
            <article
              key={item._key ?? i}
              className={`overflow-hidden rounded-panel ${onDark ? 'bg-bone/10' : 'bg-lichen-soft'}`}
            >
              <Figure
                image={item.image}
                rounded={false}
                className="aspect-[4/3]"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
              <div className="p-6">
                <h3 className={`font-display text-xl ${headingColor}`}>{item.title}</h3>
                <Prose value={item.body} className={`mt-3 text-sm ${muted}`} />
                {item.button?.label ? (
                  <div className="mt-5">
                    <Button cta={item.button} settings={settings} tone={tone} />
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {layout === 'compact' ? (
        <dl className={`border-t ${rule}`}>
          {items.map((item: FeatureItem, i: number) => (
            <div key={item._key ?? i} className={`grid gap-4 border-b py-8 md:grid-cols-3 ${rule}`}>
              <dt className={`font-display text-xl ${headingColor}`}>{item.title}</dt>
              <dd className="md:col-span-2">
                <Prose value={item.body} className={bodyColor} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Wrapper>
  )
}
