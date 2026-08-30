/**
 * Netlify only registers form fields it can find in static HTML at deploy time.
 * If ContactForm.tsx grows a field that public/__forms.html does not declare,
 * that field is silently dropped from every submission — no error, just missing
 * data. This check makes that failure loud instead.
 */
import {readFileSync} from 'node:fs'

const formsHtml = readFileSync(new URL('../public/__forms.html', import.meta.url), 'utf8')
const component = readFileSync(
  new URL('../app/components/sections/ContactForm.tsx', import.meta.url),
  'utf8',
)

// Only fields — not the <form> element's own name, nor <meta name="robots">.
const declared = new Set(
  [...formsHtml.matchAll(/<(?:input|textarea|select)\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]),
)

// Field ids the component can render, from FIELD_LABELS.
const labelsBlock = component.match(/const FIELD_LABELS[^=]*= \{([\s\S]*?)\n\}/)
if (!labelsBlock) {
  console.error('check:forms — could not find FIELD_LABELS in ContactForm.tsx')
  process.exit(1)
}
const rendered = new Set([...labelsBlock[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]))

const missing = [...rendered].filter((f) => !declared.has(f))
const orphaned = [...declared].filter(
  (f) => !rendered.has(f) && !['form-name', 'bot-field'].includes(f),
)

if (missing.length) {
  console.error(
    `check:forms — these fields render but are NOT in public/__forms.html, so Netlify will drop them:\n  ${missing.join('\n  ')}`,
  )
}
if (orphaned.length) {
  console.warn(`check:forms — declared but never rendered (harmless):\n  ${orphaned.join('\n  ')}`)
}
if (missing.length) process.exit(1)

console.log(`check:forms — OK. ${rendered.size} fields declared and rendered.`)
