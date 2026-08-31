# Treeworks Cornwall

Replaces the WordPress site at treeworkscornwall.co.uk.

**Stack:** Sanity (page-builder CMS) · React Router 8 in framework/SSR mode · Tailwind v4 · Netlify.
Studio is embedded in the same repo and served at `/studio`.

## Running it

```bash
npm install
npm run dev          # site at :5173, Studio at :5173/studio
```

`.env` is already pointed at the live Sanity project (`bb392mn5` / `production`).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Route typegen + `tsc` |
| `npm run check:forms` | Fails if the contact form and `public/__forms.html` drift apart |

## How the page builder works

A `page` is a title, a slug and an **array of sections**. Every section type is allowed
on every page, so order and mix are an editor decision.

```
Sanity page.sections[]  →  SectionRenderer  →  one component per _type
```

Adding a section type is three things and no page edits:

1. a schema file in `studio/schemaTypes/sections/`
2. its `_type` added to `SECTION_TYPES` in `studio/schemaTypes/documents/page.ts`
3. a component registered in `app/components/SectionRenderer.tsx`

The registry is typed as a mapped union, so a key that does not match its component's
props is a compile error rather than a blank section in production.

Every section carries `appearance` (tone: bone / lichen / bark, spacing, anchor id) —
that is how colour rhythm gets composed in Studio rather than in code.

## Design tokens

All in the `@theme` block at the top of `app/app.css`. Colours, type scale, radii and
section rhythm are defined once there; `docs/design-tokens.md` explains where each value
came from. Display face is Fraunces, body is Mulish, everything at weight 400.

## The contact form (Netlify Forms)

Netlify discovers forms by parsing static HTML at deploy time, which an SSR app never
emits. So:

- `public/__forms.html` holds a hidden copy of every field, purely for the build-time parser
- the React form POSTs url-encoded data with a matching `form-name`
- `npm run check:forms` fails the build if the two ever disagree — otherwise a new field
  would be silently dropped from every submission with no error

Submissions land in **Netlify → Forms**, with spam filtering and a honeypot included.
Set up email notifications there. If you later want them inside Studio instead, a
`submission-created` webhook into a small function is the way.

## The gallery (Instagram, without the Meta API)

Instagram's Basic Display API was shut down in December 2024; the replacement needs a
Meta developer app, a Business/Creator account, and a token refreshed every 60 days.

We don't do any of that. [Behold](https://behold.so) holds the Instagram connection and
hands back a plain JSON feed:

