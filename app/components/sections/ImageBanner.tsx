import type {ImageBannerSection} from '~/types'
import {Figure} from '../ui/Figure'
import {Section as Wrapper} from '../ui/Section'

const HEIGHTS: Record<string, string> = {
  short: 'h-[32vh] min-h-[16rem]',
  medium: 'h-[52vh] min-h-[22rem]',
  tall: 'h-[76vh] min-h-[30rem]',
}

export function ImageBanner({section}: {section: ImageBannerSection}) {
  const {image, height = 'medium', overlayText, appearance} = section

  return (
    // Section's own spacing presets (py-12 and up) are all bigger than the
    // 16px break this banner is meant to be, so the gap is kept on an inner
    // wrapper instead — that leaves the outer section at 'none' (py-0) with
    // nothing conflicting on the same element, while still honouring an
    // editor's explicit spacing choice if they've set one.
    <Wrapper appearance={{...appearance, spacing: appearance?.spacing ?? 'none'}} grainSeed={section._key}>
      <div className="py-4">
        <div className="relative overflow-hidden rounded-panel">
          <Figure
            image={image}
            rounded={false}
            sizes="(min-width: 1536px) 1400px, 100vw"
            className={HEIGHTS[height] ?? HEIGHTS.medium}
          />
          {overlayText ? (
            <>
              <div aria-hidden className="absolute inset-0 bg-bark/35" />
              <p className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <span className="u-h3 max-w-[22ch] font-display text-bone">{overlayText}</span>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </Wrapper>
  )
}
