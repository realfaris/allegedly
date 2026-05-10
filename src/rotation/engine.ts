// Rotation engine — pure functions only.
//
// The contract: given (now, prefs), return everything the screen / widget
// needs to render — active category, active palette, the quote at the
// current cursor, and helpers to walk the deck for swipe.
//
// Why pure: app and widget compute identical answers without shared state.
// All "where am I in the rotation" comes from `now` (slot index) plus
// stable per-category shuffles. Favorites get a 2x-weight boost in the
// current deck via duplication; this means the deck recomposes when
// favorites change. Acceptable for v1 — see NOTES.md.

import type { Category, Prefs, Quote } from '../types';
import { getQuotesForCategory, filterStubs, getQuoteById } from '../quotes/load';
import { seededShuffle } from './shuffle';
import { getSlotIndex } from './timeOfDay';

/**
 * Picks which of the user's selected categories is "active" at `slotIndex`.
 * Round-robin through `prefs.categories` in selection order — the
 * session-locked design from PLAN.
 */
export function getActiveCategory(slotIndex: number, prefs: Prefs): Category {
  if (prefs.categories.length === 0) return 'motivational'; // safety fallback
  return prefs.categories[slotIndex % prefs.categories.length];
}

/**
 * Cursor inside the active category's deck. Counts how many times this
 * category has been the active one in slots [0..slotIndex].
 */
export function getCategoryCursor(slotIndex: number, prefs: Prefs): number {
  if (prefs.categories.length === 0) return 0;
  return Math.floor(slotIndex / prefs.categories.length);
}

/**
 * Build the deterministic shuffled deck for a category. Stubs are filtered
 * out so v1 never renders "[placeholder ...]". Favorites that belong to
 * this category are doubled in the input pool (2x weight). Same input
 * always yields the same output.
 */
export function buildDeck(
  category: Category,
  favorites: readonly string[],
): readonly Quote[] {
  const base = filterStubs(getQuotesForCategory(category));
  if (base.length === 0) return base;

  // Boost: each favorite that lives in this category gets duplicated in
  // the input pool. After shuffle they're more likely to land near the
  // top of the deck, but not guaranteed — that's the "boost not pin"
  // semantics from PLAN.
  const boost: Quote[] = [];
  for (const id of favorites) {
    const q = getQuoteById(id);
    if (q && q.category === category) boost.push(q);
  }

  // De-duplicate within the boosted set (deck.length still gives unique
  // count for cursor wraparound).
  const pool = [...base, ...boost];

  const seed = `deck:${category}:fav:${[...favorites].sort().join(',')}`;
  return seededShuffle(pool, seed);
}

export interface RotationState {
  slotIndex: number;
  category: Category;
  cursor: number;
  deck: readonly Quote[];
  /** The quote at `cursor` (after wraparound). Null if the deck is empty. */
  current: Quote | null;
}

/**
 * Top-level resolver. Given `now` (defaults to current time) and prefs,
 * returns the full rotation state. Both QuoteScreen and the widget call
 * this; nothing else should reproduce its logic.
 */
export function getRotationState(prefs: Prefs, now: Date = new Date()): RotationState {
  const slotIndex = getSlotIndex(now);
  const category = getActiveCategory(slotIndex, prefs);
  const cursor = getCategoryCursor(slotIndex, prefs);
  const deck = buildDeck(category, prefs.favorites);
  const current = deck.length > 0 ? deck[cursor % deck.length] : null;
  return { slotIndex, category, cursor, deck, current };
}

/**
 * Walk the current deck by `delta` (positive = next, negative = previous).
 * Pure — does not advance time. Used by swipe to preview adjacent quotes.
 * Wraps around the deck.
 */
export function walkDeck(state: RotationState, delta: number): Quote | null {
  if (state.deck.length === 0) return null;
  const len = state.deck.length;
  const idx = ((state.cursor + delta) % len + len) % len;
  return state.deck[idx];
}
