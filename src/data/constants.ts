/**
 * Master game constants — derived from docs/data/00-master-formulas.md
 * Changing values here shifts the entire game balance.
 */

// ---------------------------------------------------------------------------
// 1. Stat System
// ---------------------------------------------------------------------------

/** Adventurer classes (계통) */
export type ClassName = 'kenshi' | 'miko' | 'shinobi' | 'yamabushi' | 'shokunin' | 'kemono';

/** Stat keys */
export type StatKey = 'STR' | 'SPD' | 'INT' | 'SPI' | 'END';

/** Base stats at Lv 1 per class (합계 50) */
export const CLASS_BASE_STATS: Record<ClassName, Record<StatKey, number>> = {
  kenshi:    { STR: 14, SPD: 10, INT:  6, SPI:  8, END: 12 },
  miko:      { STR:  5, SPD:  8, INT: 13, SPI: 14, END: 10 },
  shinobi:   { STR:  8, SPD: 15, INT: 10, SPI:  7, END: 10 },
  yamabushi: { STR: 10, SPD:  7, INT: 12, SPI: 13, END:  8 },
  shokunin:  { STR: 12, SPD:  6, INT: 14, SPI:  8, END: 10 },
  kemono:    { STR: 13, SPD: 12, INT:  5, SPI:  9, END: 11 },
};

/** Growth rate per level per class (합계 8.0/Lv) */
export const CLASS_GROWTH_RATES: Record<ClassName, Record<StatKey, number>> = {
  kenshi:    { STR: 3.0, SPD: 1.5, INT: 0.5, SPI: 1.0, END: 2.0 },
  miko:      { STR: 0.5, SPD: 1.0, INT: 2.5, SPI: 3.0, END: 1.0 },
  shinobi:   { STR: 2.0, SPD: 3.0, INT: 1.5, SPI: 0.5, END: 1.0 },
  yamabushi: { STR: 1.0, SPD: 0.5, INT: 2.5, SPI: 2.5, END: 1.5 },
  shokunin:  { STR: 2.0, SPD: 1.0, INT: 3.0, SPI: 0.5, END: 1.5 },
  kemono:    { STR: 2.5, SPD: 2.5, INT: 0.5, SPI: 1.5, END: 1.0 },
};

// ---------------------------------------------------------------------------
// Derived stat multipliers
// ---------------------------------------------------------------------------

export const DERIVED = {
  /** HP = END * HP_END_MULT + Lv * HP_LV_MULT */
  HP_END_MULT: 10,
  HP_LV_MULT: 5,
  /** Physical ATK = STR * PHYS_ATK_MULT + weapon atk */
  PHYS_ATK_MULT: 2.5,
  /** Magic ATK = INT * MAGIC_ATK_MULT + weapon magic */
  MAGIC_ATK_MULT: 2.5,
  /** Physical DEF = END * PHYS_DEF_MULT + armor def */
  PHYS_DEF_MULT: 1.5,
  /** Magic DEF = SPI * MAGIC_DEF_MULT + armor magic def */
  MAGIC_DEF_MULT: 1.5,
  /** Action speed = SPD * ACTION_SPD_MULT + equip bonus */
  ACTION_SPD_MULT: 1,
  /** Evasion = SPD * EVASION_PER_SPD (%) — cap EVASION_CAP */
  EVASION_PER_SPD: 0.5,
  EVASION_CAP: 30,
  /** Ki max = SPI * KI_MAX_MULT */
  KI_MAX_MULT: 5,
  /** Ki regen per turn = SPI * KI_REGEN_MULT */
  KI_REGEN_MULT: 0.3,
  /** Crit = CRIT_BASE + SPD * CRIT_PER_SPD + equip — cap CRIT_CAP */
  CRIT_BASE: 5,
  CRIT_PER_SPD: 0.2,
  CRIT_CAP: 50,
} as const;

// ---------------------------------------------------------------------------
// 2. XP System
// ---------------------------------------------------------------------------

