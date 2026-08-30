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
