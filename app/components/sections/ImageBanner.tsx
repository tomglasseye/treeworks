import type {ImageBannerSection} from '~/types'
import {Figure} from '../ui/Figure'

const HEIGHTS: Record<string, string> = {
  short: 'h-[32vh] min-h-[16rem]',
  medium: 'h-[52vh] min-h-[22rem]',
  tall: 'h-[76vh] min-h-[30rem]',
}

export function ImageBanner({section}: {section: ImageBannerSection}) {
  const {image, height = 'medium', overlayText, appearance} = section

  return (
    <section id={appearance?.anchorId} className="bg-bone py-4">
      <div className="u-container">
        <div className="relative overflow-hidden rounded-panel">
          <Figure
            image={image}
            rounded={false}
            width={2000}
            sizes="100vw"
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
    </section>
  )
}