/** Authoritative XP keypoints — values are xpRequired(lv) to reach lv+1 */
export const XP_TABLE_KEYPOINTS: { level: number; value: number }[] = [
  { level:  1, value:    150 },
  { level:  5, value:    251 },
  { level: 10, value:    716 },
  { level: 15, value:  1_330 },
  { level: 25, value:  3_380 },
  { level: 45, value:  9_370 },
  { level: 65, value: 17_900 },
  { level: 85, value: 28_440 },
  { level: 99, value: 37_800 },
];

/** Cumulative XP reference checkpoints (for validation) */
export const XP_CUMULATIVE_CHECKPOINTS = {
  15:  9_200,
  50:  155_000,
  100: 1_100_000,
} as const;

/** XP source multiplier ranges */
export const XP_SOURCE = {
  NORMAL_YOKAI:  { minMult: 8,   maxMult: 15  },
  ELITE_YOKAI:   { minMult: 25,  maxMult: 40  },
  BOSS:          { minMult: 150, maxMult: 300 },
  ENCOUNTER_CLEAR: { min: 30, max: 150 },
  DOJO_PER_TICK_BASE: 2, // dojoLv * 2 * (1 + members * 0.1)
  DOJO_MEMBER_BONUS: 0.1,
} as const;

// ---------------------------------------------------------------------------
// 3. Equipment System
// ---------------------------------------------------------------------------

/** Qualitative label → numeric value mapping */
export const STAT_LABEL_VALUES: Record<string, number> = {
  '最高': 6, '高': 4, '中': 3, '低': 2, '微': 1, '-低': -1, '-中': -2,
};

/** Equipment stat scaling: finalBonus = base * gradeMult * (1 + (equipLv-1) * EQUIP_LV_SCALE) */
export const EQUIP_LV_SCALE = 0.1;

/** Weapon base ATK per weapon type */
export const WEAPON_BASE_ATK: Record<string, number> = {
  katana:     5,   // 刀
  odachi:     7,   // 大太刀
  wakizashi:  4,   // 脇差
  naginata:   5,   // 薙刀
  kongojo:    3,   // 金剛杖
  fist:       3,   // 拳
  tonfa:      4,   // トンファー
  hammer:     7,   // 槌
  yumi:       4,   // 弓
  shuriken:   3,   // 手裏剣
  bomb:       5,   // 爆弾
  fukiya:     2,   // 吹矢
  staff:      2,   // 杖
  fan:        2,   // 扇
  bell:       1,   // 鈴
  scroll:     3,   // 呪文書
  crystal:    2,   // 水晶球
};

/** Armor base DEF and magic DEF per armor type */
export const ARMOR_BASE_DEF: Record<string, { baseDef: number; baseMagicDef: number; note?: string }> = {
  heavy:      { baseDef: 8, baseMagicDef: 2, note: 'SPD -2' },
  light:      { baseDef: 5, baseMagicDef: 3 },
  dofuku:     { baseDef: 3, baseMagicDef: 5 },
  miko_robe:  { baseDef: 2, baseMagicDef: 6 },
  shinobi_gi: { baseDef: 3, baseMagicDef: 3, note: 'SPD +3' },
  beast_hide: { baseDef: 4, baseMagicDef: 3 },
  merchant:   { baseDef: 2, baseMagicDef: 2, note: 'gold +10%' },
};

/** Grade multipliers and extra-effect slots */
export const GRADE_MULTIPLIERS: { grade: string; mult: number; slots: number }[] = [
  { grade: 'normal',    mult: 1.0, slots: 0 },
  { grade: 'fine',      mult: 1.3, slots: 1 },
  { grade: 'rare',      mult: 1.6, slots: 2 },
  { grade: 'legendary', mult: 2.0, slots: 3 },
  { grade: 'divine',    mult: 2.5, slots: 4 }, // + unique
];

