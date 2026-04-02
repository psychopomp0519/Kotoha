import { describe, it, expect } from 'vitest';
import { xpRequired, cumulativeXp } from '../engine/adventurer/XpTable';

describe('XP Table', () => {
  it('matches design-doc keypoints exactly', () => {
    expect(xpRequired(1)).toBe(150);
    expect(xpRequired(5)).toBe(251);
    expect(xpRequired(10)).toBe(716);
    expect(xpRequired(15)).toBe(1330);
    expect(xpRequired(25)).toBe(3380);
    expect(xpRequired(45)).toBe(9370);
    expect(xpRequired(65)).toBe(17900);
    expect(xpRequired(85)).toBe(28440);
    expect(xpRequired(99)).toBe(37800);
  });

  it('returns 0 for levels beyond max', () => {
    expect(xpRequired(100)).toBe(0);
    expect(xpRequired(0)).toBe(0);
  });

  it('interpolates between keypoints', () => {
    const xp7 = xpRequired(7);
    expect(xp7).toBeGreaterThan(251);
    expect(xp7).toBeLessThan(716);
  });

  it('cumulative XP at Lv 1 is 0', () => {
    expect(cumulativeXp(1)).toBe(0);
  });

  it('cumulative XP at Lv 2 is 150', () => {
    expect(cumulativeXp(2)).toBe(150);
  });
});
