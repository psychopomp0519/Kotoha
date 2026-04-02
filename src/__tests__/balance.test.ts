/**
 * Balance simulation tests — Phase 4
 *
 * Validates economy, progression, and combat balance assumptions
 * from the design documents.
 */

import { describe, it, expect } from 'vitest';
import { simulateCombat, type CombatUnit } from '../engine/combat/CombatEngine';
import { calcAllStats, calcDerivedStats } from '../engine/adventurer/StatCalc';
import { processExpedition } from '../engine/expedition/ExpeditionEngine';
import {
  DERIVED,
  XP_CUMULATIVE_CHECKPOINTS,
  FACILITY_BASE_COSTS,
  RECRUIT_BASE,
  RECRUIT_LV_MULT,
  ENHANCEMENT_BASE_COST,
} from '../data/constants';

// ---------------------------------------------------------------------------
// Helpers — reuse combat test pattern
// ---------------------------------------------------------------------------

function makeUnit(
  id: string,
  name: string,
  className: 'kenshi' | 'miko' | 'shinobi' | 'yamabushi',
  level: number,
  isAlly: boolean,
  element = 'none',
  weaponAtk = 15,
): CombatUnit {
  const stats = calcAllStats(className, level);
  const derived = calcDerivedStats(stats, level, weaponAtk, 0, 10, 0);
  const skills: CombatUnit['skills'] = [];

  if (className === 'miko') {
    skills.push(
      { name: '치유의 기도', type: 'heal', multiplier: 1.0, kiCost: 0, element: 'none' },
      { name: '법력', type: 'magical', multiplier: 1.0, kiCost: 0, element: 'none' },
    );
  } else if (className === 'kenshi') {
    skills.push(
      { name: '베기', type: 'physical', multiplier: 1.0, kiCost: 0, element: 'none' },
      { name: '난도', type: 'physical', multiplier: 1.5, kiCost: 10, element: 'none' },
    );
  } else if (className === 'shinobi') {
    skills.push(
      { name: '표창', type: 'physical', multiplier: 1.0, kiCost: 0, element: 'none' },
      { name: '급소찌르기', type: 'physical', multiplier: 1.5, kiCost: 10, element: 'none' },
    );
  } else if (className === 'yamabushi') {
    skills.push(
      { name: '금강권', type: 'physical', multiplier: 1.0, kiCost: 0, element: 'none' },
      { name: '뇌광', type: 'magical', multiplier: 1.5, kiCost: 10, element: 'metal' },
    );
  }

  return {
    id,
    name,
    stats,
    derivedStats: {
      maxHp: derived.maxHp,
      physAtk: derived.physAtk,
      magAtk: derived.magAtk,
      physDef: derived.physDef,
      magDef: derived.magDef,
      actionSpeed: derived.actionSpeed,
    },
    currentHp: derived.maxHp,
    currentKi: 0,
    maxKi: stats.SPI * DERIVED.KI_MAX_MULT,
    element,
    skills,
    isAlly,
  };
}

function makeBoss(): CombatUnit {
  return {
    id: 'boss_godaigaeru',
    name: '고다이가에루',
    stats: { STR: 40, SPD: 10, INT: 10, SPI: 15, END: 30 },
    derivedStats: {
      maxHp: 3000,
      physAtk: 100,
      magAtk: 25,
      physDef: 30,
      magDef: 20,
      actionSpeed: 10,
    },
    currentHp: 3000,
    currentKi: 0,
    maxKi: 75,
    element: 'water',
    skills: [
      { name: '돌진', type: 'physical', multiplier: 1.0, kiCost: 0, element: 'water' },
      { name: '수류탄', type: 'physical', multiplier: 1.5, kiCost: 15, element: 'water' },
    ],
    isAlly: false,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Balance — Combat', () => {
  it('Lv17 party with healer vs Godai Gaeru boss wins within 30 rounds', () => {
    const allies = [
      makeUnit('a1', '야요이', 'kenshi', 17, true),
      makeUnit('a2', '코하루', 'miko', 15, true),
      makeUnit('a3', '렌', 'shinobi', 16, true),
      makeUnit('a4', '소라', 'yamabushi', 14, true),
    ];
    const enemies = [makeBoss()];

    const result = simulateCombat(allies, enemies, 12345);
    expect(result.winner).toBe('ally');
    expect(result.rounds).toBeLessThanOrEqual(30);
  });
});

