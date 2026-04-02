/**
 * Phase 1 combat simulation engine.
 *
 * Supports: basic attacks, ki skills, healing, elemental affinity, crits.
 * Not yet: status effects, ki ultimates, boss phases, bond combos.
 */

import type { Rng } from '../../utils/rng';
import { createRng } from '../../utils/rng';
import { DERIVED } from '../../data/constants';
import {
  calcPhysicalDamage,
  calcMagicalDamage,
  calcHealing,
  getElementMultiplier,
  rollCrit,
} from './DamageCalc';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface CombatSkill {
  name: string;
  type: 'physical' | 'magical' | 'heal';
  multiplier: number;
  kiCost: number;
  element: string;
}

export interface CombatUnit {
  id: string;
  name: string;
  stats: { STR: number; SPD: number; INT: number; SPI: number; END: number };
  derivedStats: {
    maxHp: number;
    physAtk: number;
    magAtk: number;
    physDef: number;
    magDef: number;
    actionSpeed: number;
  };
  currentHp: number;
  currentKi: number;
  maxKi: number;
  element: string;
  skills: CombatSkill[];
  isAlly: boolean;
}

export interface CombatLogEntry {
  round: number;
  actorName: string;
  action: string;
  target: string;
  damage: number;
  heal: number;
  narrative: string;
}

