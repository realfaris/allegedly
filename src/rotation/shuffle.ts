// Seeded shuffle utilities.
//
// We need a *deterministic* shuffle so the app and the future iOS/Android
// widget compute identical quote sequences from the same inputs without
// having to share state. Math.random is non-deterministic, so we roll a
// tiny PRNG (mulberry32) seeded from the input.

/**
 * 32-bit string hash. Tiny FNV-ish — good enough as a PRNG seed.
 */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32 PRNG. Returns a function that produces values in [0, 1).
 * Same seed → same sequence. Tiny and adequate for shuffle purposes.
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded PRNG. Returns a new array; does not
 * mutate the input.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rng = mulberry32(hashString(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
