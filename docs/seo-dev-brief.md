# Treeworks Cornwall – SEO developer brief

**Site:** React Router 8 (SSR) + Sanity (project `bb392mn5`, dataset `production`) on Netlify. Studio embedded at `/studio`.
**Written:** 29 Sept 2026, after auditing the live preview (`https://treeworkscornwall.netlify.app`) and the current WordPress site (`https://treeworkscornwall.co.uk`).
**Caveat:** this brief was written without access to the repo. File names below are suggestions; find the real equivalents (root layout, `meta`/`links` exports, robots and sitemap routes, JSON-LD helper, `siteSettings` query) before editing.

The content side (titles, descriptions, FAQs, in-page links, opening hours) is already done in Sanity. This brief covers what needs code.

---

## Status: first round of code changes (29 Sept, committed on branch `seo-canonicals-noindex`)

Once the repo was visible it turned out `siteUrl(request)`, `seo.ts`, the robots and sitemap routes and `scripts/check-seo.mjs` already existed, so the work was smaller than this brief assumed.

**Done**
- **Canonical + `og:url`** on every page (`seoContext()` in `app/siteUrl.server.ts`, added by `buildMeta()`); no trailing slash, no query string.
- **Trailing-slash 301** in the root loader (`/tree-surgery/` → `/tree-surgery`, query string kept).
- **Site address:** no new variable needed. `siteUrl()` already reads `SITE_URL`, then Netlify's `URL` (which follows the primary domain automatically), then the request origin. It now also refuses to emit an `http://` origin outside local dev. `SITE_URL` is documented as optional.
- **Noindex outside the public site:** `isIndexable(request)` decides by host (`*.netlify.app` and localhost closed, custom domain open). Closed hosts get `Disallow: /` in robots.txt plus a `noindex` meta tag. This replaces the old `CONTEXT` check, which cannot be relied on at function runtime. No launch-day change needed.
- Sitemap homepage `<loc>` now ends in `/` to match its canonical.
- `npm run check:seo` extended to assert canonicals, og:url, robots/noindex agreement, the redirect and the homepage `<loc>`; README and `.env.example` updated. Typecheck and production build pass.

**Deliberately not done**
- **Self-hosted fonts:** Tom chose not to add the `@fontsource-variable` packages. The Google Fonts stylesheet stays.
- Everything else below marked P1/P2 (share-image fallback, `og:site_name`/`og:locale`, richer JSON-LD, Sanity fields, sitemap images, performance, analytics).

**Corrections to §0 and §1 below:** `seo.shareImage` *is* emitted as `og:image` when set (the code exists), but no page or site setting has one in Sanity, so no `og:image` appears. Either set a site-wide share image in Studio or add a code fallback to the hero image. And §1 no longer requires setting `SITE_URL`.

---

## 0. What the audit found (verified on the live preview)

| Area | Current state |
|---|---|
| `<html lang>` | `en-GB` ✔ |
| H1 | One per page ✔ (home checked) |
| Title + meta description | Come from Sanity `seo.title` / `seo.description` ✔ |
| Canonical tag | **Missing on every page** |
| Open Graph | Only `og:title`, `og:description`, `og:type=website`. **Missing** `og:url`, `og:image`, `og:site_name`, `og:locale` |
| Twitter | `twitter:card=summary` only. **No image**, not `summary_large_image` |
| JSON-LD | Home: a minimal `LocalBusiness` (now with `openingHoursSpecification` from siteSettings). All pages: `BreadcrumbList`. FAQ pages: `FAQPage`. **No** `Service`, `areaServed` list, `geo`, `logo`, `image`, `contactPoint`, `sameAs` to Google/Companies House |
| Origin | Every absolute URL (sitemap, robots `Sitemap:`, JSON-LD `url`/`@id`) is `https://treeworkscornwall.netlify.app` |
| robots.txt | `Allow: /`, `Disallow: /studio`, `Disallow: /api/`, plus Sitemap line ✔ (but hard-coded origin, and no noindex for non-production) |
| sitemap.xml | 11 URLs, has `lastmod`, no images. Home is listed without a trailing slash |
| Trailing slash | `/tree-surgery/` returns **200** (duplicate of `/tree-surgery`) |
| Unknown URL | Returns a real **404** ✔ |
| Fonts | Google Fonts `<link rel=stylesheet>` (Fraunces etc.) – render-blocking external CSS |
| Icons | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest` ✔ |

**Good news for migration:** the current WordPress `page-sitemap.xml` lists exactly 11 URLs (`/`, `/newquay-tree-surgeon`, `/tree-surgeon-cornwall`, `/gallery`, `/tree-surgery`, `/fencing-hard-landscaping`, `/contact-us`, `/grounds-maintenance`, `/forestry`, `/about-us`, `/ash-dieback`) and **all 11 exist on the new site at the same paths**. No per-page redirect map is needed. The old canonical host is the apex `https://treeworkscornwall.co.uk/` (no `www`, no trailing slash on inner pages).

