import { describe, it, expect } from 'vitest';
import { calcStat, calcAllStats, calcDerivedStats } from '../engine/adventurer/StatCalc';

describe('StatCalc — base stats', () => {
  it('Kenshi Lv1 STR = 14', () => {
    expect(calcStat('kenshi', 'STR', 1)).toBe(14);
  });

  it('Kenshi Lv17 STR = 62 (design doc example)', () => {
    // 14 + 16 * 3.0 = 62
    expect(calcStat('kenshi', 'STR', 17)).toBe(62);
  });

  it('Kenshi Lv100 STR = 311 (stat reference table)', () => {
    // 14 + 99 * 3.0 = 311
    expect(calcStat('kenshi', 'STR', 100)).toBe(311);
  });

  it('Miko Lv1 SPI = 14', () => {
    expect(calcStat('miko', 'SPI', 1)).toBe(14);
  });

  it('Shinobi Lv100 SPD = 312', () => {
    // 15 + 99 * 3.0 = 312
    expect(calcStat('shinobi', 'SPD', 100)).toBe(312);
  });
});

describe('StatCalc — calcAllStats', () => {
  it('returns all 5 stats for Kenshi Lv1', () => {
    const stats = calcAllStats('kenshi', 1);
    expect(stats).toEqual({ STR: 14, SPD: 10, INT: 6, SPI: 8, END: 12 });
  });

  it('returns correct stats for Kenshi Lv17', () => {
    const stats = calcAllStats('kenshi', 17);
    expect(stats.STR).toBe(62);
    expect(stats.END).toBe(44); // 12 + 16 * 2.0
  });
});

describe('StatCalc — derived stats', () => {
  it('Kenshi Lv17 HP = 525', () => {
    // END at Lv17 = 12 + 16*2 = 44
    // HP = 44*10 + 17*5 = 440 + 85 = 525
    const stats = calcAllStats('kenshi', 17);
    const derived = calcDerivedStats(stats, 17);
    expect(derived.maxHp).toBe(525);
  });

  it('evasion is clamped to EVASION_CAP (30)', () => {
    // Shinobi Lv100 SPD = 312 -> raw evasion = 312*0.5 = 156, capped at 30
    const stats = calcAllStats('shinobi', 100);
    const derived = calcDerivedStats(stats, 100);
    expect(derived.evasion).toBe(30);
  });

  it('crit rate is clamped to CRIT_CAP (50)', () => {
    // Shinobi Lv100 SPD = 312 -> raw crit = 5 + 312*0.2 = 67.4, capped at 50
    const stats = calcAllStats('shinobi', 100);
    const derived = calcDerivedStats(stats, 100);
    expect(derived.critRate).toBe(50);
  });

  it('includes weapon and armor contributions', () => {
    const stats: Record<string, number> = { STR: 50, SPD: 30, INT: 20, SPI: 25, END: 40 };
    const derived = calcDerivedStats(stats, 10, 15, 10, 8, 6);
    // physAtk = floor(50*2.5 + 15) = floor(140) = 140
    expect(derived.physAtk).toBe(140);
    // magAtk = floor(20*2.5 + 10) = floor(60) = 60
    expect(derived.magAtk).toBe(60);
    // physDef = floor(40*1.5 + 8) = floor(68) = 68
    expect(derived.physDef).toBe(68);
    // magDef = floor(25*1.5 + 6) = floor(43.5) = 43
    expect(derived.magDef).toBe(43);
  });
});
