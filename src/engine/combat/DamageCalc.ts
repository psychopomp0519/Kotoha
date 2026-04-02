/**
 * Damage / healing calculation helpers for the combat engine.
 *
 * All random rolls go through the injected Rng so that combat is
 * fully deterministic and replay-safe.
 */

import type { Rng } from '../../utils/rng';
import { randFloat } from '../../utils/rng';
import { COMBAT, ELEMENT_AFFINITY, type Element } from '../../data/constants';

// ---------------------------------------------------------------------------
// Element multiplier
// ---------------------------------------------------------------------------

/**
 * Look up the elemental affinity multiplier from ELEMENT_AFFINITY.
 * Unknown or `'none'` elements are treated as `'neutral'`.
 */
export function getElementMultiplier(
  attackElement: string,
  defenseElement: string,
): number {
  const atk = normalizeElement(attackElement);
  const def = normalizeElement(defenseElement);
  return ELEMENT_AFFINITY[atk][def];
}

function normalizeElement(raw: string): Element {
  if (raw in ELEMENT_AFFINITY) return raw as Element;
  return 'neutral';
}

// ---------------------------------------------------------------------------
// Critical hit
// ---------------------------------------------------------------------------

/**
 * Roll whether a hit is critical.
 * @param critRate  Percentage chance (e.g. 12.4 means 12.4 %).
 */
export function rollCrit(critRate: number, rng: Rng): boolean {
  return rng() * 100 < critRate;
}

// ---------------------------------------------------------------------------
// Physical damage
// ---------------------------------------------------------------------------

/**
 * ```
 * baseDmg  = physAtk * skillMult - physDef * 0.4
 * finalDmg = baseDmg * elementMult * critMult * rand(0.9, 1.1)
 * ```
 * Minimum 1.
 */
export function calcPhysicalDamage(
  attackerPhysAtk: number,
  skillMultiplier: number,
  defenderPhysDef: number,
  elementMult: number,
  isCrit: boolean,
  critMult: number,
  rng: Rng,
): number {
  const base = attackerPhysAtk * skillMultiplier - defenderPhysDef * COMBAT.PHYS_DEF_REDUCE;
  const crit = isCrit ? critMult : 1;
  const variance = randFloat(rng, COMBAT.DAMAGE_RAND_MIN, COMBAT.DAMAGE_RAND_MAX);
  const final = base * elementMult * crit * variance;
  return Math.max(COMBAT.MIN_DAMAGE, Math.floor(final));
}

// ---------------------------------------------------------------------------
// Magical damage
// ---------------------------------------------------------------------------

/**
 * ```
 * baseDmg  = magAtk * skillMult - magDef * 0.35
 * finalDmg = baseDmg * elementMult * critMult * rand(0.9, 1.1)
 * ```
 * Minimum 1.
 */
export function calcMagicalDamage(
  attackerMagAtk: number,
  skillMultiplier: number,
  defenderMagDef: number,
  elementMult: number,
  isCrit: boolean,
  critMult: number,
  rng: Rng,
): number {
  const base = attackerMagAtk * skillMultiplier - defenderMagDef * COMBAT.MAGIC_DEF_REDUCE;
  const crit = isCrit ? critMult : 1;
  const variance = randFloat(rng, COMBAT.DAMAGE_RAND_MIN, COMBAT.DAMAGE_RAND_MAX);
  const final = base * elementMult * crit * variance;
  return Math.max(COMBAT.MIN_DAMAGE, Math.floor(final));
}

// ---------------------------------------------------------------------------
// Healing
// ---------------------------------------------------------------------------

/**
 * ```
 * heal = casterSpi * skillMult * (1 + targetSpi * 0.01)
 * ```
 */
export function calcHealing(
  casterSpi: number,
  skillMultiplier: number,
  targetSpi: number,
): number {
  return Math.floor(casterSpi * skillMultiplier * (1 + targetSpi * COMBAT.HEAL_SPI_SCALE));
}
