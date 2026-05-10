// Single source of truth for user preferences. No screen/component should read
// or write AsyncStorage directly for prefs — go through this module.
//
// Principle check: "no split brain" — Prefs lives here. Anything that needs
// it imports from here. Anything that mutates it goes through `savePrefs` or
// `updatePrefs`.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Prefs } from '../types';

const STORAGE_KEY = '@allegedly:prefs:v1';

export const DEFAULT_PREFS: Prefs = {
  name: undefined,
  categories: [],          // empty until onboarding completes
  tone: 'sincere',
  backgroundMode: 'category',
  fixedPalette: undefined,
  favorites: [],
  onboarded: false,
};

/**
 * Load prefs from disk. Returns DEFAULT_PREFS on first launch or if storage
 * is corrupt. Never throws — corruption falls back silently to defaults so
 * the app can still boot.
 */
export async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    // Shallow-merge over defaults so newly-added fields get safe values
    // when an older Prefs blob is read after an app update.
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Replace the entire Prefs blob. Prefer `updatePrefs` for partial changes.
 */
export async function savePrefs(prefs: Prefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/**
 * Read-modify-write helper. Loads current prefs, applies the patch, saves
 * the result, and returns the new Prefs.
 *
 * Note: not safe under concurrent calls from different parts of the app.
 * In practice we only mutate prefs from settings + favorite-toggle paths,
 * which are user-driven and serialized by the UI thread. If concurrency
 * becomes a concern, add an in-memory mutex here.
 */
export async function updatePrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const current = await loadPrefs();
  const next: Prefs = { ...current, ...patch };
  await savePrefs(next);
  return next;
}

/**
 * Wipe prefs (used by "re-run onboarding" in settings). Returns the
 * defaults that the app should now operate on.
 */
export async function clearPrefs(): Promise<Prefs> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  return DEFAULT_PREFS;
}

/**
 * Toggle a favorite. Returns the new favorites list.
 */
export async function toggleFavorite(quoteId: string): Promise<string[]> {
  const current = await loadPrefs();
  const set = new Set(current.favorites);
  if (set.has(quoteId)) set.delete(quoteId);
  else set.add(quoteId);
  const favorites = Array.from(set);
  await savePrefs({ ...current, favorites });
  return favorites;
}
