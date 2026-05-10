// Palette definitions for the QuoteScreen background.
//
// Two roles:
//   1. CATEGORY_PALETTE_FOR — when prefs.backgroundMode === 'category', the
//      active category maps to its default palette (e.g. stoic → 'stone').
//   2. PALETTES — the lookup every renderer goes through. Includes both the
//      category-default ids and the user-pickable curated set.
//
// Each palette is a vertical gradient (top → bottom) plus the text/byline
// colors that read against it. Picked by hand for legibility — don't edit
// without checking contrast on a real device.
//
// Night-mode (11pm–5am): Phase 5 calls `darkenPalette` on the active palette
// to produce the night variant. Keeping this transformation here so palette
// authoring stays in one file.

import type { Category, PaletteId } from '../types';

export interface Palette {
  id: PaletteId;
  /** Gradient stops, top → bottom. 2 or 3 stops. */
  stops: readonly [string, string] | readonly [string, string, string];
  /** Primary text color (used for the quote). Chosen for legibility on the gradient. */
  text: string;
  /** Slightly muted version for byline + greeting accents. */
  textMuted: string;
}

// Category default palettes
const sunrise: Palette = {
  id: 'sunrise',
  stops: ['#E27B60', '#F5A77E', '#FFE4C4'],
  text: '#2A1810',
  textMuted: '#5A3A2A',
};

const noir: Palette = {
  id: 'noir',
  stops: ['#0A0A0A', '#2D1B2E', '#3D2818'],
  text: '#F5F0E8',
  textMuted: '#A8A095',
};

const stone: Palette = {
  id: 'stone',
  stops: ['#4A5560', '#7A8590', '#A8B0B8'],
  text: '#F5F2EC',
  textMuted: '#D6D2C8',
};

const pastel: Palette = {
  id: 'pastel',
  stops: ['#A8E6CF', '#FFD3B6', '#D4A5E0'],
  text: '#2A1F2E',
  textMuted: '#5A4A60',
};

const sunbeam: Palette = {
  id: 'sunbeam',
  stops: ['#FFE873', '#A8D8EA', '#FFC6C6'],
  text: '#2A2418',
  textMuted: '#5A4F38',
};

// User-pickable curated set
const dusk: Palette = {
  id: 'dusk',
  stops: ['#1E1330', '#3D2E5C', '#7E4C8A'],
  text: '#F0E8F5',
  textMuted: '#B8A5C8',
};

const midnight: Palette = {
  id: 'midnight',
  stops: ['#000010', '#0E1A2B', '#1F3A4F'],
  text: '#E8EFF5',
  textMuted: '#7A8B9C',
};

const parchment: Palette = {
  id: 'parchment',
  stops: ['#F5EBD6', '#E8DEC2', '#D9C9A6'],
  text: '#3A2A18',
  textMuted: '#7A6A55',
};

const oceanic: Palette = {
  id: 'oceanic',
  stops: ['#0F3A55', '#1E5A78', '#7BBAA3'],
  text: '#F0FAFF',
  textMuted: '#B8D5DA',
};

const rose: Palette = {
  id: 'rose',
  stops: ['#9C5969', '#C77B89', '#E8C4CA'],
  text: '#2A1018',
  textMuted: '#6A3A48',
};

const forest: Palette = {
  id: 'forest',
  stops: ['#1A2E20', '#2F4A3A', '#5C7B5C'],
  text: '#F0F5EC',
  textMuted: '#A8B5A0',
};

const monochrome: Palette = {
  id: 'monochrome',
  stops: ['#1A1A18', '#3A3A38', '#5A5A58'],
  text: '#F5F5F0',
  textMuted: '#A0A09A',
};

const amber: Palette = {
  id: 'amber',
  stops: ['#5A3010', '#B57340', '#E8AC68'],
  text: '#FFFAF0',
  textMuted: '#D4B898',
};

export const PALETTES: Readonly<Record<PaletteId, Palette>> = {
  sunrise,
  noir,
  stone,
  pastel,
  sunbeam,
  dusk,
  midnight,
  parchment,
  oceanic,
  rose,
  forest,
  monochrome,
  amber,
};

// Maps a category to its default palette. When prefs.backgroundMode is
// 'category', this is the lookup. Used by app + (later) widget.
export const CATEGORY_PALETTE_FOR: Readonly<Record<Category, PaletteId>> = {
  motivational: 'sunrise',
  anti_motivational: 'noir',
  stoic: 'stone',
  dumb: 'pastel',
  funny: 'sunbeam',
};

/**
 * Resolve the palette to render for a given category, given user prefs.
 * Centralizes the if/else so QuoteScreen and the widget agree.
 */
export function resolvePalette(args: {
  category: Category;
  backgroundMode: 'category' | 'fixed';
  fixedPalette?: PaletteId;
}): Palette {
  if (args.backgroundMode === 'fixed' && args.fixedPalette) {
    return PALETTES[args.fixedPalette];
  }
  return PALETTES[CATEGORY_PALETTE_FOR[args.category]];
}

/**
 * Darken every gradient stop by `amount` (0..1). Used for the night-mode
 * (11pm–5am) variant per PLAN.md. Naive RGB scaling — good enough for the
 * vibe, no need for HSL math here.
 */
export function darkenPalette(palette: Palette, amount = 0.4): Palette {
  const darken = (hex: string) => {
    const m = hex.match(/^#([0-9a-f]{6})$/i);
    if (!m) return hex;
    const num = parseInt(m[1], 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  const stops = palette.stops.map(darken);
  return {
    ...palette,
    stops:
      stops.length === 3
        ? ([stops[0], stops[1], stops[2]] as [string, string, string])
        : ([stops[0], stops[1]] as [string, string]),
  };
}
