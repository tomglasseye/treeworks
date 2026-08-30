import type {Appearance, Tone, Spacing} from '~/types'

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
export function Section({
  appearance,
  children,
  className = '',
  as: Tag = 'section',
}: {
  appearance?: Appearance
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'footer' | 'header'
}) {
  const tone = (appearance?.tone ?? 'bone') as Tone
  const spacing = (appearance?.spacing ?? 'normal') as Spacing

  return (
    <Tag
      id={appearance?.anchorId || undefined}
      data-tone={tone}
      className={`${TONE[tone] ?? TONE.bone} ${SPACING[spacing] ?? SPACING.normal} ${className}`}
    >
      <div className="u-container">{children}</div>
    </Tag>
  )
}

/** Muted text that stays legible on a dark panel. */
export function toneMuted(tone?: Tone) {
  return tone === 'bark' ? 'text-bone/70' : 'text-muted'
}

export function toneRule(tone?: Tone) {
  return tone === 'bark' ? 'border-bone/20' : 'border-rule'
}
