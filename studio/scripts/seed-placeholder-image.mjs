/**
 * Fill every empty image field with one placeholder image.
 *
 *   npx sanity exec scripts/seed-placeholder-image.mjs --with-user-token
 *   npx sanity exec scripts/seed-placeholder-image.mjs --with-user-token -- --dry-run
 *
 * Uploads the source image once, then walks every page and location page and
 * sets it on any image field that is still empty. Existing images are never
 * overwritten, so it is safe to re-run as real photography arrives — it only
 * fills the gaps that are left.
 *
 * To undo: `--clear` removes only the fields this script filled (they are
 * tagged with placeholder: true).
 */
import {getCliClient} from 'sanity/cli'

const SOURCE_URL =
  'https://treeworkscornwall.co.uk/wp-content/uploads/2024/04/IMG_4009-2048x1365.jpeg'

const ALT =
  'Placeholder — looking up through a bamboo grove towards a bright green canopy'

const GALLERY_FALLBACK_COUNT = 6

const dryRun = process.argv.includes('--dry-run')
const clear = process.argv.includes('--clear')

const client = getCliClient({apiVersion: '2026-08-01'})

/** Reuse the asset if this script has already uploaded it. */
async function ensureAsset() {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $name][0]{_id}`,
    {name: 'treeworks-placeholder.jpeg'},
  )
  if (existing?._id) {
    console.log(`Reusing existing asset ${existing._id}`)
    return existing._id
  }

  console.log(`Downloading ${SOURCE_URL}`)
  const response = await fetch(SOURCE_URL)
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  console.log(`  ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

  const asset = await client.assets.upload('image', buffer, {
    filename: 'treeworks-placeholder.jpeg',
    title: 'Placeholder image',
  })
  console.log(`Uploaded asset ${asset._id}`)
  return asset._id
}

const imageValue = (assetId) => ({
  _type: 'figure',
  asset: {_type: 'reference', _ref: assetId},
  alt: ALT,
  placeholder: true,
})

const isEmpty = (value) => !value || !value.asset
const isPlaceholder = (value) => Boolean(value?.placeholder)

// Only these carry images. stats.items and faq.items are arrays too, but of
// figures-and-labels and questions-and-answers — writing .image into those
// would create fields the schema does not define.
const SINGLE_IMAGE_SECTIONS = new Set(['hero', 'textWithImage', 'imageBanner'])
const ITEM_IMAGE_SECTIONS = new Set(['featureList'])

/** Collect { path, kind } for every image slot in a document. */
function findImageSlots(doc) {
  const slots = []
  const sections = doc.sections ?? []

  for (const section of sections) {
    const base = `sections[_key=="${section._key}"]`

    if (SINGLE_IMAGE_SECTIONS.has(section._type)) {
      slots.push({path: `${base}.image`, value: section.image, kind: section._type})
    }

    if (ITEM_IMAGE_SECTIONS.has(section._type)) {
      for (const item of section.items ?? []) {
        slots.push({
          path: `${base}.items[_key=="${item._key}"].image`,
          value: item.image,
          kind: `${section._type}.item`,
        })
      }
    }

    if (section._type === 'serviceCards') {
      for (const card of section.cards ?? []) {
        slots.push({
          path: `${base}.cards[_key=="${card._key}"].image`,
          value: card.image,
          kind: 'serviceCards.card',
        })
      }
    }

    if (section._type === 'logoStrip') {
      for (const logo of section.logos ?? []) {
        slots.push({
          path: `${base}.logos[_key=="${logo._key}"].image`,
          value: logo.image,
          kind: 'logoStrip.logo',
        })
      }
    }

    // Galleries take an array. Give the Instagram ones a fallback set so the
    // page is not empty before the Behold feed is connected.
    if (section._type === 'gallery') {
      const field = section.source === 'sanity' ? 'images' : 'fallbackImages'
      const current = section[field] ?? []
      if (current.length === 0) {
        slots.push({path: `${base}.${field}`, value: null, kind: `gallery.${field}`, array: true})
      }
    }
  }

  if (doc.seo) slots.push({path: 'seo.shareImage', value: doc.seo.shareImage, kind: 'seo'})

  return slots
}

async function run() {
  const docs = await client.fetch(
    `*[_type in ["page", "locationPage"] && !(_id in path("drafts.**"))]{
      _id, _type, title, sections, seo
    } | order(_id)`,
  )
  console.log(`\n${docs.length} documents\n`)

  const assetId = clear ? null : await ensureAsset()
  let filled = 0
  let skipped = 0
  let cleared = 0

  for (const doc of docs) {
    const slots = findImageSlots(doc)
    const patch = {set: {}, unset: []}
    const notes = []

    for (const slot of slots) {
      if (clear) {
        const values = slot.array ? (slot.value ?? []) : [slot.value]
        if (values.some(isPlaceholder)) {
          patch.unset.push(slot.path)
          cleared++
          notes.push(`  - cleared ${slot.kind}`)
        }
        continue
      }

      if (slot.array) {
        patch.set[slot.path] = Array.from({length: GALLERY_FALLBACK_COUNT}, (_, i) => ({
          ...imageValue(assetId),
          _key: `placeholder-${i}`,
        }))
        filled++
        notes.push(`  + ${slot.kind} (${GALLERY_FALLBACK_COUNT} images)`)
        continue
      }

      if (isEmpty(slot.value)) {
        patch.set[slot.path] = imageValue(assetId)
        filled++
        notes.push(`  + ${slot.kind}`)
      } else {
        skipped++
      }
    }

    const hasWork = Object.keys(patch.set).length > 0 || patch.unset.length > 0
    if (!hasWork) continue

    console.log(`${doc.title} (${doc._id})`)
    notes.forEach((n) => console.log(n))

    if (!dryRun) {
      let tx = client.patch(doc._id)
      if (Object.keys(patch.set).length) tx = tx.set(patch.set)
      if (patch.unset.length) tx = tx.unset(patch.unset)
      await tx.commit()
    }
  }

  console.log(
    `\n${dryRun ? 'DRY RUN — nothing written. ' : ''}` +
      (clear
        ? `${cleared} placeholder field(s) cleared.`
        : `${filled} field(s) filled, ${skipped} left alone (already had an image).`),
  )
  if (!clear && !dryRun) {
    console.log('\nThese are placeholders. Replace them in Studio and rewrite the alt text —')
    console.log('alt text describing a bamboo grove is not useful on a Cornish tree surgery page.')
  }
}

run().catch((error) => {
  console.error('\nFailed:', error.message)
  process.exit(1)
})
