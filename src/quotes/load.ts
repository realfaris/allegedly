// Quote pack loader.
//
// Quotes are bundled as JSON in `assets/quotes/`, one file per category.
// Metro's bundler inlines the JSON at build time — no I/O at runtime.
//
// Principle check: the loader is the ONLY module that imports the raw JSON.
// Anything that needs quotes goes through these functions, so swapping the
// pack source (e.g. remote-fetched in v2) only touches this file.

import type { Category, Quote } from '../types';

import motivationalRaw from '../../assets/quotes/motivational.json';
import antiMotivationalRaw from '../../assets/quotes/anti_motivational.json';
import dumbRaw from '../../assets/quotes/dumb.json';
import funnyRaw from '../../assets/quotes/funny.json';
import stoicRaw from '../../assets/quotes/stoic.json';

// JSON imports come back as `any`-shaped readonly arrays. We trust our own
// authoring discipline and cast through `unknown` to the typed shape, then
// run a cheap validation pass on first access.
const PACKS: Readonly<Record<Category, readonly Quote[]>> = {
  motivational: motivationalRaw as unknown as Quote[],
  anti_motivational: antiMotivationalRaw as unknown as Quote[],
  dumb: dumbRaw as unknown as Quote[],
  funny: funnyRaw as unknown as Quote[],
  stoic: stoicRaw as unknown as Quote[],
};

let validated = false;

/**
 * One-time shape check. Cheap because pack sizes are bounded (~200 each).
 * Throws in dev if a pack is malformed; we'd rather fail loudly at startup
 * than render undefined text in the UI.
 */
function validatePacks(): void {
  if (validated) return;
  for (const [category, pack] of Object.entries(PACKS)) {
    if (!Array.isArray(pack)) {
      throw new Error(`[quotes/load] pack "${category}" is not an array`);
    }
    for (const q of pack) {
      if (
        typeof q.id !== 'string' ||
        typeof q.text !== 'string' ||
        typeof q.author !== 'string' ||
        typeof q.public_domain !== 'boolean' ||
        q.category !== category
      ) {
        throw new Error(
          `[quotes/load] pack "${category}" has malformed entry: ${JSON.stringify(q)}`,
        );
      }
    }
  }
  validated = true;
}

/**
 * All quotes for a category, in source order. Rotation engines should treat
 * the order as input only — they own the shuffle.
 */
export function getQuotesForCategory(category: Category): readonly Quote[] {
  validatePacks();
  return PACKS[category];
}

/**
 * Flat list of every quote across every category. Used for favorites lookup
 * (since favorites store quote ids without category context).
 */
export function getAllQuotes(): readonly Quote[] {
  validatePacks();
  return Object.values(PACKS).flat();
}

/**
 * O(1) average lookup by id. Built lazily on first call. Useful for
 * resolving favorites and widget-shared quote ids.
 */
let byIdCache: Map<string, Quote> | null = null;
export function getQuoteById(id: string): Quote | undefined {
  if (!byIdCache) {
    validatePacks();
    byIdCache = new Map();
    for (const q of getAllQuotes()) {
      byIdCache.set(q.id, q);
    }
  }
  return byIdCache.get(id);
}

/**
 * Filter out placeholder/stub entries — those whose id contains "-stub-" or
 * whose text starts with "[placeholder". Used by rotation so users don't
 * see "[placeholder — anti-motivational quote to be written]" in the wild
 * before the real anti-motivational and dumb categories are populated.
 *
 * Returns the input unchanged if no stubs are present.
 */
export function filterStubs(quotes: readonly Quote[]): readonly Quote[] {
  return quotes.filter(
    (q) => !q.id.includes('-stub-') && !q.text.startsWith('[placeholder'),
  );
}
