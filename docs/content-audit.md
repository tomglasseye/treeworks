# Treeworks Cornwall — WordPress content audit

Source: https://treeworkscornwall.co.uk/ · audited 30 Aug 2026

## Platform findings

| Thing | Finding |
|---|---|
| Theme | Custom classic PHP theme (`contact.php` template on Contact Us). Layout lives in templates, not in the editor. |
| Custom post types | **None.** Only core `post` / `page` / `attachment`. |
| ACF | Plugin installed (`_acf_changed` meta present) but **no fields exposed to REST** — field data is not retrievable via the API. |
| Forms | Ninja Forms installed, **but the contact page renders no form at all** (verified in-browser: zero form fields). |
| SEO | Yoast. Titles/descriptions per page — must be carried across. |
| Media library | **170 items.** Almost all have **empty `alt_text`** — an accessibility and SEO debt worth fixing during migration. |
| Fonts in use | Rubik (headings), Roboto (body). Being replaced. |

> **Consequence:** because section structure lives in PHP templates and ACF is not exposed, content cannot be migrated by API alone. Body copy comes from `content.rendered` + the rendered pages; **section composition has to be re-modelled by hand** into the page-builder. That is exactly the intent, but it means migration is a content-entry task, not a script.

## Pages (10 published + home)

| Slug | Title | Notes |
|---|---|---|
| *(front page)* | Home | `front-page.php` — not an editable page in WP at all |
| `tree-surgery` | Tree Surgery | Largest page: 11 repeating service blocks |
| `fencing-hard-landscaping` | Fencing & Landscaping | 2 service blocks |
| `grounds-maintenance` | Grounds Maintenance | 4 blocks incl. a compliance/legal block |
| `forestry` | Forestry | 5 service blocks |
| `ash-dieback` | Ash Dieback | Editorial/explainer: bullet lists + a quoted government advisory |
| `about-us` | About Us | Team, values, testimonials |
| `gallery` | Gallery | **Stub** — one image + link to Instagram |
| `contact-us` | Contact Us | **No form.** Contact details only |
| `tree-surgeon-cornwall` | Tree Surgeon Cornwall | SEO landing page |
| `newquay-tree-surgeon` | Newquay Tree Surgeon | Location SEO landing page |

## Recurring section patterns

Frequency across the 11 pages — this is what drives the schema:

| Pattern | Appears on | Becomes |
|---|---|---|
| Page hero (title + standfirst + image + CTA) | 11/11 | `hero` |
| "Free site visit / no obligation quotation" band | 9/11, **twice** on several | `cta` |
| Repeating *heading + body + image* service blocks | 5 pages (11, 5, 4, 2, 4 items) | `featureList` |
| Contact details band (phone / email / address / socials) | 11/11 — identical | `contactDetails`, sourced from `siteSettings` |
| Service cards linking to other pages | Home | `serviceCards` |
| Testimonials | Home (8), About (2) | `testimonials` + `testimonial` docs |
| Prose with bullet lists / block quote | Ash Dieback | `richText` |
| 24-hour emergency call-out band | Tree Surgery, Home | `cta` with `tone: "urgent"` |
| Values / mission statement | About ("We Love Trees") | `statement` |

**The single biggest finding:** the same CTA band and the same contact block are hand-repeated on every page. In the new model they are one section type and one settings document — change the phone number once, not eleven times.

## Content issues found (worth fixing, not porting)

1. **Inconsistent location claim.** About Us says the business is "based near St Columb Major"; the Newquay page says "based just outside of Newquay in St Newlyn East". The registered address is Tregonetha, St Columb. Pick one.
2. **170 images, no alt text.** Fix during migration.
3. **Contact page has no working form** — visitors can only phone or email. This is the clearest conversion win in the rebuild.
4. **Gallery is a dead end** — sends traffic off-site to Instagram.
5. **Copyright says "©2026"** — hardcode nothing; derive the year.
6. **Two phone numbers** appear (Tom 07880 335025, Mel 07974 937649) but only Tom's is in the footer.

## Verbatim copy

Full body copy for every page was captured during the audit and will be transferred at content-entry time. Key reusable strings:

- Standing CTA: *"Contact us today for a free site visit and a free, no obligation quotation"*
- Emergency: *"If you've got a tree problem that needs immediate attention, no matter what time of the day or night, 365 days of the year, we can help, even if only initially to make dangerous trees safe or re-open an access. Emergency call out charges will apply where a consultant or team is mobilised at your request."*
- Business: Treeworks Cornwall Ltd · Company No. 11472677 · Avalen Farm, Tregonetha, St Columb, Cornwall, TR9 6EN · 07880 335025 · info@treeworkscornwall.co.uk · @treeworks_cornwall

## Migration / SEO checklist

- [ ] Preserve all 10 slugs exactly — they carry existing rankings
- [ ] Port Yoast title + meta description per page into the `seo` object
- [ ] Re-upload media to Sanity **with alt text written**
- [ ] Add `LocalBusiness` structured data (absent today)
- [ ] 301 map only if any slug changes (none planned)
- [ ] Check Search Console for the two landing pages before assuming their value
