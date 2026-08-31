import {useEffect} from 'react'
import {useNavigate, useRevalidator} from 'react-router'
import {enableVisualEditing} from '@sanity/visual-editing'
import {useLiveMode} from '~/sanity/loader'
import {client} from '~/sanity/client'

/**
 * Mounted only in draft mode. Two jobs:
 *  - overlays: click a heading in the preview, land on that field in the Studio
 *  - live mode: content updates stream in without a refresh
 *
 * `history` is wired to the router so navigating inside the Presentation iframe
 * keeps the Studio's URL bar in step, and vice versa.
 */
export function VisualEditing() {
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  useEffect(() => {
    const disable = enableVisualEditing({
      history: {
        subscribe: (navigateComposer) => {
          // Presentation drives the iframe; hand it a way to push URLs.
          ;(window as never as {__sanityNavigate?: unknown}).__sanityNavigate = navigateComposer
          return () => {}
        },
        update: (update) => {
          if (update.type === 'push' || update.type === 'replace') {
            void navigate(update.url, {replace: update.type === 'replace'})
          } else if (update.type === 'pop') {
            void navigate(-1)
          }
        },
      },
    })
    return () => disable()
  }, [navigate])

  // Live Content API -> re-run loaders when the dataset changes.
  useLiveMode({
    client,
    onConnect: () => revalidator.revalidate(),
  })

  return null
}