/** Enhancement levels: statBoost (%), failRate (%), costMultiplier (of grade base cost) */
export const ENHANCEMENT_TABLE: { level: number; statBoost: number; failRate: number; costMult: number }[] = [
  { level:  1, statBoost: 0.05, failRate: 0.00, costMult:  0.5 },
  { level:  2, statBoost: 0.10, failRate: 0.00, costMult:  1.0 },
  { level:  3, statBoost: 0.15, failRate: 0.00, costMult:  1.5 },
  { level:  4, statBoost: 0.20, failRate: 0.00, costMult:  2.5 },
  { level:  5, statBoost: 0.25, failRate: 0.00, costMult:  4.0 },
  { level:  6, statBoost: 0.30, failRate: 0.20, costMult:  6.0 },
  { level:  7, statBoost: 0.35, failRate: 0.20, costMult:  9.0 },
  { level:  8, statBoost: 0.40, failRate: 0.35, costMult: 13.0 },
  { level:  9, statBoost: 0.45, failRate: 0.35, costMult: 18.0 },
  { level: 10, statBoost: 0.50, failRate: 0.50, costMult: 25.0 },
];

export const ENHANCEMENT_MAX = 10;

/** Base enhancement cost per grade (gold) */
export const ENHANCEMENT_BASE_COST: Record<string, number> = {
  normal:    50,
  fine:      150,
  rare:      400,
  legendary: 1_000,
  divine:    3_000,
};

// ---------------------------------------------------------------------------
// 4. Combat Formulas
// ---------------------------------------------------------------------------

export const COMBAT = {
  /** Physical: (atkPhys * skillMult) - (defPhys * PHYS_DEF_REDUCE) */
  PHYS_DEF_REDUCE: 0.4,
  /** Magic: (atkMagic * skillMult) - (defMagic * MAGIC_DEF_REDUCE) */
  MAGIC_DEF_REDUCE: 0.35,
  /** Final damage random variance [DAMAGE_RAND_MIN, DAMAGE_RAND_MAX] */
  DAMAGE_RAND_MIN: 0.9,
  DAMAGE_RAND_MAX: 1.1,
  /** Minimum final damage */
  MIN_DAMAGE: 1,
  /** Heal = caster SPI * skillMult * (1 + target SPI * HEAL_SPI_SCALE) */
  HEAL_SPI_SCALE: 0.01,
} as const;

/** Skill grade multipliers and ki cost */
export const SKILL_GRADES: { grade: string; mult: number; kiCost: number | 'all' }[] = [
  { grade: 'basic',    mult: 1.0, kiCost: 0 },
  { grade: 'beginner', mult: 1.5, kiCost: 10 },
  { grade: 'mid',      mult: 2.0, kiCost: 25 },
  { grade: 'advanced', mult: 3.0, kiCost: 50 },
  { grade: 'ultimate', mult: 5.0, kiCost: 'all' }, // mult = currentKi/maxKi * 5.0
];

/** Element affinity matrix — ELEMENT_AFFINITY[attacker][defender] */
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'neutral';

export const ELEMENT_AFFINITY: Record<Element, Record<Element, number>> = {
  wood:    { wood: 1.0, fire: 0.7, earth: 1.5, metal: 0.7, water: 1.0, neutral: 1.0 },
  fire:    { wood: 1.0, fire: 1.0, earth: 0.7, metal: 1.5, water: 0.7, neutral: 1.0 },
  earth:   { wood: 0.7, fire: 1.0, earth: 1.0, metal: 0.7, water: 1.5, neutral: 1.0 },
  metal:   { wood: 1.5, fire: 0.7, earth: 1.0, metal: 1.0, water: 0.7, neutral: 1.0 },
  water:   { wood: 0.7, fire: 1.5, earth: 0.7, metal: 1.0, water: 1.0, neutral: 1.0 },
  neutral: { wood: 1.0, fire: 1.0, earth: 1.0, metal: 1.0, water: 1.0, neutral: 1.0 },
};

/** Bond (유대) combo rates and multipliers */
export const BOND_COMBO: { stage: number; triggerRate: number; mult: number }[] = [
  { stage: 2, triggerRate: 0.05, mult: 1.2 },
  { stage: 3, triggerRate: 0.12, mult: 1.3 },
  { stage: 4, triggerRate: 0.20, mult: 1.5 },
];

/** Combined skill (합체기) — bond stage 4 only */
export const COMBINED_SKILL = {
  KI_THRESHOLD: 0.5,   // both need 50%+ ki
  TRIGGER_RATE: 0.20,  // per round
  KI_COST: 0.5,        // both spend 50% ki
  POWER_MULT: 1.5,     // ultimate * 1.5
} as const;

