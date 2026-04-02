// ============================================================================
// Kotoha — Asagiri Region Enemy Data (제1국: 아사기리)
// Source: docs/data/01-enemy-stats.md
// ============================================================================

import type { Element } from '../core/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnemyDrop {
  itemId: string;
  rate: number; // 0~1
}

export interface EnemyStats {
  hp: number;
  atk: number;
  def: number;
  mag: number;
  mdef: number;
  spd: number;
}

export interface BossPhase {
  hpThreshold: [number, number]; // [min%, max%] e.g. [60, 100]
  pattern: string[];
  element: Element;
}

export interface Enemy {
  id: string;
  name: string;
  nameJp: string;
  level: { min: number; max: number };
  stats: EnemyStats;
  element: Element;
  specials: string[];
  drops: EnemyDrop[];
  isBoss?: boolean;
  immunities?: string[];
  weaknesses?: string[];
  phases?: BossPhase[];
}

// ---------------------------------------------------------------------------
// Asagiri Common Enemies (8)
// ---------------------------------------------------------------------------

export const ENEMIES: Enemy[] = [
  // ── 1. 타누키 (狸) ──
  {
    id: 'enemy_tanuki',
    name: '타누키',
    nameJp: '狸',
    level: { min: 1, max: 3 },
    stats: { hp: 30, atk: 10, def: 5, mag: 8, mdef: 6, spd: 12 },
    element: 'earth',
    specials: ['변신술: 20% 확률로 피격 회피'],
    drops: [
      { itemId: 'mat_tanuki_leaf', rate: 0.40 },
      { itemId: 'mat_suspicious_fruit', rate: 0.15 },
    ],
  },

  // ── 2. 카파 (河童) ──
  {
    id: 'enemy_kappa',
    name: '카파',
    nameJp: '河童',
    level: { min: 2, max: 4 },
    stats: { hp: 50, atk: 14, def: 8, mag: 12, mdef: 8, spd: 10 },
    element: 'water',
    specials: ['머리접시: 수속성 공격에 HP 회복'],
    drops: [
      { itemId: 'mat_kappa_cucumber', rate: 0.30 },
      { itemId: 'mat_plate_shard', rate: 0.20 },
    ],
  },

  // ── 3. 코다마 (木霊) ──
  {
    id: 'enemy_kodama',
    name: '코다마',
    nameJp: '木霊',
    level: { min: 3, max: 5 },
    stats: { hp: 40, atk: 10, def: 6, mag: 18, mdef: 14, spd: 14 },
    element: 'wood',
    specials: ['숲의메아리: 피격 시 25% 확률로 공격 반사(MAG의 50%)'],
    drops: [
      { itemId: 'mat_kodama_sap', rate: 0.35 },
      { itemId: 'mat_leaf_talisman', rate: 0.10 },
    ],
  },

  // ── 4. 오니졸병 (鬼足軽) ──
  {
    id: 'enemy_oni_ashigaru',
    name: '오니졸병',
    nameJp: '鬼足軽',
    level: { min: 4, max: 7 },
    stats: { hp: 80, atk: 25, def: 15, mag: 5, mdef: 4, spd: 8 },
    element: 'none',
    specials: ['돌진: 첫 공격 ATK 1.5배'],
    drops: [
      { itemId: 'mat_oni_horn_shard', rate: 0.25 },
      { itemId: 'mat_rusty_axe', rate: 0.15 },
      { itemId: 'mat_seal_cloth', rate: 0.03 },
    ],
  },

  // ── 5. 히토다마 (人魂) ──
  {
    id: 'enemy_hitodama',
    name: '히토다마',
    nameJp: '人魂',
    level: { min: 5, max: 8 },
    stats: { hp: 60, atk: 8, def: 3, mag: 30, mdef: 18, spd: 16 },
    element: 'fire',
    specials: ['령체: 물리 데미지 50% 감소, 술법에 약함'],
    drops: [
      { itemId: 'mat_soul_crystal', rate: 0.20 },
      { itemId: 'mat_ghostfire_flame', rate: 0.25 },
    ],
  },

  // ── 6. 논의허수아비 (田の案山子) ──
  {
    id: 'enemy_scarecrow',
    name: '논의허수아비',
    nameJp: '田の案山子',
    level: { min: 1, max: 3 },
    stats: { hp: 35, atk: 12, def: 10, mag: 3, mdef: 3, spd: 4 },
    element: 'wood',
    specials: ['부동: SPD 고정, 첫 턴 선제 불가'],
    drops: [
      { itemId: 'mat_rice_straw', rate: 0.50 },
      { itemId: 'mat_old_talisman', rate: 0.10 },
    ],
  },

  // ── 7. 안개쥐 (霧鼠) ──
  {
    id: 'enemy_fog_rat',
    name: '안개쥐',
    nameJp: '霧鼠',
    level: { min: 2, max: 4 },
    stats: { hp: 28, atk: 13, def: 4, mag: 6, mdef: 5, spd: 18 },
    element: 'water',
    specials: ['안개숨기: 회피율 +15%'],
    drops: [
      { itemId: 'mat_rat_fang', rate: 0.45 },
      { itemId: 'mat_fog_orb', rate: 0.08 },
    ],
  },

  // ── 8. 개구리무사 (蛙侍) ──
  {
    id: 'enemy_frog_samurai',
    name: '개구리무사',
    nameJp: '蛙侍',
    level: { min: 3, max: 6 },
    stats: { hp: 65, atk: 20, def: 12, mag: 10, mdef: 9, spd: 11 },
    element: 'water',
    specials: ['도약베기: 2턴마다 ATK 1.3배 점프 공격'],
    drops: [
      { itemId: 'mat_frog_oil', rate: 0.30 },
      { itemId: 'mat_rusty_tanto', rate: 0.12 },
    ],
  },

  // ── BOSS: 고다이가에루 (五大蛙) ──
  {
    id: 'boss_godai_gaeru',
    name: '고다이가에루',
    nameJp: '五大蛙',
    level: { min: 10, max: 10 },
    stats: { hp: 3000, atk: 100, def: 45, mag: 80, mdef: 50, spd: 10 },
    element: 'water',
    isBoss: true,
    immunities: ['독', '속박'],
    weaknesses: [
      '화속성 공격 시 DEF -30%',
      '목속성 술법 시 MDEF -25%',
    ],
    specials: [
      '수류탄: 단일 ATK x1.2 수속성',
      '진흙파도: 전체 MAG x0.8 수속성',
      '지진밟기: 전체 ATK x1.0 토속성',
      '흙벽: DEF +50% 2턴',
      '논의저주: 랜덤 1인 SPD -30% 3턴',
      '오대홍수: 전체 MAG x1.5 수속성 (3턴 쿨)',
      '대지의분노: 전체 ATK x1.3 토속성',
      '재생: 매턴 HP 2% 회복',
    ],
    phases: [
      {
        hpThreshold: [60, 100],
        pattern: ['수류탄', '진흙파도'],
        element: 'water',
      },
      {
        hpThreshold: [30, 59],
        pattern: ['지진밟기', '흙벽', '논의저주'],
        element: 'earth',
      },
      {
        hpThreshold: [0, 29],
        pattern: ['오대홍수', '대지의분노', '재생'],
        element: 'water', // 수/토 dual — primary water
      },
    ],
    drops: [
      { itemId: 'mat_godai_eye', rate: 1.00 },
      { itemId: 'mat_water_earth_crystal', rate: 0.60 },
      { itemId: 'mat_legendary_frog_oil', rate: 0.15 },
      { itemId: 'equip_asagiri_treasure', rate: 0.05 },
    ],
  },
];
