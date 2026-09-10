/**
 * Checks the things search engines and browsers fetch but nobody ever looks at.
 *
 * Structured data and icons fail silently by design: malformed JSON-LD is
 * skipped rather than reported, and a missing icon is just a blank tab. Both
 * look identical to "working" from the outside, so they get asserted here.
 *
 *   node scripts/check-seo.mjs [base-url]    (default http://localhost:5173)
 *
 * Needs the dev server running — it checks rendered output, not source.
 */
const base = (process.argv[2] ?? 'http://localhost:5173').replace(/\/$/, '')

const failures = []
const notes = []
const fail = (msg) => failures.push(msg)

async function get(path) {
  try {
    const res = await fetch(`${base}${path}`)
    return {res, body: Buffer.from(await res.arrayBuffer())}
  } catch (error) {
    fail(`${path} — request failed: ${error.message}`)
    return null
  }
}

/** Magic bytes beat content-type here: dev servers guess the latter. */
const SIGNATURES = {
  '/favicon.ico': (b) => b.readUInt16LE(0) === 0 && b.readUInt16LE(2) === 1,
  '/favicon.svg': (b) => b.toString('utf8', 0, 200).includes('<svg'),
  '/apple-touch-icon.png': (b) => b.subarray(1, 4).toString() === 'PNG',
  '/icon-192.png': (b) => b.subarray(1, 4).toString() === 'PNG',
  '/icon-512.png': (b) => b.subarray(1, 4).toString() === 'PNG',
}

for (const [path, isValid] of Object.entries(SIGNATURES)) {
  const got = await get(path)
  if (!got) continue
  if (got.res.status !== 200) fail(`${path} — expected 200, got ${got.res.status}`)
  else if (!got.body.length) fail(`${path} — served an empty file`)
  else if (!isValid(got.body)) fail(`${path} — served, but the bytes are not the right format`)
}

const manifest = await get('/site.webmanifest')
if (manifest && manifest.res.status === 200) {
  try {
    const parsed = JSON.parse(manifest.body.toString('utf8'))
    if (!parsed.icons?.length) fail('/site.webmanifest — declares no icons')
    if (!parsed.theme_color) fail('/site.webmanifest — has no theme_color')
  } catch (error) {
    fail(`/site.webmanifest — is not valid JSON: ${error.message}`)
  }
} else if (manifest) {
  fail(`/site.webmanifest — expected 200, got ${manifest.res.status}`)
}

const robots = await get('/robots.txt')
if (robots) {
  const text = robots.body.toString('utf8')
  if (robots.res.status !== 200) fail(`/robots.txt — expected 200, got ${robots.res.status}`)
  else if (!/^Sitemap:\s*https?:\/\/\S+/m.test(text))
    fail('/robots.txt — no absolute Sitemap: line')
  if (/^Disallow:\s*\/\s*$/m.test(text)) notes.push('/robots.txt is disallowing everything (non-production build)')
}

/** Doubles as the source of a real page slug to test breadcrumbs against. */
let pagePath = null
const sitemap = await get('/sitemap.xml')
if (sitemap) {
  const xml = sitemap.body.toString('utf8')
  if (sitemap.res.status !== 200) fail(`/sitemap.xml — expected 200, got ${sitemap.res.status}`)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (!locs.length) fail('/sitemap.xml — contains no <loc> entries')
  const relative = locs.filter((l) => !/^https?:\/\//.test(l))
  if (relative.length) fail(`/sitemap.xml — ${relative.length} <loc> values are not absolute URLs`)

  const inner = locs.map((l) => new URL(l).pathname).find((p) => p !== '/' && p !== '')
  if (inner) pagePath = inner
  else notes.push('sitemap has no non-homepage entries, so breadcrumbs were not checked')
}

/** Every JSON-LD block on a page, parsed. Unparseable ones are a failure. */
async function jsonLdOn(path) {
  const got = await get(path)
  if (!got) return []
  if (got.res.status !== 200) {
    fail(`${path} — expected 200, got ${got.res.status}`)
    return []
  }
  const html = got.body.toString('utf8')
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
  return blocks.flatMap(([, raw]) => {
    try {
      return [JSON.parse(raw)]
    } catch (error) {
      fail(`${path} — a JSON-LD block does not parse: ${error.message}`)
      return []
    }
  })
}

function requireFields(label, object, fields) {
  for (const field of fields) {
    const value = object?.[field]
    if (value === undefined || value === null || value === '') {
      fail(`${label} — "${field}" is missing or empty`)
    }
  }
}

/**
 * An absent property and a null one are different things to a consumer: the
 * first says nothing, the second asserts "this business has no image". Only
 * `undefined` is dropped by JSON.stringify, so a null leaking in from a GROQ
 * projection ends up published.
 */
function assertNoNulls(label, object) {
  for (const [key, value] of Object.entries(object)) {
    if (value === null) fail(`${label} — "${key}" is null; it should be omitted entirely`)
  }
}

const home = await jsonLdOn('/')
const business = home.find((b) => b['@type'] === 'LocalBusiness')
if (!business) fail('homepage — no LocalBusiness JSON-LD found')
else {
  requireFields('LocalBusiness', business, ['name', 'url', '@id'])
  assertNoNulls('LocalBusiness', business)
  if (business.url && !/^https?:\/\//.test(business.url))
    fail('LocalBusiness — "url" is not an absolute URL')
}
if (home.some((b) => b['@type'] === 'BreadcrumbList'))
  fail('homepage — has a BreadcrumbList, which should only appear on inner pages')

if (pagePath) {
  const page = await jsonLdOn(pagePath)
  const crumbs = page.find((b) => b['@type'] === 'BreadcrumbList')
  if (!crumbs) fail(`${pagePath} — no BreadcrumbList JSON-LD found`)
  else {
    const items = crumbs.itemListElement ?? []
    if (items.length !== 2) fail(`${pagePath} — expected a 2-item breadcrumb, got ${items.length}`)
    items.forEach((item, i) => {
      requireFields(`BreadcrumbList item ${i + 1}`, item, ['name', 'item', 'position'])
      if (item.item && !/^https?:\/\//.test(item.item))
        fail(`BreadcrumbList item ${i + 1} — "item" is not an absolute URL`)
    })
  }
}

for (const note of notes) console.log(`check:seo — note: ${note}`)

if (failures.length) {
  console.error(`\ncheck:seo — ${failures.length} problem(s):\n  ${failures.join('\n  ')}`)
  process.exit(1)
}

console.log(
  `check:seo — OK. Icons, manifest, robots, sitemap, LocalBusiness${pagePath ? ` and breadcrumbs (${pagePath})` : ''} all valid.`,
)
