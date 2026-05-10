// Time-of-day boundaries and slot indexing.
//
// We expose THREE quote slots per local day: morning, afternoon, evening.
// Night (11pm–5am) intentionally reuses the evening slot — per PLAN it
// shows the evening quote with a darkened palette variant. So night does
// NOT advance the rotation cursor.
//
// `getSlotIndex(now)` returns a strictly-monotonic integer that counts
// slot transitions since a fixed epoch. It's the only state the rotation
// engine consumes from time, which means both the app and the widget can
// compute the same quote at the same moment without sharing storage.

import type { TimeOfDay } from '../types';

// Use UTC midnight on a fixed Monday as the epoch so day-counting is
// timezone-stable enough for a quote app. For widget parity we'll resolve
// boundaries in local time below.
const EPOCH = Date.UTC(2025, 0, 1, 0, 0, 0, 0);

/** Hour boundaries in local time. */
export const BOUNDARIES = {
  morningStart: 5,    // 5am
  afternoonStart: 12, // noon
  eveningStart: 18,   // 6pm
  nightStart: 23,     // 11pm
} as const;

/**
 * Time-of-day classification for a given moment, in local time.
 *
 *   05:00 .. 11:59 → morning
 *   12:00 .. 17:59 → afternoon
 *   18:00 .. 22:59 → evening
 *   23:00 .. 04:59 → night (uses evening's quote with darker palette)
 */
export function getBoundary(now: Date = new Date()): TimeOfDay {
  const h = now.getHours();
  if (h >= BOUNDARIES.morningStart && h < BOUNDARIES.afternoonStart) return 'morning';
  if (h >= BOUNDARIES.afternoonStart && h < BOUNDARIES.eveningStart) return 'afternoon';
  if (h >= BOUNDARIES.eveningStart && h < BOUNDARIES.nightStart) return 'evening';
  return 'night';
}

export function isNight(now: Date = new Date()): boolean {
  return getBoundary(now) === 'night';
}

/**
 * Map a TimeOfDay to a slot index 0/1/2. Morning/afternoon/evening map to
 * 0/1/2; night maps to 2 (reuses evening's quote).
 */
export function boundaryToSlot(b: TimeOfDay): 0 | 1 | 2 {
  if (b === 'morning') return 0;
  if (b === 'afternoon') return 1;
  return 2; // evening or night
}

/**
 * Days elapsed in local time since EPOCH. `Math.floor` of (localMidnightOf(now) - EPOCH) / day.
 * Done by zeroing out the time-of-day on `now` then subtracting from the
 * EPOCH UTC, then dividing. Approximate but stable across DST as long as we
 * don't do work mid-DST-transition; quote slot rounding will heal it.
 */
function localDaysSinceEpoch(now: Date): number {
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor((localMidnight - EPOCH) / 86400000);
}

/**
 * Strictly-monotonic slot index. Two distinct boundary moments produce
 * different indices; a moment within the same boundary on the same day
 * produces the same index. This is the only time-derived input the rotation
 * engine needs.
 *
 * Night slots reuse the evening slot of the SAME local day (so 11:30pm and
 * 8pm produce the same index). Past midnight (00:00–04:59) we still want to
 * show "yesterday's evening", so we treat it as the previous day's slot 2.
 */
export function getSlotIndex(now: Date = new Date()): number {
  const h = now.getHours();
  if (h < BOUNDARIES.morningStart) {
    // Pre-morning hours of today belong to yesterday's evening slot.
    return (localDaysSinceEpoch(now) - 1) * 3 + 2;
  }
  return localDaysSinceEpoch(now) * 3 + boundaryToSlot(getBoundary(now));
}

/**
 * Day seed string for telemetry / cache keys. Format: YYYY-MM-DD-<boundary>.
 */
export function getDaySeed(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}-${getBoundary(now)}`;
}
