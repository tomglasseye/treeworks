import {useEffect, useState} from 'react'
import {Studio} from 'sanity'
import config from '../../sanity.config'

export function meta() {
  return [{title: 'Studio — Treeworks Cornwall'}, {name: 'robots', content: 'noindex, nofollow'}]
}

// Studio is browser-only: it touches window during module init, so it mounts
// after hydration rather than server-rendering.
export default function StudioRoute() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    // Studio lays itself out with `flex: 1 1 0%` and `height: 100%` all the way
    // down, which needs ONE definite height at the top or the whole chain
    // collapses to content height — which is why the Presentation preview came
    // out ~150px tall. 100dvh rather than 100vh so mobile browser chrome does
    // not push the bottom of the Studio off-screen.
    <div style={{height: '100dvh', overflow: 'hidden'}}>
      {mounted ? (
        <Studio config={config} />
      ) : (
        <div style={{display: 'grid', placeItems: 'center', height: '100%', fontFamily: 'system-ui'}}>
          Loading Studio…
        </div>
      )}
    </div>
  )
}
