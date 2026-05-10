// Core domain types shared across screens, storage, theme, rotation, and (later) the widget.
// Keep this file dependency-free so it can be imported anywhere without cycles.

export type Category =
  | 'motivational'
  | 'anti_motivational'
  | 'dumb'
  | 'funny'
  | 'stoic';

export const ALL_CATEGORIES: readonly Category[] = [
  'motivational',
  'anti_motivational',
  'dumb',
  'funny',
  'stoic',
] as const;

export type Tone = 'sincere' | 'sassy' | 'minimal';

export type BackgroundMode = 'category' | 'fixed';

// PaletteId covers both category-default palettes and the curated user-pickable set.
// Keeping them in one union so `Prefs.fixedPalette` can hold any of them.
export type PaletteId =
  // Category defaults
  | 'sunrise'        // motivational
  | 'noir'           // anti_motivational
  | 'stone'          // stoic
  | 'pastel'         // dumb
  | 'sunbeam'        // funny
  // User-pickable curated set (placeholders, finalized in Phase 4)
  | 'dusk'
  | 'midnight'
  | 'parchment'
  | 'oceanic'
  | 'rose'
  | 'forest'
  | 'monochrome'
  | 'amber';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Quote {
  id: string;
  text: string;
  author: string;        // 'Allegedly' for original quotes; real author for public-domain
  source?: string;       // metadata only, not rendered
  public_domain: boolean;
  original?: boolean;    // true for our own anti-motivational / dumb originals
  category: Category;
}

export interface Prefs {
  name?: string;
  categories: Category[];           // must contain at least one
  tone: Tone;
  backgroundMode: BackgroundMode;
  fixedPalette?: PaletteId;         // only meaningful when backgroundMode === 'fixed'
  favorites: string[];              // quote ids
  onboarded: boolean;
}