// ---------------------------------------------------------------------------
// 5. Expedition System
// ---------------------------------------------------------------------------

/** Base encounter counts per depth */
export const ENCOUNTER_COUNTS: Record<number, number> = {
  1: 4, 2: 8, 3: 12, 4: 18,
};

/** Base tick durations per depth */
export const EXPEDITION_BASE_TICKS: Record<number, number> = {
  1:    300,   // 5 min
  2:  1_800,   // 30 min
  3:  5_400,   // 1.5 h
  4: 14_400,   // 4 h
};

/** Encounter type weights per depth (probabilities sum to 1.0) */
export const ENCOUNTER_WEIGHTS: Record<number, Record<string, number>> = {
  1: { combat: 0.55, discovery: 0.20, trap: 0.10, camp: 0.10, event: 0.05 },
  2: { combat: 0.58, discovery: 0.18, trap: 0.12, camp: 0.07, event: 0.05 },
  3: { combat: 0.60, discovery: 0.15, trap: 0.13, camp: 0.07, event: 0.05 },
  4: { combat: 0.65, discovery: 0.12, trap: 0.13, camp: 0.05, event: 0.05 },
};

/** Actual tick = baseTick / (1 + avgSPD * EXPEDITION_SPD_SCALE) */
export const EXPEDITION_SPD_SCALE = 0.01;

// ---------------------------------------------------------------------------
// 6. Facility System
// ---------------------------------------------------------------------------

/** Facility upgrade cost: floor(baseCost * (level ^ FACILITY_COST_EXP) * discount) */
export const FACILITY_COST_EXP = 1.8;
export const FACILITY_DISCOUNT_LOW = 0.6;   // Lv 1-3
export const FACILITY_DISCOUNT_HIGH = 1.0;  // Lv 4+

export const FACILITY_BASE_COSTS: Record<string, number> = {
  blacksmith:  150,  // 대장간
  apothecary:  120,  // 약제실
  kitchen:      80,  // 주방
  dojo:        150,  // 도장
  talisman:    100,  // 부적방
  tearoom:      80,  // 다실
  recruiter:   100,  // 모집소
  lodging:     120,  // 숙소
  warehouse:    80,  // 창고
  tavern:      100,  // 주점
  library:     120,  // 서재
  garden:       80,  // 정원
  pet_den:     100,  // 펫 소굴
  trading:     150,  // 교역소
};

// ---------------------------------------------------------------------------
// 7. Gold Economy
// ---------------------------------------------------------------------------

/**
 * Average gold per expedition — GOLD_PER_EXPEDITION[regionIndex][depth]
 * regionIndex: 0..9 (제1국..제10국), depth: 1..4
 */
export const GOLD_PER_EXPEDITION: number[][] = [
  /*  R1 */ [    50,    120,    250,    500],
  /*  R2 */ [   120,    280,    550,  1_100],
  /*  R3 */ [   250,    550,  1_100,  2_200],
  /*  R4 */ [   500,  1_100,  2_200,  4_400],
  /*  R5 */ [ 1_000,  2_200,  4_400,  8_800],
  /*  R6 */ [ 1_500,  3_300,  6_600, 13_200],
  /*  R7 */ [ 2_000,  4_400,  8_800, 17_600],
  /*  R8 */ [ 2_800,  6_000, 12_000, 24_000],
  /*  R9 */ [ 3_500,  7_500, 15_000, 30_000],
  /* R10 */ [ 5_000, 10_000, 20_000, 40_000],
];

/** Recruitment cost = RECRUIT_BASE + (candidateLv * RECRUIT_LV_MULT) + (rareTraits * RECRUIT_TRAIT_COST) */
export const RECRUIT_BASE = 100;
export const RECRUIT_LV_MULT = 50;
export const RECRUIT_TRAIT_COST = 200;
/** Tavern special recruit multiplier */
export const RECRUIT_TAVERN_MULT = 3;

// ---------------------------------------------------------------------------
// 8. Reincarnation (환생) — Magatama
// ---------------------------------------------------------------------------

