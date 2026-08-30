# Coverage check — old page → new sections

Every section found in the audit, and the schema type that absorbs it.
If a row had no home, the schema would be wrong.

## Home
| Old | New |
|---|---|
| Hero: "Professional Tree Services in Cornwall" + image + CTA | `hero` (layout: full) |
| 5 service blocks linking to service pages | `serviceCards` |
| 24/7 emergency band | `callToAction` (tone: urgent, showPhone) |
| 8 testimonials | `testimonials` (mode: latest, limit 8) |
| Contact band | `contactDetails` |

## Tree Surgery
| Old | New |
|---|---|
| Hero + emergency number in standfirst | `hero` (layout: split) |
| "Free site visit" band | `callToAction` |
| **11 service blocks** (Tree Assessment → Ancient/Veteran) | `featureList` (layout: alternating) |
| Out-of-hours emergency block | `callToAction` (tone: urgent) |
| Contact band | `contactDetails` |

## Fencing & Landscaping
| Old | New |
|---|---|
| Hero | `hero` (split) |
| CTA band | `callToAction` |
| Fencing + Landscaping blocks | `featureList` (alternating, 2 items) |
| Contact band | `contactDetails` |

## Grounds Maintenance
| Old | New |
|---|---|
| Hero + "Hedge Management and Grounds Clearance" | `hero` (split) |
| Hedge Cutting / Hedge Removal / Grounds Clearance | `featureList` (alternating) |
| Nesting Birds (Wildlife & Countryside Act 1981) | `richText` — it is a legal note, not a service |
| CTA + contact | `callToAction` + `contactDetails` |

## Forestry
| Old | New |
|---|---|
| Hero | `hero` (split) |
| CTA band | `callToAction` |
| "Professional Tree Management" intro | `textWithImage` |
| Coppicing / Pollarding / Formative pruning / Thinning / New Woodland | `featureList` (alternating, 5 items) |
| CTA + contact | `callToAction` + `contactDetails` |

## Ash Dieback
| Old | New |
|---|---|
| Hero + "Areas affected / Origin" pair | `hero` + `stats` |
| What is it / What does it look like (bullets) / What happens | `faq` **or** `richText` — recommend `faq`, it earns rich results |
| Government "Tree safety" excerpt | `richText` (blockquote) |
| CTA band | `callToAction` |
| Removing the tree / Replanting | `featureList` (compact) |

## About Us
| Old | New |
|---|---|
| Hero | `hero` (split) |
| "Our Team" | `textWithImage` |
| "We Love Trees" | `statement` — the Solterra asymmetric move |
| "Your Requirements" + CTA | `callToAction` |
| 2 testimonials | `testimonials` (mode: selected) |

## Gallery
| Old | New |
|---|---|
| Stub: one image + Instagram link | `hero` (text) + `gallery` (live Instagram feed) |

## Contact Us
| Old | New |
|---|---|
| Heading + details, **no working form** | `hero` (text) + `contactForm` + `contactDetails` |

## Location pages (tree-surgeon-cornwall, newquay-tree-surgeon)
| Old | New |
|---|---|
| Hero + local intro + team blurb + contact | `locationPage` doc: `localIntro` + `nearbyAreas` + sections |

---

## Sections with no old-site equivalent

Three types exist that nothing on the current site uses. Each is deliberate:

- **`logoStrip`** — the site shows no qualifications or insurance marks at all. For a trade where the customer is choosing who to put a chainsaw in a tree above their house, that is the biggest missing trust signal.
- **`imageBanner`** — the design direction needs full-bleed image breaks to pace long pages.
- **`stats`** — "16+ years experience", "24/7", "fully insured" are currently buried in prose.

## Nothing was dropped

Every section in the audit has a target. The only content **not** carried over as-is is the gallery's Instagram hand-off, which becomes the live feed instead of a link away.
