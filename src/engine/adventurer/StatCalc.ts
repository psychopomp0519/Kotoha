/**
 * Stat calculation engine — computes base stats, level-scaled stats,
 * and derived combat stats from the master formula constants.
 */

import {
  type ClassName,
  type StatKey,
  CLASS_BASE_STATS,
  CLASS_GROWTH_RATES,
  DERIVED,
} from '../../data/constants';

// ---------------------------------------------------------------------------
// Derived stats interface
// ---------------------------------------------------------------------------

export interface DerivedStats {
  maxHp: number;
  physAtk: number;
  magAtk: number;
  physDef: number;
  magDef: number;
  actionSpeed: number;
  evasion: number;
  kiMax: number;
  kiRegen: number;
  critRate: number;
}

// ---------------------------------------------------------------------------
// 1. Single stat at level
// ---------------------------------------------------------------------------

/**
 * Calculate a single base stat for a class at a given level.
 *
 * Formula: baseStat + (level - 1) * growthRate
 *
 * The result is floored to an integer.
 */
export function calcStat(className: ClassName, stat: StatKey, level: number): number {
  const base = CLASS_BASE_STATS[className][stat];
  const growth = CLASS_GROWTH_RATES[className][stat];
  return Math.floor(base + (level - 1) * growth);
}

// ---------------------------------------------------------------------------
// 2. All stats at level
// ---------------------------------------------------------------------------

const STAT_KEYS: StatKey[] = ['STR', 'SPD', 'INT', 'SPI', 'END'];

/**
 * Calculate all 5 base stats for a class at a given level.
 */
export function calcAllStats(className: ClassName, level: number): Record<StatKey, number> {
  const result = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) {
    result[key] = calcStat(className, key, level);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 3. Derived (combat) stats
// ---------------------------------------------------------------------------

/**
 * Calculate derived combat stats from base stats, level, and optional
 * equipment contributions.
 *
 * Evasion is clamped to EVASION_CAP and crit rate to CRIT_CAP.
 */
export function calcDerivedStats(
  stats: Record<StatKey, number>,
  level: number,
  weaponAtk = 0,
  weaponMagAtk = 0,
  armorDef = 0,
  armorMagDef = 0,
): DerivedStats {
  const { HP_END_MULT, HP_LV_MULT, PHYS_ATK_MULT, MAGIC_ATK_MULT,
          PHYS_DEF_MULT, MAGIC_DEF_MULT, ACTION_SPD_MULT,
          EVASION_PER_SPD, EVASION_CAP, KI_MAX_MULT, KI_REGEN_MULT,
          CRIT_BASE, CRIT_PER_SPD, CRIT_CAP } = DERIVED;

  const maxHp       = stats.END * HP_END_MULT + level * HP_LV_MULT;
  const physAtk     = Math.floor(stats.STR * PHYS_ATK_MULT + weaponAtk);
  const magAtk      = Math.floor(stats.INT * MAGIC_ATK_MULT + weaponMagAtk);
  const physDef     = Math.floor(stats.END * PHYS_DEF_MULT + armorDef);
  const magDef      = Math.floor(stats.SPI * MAGIC_DEF_MULT + armorMagDef);
  const actionSpeed = Math.floor(stats.SPD * ACTION_SPD_MULT);
  const evasion     = Math.min(stats.SPD * EVASION_PER_SPD, EVASION_CAP);
  const kiMax       = Math.floor(stats.SPI * KI_MAX_MULT);
  const kiRegen     = +(stats.SPI * KI_REGEN_MULT).toFixed(2);
  const critRate    = Math.min(CRIT_BASE + stats.SPD * CRIT_PER_SPD, CRIT_CAP);

  return { maxHp, physAtk, magAtk, physDef, magDef, actionSpeed, evasion, kiMax, kiRegen, critRate };
}
