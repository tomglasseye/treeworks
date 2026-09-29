/**
 * The origin this site should call itself, with no trailing slash.
 *
 * Netlify sets URL on production builds; SITE_URL overrides it for anyone
 * self-hosting or running a custom domain ahead of the DNS cutover. Falling
 * back to the request's own origin keeps dev, deploy previews and production
 * all correct without configuring anything.
 *
 * Netlify's URL is the site's *primary* domain, so it moves from
 * treeworkscornwall.netlify.app to the custom domain by itself the moment that
 * domain is made primary. Nothing needs to be set, before or after launch.
 *
 * Worth centralising rather than inlining: sitemap <loc> values and JSON-LD
 * `item` values are both specified as absolute URLs, and a relative one is
 * ignored rather than rejected — a failure that surfaces in Search Console
 * weeks later, if at all.
 */
export function siteUrl(request: Request): string {
  const configured = process.env.SITE_URL ?? process.env.URL
  const origin = (configured ?? new URL(request.url).origin).replace(/\/$/, '')
  // A canonical or sitemap entry on http:// would be wrong, and nothing would
  // complain. Only local development legitimately runs without TLS.
  return origin.replace(/^http:\/\/(?!localhost|127\.|\[::1\])/, 'https://')
}

/**
 * Hosts that are never the public site: Netlify's own subdomains (the default
 * one, deploy previews and branch deploys) and local development.
 */
const NON_PUBLIC_HOST = /(^|\.)netlify\.app$|^localhost$|^127\.|^\[::1\]$/i

/**
 * Whether search engines may index what this request is being served from.
 *
 * Decided by the host the request arrived on, not by Netlify's CONTEXT
 * variable: CONTEXT is a build-time value that is not reliably present when the
 * server function runs, and treeworkscornwall.netlify.app is itself a
 * *production* deploy, so "is this production?" would call it indexable anyway.
 *
 * With no configuration this is automatic — anything on *.netlify.app or
 * localhost is kept out of search results, and a custom domain is indexed — so
 * attaching the real domain at launch needs no change here. Set SITE_URL to
 * make it stricter: only that exact host is then indexable.
 */
export function isIndexable(request: Request): boolean {
  const context = process.env.CONTEXT
  if (context && context !== 'production') return false

  const {host, hostname} = new URL(request.url)
  const configured = process.env.SITE_URL
  if (configured) return host === new URL(configured).host

  return !NON_PUBLIC_HOST.test(hostname)
}

/**
 * Everything a route needs to describe itself to a search engine.
 *
 * The canonical URL has no trailing slash and no query string, matching the
 * 301 in the root loader, so every page has exactly one address. A page that
 * must not be indexed canonicalises to itself rather than to the production
 * site: pointing it at production while also marking it noindex would send
 * Google two contradictory signals.
 */
export function seoContext(request: Request) {
  const indexable = isIndexable(request)
  const origin = indexable ? siteUrl(request) : new URL(request.url).origin
  const {pathname} = new URL(request.url)
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return {siteUrl: siteUrl(request), canonicalUrl: `${origin}${path}`, indexable}
}
