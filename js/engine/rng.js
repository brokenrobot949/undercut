// The game's one seeded random number generator (mulberry32).
// Its whole state is a single number kept in the save, so a run replays exactly.
// Never use Math.random() for game logic; call these with state.rng instead.

export function createRng(seed) {
  return { seed: seed >>> 0, state: seed >>> 0 };
}

// A float in [0, 1). Advances the generator.
export function rngNext(rng) {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// An integer from min to max, both included.
export function rngInt(rng, min, max) {
  return min + Math.floor(rngNext(rng) * (max - min + 1));
}

// A float from min up to (not including) max.
export function rngRange(rng, min, max) {
  return min + rngNext(rng) * (max - min);
}

export function rngPick(rng, list) {
  return list[Math.floor(rngNext(rng) * list.length)];
}

export function rngChance(rng, probability) {
  return rngNext(rng) < probability;
}