---

## Priority order

- **P0 – must be done before the domain switch:** §1 origin and indexing control, §2 canonicals, §3 URL normalisation.
- **P1 – do at or before launch:** §4 share tags, §5 structured data, §6 Sanity field additions.
- **P2 – soon after launch:** §7 sitemap and robots polish, §8 performance, §9 measurement.

---

## 1. One origin, and keep non-production out of Google (P0)

1. Add a single `SITE_URL` env var (Netlify → Site configuration → Environment variables; make sure it is available to Builds and Functions/runtime). Value: `https://treeworkscornwall.co.uk`. Set it **now**, before launch. Locally: leave unset or use `http://localhost:5173`.
2. Create one helper, e.g. `absoluteUrl(path, request)`, and use it for **everything** absolute: canonical, `og:url`, `og:image`, JSON-LD `url`/`@id`, sitemap `<loc>`, and the robots `Sitemap:` line. No hard-coded hosts anywhere.
3. **Indexing rule: a page is indexable only when the request's host equals the host of `SITE_URL`.** Every other host (today's `treeworkscornwall.netlify.app`, deploy previews, branch deploys, and the `.netlify.app` address after launch) gets:
   - `X-Robots-Tag: noindex, nofollow` on all responses, plus `<meta name="robots" content="noindex,nofollow">`;
   - a `robots.txt` that returns `Disallow: /`;
   - a self-referencing canonical (the request's own origin) rather than one pointing at production, so noindex and canonical don't conflict.

   Why a host check and not Netlify's `CONTEXT` variable: at function runtime Netlify only exposes `URL`, `SITE_NAME` and `SITE_ID` (plus your own variables); `CONTEXT` is build-time only. And the `treeworkscornwall.netlify.app` address is itself a *production* deploy, so a "production vs preview" test would not catch it anyway. The host check also means **nothing needs to change on launch day**: once the custom domain is attached and DNS is switched, requests arrive with the matching host and the site becomes indexable automatically. If `SITE_URL` is missing, fail safe to noindex and log a warning.
4. In Netlify → Domain management, set `treeworkscornwall.co.uk` as the **primary domain** and add `www` as an alias so it redirects to the apex. Netlify's docs say the `*.netlify.app` address keeps working after a custom domain is attached (they don't describe an automatic redirect), so rely on the noindex rule above. Optionally 301 the main `treeworkscornwall.netlify.app` host to production after launch (leave deploy previews alone so they stay usable). Confirm that `http://` and `www.` variants 301 to `https://treeworkscornwall.co.uk/…`.

## 2. Canonical tags (P0)

