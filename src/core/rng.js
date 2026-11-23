/* ============================================================================
   World Life 2.0 — Pure Deterministic Seeded PRNG (Mulberry32)
   State lives directly inside S.rngState — zero wall-clock leaks.
   ========================================================================== */

export function hashSeed(input) {
  const str = String(input ?? 'world-life-2');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 0x9e3779b9;
}

export function rand(S) {
  // Fail loudly on an unseeded state instead of silently returning 0.5:
  // a missing stream is a bug, and 0.5 everywhere would silently flatten
  // every lottery, interview and mortality roll in the game.
  if (!S) throw new Error('rand() called without a game state (S is missing).');
  if (typeof S.rngState !== 'number') {
    // A life that still carries its seed can be re-seeded on the spot.
    if (S.seed != null) {
      S.rngState = hashSeed(S.seed);
    } else {
      throw new Error('rand() called on a game state with no rngState and no seed — the life was never seeded.');
    }
  }
  let t = (S.rngState = (S.rngState + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(S, min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(rand(S) * (hi - lo + 1));
}

export function chance(S, probability) {
  return rand(S) < probability;
}

export function pick(S, list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(rand(S) * list.length)];
}

export function clamp(val, min = 0, max = 100) {
  const n = Number(val);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
