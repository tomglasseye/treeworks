# Sanity schema — Treeworks Cornwall

Draft for review. Nothing is wired into a Studio yet.

```
schemaTypes/
├── objects/      5 shared primitives, reused everywhere
├── sections/    15 page-builder sections
└── documents/    6 document types (2 of them singletons)
```

## The idea

A `page` is a title, a slug, and an **array of sections**. Every section type is
allowed on every page, so the order and the mix are the editor's decision, not
the developer's. `SectionRenderer` maps each section's `_type` to a React
component; adding a section type later means one schema file and one component,
and no change to any page.

Every section carries `sectionAppearance` — background tone (bone / lichen / bark),
vertical spacing, optional anchor id. That is how colour rhythm gets composed in
Studio rather than in code.

## Why these fifteen sections

They were derived from the audit, not invented. The old site's eleven pages
collapse into these; see `docs/content-audit.md` for the frequency table.

The one that does the most work is `featureList`. Tree Surgery's eleven service
blocks, Forestry's five, Grounds Maintenance's four and Fencing's two are all
the same shape — heading, body, image — differing only in layout. One type,
four layout options, instead of four near-identical section types.

## Singletons

`siteSettings` and `navigation` should be pinned as single documents in the
Studio structure and excluded from the "create new" menu.

## Notes

- `figure` makes alt text a validation error unless the image is explicitly
  marked decorative. The old library had 170 images and almost no alt text.
- `contactSubmission` is read-only except for `status` and `notes`.
- The gallery reads the live Instagram feed through a Netlify Function; it
  stores presentation settings only, plus fallback images for when the feed
  is unreachable.
