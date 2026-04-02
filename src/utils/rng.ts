/**
 * Deterministic PRNG wrapper around seedrandom.
 * Every random call in the game MUST go through these helpers
 * so that replays and offline simulation stay reproducible.
 */
import seedrandom from 'seedrandom';

/** Seeded RNG instance — call rng() for a float in [0, 1) */
export type Rng = () => number;

/** Create a new deterministic RNG from a numeric seed. */
export function createRng(seed: number): Rng {
  return seedrandom(seed.toString()) as Rng;
}

/**
 * Return a random integer in [min, max] (inclusive on both ends).
 * Equivalent to the design-doc notation `rand(min, max)`.
 */
export function rand(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Return a random float in [min, max).
 * Useful for damage variance, idle keep-ratio, etc.
 */
export function randFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min;
}
