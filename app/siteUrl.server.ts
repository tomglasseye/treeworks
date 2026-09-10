/**
 * The origin this site should call itself, with no trailing slash.
 *
 * Netlify sets URL on production builds; SITE_URL overrides it for anyone
 * self-hosting or running a custom domain ahead of the DNS cutover. Falling
 * back to the request's own origin keeps dev, deploy previews and production
 * all correct without configuring anything.
 *
 * Worth centralising rather than inlining: sitemap <loc> values and JSON-LD
 * `item` values are both specified as absolute URLs, and a relative one is
 * ignored rather than rejected — a failure that surfaces in Search Console
 * weeks later, if at all.
 */
export function siteUrl(request: Request): string {
  const configured = process.env.SITE_URL ?? process.env.URL
  return (configured ?? new URL(request.url).origin).replace(/\/$/, '')
}