export const MAGATAMA = {
  /** magatama = clearedRegions * PER_REGION + (maxAdvLv / LV_DIVISOR) + bossKills * PER_BOSS + legendaryItems * PER_LEGENDARY + (encyclopediaRate * ENCYCLOPEDIA_MULT) */
  PER_REGION: 10,
  LV_DIVISOR: 10,
  PER_BOSS: 5,
  PER_LEGENDARY: 3,
  ENCYCLOPEDIA_MULT: 50,
} as const;

export const REINCARNATION = {
  /** Stat bonus per reincarnation (+5% each, cap 10) */
  STAT_BONUS_PER: 0.05,
  /** XP bonus per reincarnation (+15% each, cap 10) */
  XP_BONUS_PER: 0.15,
  /** Maximum reincarnations that grant bonuses */
  BONUS_CAP: 10,
} as const;

// ---------------------------------------------------------------------------
// 9. Corruption (요기 침식)
// ---------------------------------------------------------------------------

/** Corruption gauge accumulation = concentration * CORRUPTION_TICK_RATE per tick (during expedition) */
export const CORRUPTION_TICK_RATE = 0.01;
/** Decay when at guild = CORRUPTION_DECAY_RATE per tick */
export const CORRUPTION_DECAY_RATE = 0.5;
/** Resistance: SPI * CORRUPTION_SPI_RESIST_RATE reduces accumulation */
export const CORRUPTION_SPI_RESIST_RATE = 0.003; // 0.3%
/** Depth multiplier on corruption */
export const CORRUPTION_DEPTH_MULT = 1.2;

/** Yokai concentration per region (제1국..제10국) */
export const CORRUPTION_CONCENTRATION: number[] = [
  0.1, 0.3, 0.5, 0.7, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0,
];

/** Corruption stage thresholds */
export const CORRUPTION_STAGES = [
  { stage: 0, min:  0, max: 24, name: '正常' },
  { stage: 1, min: 25, max: 49, name: '軽微' },
  { stage: 2, min: 50, max: 74, name: '進行' },
  { stage: 3, min: 75, max: 89, name: '深刻' },
  { stage: 4, min: 90, max: 100, name: '暴走' },
] as const;

// ---------------------------------------------------------------------------
// 10. Pet System
// ---------------------------------------------------------------------------

export const PET = {
  /** Pet gains partyXP * XP_SHARE */
  XP_SHARE: 0.3,
  /** Max pet level */
  MAX_LEVEL: 50,
  /** Pet XP required = floor(PET_XP_BASE * (Lv ^ PET_XP_EXP)) */
  XP_BASE: 10,
  XP_EXP: 1.4,
  /** Passive scaling: base * (1 + (petLv - 1) * PASSIVE_SCALE) */
  PASSIVE_SCALE: 0.04,
  /** Assist trigger rate = (petLv * ASSIST_RATE_PER_LV)% — cap 100% */
  ASSIST_RATE_PER_LV: 2,
  /** Assist power = party avg stat * ASSIST_POWER_MULT */
  ASSIST_POWER_MULT: 0.5,
  /** Assist heal = party avg SPI * ASSIST_HEAL_MULT */
  ASSIST_HEAL_MULT: 0.3,
  /** Bond points per expedition with same adventurer */
  BOND_PER_EXPEDITION: 10,
  /** Bond stage thresholds */
  BOND_STAGES: [0, 50, 150, 300] as number[],
} as const;

// ---------------------------------------------------------------------------
// 11. Offline System
// ---------------------------------------------------------------------------

export const OFFLINE = {
  /** Base accumulation cap in ticks (24 h) */
  BASE_CAP: 86_400,
  /** Extra ticks per lodging level */
  LODGING_BONUS_PER_LV: 14_400,
  /** Max lodging bonus ticks (Lv 10 * 14400) */
  LODGING_BONUS_MAX: 144_000,
  /** Extra ticks per reincarnation count */
  REINCARNATION_BONUS_PER: 14_400,
  /** Max reincarnation bonus ticks (3 * 14400) */
  REINCARNATION_BONUS_MAX: 43_200,
  /** Absolute hard cap */
  HARD_CAP: 172_800, // 48 h
  /** Idle route keeps 60-70% of encounters */
  IDLE_KEEP_MIN: 0.6,
  IDLE_KEEP_MAX: 0.7,
} as const;

