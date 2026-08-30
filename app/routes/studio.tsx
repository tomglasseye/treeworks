import {useEffect, useState} from 'react'
import {Studio} from 'sanity'
import config from '../../sanity.config'

export function meta() {
  return [{title: 'Studio — Treeworks Cornwall'}, {name: 'robots', content: 'noindex, nofollow'}]
}

// Studio is browser-only: it touches window during module init, so it is
// mounted after hydration rather than server-rendered.
export default function StudioRoute() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div style={{display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'system-ui'}}>
        Loading Studio…
      </div>
    )
  }

  return <Studio config={config} />
}