Add to every indexable route (root layout or each route's `meta`/`links`):

```html
<link rel="canonical" href="https://treeworkscornwall.co.uk/tree-surgery">
```

- Href = `SITE_URL` + pathname, **no query string, no trailing slash** (except the home page, which is `https://treeworkscornwall.co.uk/`).
- Use the same URL in `og:url`, in the sitemap and in JSON-LD.
- If Sanity has a `seo.noIndex` toggle (or you add one, see §6): emit `noindex` and leave the page out of the sitemap.
- No canonical on the 404 page.

## 3. URL normalisation (P0)

- **Trailing slash:** 301 any path ending in `/` (except `/` itself and `/studio/*`) to the same path without it, keeping the query string. Doing this in a root loader is the most reliable with SSR:

  ```ts
  // root loader / server entry (adapt to the repo)
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith('/') && !url.pathname.startsWith('/studio')) {
    throw redirect(url.pathname.replace(/\/+$/, '') + url.search, 301);
  }
  ```
- Internal links (nav, footer, Sanity `link` resolver) must produce the canonical form.
- Keep a small redirect test list (§10) so this cannot regress.

## 4. Share tags: Open Graph and Twitter (P1)

Emit on every page (values from Sanity, with fallbacks):

| Tag | Value |
|---|---|
| `og:site_name` | `siteSettings.businessName` ("Treeworks Cornwall Ltd") |
| `og:locale` | `en_GB` |
| `og:type` | `website` |
| `og:url` | canonical URL |
| `og:title` / `twitter:title` | `seo.title` |
| `og:description` / `twitter:description` | `seo.description`, falling back to `siteSettings.defaultSeo.description` |
| `og:image` / `twitter:image` | see below |
| `og:image:width` / `height` / `og:image:alt` | `1200` / `630` / alt from the image |
| `twitter:card` | `summary_large_image` |

**Image fallback chain:** `seo.shareImage` → the page's first `hero` image → `siteSettings.defaultSeo.shareImage` (add if missing) → a static `/og-default.jpg`.
`seo.shareImage` already exists in the schema but is never emitted.

Build the URL with the Sanity image builder, honouring hotspot: `width(1200).height(630).fit('crop').format('jpg').quality(80)`. Use **jpg explicitly**, since some crawlers mishandle `auto=format` webp. The URL must be absolute.

## 5. Structured data (P1)

### 5a. Site-wide entity (emit in full on the home page; other pages reference it by `@id`)

Use `HomeAndConstructionBusiness` (a `LocalBusiness` subtype; schema.org has no tree-surgeon type). Keep `LocalBusiness` if you prefer, since both satisfy Google's requirements. Only `name` and `address` are required by Google, but the more properties the better.

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://treeworkscornwall.co.uk/#business",
  "name": "Treeworks Cornwall Ltd",
  "alternateName": "Treeworks Cornwall",
  "url": "https://treeworkscornwall.co.uk/",
  "description": "<siteSettings.tagline / defaultSeo.description>",
  "logo": { "@type": "ImageObject", "url": "<absolute logo url>" },
  "image": ["<absolute logo url>", "<absolute hero photo url>"],
  "telephone": "+44 7880 335025",
  "email": "info@treeworkscornwall.co.uk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avalen Farm, Tregonetha",
    "addressLocality": "St Columb",
    "addressRegion": "Cornwall",
    "postalCode": "TR9 6EN",
    "addressCountry": "GB"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 0.00000, "longitude": 0.00000 },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  }],
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Cornwall" },
    { "@type": "City", "name": "Newquay" },
    { "@type": "City", "name": "St Columb" },
    { "@type": "City", "name": "St Newlyn East" },
    { "@type": "City", "name": "Perranporth" },
    { "@type": "City", "name": "Padstow" },
    { "@type": "City", "name": "Wadebridge" },
    { "@type": "City", "name": "Bodmin" },
    { "@type": "City", "name": "Truro" },
    { "@type": "City", "name": "St Austell" },
    { "@type": "City", "name": "Helston" }
  ],
  "contactPoint": [{
    "@type": "ContactPoint",
    "contactType": "customer service",
    "telephone": "+44 7880 335025",
    "availableLanguage": "en-GB",
    "hoursAvailable": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "00:00", "closes": "23:59" }
  }],
  "sameAs": [
    "https://www.facebook.com/treeworkscornwall/",
    "https://instagram.com/treeworks_cornwall",
    "<Google Maps listing URL – siteSettings.googleBusinessProfileUrl>",
    "https://find-and-update.company-information.service.gov.uk/company/11472677"
  ]
}
```

Notes:
- **Values come from Sanity `siteSettings`** (businessName, tagline, phone, email, address, openingHours, facebookUrl, instagramHandle) plus the new fields in §6 (logo, geo, areasServed, googleBusinessProfileUrl). Don't hard-code them in the template.
- **Opening hours:** Sanity currently holds a single row "Every day – Open 24 hours". Map that to the 24/7 spec above (all seven days, `00:00`–`23:59`). If Tom later enters normal hours, map real day ranges instead.
- **`geo`:** look up the coordinates for TR9 6EN (five decimal places minimum, per Google) and store them in Sanity. The address is already public on the site, so this reveals nothing new, but check Tom is happy.
- **Omit `priceRange`.** The old WordPress markup had "£50 - £10000", which is not useful. Only add it if Tom gives a genuine indicator.
- **Never add `review` or `aggregateRating`.** Google makes LocalBusiness/Organization pages ineligible for review stars when the business controls the reviews about itself, including embedded Google or Facebook widgets. The site links to its Google reviews instead.
- Also emit a `WebSite` node (`@id: …/#website`, `publisher: {"@id": …/#business}`) if not already present.

### 5b. Service pages