export interface CombatResult {
  winner: 'ally' | 'enemy' | 'draw';
  rounds: number;
  log: CombatLogEntry[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ROUNDS = 30;
const CRIT_MULTIPLIER = 1.5;
const KI_REGEN_DAMAGE_DEALT = 0.02;
const KI_REGEN_DAMAGE_TAKEN = 0.05;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAlive(u: CombatUnit): boolean {
  return u.currentHp > 0;
}

function aliveUnits(units: CombatUnit[]): CombatUnit[] {
  return units.filter(isAlive);
}

/**
 * Crit rate: base 5 % + SPD * 0.2 %, cap 50 %.
 */
function critRate(unit: CombatUnit): number {
  return Math.min(DERIVED.CRIT_BASE + unit.stats.SPD * DERIVED.CRIT_PER_SPD, DERIVED.CRIT_CAP);
}

/**
 * Pick the ally with the lowest HP ratio (for heal targeting).
 */
function weakestAlly(allies: CombatUnit[]): CombatUnit {
  let target = allies[0];
  let lowestRatio = target.currentHp / target.derivedStats.maxHp;
  for (let i = 1; i < allies.length; i++) {
    const ratio = allies[i].currentHp / allies[i].derivedStats.maxHp;
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      target = allies[i];
    }
  }
  return target;
}

/**
 * Pick the enemy with the lowest absolute HP (focus fire).
 */
function weakestEnemy(enemies: CombatUnit[]): CombatUnit {
  let target = enemies[0];
  for (let i = 1; i < enemies.length; i++) {
    if (enemies[i].currentHp < target.currentHp) {
      target = enemies[i];
    }
  }
  return target;
}

function randomEnemy(enemies: CombatUnit[], rng: Rng): CombatUnit {
  const idx = Math.floor(rng() * enemies.length);
  return enemies[idx];
}

// ---------------------------------------------------------------------------
// Narrative helpers (Korean)
// ---------------------------------------------------------------------------

function narrativeAttack(
  actorName: string,
  targetName: string,
  skillName: string,
  damage: number,
  isCrit: boolean,
): string {
  const critTag = isCrit ? ' (치명타!)' : '';
  return `${actorName}(이)가 ${targetName}에게 ${skillName}을 사용했다 -- ${damage} 데미지${critTag}`;
}

function narrativeHeal(
  actorName: string,
  targetName: string,
  skillName: string,
  heal: number,
): string {
  return `${actorName}(이)가 ${targetName}을 ${skillName}(으)로 치유했다 -- ${heal} 회복`;
}

function narrativeBasicAttack(
  actorName: string,
  targetName: string,
  damage: number,
  isCrit: boolean,
): string {
  const critTag = isCrit ? ' (치명타!)' : '';
  return `${actorName}(이)가 ${targetName}을 베었다 -- ${damage} 데미지${critTag}`;
}

// ---------------------------------------------------------------------------
// Main simulation
// ---------------------------------------------------------------------------

export function simulateCombat(
  allies: CombatUnit[],
  enemies: CombatUnit[],
  seed: number,
  maxRounds: number = DEFAULT_MAX_ROUNDS,
): CombatResult {
  const rng = createRng(seed);
  const log: CombatLogEntry[] = [];

  // Collect all units for turn ordering
  const allUnits = [...allies, ...enemies];

  // Ki starts at 0 (already set on input, but enforce)
  for (const u of allUnits) {
    u.currentKi = 0;
  }

  for (let round = 1; round <= maxRounds; round++) {
    // --- Turn order: descending actionSpeed ---------------------------------
    const turnOrder = aliveUnits(allUnits).sort(
      (a, b) => b.derivedStats.actionSpeed - a.derivedStats.actionSpeed,
    );

    for (const actor of turnOrder) {
      if (!isAlive(actor)) continue; // may have died mid-round

      // Ki regen per turn
      const kiRegen = actor.stats.SPI * DERIVED.KI_REGEN_MULT;
      actor.currentKi = Math.min(actor.maxKi, actor.currentKi + kiRegen);

      const friendlies = aliveUnits(actor.isAlly ? allies : enemies);
      const foes = aliveUnits(actor.isAlly ? enemies : allies);

      if (foes.length === 0) break; // battle already over

      // --- Decision: heal or attack -----------------------------------------
      const healSkill = actor.skills.find((s) => s.type === 'heal');
      const allyNeedingHeal = friendlies.find(
        (u) => u.currentHp / u.derivedStats.maxHp < 0.5,
      );
      const shouldHeal =
        actor.isAlly &&
        healSkill !== undefined &&
        allyNeedingHeal !== undefined &&
        actor.currentKi >= healSkill.kiCost;

      if (shouldHeal) {
        // ---- Heal ----------------------------------------------------------
        const target = weakestAlly(friendlies);
        actor.currentKi -= healSkill!.kiCost;

        const healAmt = calcHealing(
          actor.stats.SPI,
          healSkill!.multiplier,
          target.stats.SPI,
        );
        target.currentHp = Math.min(
          target.derivedStats.maxHp,
          target.currentHp + healAmt,
        );

        log.push({
          round,
          actorName: actor.name,
          action: healSkill!.name,
          target: target.name,
          damage: 0,
          heal: healAmt,
          narrative: narrativeHeal(actor.name, target.name, healSkill!.name, healAmt),
        });
      } else {
        // ---- Attack --------------------------------------------------------
        // Choose best available attack skill the actor can afford
        const usableSkills = actor.skills
          .filter((s) => s.type !== 'heal' && s.kiCost <= actor.currentKi)
          .sort((a, b) => b.multiplier - a.multiplier);

        const skill: CombatSkill | undefined = usableSkills[0];
        const isBasic = skill === undefined || skill.kiCost === 0;
        const activeSkill: CombatSkill = skill ?? {
          name: '기본 공격',
          type: 'physical',
          multiplier: 1.0,
          kiCost: 0,
          element: actor.element,
        };

        actor.currentKi -= activeSkill.kiCost;

        // Target selection
        const target =
          activeSkill.type === 'physical'
            ? weakestEnemy(foes)
            : randomEnemy(foes, rng);

        // Element multiplier
        const elemMult = getElementMultiplier(activeSkill.element, target.element);

        // Crit
        const crit = rollCrit(critRate(actor), rng);

        // Damage
        let damage: number;
        if (activeSkill.type === 'magical') {
          damage = calcMagicalDamage(
            actor.derivedStats.magAtk,
            activeSkill.multiplier,
            target.derivedStats.magDef,
            elemMult,
            crit,
            CRIT_MULTIPLIER,
            rng,
          );
        } else {
          damage = calcPhysicalDamage(
            actor.derivedStats.physAtk,
            activeSkill.multiplier,
            target.derivedStats.physDef,
            elemMult,
            crit,
            CRIT_MULTIPLIER,
            rng,
          );
        }

        // Apply damage
        target.currentHp = Math.max(0, target.currentHp - damage);

        // Ki gain from damage dealt / taken
        actor.currentKi = Math.min(
          actor.maxKi,
          actor.currentKi + damage * KI_REGEN_DAMAGE_DEALT,
        );
        target.currentKi = Math.min(
          target.maxKi,
          target.currentKi + damage * KI_REGEN_DAMAGE_TAKEN,
        );

        // Narrative
        const narrative = isBasic
          ? narrativeBasicAttack(actor.name, target.name, damage, crit)
          : narrativeAttack(actor.name, target.name, activeSkill.name, damage, crit);

        log.push({
          round,
          actorName: actor.name,
          action: activeSkill.name,
          target: target.name,
          damage,
          heal: 0,
          narrative,
        });
      }

      // --- Victory check (mid-round) ----------------------------------------
      if (aliveUnits(enemies).length === 0) {
        return { winner: 'ally', rounds: round, log };
      }
      if (aliveUnits(allies).length === 0) {
        return { winner: 'enemy', rounds: round, log };
      }
    }
  }

  // Ran out of rounds
  return { winner: 'draw', rounds: maxRounds, log };
}
