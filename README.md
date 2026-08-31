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

## Wood grain

`public/wood-grain.svg` — long grain lines that deflect around two knots, with
concentric rings at each. Generated, not hand-drawn; the script that produced it
is in the commit history and uses a fixed random seed, so it regenerates
identically.

It is applied as a **mask**, not a background image, so one asset picks up
`currentColor` and works on the light and dark panels alike instead of needing
two copies. Turn it on per section in Studio: **Appearance → Background pattern →
Wood grain**. Opacity is tuned per tone (6% on bone, 9% on lichen, 10% on bark)
and it is removed entirely under `prefers-contrast: more`.

This is our own drawing, not the reference site's asset — theirs is a
topographic contour motif, and grain suits a tree surgeon better anyway.

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

### How draft mode works

React Router has no built-in `draftMode()`, so:

- Presentation calls `/api/preview/enable` with a single-use secret it just wrote to the dataset
- we validate that secret against the Content Lake — not against the URL — and set an
  httpOnly, signed cookie
- loaders read the cookie and switch to `perspective: 'drafts'` with stega enabled
- `/api/preview/disable` clears it; an **Exit preview** button appears if you opened a
  preview link outside the Studio

Anything that fails validation fails *closed*: no cookie, no drafts. A visitor cannot
opt themselves into unpublished content.

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
