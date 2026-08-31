import {useEffect, useRef} from 'react'

/**
 * Reveals children once they scroll into view.
 *
 * Deliberately small: one shared IntersectionObserver, no animation library, and
 * it unobserves after the first reveal so nothing keeps running as you scroll.
 * If motion is reduced — or the observer is unavailable — everything is shown at
 * once and no transition is applied.
 */
let observer: IntersectionObserver | null = null

function getObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        ;(entry.target as HTMLElement).dataset.revealed = 'true'
        observer?.unobserve(entry.target)
      }
    },
    // Hold off until the element is meaningfully on screen. Firing early meant
    // the animation finished before it was in view — technically running, but
    // invisible, which is the same as not having it.
    {rootMargin: '0px 0px -22% 0px', threshold: 0.1},
  )
  return observer
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: React.ReactNode
  /** Stagger, in ms. Keep under ~400ms total or it starts to read as lag. */
  delay?: number
  as?: 'div' | 'li' | 'article' | 'section'
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const obs = getObserver()

    if (reduced || !obs) {
      node.dataset.revealed = 'skip'
      return
    }

    obs.observe(node)
    return () => obs.unobserve(node)
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`u-reveal ${className}`}
      style={delay ? ({'--reveal-delay': `${delay}ms`} as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