// ---------------------------------------------------------------------------
// 12. Status Ailments
// ---------------------------------------------------------------------------

/** Base resistance = RESIST_BASE + (resistStat * RESIST_PER_STAT) + equipBonus */
export const RESIST_BASE = 0.10;      // 10%
export const RESIST_PER_STAT = 0.005; // 0.5% per point

export const STATUS_AILMENT_BASE_CHANCE: { name: string; chance: number; resistStat: StatKey }[] = [
  { name: 'poison',    chance: 0.40, resistStat: 'END' },
  { name: 'venom',     chance: 0.25, resistStat: 'END' },
  { name: 'curse',     chance: 0.30, resistStat: 'SPI' },
  { name: 'seal',      chance: 0.25, resistStat: 'INT' },
  { name: 'confusion', chance: 0.20, resistStat: 'SPI' },
  { name: 'fear',      chance: 0.25, resistStat: 'SPI' },
  { name: 'paralysis', chance: 0.30, resistStat: 'END' },
  { name: 'blind',     chance: 0.35, resistStat: 'INT' },
  { name: 'freeze',    chance: 0.20, resistStat: 'END' },
];

// ---------------------------------------------------------------------------
// 13. Recruitment System
// ---------------------------------------------------------------------------

export const RECRUITMENT = {
  /** Candidate count = 3 + floor(recruiterLv / 2) — max 6 */
  BASE_CANDIDATES: 3,
  MAX_CANDIDATES: 6,
  /** Refresh interval = 14400 / (1 + recruiterLv * REFRESH_SCALE) ticks */
  BASE_REFRESH_TICKS: 14_400,
  REFRESH_SCALE: 0.05,
  /** Initial stat variance: base + rand(STAT_VAR_MIN, STAT_VAR_MAX) */
  STAT_VAR_MIN: -3,
  STAT_VAR_MAX: 5,
  /** Reincarnation stat bonus per count */
  REINCARNATION_STAT_BONUS: 2,
  /** Magatama quality bonus per enhancement level */
  MAGATAMA_QUALITY_BONUS: 2,
  /** Personality traits: rand(TRAIT_MIN, TRAIT_MAX) */
  TRAIT_MIN: 2,
  TRAIT_MAX: 3,
} as const;

// ---------------------------------------------------------------------------
// 14. Morale System
// ---------------------------------------------------------------------------

export const MORALE = {
  EXPEDITION_SUCCESS:     { min: 10, max: 20 },
  EXPEDITION_FAIL:        { min: -25, max: -15 },
  BOSS_FAIL:              0,  // no change
  ALLY_INJURED:           { min: -10, max: -5 },
  EVENT_POSITIVE:         { min: 5, max: 15 },
  EVENT_NEGATIVE:         { min: -15, max: -5 },
  TEAROOM_PER_HOUR:       20,
  TEAROOM_PER_TICK:       0.0056, // 20/3600 approx
  FAVORITE_FOOD:          5,
  BOND_PARTY:             5,
  LONG_IDLE:              0,
  /** Burnout triggers at morale 0 */
  BURNOUT_RECOVERY_TICKS: 259_200, // 3 days
  BURNOUT_RECOVERY_VALUE: 30,
  BURNOUT_STAT_PENALTY:   -0.25,   // -25% all stats
} as const;

// ---------------------------------------------------------------------------
// 15. Season System
// ---------------------------------------------------------------------------

export const SEASON = {
  TICKS_PER_DAY:    86_400,
  DAYS_PER_MONTH:   30,
  MONTHS_PER_SEASON: 3,
  DAYS_PER_SEASON:  90,
  SEASONS_PER_YEAR: 4,
  DAYS_PER_YEAR:    360,
  /** Season order starting from spring */
  ORDER: ['spring', 'summer', 'autumn', 'winter'] as const,
} as const;