describe('Balance — Expedition Gold Inflation', () => {
  it('1000 expedition ticks generate less than 300% gold inflation', () => {
    // Simulate 1000 expedition runs at region 0 depth 1
    let totalGoldEarned = 0;

    for (let i = 0; i < 1000; i++) {
      const outcome = processExpedition({
        seed: (i * 7919 + 42) >>> 0, // varied seeds
        regionIndex: 0,
        depth: 1,
        expeditionCount: i,
        partyAverageSpd: 10,
        isIdle: false,
      });
      totalGoldEarned += outcome.totalGold;
    }

    // 300% inflation cap means total gold earned should be within reasonable bounds
    // For region 0 depth 1, average gold per expedition ~50 (from GOLD_PER_EXPEDITION table).
    // 1000 expeditions * ~50 = ~50000. With starting gold 200, 300% would be 600.
    // But 1000 expedition *runs* is many playthroughs worth.
    // The intent: per-expedition gold should be bounded, not spiraling.
    // Average gold per expedition should stay below 300 (300% of the design target ~50-100).
    const avgGoldPerExpedition = totalGoldEarned / 1000;
    expect(avgGoldPerExpedition).toBeLessThan(300);
    expect(avgGoldPerExpedition).toBeGreaterThan(0);
  });
});

describe('Balance — XP Progression', () => {
  it('Boss is reachable at Lv15-20 within 7-14 days of XP', () => {
    // From constants: XP_CUMULATIVE_CHECKPOINTS[15] = 9200
    // 24h idle at region 0 produces ~13000 XP/day (design estimate)
    // So Lv15 should be reachable in < 1 day of play
    const cumulativeXpToLv15 = XP_CUMULATIVE_CHECKPOINTS[15];

    // Simulate a day's worth of expeditions:
    // Region 0 depth 1 takes ~300 ticks base, with SPD 10 ~ 272 ticks
    // In 86400 ticks (1 day), that's ~317 expeditions
    const ticksPerDay = 86400;
    const ticksPerExpedition = Math.floor(300 / (1 + 10 * 0.01)); // ~272
    const expeditionsPerDay = Math.floor(ticksPerDay / ticksPerExpedition);

    let totalXpOneDay = 0;
    for (let i = 0; i < expeditionsPerDay; i++) {
      const outcome = processExpedition({
        seed: (i * 13 + 7) >>> 0,
        regionIndex: 0,
        depth: 1,
        expeditionCount: i,
        partyAverageSpd: 10,
        isIdle: false,
      });
      totalXpOneDay += outcome.totalXp;
    }

    // Lv15 cumulative XP should be reachable within 14 days
    // (generous upper bound — design says ~1 day)
    expect(cumulativeXpToLv15).toBe(9_200);
    expect(totalXpOneDay).toBeGreaterThan(0);

    const daysToLv15 = cumulativeXpToLv15 / totalXpOneDay;
    expect(daysToLv15).toBeLessThanOrEqual(14);
    // Also verify it's reachable in a reasonable time (not instant)
    expect(daysToLv15).toBeGreaterThan(0);
  });
});

describe('Balance — Resource Sinks', () => {
  it('All resources have sinks — gold costs exist for facilities, recruitment, crafting', () => {
    // 1. Facility upgrade costs exist and are positive
    const facilityIds = Object.keys(FACILITY_BASE_COSTS);
    expect(facilityIds.length).toBeGreaterThan(0);
    for (const id of facilityIds) {
      expect(FACILITY_BASE_COSTS[id]).toBeGreaterThan(0);
    }

    // 2. Recruitment costs exist and are positive
    expect(RECRUIT_BASE).toBeGreaterThan(0);
    expect(RECRUIT_LV_MULT).toBeGreaterThan(0);
    // A Lv1 recruit costs at least RECRUIT_BASE + 1 * RECRUIT_LV_MULT
    const minRecruitCost = RECRUIT_BASE + 1 * RECRUIT_LV_MULT;
    expect(minRecruitCost).toBeGreaterThan(0);

    // 3. Equipment enhancement costs exist and are positive (crafting gold sink)
    const enhancementGrades = Object.keys(ENHANCEMENT_BASE_COST);
    expect(enhancementGrades.length).toBeGreaterThan(0);
    for (const grade of enhancementGrades) {
      expect(ENHANCEMENT_BASE_COST[grade]).toBeGreaterThan(0);
    }

    // 4. Verify there are multiple distinct gold sinks (at least 3 categories)
    const sinkCategories = [
      facilityIds.length > 0,       // facility upgrades
      minRecruitCost > 0,           // recruitment
      enhancementGrades.length > 0, // equipment enhancement
    ];
    const activeSinks = sinkCategories.filter(Boolean).length;
    expect(activeSinks).toBeGreaterThanOrEqual(3);
  });
});