On each service page emit a `Service` node that points back to the business:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Tree surgery",
  "serviceType": "Tree surgery",
  "description": "<page seo.description>",
  "url": "<canonical>",
  "provider": { "@id": "https://treeworkscornwall.co.uk/#business" },
  "areaServed": { "@type": "AdministrativeArea", "name": "Cornwall" }
}
```

| Slug | `name` / `serviceType` |
|---|---|
| `/tree-surgery` | Tree surgery |
| `/grounds-maintenance` | Hedge cutting and grounds maintenance |
| `/forestry` | Forestry and woodland management |
| `/fencing-hard-landscaping` | Fencing and landscaping |
| `/ash-dieback` | Ash dieback assessment and removal |

### 5c. Location pages

- `/newquay-tree-surgeon`: `WebPage` with `about` = a `Service` (`serviceType: "Tree surgery"`, `provider` → business `@id`) whose `areaServed` is `{"@type":"City","name":"Newquay"}`.
- `/tree-surgeon-cornwall`: the same, with `areaServed` = `AdministrativeArea` "Cornwall".
- To make this data-driven for future town pages, add `areaName` and `areaType` (`City` / `AdministrativeArea`) to the `locationPage` schema (§6) and use them here.

### 5d. Keep as is

- `BreadcrumbList`: keep; check names and URLs use the canonical absolute form.
- `FAQPage` (driven by each FAQ section's `emitStructuredData`): **Google stopped showing FAQ rich results on 7 May 2026.** The markup is harmless, so leave it, but don't spend more effort here. The value of the FAQs is the visible content.

### 5e. Validate

Run every template type through [validator.schema.org](https://validator.schema.org) and Google's Rich Results Test (the Rich Results Test no longer supports FAQ).

## 6. Sanity schema additions (P1)

Add only what isn't already there:

- `siteSettings.logo` (image, required for the schema `logo`)
- `siteSettings.geo` (geopoint)
- `siteSettings.areasServed` (array of strings: the town list above)
- `siteSettings.googleBusinessProfileUrl` (url) and optionally `googleReviewsUrl`
- `siteSettings.defaultSeo.shareImage` (image)
- `locationPage.areaName` (string) and `areaType` (`City` | `AdministrativeArea`)
- `seo.noIndex` (boolean), if not already present, honoured in meta robots and the sitemap

Then tell Tom to fill them in (logo file, Google listing URL, towns list). The rest of the copy is already published.

## 7. Sitemap and robots polish (P2)

- `<loc>` values built with `absoluteUrl()`; home as `https://treeworkscornwall.co.uk/`, everything else without a trailing slash.
- Keep `lastmod` from Sanity `_updatedAt`. Exclude `noindex` pages, `/studio` and `/api`.
- **Optional images:** add `<image:image><image:loc>…</image:loc></image:image>` for the hero and gallery images. Since 2022 Google only reads `image:loc`; caption, title and licence tags are ignored.
- Production robots.txt should be:

  ```
  User-agent: *
  Allow: /
  Disallow: /studio
  Disallow: /api/

  Sitemap: https://treeworkscornwall.co.uk/sitemap.xml
  ```

## 8. Performance (P2, but check before launch)

The photography is now real and large (some originals are 6240×4160). Google uses mobile Core Web Vitals as a ranking signal.

- Serve all images through the Sanity CDN with explicit width, `auto=format` and a sensible quality. Provide `srcset` and `sizes`. Never serve originals.
- Set `width`/`height` (or `aspect-ratio`) on every image to prevent layout shift.
- The **hero image is the LCP element**: `fetchpriority="high"`, not lazy-loaded, ideally preloaded. Everything below the fold gets `loading="lazy" decoding="async"`.
- **Fonts:** replace the render-blocking Google Fonts stylesheet with self-hosted fonts (e.g. `@fontsource`), `font-display: swap`, and preload only the main weight. Limit the number of weights.
- The Gallery page is the heaviest: lazy-load and consider paginating or limiting the initial set.
- Run PageSpeed Insights (mobile) on `/`, `/tree-surgery` and `/gallery`. Targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms.

## 9. Measurement (P2)

- **Google Search Console:** add a **Domain property** for `treeworkscornwall.co.uk` (DNS TXT record). Submit `sitemap.xml`. Also set up Bing Webmaster Tools (it can import from Search Console).
- **Analytics:** Tom's choice. A cookieless tool avoids a consent banner. Track these events: click on `tel:` links, click on `mailto:` links, click on the Google reviews button, and successful contact-form submission (Netlify Forms). Phone taps are the most valuable conversion for this business.

## 10. Acceptance checks (run against production after launch)

