# Design direction — adapted from solterra.ca

Measured from the live site (computed styles, 30 Aug 2026), then adapted for Treeworks.
The goal is Solterra's *restraint* — editorial serif, deep green, generous air — not its exact palette.

## What Solterra actually does

| Token | Measured value |
|---|---|
| Dark green | `#384933` (`--main-dark-color`) |
| Sage panel | `#d8d9bc` (`--main-light-color`) |
| Page ground | `#fffcf2` warm bone |
| Display face | Hedvig Letters Serif — **every weight 400** |
| UI/body face | Mulish 400 |
| Accent | Libre Baskerville *italic*, used inside display lines |
| Display sizes | 72 / 54 / 40 / 24 / 20 px |
| Leading | Display ~1.0–1.2 (tight), body 1.5 |
| Radii | 16px panels · 8px inputs · 100px pills |
| Section rhythm | 128px primary · 64px secondary · 24 / 16px inner |

**The moves worth stealing:**

1. Full-bleed hero image *inset* from the viewport with a 16px radius — the page ground frames the photo.
2. Asymmetric statement rows: small body copy left, large serif statement right with *italic* emphasis on key phrases.
3. Tinted rounded panels (sage, forest) carrying a text+image pair — colour blocks the rhythm instead of rules.
4. Numbered feature columns (`01 / 02 / 03`) separated by hairlines.
5. Everything at weight 400. No bold headings anywhere. The size does the work.
6. Decorative contour lines drifting behind sections — a topographic motif.

**What not to copy:** the exact greens (they're a soil-remediation company's), the contour-line motif (theirs, and site-specific), and the oversized footer wordmark.

## Proposed Treeworks palette

Shifted warmer and darker than Solterra — Cornish woodland rather than Québec agronomy. Bark, leaf, lichen.

| Token | Value | Use |
|---|---|---|
| `--color-bark` | `#2C3A2A` | Primary dark: footer, dark panels, display text |
| `--color-canopy` | `#44573F` | Mid green: buttons, links, hover |
| `--color-lichen` | `#CFD6BC` | Light panel tint |
| `--color-bone` | `#FBF9F1` | Page ground |
| `--color-sap` | `#B4703A` | Warm accent — emergency CTA, chainsaw-orange nod, used sparingly |
| `--color-ink` | `#23291F` | Body text |
| `--color-muted` | `#6B7361` | Secondary text, captions |
| `--color-rule` | `#DDD9C9` | Hairlines |

`--color-sap` earns its place: a tree surgeon has a genuine 24/7 emergency service, and it needs a colour that isn't green.

## Type

| Role | Face | Size / leading |
|---|---|---|
| Display | **Fraunces** or **Hedvig Letters Serif** (both variable, both free) | see scale |
| Body / UI | **Mulish** | 16 / 1.5 |
| Accent italic | Display face, italic | inside display lines |

Fraunces is the recommendation over Hedvig — it has a proper italic and an optical-size axis, so the 72px hero and the 20px card title can share one family without looking like two.

Scale (rem, 16px root):

| Token | px | Leading | Use |
|---|---|---|---|
| `--text-display` | 72 | 1.05 | Homepage hero only |
| `--text-4xl` | 54 | 1.0 | Section headings |
| `--text-3xl` | 40 | 1.15 | Statement rows |
| `--text-2xl` | 32 | 1.2 | Sub-sections |
| `--text-xl` | 24 | 1.2 | Card titles |
| `--text-lg` | 20 | 1.45 | Standfirst / lead |
| `--text-base` | 16 | 1.5 | Body |
| `--text-sm` | 14 | 1.6 | Captions, meta |
| `--text-eyebrow` | 11 | 1.4 | 700, uppercase, 0.12em tracking |

Clamp the top three for mobile — 72px must not ship to a 390px viewport.

## Spacing

8px base. Section rhythm `--space-section` 128px desktop → 72px mobile; `--space-section-tight` 64px → 40px.

## Tailwind v4 `@theme` — first draft

```css
@theme {
  --color-bark:   #2C3A2A;
  --color-canopy: #44573F;
  --color-lichen: #CFD6BC;
  --color-bone:   #FBF9F1;
  --color-sap:    #B4703A;
  --color-ink:    #23291F;
  --color-muted:  #6B7361;
  --color-rule:   #DDD9C9;

  --font-display: "Fraunces", Georgia, serif;
  --font-body:    "Mulish", system-ui, sans-serif;

  --text-display: 4.5rem;   --text-display--line-height: 1.05;
  --text-4xl:     3.375rem; --text-4xl--line-height: 1;
  --text-3xl:     2.5rem;   --text-3xl--line-height: 1.15;
  --text-2xl:     2rem;     --text-2xl--line-height: 1.2;
  --text-xl:      1.5rem;   --text-xl--line-height: 1.2;
  --text-lg:      1.25rem;  --text-lg--line-height: 1.45;
  --text-base:    1rem;     --text-base--line-height: 1.5;
  --text-sm:      0.875rem; --text-sm--line-height: 1.6;

  --radius-panel: 1rem;
  --radius-input: 0.5rem;
  --radius-pill:  100px;

  --spacing-section:       8rem;
  --spacing-section-tight: 4rem;
}
```

The three `tone` values a section can take (`bone` / `lichen` / `bark`) map straight onto these tokens, so the page-builder composes colour rhythm without a developer.
