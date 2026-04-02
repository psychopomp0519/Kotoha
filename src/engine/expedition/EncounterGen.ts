/**
 * EncounterGen — Deterministic encounter sequence generation.
 *
 * Algorithm source: docs/data/00-master-formulas.md §17
 * All randomness is seed-derived so offline replays stay identical.
 */

import { createRng, randFloat, type Rng } from '../../utils/rng';
import { ENCOUNTER_COUNTS, ENCOUNTER_WEIGHTS, OFFLINE } from '../../data/constants';
import type { EncounterType } from '../../core/types';

// ── Public types ────────────────────────────────────────────────────────────

export interface GeneratedEncounter {
  type: EncounterType;
  seed: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle (seed-deterministic).
 * Returns a **new** array — the original is untouched.
 */
function shuffleArray<T>(arr: T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Weighted random pick from the encounter-weight table.
 * `weights` maps EncounterType → probability (sums to ~1.0).
 */
function weightedPick(weights: Record<string, number>, rng: Rng): EncounterType {
  const roll = rng();
  let cumulative = 0;
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll < cumulative) {
      return type as EncounterType;
    }
  }
  // Fallback (rounding edge-case) — return last key
  return 'combat';
}

// ── Core generation ─────────────────────────────────────────────────────────

/**
 * Generate a deterministic encounter sequence for an expedition.
 *
 * Rules (from §17 of master formulas):
 *  - depth 5 → boss: return a single combat encounter
 *  - First encounter is always combat
 *  - Last encounter is always combat
 *  - Max 3 consecutive combat encounters; after 3, force a non-combat
 *  - Remaining slots use ENCOUNTER_WEIGHTS[depth] for weighted selection
 *  - Each encounter gets its own sub-seed: `seed ^ (i * 31) ^ depth`
 */
export function generateEncounterSequence(
  seed: number,
  regionIndex: number,
  depth: 1 | 2 | 3 | 4 | 5,
  expeditionCount: number,
): GeneratedEncounter[] {
  // Boss depth — single fixed combat encounter
  if (depth === 5) {
    return [{ type: 'combat', seed }];
  }

  // Create a deterministic RNG seeded from all expedition parameters
  const rng = createRng((seed ^ regionIndex ^ depth ^ expeditionCount) >>> 0);

  const encounterCount = ENCOUNTER_COUNTS[depth];
  const weights = ENCOUNTER_WEIGHTS[depth];
  const sequence: GeneratedEncounter[] = [];
  let consecutiveCombat = 0;

  for (let i = 0; i < encounterCount; i++) {
    const encounterSeed = (seed ^ (i * 31) ^ depth) >>> 0;

    // Rule 1: first encounter is always combat
    if (i === 0) {
      sequence.push({ type: 'combat', seed: encounterSeed });
      consecutiveCombat = 1;
      continue;
    }

    // Rule 2: last encounter is always combat
    if (i === encounterCount - 1) {
      sequence.push({ type: 'combat', seed: encounterSeed });
      break;
    }

    // Rule 3: after 3 consecutive combats, force non-combat
    if (consecutiveCombat >= 3) {
      const nonCombatType: EncounterType = rng() < 0.5 ? 'camp' : 'discovery';
      sequence.push({ type: nonCombatType, seed: encounterSeed });
      consecutiveCombat = 0;
      continue;
    }

    // Rule 4: weighted random selection
    const selectedType = weightedPick(weights, rng);
    sequence.push({ type: selectedType, seed: encounterSeed });
    consecutiveCombat = selectedType === 'combat' ? consecutiveCombat + 1 : 0;
  }

  return sequence;
}

// ── Idle route ──────────────────────────────────────────────────────────────

/**
 * Apply "safe route" filtering for idle/offline expeditions.
 *
 * Keeps 60-70 % of encounters (determined by rng).
 * Combat encounters are removed preferentially; the first and last
 * encounters are always preserved.
 */
export function applyIdleRoute(
  sequence: GeneratedEncounter[],
  rng: Rng,
): GeneratedEncounter[] {
  if (sequence.length <= 2) return [...sequence];

  const keepRatio = randFloat(rng, OFFLINE.IDLE_KEEP_MIN, OFFLINE.IDLE_KEEP_MAX);
  const keepCount = Math.max(2, Math.floor(sequence.length * keepRatio));

  // Collect indices of combat encounters that are neither first nor last
  const combatIndices = sequence
    .map((e, i) => (e.type === 'combat' ? i : -1))
    .filter((i) => i > 0 && i < sequence.length - 1);

  const toRemove = sequence.length - keepCount;
  const removeSet = new Set(
    shuffleArray(combatIndices, rng).slice(0, toRemove),
  );

  return sequence.filter((_, i) => !removeSet.has(i));
}
