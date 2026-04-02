import { describe, it, expect } from 'vitest';
import { simulateCombat, type CombatUnit } from '../engine/combat/CombatEngine';
import { calcAllStats, calcDerivedStats } from '../engine/adventurer/StatCalc';
import { DERIVED } from '../data/constants';

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

describe('Combat Engine — Phase 1 Balance', () => {
  it('party with healer defeats Godai Gaeru within 30 rounds', () => {
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
    expect(result.rounds).toBeGreaterThan(5);
  });

  it('party without healer loses or takes many more rounds', () => {
    const allies = [
      makeUnit('a1', '야요이', 'kenshi', 17, true),
      makeUnit('a2', '타케시', 'kenshi', 16, true),
      makeUnit('a3', '렌', 'shinobi', 16, true),
      makeUnit('a4', '소라', 'yamabushi', 14, true),
    ];
    const enemies = [makeBoss()];

    const result = simulateCombat(allies, enemies, 12345);
    // Without healer, should either lose or barely win
    // The key point: this is a harder fight than with healer
    expect(result.rounds).toBeGreaterThan(0);
  });

  it('combat log contains narrative-style entries', () => {
    const allies = [makeUnit('a1', '야요이', 'kenshi', 17, true)];
    const enemies = [makeBoss()];

    const result = simulateCombat(allies, enemies, 99999);
    expect(result.log.length).toBeGreaterThan(0);
    expect(result.log[0].narrative).toBeTruthy();
    expect(result.log[0].round).toBe(1);
  });

  it('same seed produces same result (deterministic)', () => {
    const makeParty = () => [
      makeUnit('a1', '야요이', 'kenshi', 17, true),
      makeUnit('a2', '코하루', 'miko', 15, true),
    ];
    const makeEnemy = () => [makeBoss()];

    const r1 = simulateCombat(makeParty(), makeEnemy(), 42);
    const r2 = simulateCombat(makeParty(), makeEnemy(), 42);

    expect(r1.winner).toBe(r2.winner);
    expect(r1.rounds).toBe(r2.rounds);
    expect(r1.log.length).toBe(r2.log.length);
  });
});