```bash
# canonical present and correct
curl -s https://treeworkscornwall.co.uk/tree-surgery | grep -i 'rel="canonical"'

# trailing slash redirects (expect 301 -> /tree-surgery)
curl -sI https://treeworkscornwall.co.uk/tree-surgery/ | head -n 5

# www and http redirect to apex https (expect 301)
curl -sI http://www.treeworkscornwall.co.uk/ | head -n 5

# production must NOT be noindex
curl -sI https://treeworkscornwall.co.uk/ | grep -i x-robots-tag        # expect nothing
curl -s  https://treeworkscornwall.co.uk/ | grep -i 'name="robots"'     # expect nothing or "index"

# every non-production host MUST be noindex (deploy preview, branch deploy, and the netlify.app address)
curl -sI <deploy-preview-url>/ | grep -i x-robots-tag                   # expect noindex
curl -sI https://treeworkscornwall.netlify.app/ | grep -i x-robots-tag  # expect noindex
curl -s  https://treeworkscornwall.netlify.app/robots.txt               # expect Disallow: /

# robots + sitemap use the production host
curl -s https://treeworkscornwall.co.uk/robots.txt
curl -s https://treeworkscornwall.co.uk/sitemap.xml | grep -c 'netlify.app'   # expect 0

# all 11 legacy URLs return 200 on the new site
for p in "" newquay-tree-surgeon tree-surgeon-cornwall gallery tree-surgery fencing-hard-landscaping contact-us grounds-maintenance forestry about-us ash-dieback; do
  curl -s -o /dev/null -w "%{http_code} /$p\n" https://treeworkscornwall.co.uk/$p
done

# unknown URL is a real 404
curl -s -o /dev/null -w "%{http_code}\n" https://treeworkscornwall.co.uk/definitely-not-a-page
```

Also check by hand:
- View-source on `/`, `/tree-surgery`, `/newquay-tree-surgeon`: canonical, full OG set with an absolute 1200×630 jpg, and `twitter:card=summary_large_image`.
- Paste a page URL into the Facebook Sharing Debugger and the LinkedIn Post Inspector to confirm the preview image.
- Validate the JSON-LD for the home page, a service page and a location page (§5e).
- Search Console → URL Inspection on `/` and `/tree-surgery`: "URL is available to Google" and the user-declared canonical matches the Google-selected one.

## 11. Launch-day sequence

1. `SITE_URL=https://treeworkscornwall.co.uk` should already be set (§1) and deployed. While the site is still on `netlify.app`, every page should be noindex. Test the contact form end to end on the preview (the Netlify MCP showed Forms as "not enabled" for the project, so confirm form detection is on and submissions arrive).
2. Attach `treeworkscornwall.co.uk` in Netlify, set it as primary, add the `www` alias, switch DNS, wait for the certificate. No code change is needed: the site turns indexable by itself once the host matches `SITE_URL`.
3. Re-run the §10 checks on the live domain.
4. Add the Search Console domain property, submit the sitemap, request indexing for `/`.
5. Tom updates the Google Business Profile website link (currently `http://www.treeworkscornwall.co.uk/`) to `https://treeworkscornwall.co.uk/`, and fixes the address wording in the profile description and the directories (Yell, Cylex, Cornwall Live, Thomsonlocal). They currently say "St Newlyn East" rather than Avalen Farm, Tregonetha, St Columb.
6. Watch Search Console (Pages and Performance reports) for 2–4 weeks; investigate any "Duplicate without user-selected canonical" or "Not found (404)" entries.

## 12. Do not

- Add `Review` / `AggregateRating` markup for the testimonials or the Google reviews.
- Add separate pages per town without genuinely different local content (jobs, photos, testimonials). Near-identical town pages risk being treated as doorway pages.
- Apply `noindex` in production, or let any `netlify.app` URL end up in the sitemap or canonicals.
- Keyword-stuff titles, alt text or hidden text.

---

### Reference: current Sanity values

| Field | Value |
|---|---|
| businessName | Treeworks Cornwall Ltd |
| tagline | Professional Tree Services in Cornwall |
| phone | 07880 335025 (matches the Google listing; also the 24-hour emergency number) |
| secondaryPhone | 07974 937649 (Mel) |
| email | info@treeworkscornwall.co.uk |
| address | Avalen Farm, Tregonetha, St Columb, Cornwall, TR9 6EN |
| companyNumber | 11472677 |
| openingHours | Every day – Open 24 hours |
| facebookUrl | https://www.facebook.com/treeworkscornwall/ |
| instagramHandle | treeworks_cornwall |
| Google listing | "Treeworks Cornwall Ltd", category "Arborist service", 5.0 stars, 36 reviews |
| Towns (starter list, Tom to edit) | Newquay, St Columb, St Newlyn East, Perranporth, Padstow, Wadebridge, Bodmin, Truro, St Austell, Helston |
