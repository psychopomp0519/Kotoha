/**
 * ExpeditionEngine — Process an expedition and compute aggregate outcomes.
 *
 * This module does NOT run actual turn-by-turn combat simulation.
 * It generates the encounter sequence, then calculates XP / gold / drops
 * for each encounter based on deterministic RNG and region/depth parameters.
 */

import { createRng, rand, type Rng } from '../../utils/rng';
import {
  EXPEDITION_BASE_TICKS,
  EXPEDITION_SPD_SCALE,
  XP_SOURCE,
} from '../../data/constants';
import type { EncounterType } from '../../core/types';
import {
  generateEncounterSequence,
  applyIdleRoute,
  type GeneratedEncounter,
} from './EncounterGen';

// ── Public types ────────────────────────────────────────────────────────────

export interface ExpeditionConfig {
  seed: number;
  regionIndex: number;        // 0..9
  depth: 1 | 2 | 3 | 4 | 5;
  expeditionCount: number;
  partyAverageSpd: number;
  isIdle: boolean;
}

export interface ItemDrop {
  itemId: string;
  quantity: number;
}

export interface EncounterOutcome {
  type: EncounterType;
  result: 'victory' | 'defeat' | 'discovered' | 'trapped' | 'camped' | 'event';
  xpGained: number;
  goldGained: number;
  drops: ItemDrop[];
}

export interface ExpeditionOutcome {
  encounters: EncounterOutcome[];
  totalXp: number;
  totalGold: number;
  drops: ItemDrop[];
  totalTicks: number;
  completed: boolean;   // false if party wiped
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive enemy level range from regionIndex.
 * Region 0 → Lv 1-10, Region 1 → Lv 11-20, …, Region 9 → Lv 91-100
 */
function enemyLevelRange(regionIndex: number): { min: number; max: number } {
  const min = regionIndex * 10 + 1;
  const max = (regionIndex + 1) * 10;
  return { min, max };
}

/**
 * Roll an enemy level for a single encounter.
 */
function rollEnemyLevel(rng: Rng, regionIndex: number): number {
  const { min, max } = enemyLevelRange(regionIndex);
  return rand(rng, min, max);
}

/**
 * Merge item drops, combining quantities for duplicate itemIds.
 */
function mergeDrops(allDrops: ItemDrop[]): ItemDrop[] {
  const map = new Map<string, number>();
  for (const d of allDrops) {
    map.set(d.itemId, (map.get(d.itemId) ?? 0) + d.quantity);
  }
  return Array.from(map.entries()).map(([itemId, quantity]) => ({
    itemId,
    quantity,
  }));
}

// ── Tick calculation ────────────────────────────────────────────────────────

/**
 * Calculate the actual tick duration for an expedition.
 *
 * Formula: floor(baseTicks / (1 + partyAverageSpd * 0.01))
 */
export function calculateExpeditionTicks(
  baseTicks: number,
  partyAverageSpd: number,
): number {
  return Math.floor(baseTicks / (1 + partyAverageSpd * EXPEDITION_SPD_SCALE));
}

// ── Encounter reward resolution ─────────────────────────────────────────────

function resolveCombat(
  rng: Rng,
  regionIndex: number,
  depth: number,
): EncounterOutcome {
  const enemyLv = rollEnemyLevel(rng, regionIndex);
  const xp = enemyLv * rand(rng, XP_SOURCE.NORMAL_YOKAI.minMult, XP_SOURCE.NORMAL_YOKAI.maxMult);
  const gold = Math.floor(enemyLv * rand(rng, 1, 3) * depth * 1.5);
  return { type: 'combat', result: 'victory', xpGained: xp, goldGained: gold, drops: [] };
}

function resolveDiscovery(rng: Rng): EncounterOutcome {
  const xp = rand(rng, XP_SOURCE.ENCOUNTER_CLEAR.min, XP_SOURCE.ENCOUNTER_CLEAR.max);
  // Possible material drop (30 % chance placeholder)
  const drops: ItemDrop[] = [];
  if (rng() < 0.3) {
    drops.push({ itemId: 'material_common', quantity: rand(rng, 1, 3) });
  }
  return { type: 'discovery', result: 'discovered', xpGained: xp, goldGained: 0, drops };
}

function resolveTrap(rng: Rng): EncounterOutcome {
  // Survival assumed for reward calculation (actual HP effects are separate)
  const xp = rand(rng, XP_SOURCE.ENCOUNTER_CLEAR.min, XP_SOURCE.ENCOUNTER_CLEAR.max);
  return { type: 'trap', result: 'trapped', xpGained: xp, goldGained: 0, drops: [] };
}

function resolveCamp(): EncounterOutcome {
  // Recovery only — no XP or gold
  return { type: 'camp', result: 'camped', xpGained: 0, goldGained: 0, drops: [] };
}

function resolveEvent(): EncounterOutcome {
  // Events are handled by the event system separately; yield nothing here
  return { type: 'event', result: 'event', xpGained: 0, goldGained: 0, drops: [] };
}

function resolveEncounter(
  encounter: GeneratedEncounter,
  rng: Rng,
  regionIndex: number,
  depth: number,
): EncounterOutcome {
  switch (encounter.type) {
    case 'combat':    return resolveCombat(rng, regionIndex, depth);
    case 'discovery': return resolveDiscovery(rng);
    case 'trap':      return resolveTrap(rng);
    case 'camp':      return resolveCamp();
    case 'event':     return resolveEvent();
  }
}

// ── Main entry point ────────────────────────────────────────────────────────

/**
 * Process a full expedition and return aggregated outcomes.
 *
 * Steps:
 *  1. Generate the encounter sequence (deterministic from seed).
 *  2. If idle, apply the safe-route filter.
 *  3. Resolve each encounter for XP / gold / drops.
 *  4. Sum totals and compute tick duration.
 */
export function processExpedition(config: ExpeditionConfig): ExpeditionOutcome {
  const {
    seed,
    regionIndex,
    depth,
    expeditionCount,
    partyAverageSpd,
    isIdle,
  } = config;

  // 1. Generate encounter sequence
  let sequence = generateEncounterSequence(seed, regionIndex, depth, expeditionCount);

  // 2. Apply idle route if needed
  if (isIdle) {
    const idleRng = createRng((seed ^ 0xDEAD) >>> 0);
    sequence = applyIdleRoute(sequence, idleRng);
  }

  // 3. Resolve each encounter
  const rng = createRng((seed ^ 0xBEEF ^ depth) >>> 0);
  const outcomes: EncounterOutcome[] = [];
  let completed = true;

  for (const encounter of sequence) {
    const outcome = resolveEncounter(encounter, rng, regionIndex, depth);
    outcomes.push(outcome);

    // If any combat results in defeat, expedition ends early
    if (outcome.result === 'defeat') {
      completed = false;
      break;
    }
  }

  // 4. Aggregate totals
  let totalXp = 0;
  let totalGold = 0;
  const allDrops: ItemDrop[] = [];

  for (const o of outcomes) {
    totalXp += o.xpGained;
    totalGold += o.goldGained;
    allDrops.push(...o.drops);
  }

  // 5. Tick duration
  const baseTicks = depth === 5 ? 0 : (EXPEDITION_BASE_TICKS[depth] ?? 0);
  const totalTicks = calculateExpeditionTicks(baseTicks, partyAverageSpd);

  return {
    encounters: outcomes,
    totalXp,
    totalGold,
    drops: mergeDrops(allDrops),
    totalTicks,
    completed,
  };
}
