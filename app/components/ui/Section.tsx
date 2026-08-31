import type {Appearance, Tone, Spacing, Pattern} from '~/types'
import {Reveal} from './Reveal'
import {opt} from '~/lib/stega'

const TONE: Record<Tone, string> = {
  bone: 'bg-bone text-ink',
  lichen: 'bg-lichen text-bark',
  bark: 'bg-bark text-bone',
}

const SPACING: Record<Spacing, string> = {
  normal: 'py-20 md:py-section',
  tight: 'py-12 md:py-section-tight',
  none: 'py-0',
}

/**
 * Wraps every section. Reads `sectionAppearance` so editors control colour
 * rhythm and spacing from Studio without a developer.
 */
const GRAIN_VARIANTS = 4

/**
 * Pick a grain variant from a stable string.
 *
 * Deliberately NOT Math.random(): the server and the client have to agree or
 * React throws a hydration mismatch, and a genuinely random pick would also
 * reshuffle the texture on every reload. Hashing the section key gives variety
 * across a page while staying identical between renders.
 */
function grainVariant(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % GRAIN_VARIANTS) + 1
}

export function Section({
  appearance,
  children,
  className = '',
  as: Tag = 'section',
  reveal = true,
  grainSeed = '',
}: {
  appearance?: Appearance
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'footer' | 'header'
  /** Opt out where the section is already above the fold. */
  reveal?: boolean
  /** Stable string used to choose which grain variant this section gets. */
  grainSeed?: string
}) {
  // Cleaned: these index into the TONE/SPACING maps below.
  const tone = (opt(appearance?.tone) ?? 'bone') as Tone
  const spacing = (opt(appearance?.spacing) ?? 'normal') as Spacing
  const pattern = (opt(appearance?.pattern) ?? 'none') as Pattern

  return (
    <Tag
      id={opt(appearance?.anchorId) || undefined}
      data-tone={tone}
      className={`${TONE[tone] ?? TONE.bone} ${SPACING[spacing] ?? SPACING.normal} ${
        pattern === 'grain' ? 'u-grain-clip' : ''
      } ${className}`}
    >
      <div
        className={`u-container ${
          pattern === 'grain'
            ? `u-grain u-grain-${grainVariant(grainSeed || appearance?.anchorId || tone)}`
            : ''
        }`}
      >
        {reveal ? <Reveal>{children}</Reveal> : children}
      </div>
    </Tag>
  )
}

/** Muted text that stays legible on a dark panel. */
export function toneMuted(tone?: Tone) {
  return opt(tone) === 'bark' ? 'text-bone/70' : 'text-muted'
}

export function toneRule(tone?: Tone) {
  return opt(tone) === 'bark' ? 'border-bone/20' : 'border-rule'
}
