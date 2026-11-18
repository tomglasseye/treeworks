import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
  redirect,
  useRouteLoaderData,
} from 'react-router'
import {Suspense, lazy} from 'react'
import type {Route} from './+types/root'
import stylesheet from './app.css?url'
import {
  checkPreviewToken,
  isInPreviewFrame,
  isPreviewEnabled,
  previewExitHeaders,
} from './sanity/preview.server'
import {PreviewNotice} from './components/PreviewNotice'

// Visual editing ships only inside the Studio's preview iframe, never to visitors.
const VisualEditing = lazy(() =>
  import('./components/VisualEditing').then((m) => ({default: m.VisualEditing})),
)

export async function loader({request}: Route.LoaderArgs) {
  // /tree-surgery/ and /tree-surgery would otherwise both answer 200 with the
  // same page, splitting whatever ranking either earns. Every URL on the site is
  // written without a trailing slash, so that is the one that wins. The Studio
  // is the exception (it needs its slash), though Netlify serves it as static
  // files before this ever runs.
  const {pathname, search} = new URL(request.url)
  if (pathname.length > 1 && pathname.endsWith('/') && !pathname.startsWith('/studio')) {
    throw redirect(pathname.replace(/\/+$/, '') + search, 301)
  }

  const preview = await isPreviewEnabled(request)
  const inPreviewFrame = await isInPreviewFrame(request)
  // Opening the site normally clears any lingering preview cookie. This is what
  // replaces an exit button: browsing the real site is how you leave preview.
  const headers = await previewExitHeaders(request)

  // Only inside the Studio iframe, and only far enough to say whether drafts
  // will load. The underlying error stays on the server; the browser gets a
  // reason code, not a Sanity message.
  const token = inPreviewFrame ? await checkPreviewToken() : null
  const tokenStatus = token && !token.ok ? ({ok: false, reason: token.reason} as const) : null

  return data({preview, inPreviewFrame, tokenStatus}, headers ? {headers} : undefined)
}

export const links: Route.LinksFunction = () => [
  // Self-hosted fonts (see the @font-face block at the top of app.css).
  // Preloading the two upright faces lets them download in parallel with the
  // stylesheet instead of after it. Italic is rarer and loads on demand.
  {rel: 'preload', href: '/fonts/fraunces-latin-normal.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous'},
  {rel: 'preload', href: '/fonts/mulish-latin.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous'},
  {rel: 'stylesheet', href: stylesheet},

  // All generated from public/favicon.svg by `npm run build:icons`.
  // The SVG is listed alongside the .ico rather than instead of it: evergreen
  // browsers prefer the SVG, while feed readers and link-preview scrapers still
  // probe /favicon.ico blindly.
  {rel: 'icon', href: '/favicon.ico', sizes: '32x32'},
  {rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'},
  {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
  {rel: 'manifest', href: '/site.webmanifest'},
]

export function Layout({children}: {children: React.ReactNode}) {
  const data = useRouteLoaderData<typeof loader>('root')
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tints the browser chrome on Android and iOS Safari to match the
            footer, so the site reads as one surface rather than a page floating
            in someone else's UI. */}
        <meta name="theme-color" content="#2c3a2a" />
        <Meta />
        <Links />
        {/* Marks that JS is running, so scroll-reveal only hides content it can
            actually reveal again. Inline and blocking so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{__html: "document.documentElement.classList.add('js')"}}
        />
      </head>
      <body data-preview={data?.preview ? 'true' : undefined}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-input focus:bg-bark focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({loaderData}: Route.ComponentProps) {
  return (
    <>
      <Outlet />
      {loaderData?.inPreviewFrame ? (
        <>
          <Suspense fallback={null}>
            <VisualEditing />
          </Suspense>
          {loaderData.tokenStatus ? <PreviewNotice status={loaderData.tokenStatus} /> : null}
        </>
      ) : null}
    </>
  )
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  let title = 'Something went wrong'
  let message = 'Please try again, or call us on 07880 335025.'

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? 'Page not found' : `${error.status}`
    message =
      error.status === 404
        ? 'That page has moved or never existed. Try the menu, or give us a call.'
        : error.statusText || message
  }

  return (
    <main id="main" className="u-container flex min-h-screen flex-col justify-center py-section">
      <p className="u-eyebrow text-muted">Treeworks Cornwall</p>
      <h1 className="u-h2 mt-4 text-bark">{title}</h1>
      <p className="mt-4 max-w-prose text-muted">{message}</p>
      <a
        href="/"
        className="mt-8 inline-flex w-fit rounded-pill bg-bark px-6 py-3 text-bone transition-colors hover:bg-bark-soft"
      >
        Back to the homepage
      </a>
      {import.meta.env.DEV && error instanceof Error ? (
        <pre className="mt-8 overflow-x-auto rounded-panel bg-lichen-soft p-4 text-sm">
          {error.stack}
        </pre>
      ) : null}
    </main>
  )
}
