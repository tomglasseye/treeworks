import {stegaClean} from '@sanity/client/stega'

/**
 * Strip stega markers from a value used for LOGIC rather than display.
 *
 * In preview, Sanity encodes invisible characters into every string so the
 * Presentation tool can map it back to a field. Great for click-to-edit,
 * fatal for comparisons: `layout === 'alternating'` becomes false, and object
 * lookups like TONE[tone] miss, so pages quietly render with default layouts —
 * but only in preview, which makes it a nasty thing to debug.
 *
 * Rule of thumb: clean anything you compare, switch on, or use as a key.
 * Never clean text you render, or click-to-edit stops working.
 */
export function opt<T extends string | undefined | null>(value: T): T {
  return (value == null ? value : stegaClean(value)) as T
}

/** Same, for arrays of option strings (e.g. the contact form's field list). */
export function optList(values?: string[] | null): string[] {
  return (values ?? []).map((v) => stegaClean(v))
}
