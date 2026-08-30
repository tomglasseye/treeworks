import type {HeroSection, SiteSettings} from '~/types'
import {Figure} from '../ui/Figure'
import {ButtonRow} from '../ui/Button'
import {Section as Wrapper} from '../ui/Section'
import {opt} from '~/lib/stega'

/**
 * Three layouts. `full` is the Solterra move: a full-bleed image inset from the
 * viewport with a panel radius, so the page ground frames the photograph.
 */
export function Hero({section, settings}: {section: HeroSection; settings?: SiteSettings}) {
  const {eyebrow, heading, standfirst, image, buttons, appearance} = section
  const layout = opt(section.layout) ?? 'full'

  if (layout === 'full') {
    // The height lives on the container, not the image. Otherwise a hero with no
    // image yet collapses to nothing and paints bone-coloured text on a bone
    // background — invisible. Falling back to the dark panel keeps it legible.
    const hasImage = Boolean(image?.asset ?? image?.url)

    return (
      <section id={opt(appearance?.anchorId)} className="bg-bone pt-4">
        <div className="u-container">
          <div
            className={`relative h-[60vh] min-h-[26rem] overflow-hidden rounded-panel md:h-[78vh] ${
              hasImage ? '' : 'bg-bark'
            }`}
          >
            {hasImage ? (
              <>
                <Figure
                  image={image}
                  priority
                  width={2000}
                  sizes="100vw"
                  rounded={false}
                  className="absolute inset-0 h-full w-full"
                />
                {/*
                  Two scrims, not one. Editors upload whatever photo they have,
                  and a bright one (sunlit canopy, snow, pale sky) leaves white
                  display type barely legible. The vertical scrim anchors the
                  bottom where the text sits; the horizontal one protects the
                  left column on wide screens while leaving the right of the
                  image visible.
                */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-bark/90 via-bark/45 to-bark/15"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-bark/70 via-bark/20 to-transparent md:to-transparent"
                />
              </>
            ) : null}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-6 pb-10 md:p-14 md:pb-16">
                {eyebrow ? <p className="u-eyebrow mb-4 text-bone/80">{eyebrow}</p> : null}
                <h1 className="u-display max-w-[18ch] text-bone">{heading}</h1>
                {standfirst ? (
                  <p className="mt-5 max-w-[52ch] text-lg text-bone/85">{standfirst}</p>
                ) : null}
                <ButtonRow buttons={buttons} settings={settings} tone="bark" className="mt-8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'text') {
    return (
      <Wrapper appearance={appearance}>
        <div className="max-w-[24ch]">
          {eyebrow ? <p className="u-eyebrow mb-4 text-muted">{eyebrow}</p> : null}
          <h1 className="u-display text-bark">{heading}</h1>
        </div>
        {standfirst ? <p className="mt-6 max-w-[56ch] text-lg text-muted">{standfirst}</p> : null}
        <ButtonRow buttons={buttons} settings={settings} className="mt-8" />
      </Wrapper>
    )
  }

  // split
  return (
    <Wrapper appearance={appearance}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          {eyebrow ? <p className="u-eyebrow mb-4 text-muted">{eyebrow}</p> : null}
          <h1 className="u-display text-bark">{heading}</h1>
          {standfirst ? <p className="mt-6 max-w-[48ch] text-lg text-muted">{standfirst}</p> : null}
          <ButtonRow buttons={buttons} settings={settings} className="mt-8" />
        </div>
        <Figure
          image={image}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/5] lg:aspect-[4/3]"
        />
      </div>
    </Wrapper>
  )
}
