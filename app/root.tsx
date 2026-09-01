import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
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
  {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  {
    rel: 'stylesheet',
    // Only what the design actually uses. Fraunces is set at 400 everywhere
    // (headings, the phone links, prose blockquotes), with italics for <em> and
    // blockquote, and keeps the optical-size axis because font-optical-sizing
    // is on. Mulish is body text at 400 and eyebrows at 700, and is never
    // italic — asking for the 300..800 range plus a whole italic file was
    // downloading two faces nothing on the site can render.
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Mulish:wght@400..700&display=swap',
  },
  {rel: 'stylesheet', href: stylesheet},
]

export function Layout({children}: {children: React.ReactNode}) {
  const data = useRouteLoaderData<typeof loader>('root')
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
