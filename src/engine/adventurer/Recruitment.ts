/**
 * Recruitment — Generate adventurer candidates for hiring.
 */

import type { BaseClass, Stats, TraitId } from '../../core/types';
import { CLASS_BASE_STATS, type ClassName, RECRUITMENT, RECRUIT_BASE, RECRUIT_LV_MULT, RECRUIT_TRAIT_COST } from '../../data/constants';
import { FAMILY_NAMES, GIVEN_NAMES } from '../../data/names';
import { TRAITS } from '../../data/traits';
import { createRng, rand, type Rng } from '../../utils/rng';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecruitCandidate {
  name: {
    family: string;
    familyJp: string;
    given: string;
    givenJp: string;
  };
  className: BaseClass;
  level: number;
  baseStats: Stats;
  traits: TraitId[];
  recruitCost: number;
}

// ---------------------------------------------------------------------------
// Rare traits — traits that cost extra to recruit
// ---------------------------------------------------------------------------

const RARE_TRAIT_IDS: Set<TraitId> = new Set([
  'spirited', 'nocturnal', 'artisan',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLASS_LIST: BaseClass[] = ['kenshi', 'miko', 'shinobi', 'yamabushi', 'shokunin', 'kemono'];

function pickRandom<T>(rng: Rng, arr: readonly T[]): T {
  return arr[rand(rng, 0, arr.length - 1)];
}

function generateBaseStats(rng: Rng, className: ClassName): Stats {
  const base = CLASS_BASE_STATS[className];
  return {
    str: base.STR + rand(rng, RECRUITMENT.STAT_VAR_MIN, RECRUITMENT.STAT_VAR_MAX),
    spd: base.SPD + rand(rng, RECRUITMENT.STAT_VAR_MIN, RECRUITMENT.STAT_VAR_MAX),
    int: base.INT + rand(rng, RECRUITMENT.STAT_VAR_MIN, RECRUITMENT.STAT_VAR_MAX),
    spi: base.SPI + rand(rng, RECRUITMENT.STAT_VAR_MIN, RECRUITMENT.STAT_VAR_MAX),
    end: base.END + rand(rng, RECRUITMENT.STAT_VAR_MIN, RECRUITMENT.STAT_VAR_MAX),
  };
}

function pickTraits(rng: Rng): TraitId[] {
  const count = rand(rng, RECRUITMENT.TRAIT_MIN, RECRUITMENT.TRAIT_MAX);
  const pool = [...TRAITS];
  const picked: TraitId[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = rand(rng, 0, pool.length - 1);
    picked.push(pool[idx].id);
    pool.splice(idx, 1);
  }

  return picked;
}

function computeRecruitCost(level: number, traits: TraitId[]): number {
  const rareCount = traits.filter(t => RARE_TRAIT_IDS.has(t)).length;
  return RECRUIT_BASE + (level * RECRUIT_LV_MULT) + (rareCount * RECRUIT_TRAIT_COST);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a list of recruit candidates using deterministic RNG.
 */
export function generateCandidates(
  seed: number,
  count: number,
  currentTick: number,
): RecruitCandidate[] {
  const rng = createRng((seed ^ currentTick) >>> 0);
  const candidates: RecruitCandidate[] = [];

  for (let i = 0; i < count; i++) {
    const className = pickRandom(rng, CLASS_LIST);
    const familyEntry = pickRandom(rng, FAMILY_NAMES);
    const givenEntry = pickRandom(rng, GIVEN_NAMES);
    const level = 1;
    const baseStats = generateBaseStats(rng, className);
    const traits = pickTraits(rng);
    const recruitCost = computeRecruitCost(level, traits);

    candidates.push({
      name: {
        family: familyEntry.ko,
        familyJp: familyEntry.jp,
        given: givenEntry.ko,
        givenJp: givenEntry.jp,
      },
      className,
      level,
      baseStats,
      traits,
      recruitCost,
    });
  }

  return candidates;
}