1. Sign up at behold.so and connect `@treeworks_cornwall`
2. Create a feed, copy its URL
3. Put it in `VITE_BEHOLD_FEED_URL` (locally and in Netlify's env vars)

`app/routes/api.instagram.ts` proxies that feed server-side — it keeps the URL out of the
client bundle, trims the payload, caches for 15 minutes, and serves stale rather than
nothing if Behold is unreachable.

**Note on tiers:** the free tier caps at 6 posts and 1,200 views/month. For a real site
the $10/month Starter tier (50 posts, hourly refresh, no Behold logo) is the realistic
choice. If you'd rather not pay a third party at all, switch the gallery section's
**source** to "Images managed here" and upload photos in Studio — the same component
renders both, no code change.

## Header and menu

Mirrors the old site's arrangement: site name, a few key links, the phone number,
the quote CTA, and a hamburger that opens a full-page overlay listing **every**
page — the same pattern, with the name, number and CTA the old header lacked.

Which links sit in the top bar is an editor decision: tick **Show in the top bar**
on a nav item in Studio. Everything appears in the overlay regardless. Four or
five in the bar is the practical limit before it crowds the phone number.

Breakpoints:

| Width | Shows |
|---|---|
| `< 640px` | name · phone icon · hamburger |
| `640–1023px` | name · phone number · CTA · hamburger |
| `≥ 1024px` | name · bar links · phone number · CTA · hamburger |

The overlay is a **sibling** of `<header>`, not a child. The header uses
`backdrop-blur`, and `backdrop-filter` creates a containing block for
fixed-position descendants — nested inside, the overlay clipped itself to the
header's 80px instead of covering the viewport. Worth remembering before moving
it back.

## Motion

Scroll reveals are CSS transitions toggled by a `data-revealed` attribute that one
shared `IntersectionObserver` sets, then unobserves. No animation library.

Where a page-builder block holds an **array** — feature list items, service cards,
testimonials, stats, FAQ rows, gallery images, logos — each item reveals
individually rather than the block fading in as one. Those sections pass
`reveal={false}` to the section wrapper so the two do not nest and fight.

Stagger follows the layout, which is the part worth getting right:

- items that appear **side by side** (cards, stats, logos) stagger by index, capped
  so a long row does not trail
- items **stacked vertically** (alternating feature rows, compact lists) get no
  stagger — each is already reaching the fold at a different moment, and adding
  delay on top just makes them feel late

Everything is hidden only once a `js` class confirms JavaScript is running, so a
blocked bundle cannot leave the page invisible, and all of it is disabled under
`prefers-reduced-motion`.

The menu toggle morphs into its own close icon: the header sits above the overlay
in the stack (`z-50` vs `z-40`) and drops its background when open, so one button
serves both states. The overlay stays mounted and animates on `opacity` and
`visibility` rather than mounting and unmounting, which is what lets it animate
out as well as in; `visibility` is also what keeps it out of the tab order when
closed.

## Wood grain

Four variants in `public/grain/`. Generated, not hand-drawn — the script uses a
fixed seed and Catmull-Rom splines converted to cubic Béziers, which is what
keeps the lines genuinely smooth. Quadratic curves through midpoints leave a
faint kink at every control point.

Turn it on per section in Studio: **Appearance → Background pattern → Wood grain**.
Which of the four you get is chosen by hashing the section's `_key` — deliberately
not `Math.random()`, which would mismatch between server and client and reshuffle
the texture on every reload. Different sections get different grain; the same
section keeps its own.

Applied as a **mask**, not a background image, so one asset picks up
`currentColor` and works on the light and dark panels alike. Opacity sits between
3.5% and 5.5% — it should read as texture you notice only if you look for it.
Removed entirely under `prefers-contrast: more`.

The grain bleeds `-50vw` either side so it runs to the section edges rather than
stopping at the text column; the section carries `.u-grain-clip` to contain that,
without which the page gains a horizontal scrollbar.


## Placeholder images

Nothing has real photography yet. To fill every empty image field with one
placeholder so the layouts can be judged:

```bash
npx sanity exec scripts/seed-placeholder-image.mjs --with-user-token -- --dry-run   # see what it would do
npx sanity exec scripts/seed-placeholder-image.mjs --with-user-token                # do it
npx sanity exec scripts/seed-placeholder-image.mjs --with-user-token -- --clear     # undo
```

It uploads the image once, reuses that asset on re-runs, and **only fills fields
that are still empty** — so as real photos go in, re-running tops up the gaps
without touching anything you have set.

Every field it writes is tagged `placeholder: true`, which is what `--clear`
keys off and what makes them obvious in Studio. The alt text is deliberately
useless ("Placeholder — looking up through a bamboo grove…") so it can't quietly
ship: alt text describing bamboo on a Cornish tree surgery page helps nobody.

## Live preview (Presentation)

Open Studio → **Presentation**. The site renders in an iframe beside the content,
edits appear as you type, and clicking anything in the preview jumps to that field.

**There is no port to configure.** That is deliberate. The usual setup runs Studio on
:3333 and the site on :5173, which means a `previewUrl.origin`, a CORS entry, and two
dev servers that have to agree — and it all breaks again in production. Here the Studio
is *inside* the site at `/studio`, so the preview target is the same origin the Studio is
already on. `previewUrl.origin` is left undefined on purpose: Presentation then uses its
own origin, which is correct in dev, on a Netlify deploy preview, and in production,
without anything being set.

The one exception is a standalone Studio at `*.sanity.studio`, which genuinely is a
different host. Only then set `SANITY_STUDIO_PREVIEW_ORIGIN` (and add that origin to
CORS). If you skip the standalone deploy, you never touch this.

### What it needs

One thing: a **Viewer** token, so the server can read drafts.
sanity.io/manage → the project → API → Tokens → Add token → Viewer. Then:

```
SANITY_API_READ_TOKEN=<the token>
```

in `.env` locally and in Netlify's environment variables. Without it, `/api/preview/enable`
returns a 501 telling you exactly that, and the site keeps serving published content.

### Why published reads are unauthenticated

Published content is fetched with a **tokenless** client (`publicClient`), and
only draft reads use the authenticated one. That split matters: with a single
token-carrying client, one revoked or mistyped token takes every page down with
`Unauthorized - Session not found`, rather than just breaking preview.

`loadContent()` also falls back to published content if Sanity rejects the token
mid-preview, and logs why. A stale token should degrade preview, never 500 the site.

Quick check on whether a token is good:

```
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://localhost:5173/api/preview/enable?sanity-preview-secret=probe"
```

`401` = token works (Sanity was reached, it just refused the fake secret).
`503` = token rejected — make a new one. `501` = no token configured.

### Draft mode is confined to the Studio iframe

There is no preview mode on the public site and no exit button. Drafts and stega exist
**only** inside Presentation's iframe:

- Presentation calls `/api/preview/enable` with a single-use secret it just wrote to the
  dataset; we validate it against the Content Lake — not the URL — and set an httpOnly,
  signed session cookie
- a loader only honours that cookie when `Sec-Fetch-Dest` says the request came from an
  iframe, so the same browser gets published content in a normal tab
- opening the site normally **clears** the cookie, which is what replaces an exit button

Two things are deliberately separate. The visual-editing runtime mounts whenever we are
inside the preview iframe, so Presentation's overlay and navigation connect even without
a token; drafts additionally need the cookie and a working token. A missing or expired
token therefore costs you draft content, not the whole Presentation connection.

Validation failures never grant drafts — but they do still redirect to the page, so
Presentation shows published content rather than a blank pane.

Set `PREVIEW_COOKIE_SECRET` in production to sign the cookie with something other than
the dev default.

### The stega trap

In preview, Sanity encodes invisible characters into every string so it can map text back
to a field. An 11-character `"alternating"` becomes ~750 characters. That means
`layout === 'alternating'` is **false** in preview, and `TONE[tone]` misses — so pages
silently render with default layouts, in preview only.

`app/lib/stega.ts` exports `opt()` for this. The rule:

- **clean** anything you compare, switch on, or use as an object key or HTML id
- **clean** anything going into `<head>` or JSON-LD — stega in a meta description shows
  up in Google's snippet
- **never** clean text you render, or click-to-edit stops working

Every existing section already does this. New ones should too.

## Publishing the Studio

Two separate things, both run from this repo with the Sanity CLI (they need your
own `sanity login`, so they aren't scripted here):

```bash
npx sanity schema deploy   # publishes the schema so Sanity tooling knows the types
npx sanity deploy          # publishes a hosted Studio at treeworks-cornwall.sanity.studio
```

`npx sanity deploy` is optional. The Studio is already embedded in this app at
`/studio`, so once the Netlify site is live you have a Studio there either way.
A hosted one is useful before that — it gives the client somewhere to edit
without waiting on the frontend deploy.

`basePath` switches automatically: `/studio` for the embedded route, `/` for the
standalone deploy (via `SANITY_STUDIO_BASE_PATH` in `.env`, which only the Sanity
CLI build can see).

## Deploying

Netlify, building from this repo. `netlify.toml` is configured. Set these environment
variables in the Netlify UI:

```
VITE_SANITY_PROJECT_ID=bb392mn5
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2026-08-01
VITE_SANITY_STUDIO_URL=/studio
VITE_BEHOLD_FEED_URL=<your feed url>
```

Then add the deploy URL as a CORS origin in the Sanity project settings.

## Content

All eleven WordPress pages are migrated and published, with the original slugs preserved —
they carry the existing search rankings, so don't change them without a redirect.

`docs/content-audit.md` records what was found on the old site, including the issues worth
fixing rather than porting.
