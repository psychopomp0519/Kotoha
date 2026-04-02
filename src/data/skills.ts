// ============================================================================
// Kotoha — T0 Class Skill Data (6 classes x 4 skills = 24 total)
// Source: docs/data/02-class-skills.md
// ============================================================================

import type { Element, BaseClass } from '../core/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillType = 'physical' | 'magical' | 'heal' | 'buff';
export type SkillTarget =
  | 'single_enemy'
  | 'all_enemies'
  | 'self'
  | 'single_ally'
  | 'all_allies'
  | 'random_enemies';
export type SkillGrade = 'basic' | 'beginner' | 'intermediate' | 'advanced' | 'ultimate';

export interface Skill {
  id: string;
  name: string;
  nameJp: string;
  classLineage: BaseClass;
  tier: 0;
  grade: SkillGrade;
  multiplier: number;
  kiCost: number;
  element: Element;
  target: SkillTarget;
  type: SkillType;
  effects: string[];
  learnLevel: number;
}

// ---------------------------------------------------------------------------
// T0 Skills — All 6 Classes
// ---------------------------------------------------------------------------

export const SKILLS: Skill[] = [
  // =========================================================================
  // 검사 (剣士 / Kenshi) — STR/END physical dealer / tank
  // =========================================================================
  {
    id: 'kenshi_kiri',
    name: '베기',
    nameJp: '斬り',
    classLineage: 'kenshi',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'none',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '검사 기본 공격'],
    learnLevel: 1,
  },
  {
    id: 'kenshi_kiai',
    name: '기합',
    nameJp: '気合',
    classLineage: 'kenshi',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'none',
    target: 'self',
    type: 'buff',
    effects: ['공격력 +25%', '3턴 지속'],
    learnLevel: 1,
  },
  {
    id: 'kenshi_rantou',
    name: '난도',
    nameJp: '乱刀',
    classLineage: 'kenshi',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'none',
    target: 'random_enemies',
    type: 'physical',
    effects: ['3회 랜덤 대상 연속 공격', '각 타격 배율 0.5x'],
    learnLevel: 3,
  },
  {
    id: 'kenshi_bougyo_taisei',
    name: '방어태세',
    nameJp: '防御態勢',
    classLineage: 'kenshi',
    tier: 0,
    grade: 'intermediate',
    multiplier: 0,
    kiCost: 25,
    element: 'none',
    target: 'self',
    type: 'buff',
    effects: ['물리방어 +30%', '2턴 지속', '도발 효과(적의 공격을 자신에게 집중)'],
    learnLevel: 7,
  },

  // =========================================================================
  // 무녀 (巫女 / Miko) — SPI/INT healer / support / magic dealer
  // =========================================================================
  {
    id: 'miko_chiyu_no_inori',
    name: '치유의 기도',
    nameJp: '治癒の祈り',
    classLineage: 'miko',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'water',
    target: 'single_ally',
    type: 'heal',
    effects: ['회복', 'SPI x 1.0 x (1 + 대상SPI x 0.01)'],
    learnLevel: 1,
  },
  {
    id: 'miko_jouka',
    name: '정화',
    nameJp: '浄化',
    classLineage: 'miko',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'water',
    target: 'single_ally',
    type: 'heal',
    effects: ['상태이상 1개 해제'],
    learnLevel: 1,
  },
  {
    id: 'miko_houriki',
    name: '법력',
    nameJp: '法力',
    classLineage: 'miko',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'water',
    target: 'single_enemy',
    type: 'magical',
    effects: ['술법 데미지', '무녀 기본 원거리 공격'],
    learnLevel: 2,
  },
  {
    id: 'miko_shukufuku',
    name: '축복',
    nameJp: '祝福',
    classLineage: 'miko',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'water',
    target: 'single_ally',
    type: 'buff',
    effects: ['축복(매 턴 최대HP 5% 회복)', '3턴 지속'],
    learnLevel: 5,
  },

  // =========================================================================
  // 시노비 (忍 / Shinobi) — SPD/STR physical assassin
  // =========================================================================
  {
    id: 'shinobi_shuriken',
    name: '표창',
    nameJp: '手裏剣',
    classLineage: 'shinobi',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'metal',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '원거리 가능', '시노비 기본 공격'],
    learnLevel: 1,
  },
  {
    id: 'shinobi_inshin',
    name: '은신',
    nameJp: '隠身',
    classLineage: 'shinobi',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'none',
    target: 'self',
    type: 'buff',
    effects: ['은신(피격률 -50%)', '2턴 지속', '공격 시 해제되지만 해당 공격 크리티컬 확정'],
    learnLevel: 1,
  },
  {
    id: 'shinobi_kyuusho_tsuki',
    name: '급소찌르기',
    nameJp: '急所突き',
    classLineage: 'shinobi',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'none',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '크리티컬률 +30%', '크리티컬 시 배율 x3.0(급소)'],
    learnLevel: 4,
  },
  {
    id: 'shinobi_enmaku',
    name: '연막',
    nameJp: '煙幕',
    classLineage: 'shinobi',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'none',
    target: 'all_enemies',
    type: 'buff',
    effects: ['디버프: 적 전원 명중률 -30%', '2턴 지속'],
    learnLevel: 7,
  },

  // =========================================================================
  // 야마부시 (山伏 / Yamabushi) — STR/SPI hybrid fighter / healer
  // =========================================================================
  {
    id: 'yamabushi_kongouken',
    name: '금강권',
    nameJp: '金剛拳',
    classLineage: 'yamabushi',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'none',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '야마부시 기본 공격', 'STR+SPI 혼합 기반(각 50%)'],
    learnLevel: 1,
  },
  {
    id: 'yamabushi_shizen_no_chikara',
    name: '자연의 힘',
    nameJp: '自然の力',
    classLineage: 'yamabushi',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'wood',
    target: 'single_enemy',
    type: 'magical',
    effects: ['술법 데미지', '목 원소', '야외 전투 시 위력 +20%'],
    learnLevel: 1,
  },
  {
    id: 'yamabushi_chiyu_no_kusuri',
    name: '치유의 약',
    nameJp: '治癒の薬',
    classLineage: 'yamabushi',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'wood',
    target: 'single_ally',
    type: 'heal',
    effects: ['회복', 'SPI x 1.5 x (1 + 대상SPI x 0.01)'],
    learnLevel: 3,
  },
  {
    id: 'yamabushi_dokyou',
    name: '경전읽기',
    nameJp: '読経',
    classLineage: 'yamabushi',
    tier: 0,
    grade: 'intermediate',
    multiplier: 0,
    kiCost: 25,
    element: 'water',
    target: 'all_allies',
    type: 'buff',
    effects: ['전체아군 술법방어 +20%', '2턴 지속'],
    learnLevel: 8,
  },

  // =========================================================================
  // 쇼쿠닌 (職人 / Shokunin) — INT/END crafter / support
  // =========================================================================
  {
    id: 'shokunin_hammer',
    name: '해머타격',
    nameJp: '槌打ち',
    classLineage: 'shokunin',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'earth',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '쇼쿠닌 기본 공격', '토 원소'],
    learnLevel: 1,
  },
  {
    id: 'shokunin_shuuri',
    name: '수리',
    nameJp: '修理',
    classLineage: 'shokunin',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.0,
    kiCost: 10,
    element: 'earth',
    target: 'single_ally',
    type: 'heal',
    effects: ['회복', 'INT x 1.0 x (1 + 대상END x 0.01)', '장비 내구도 회복 효과 겸용'],
    learnLevel: 1,
  },
  {
    id: 'shokunin_bakudan',
    name: '폭탄투척',
    nameJp: '爆弾投擲',
    classLineage: 'shokunin',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'fire',
    target: 'all_enemies',
    type: 'physical',
    effects: ['물리 데미지', '화 원소 전체 공격', '배율 낮지만 범위 넓음'],
    learnLevel: 3,
  },
  {
    id: 'shokunin_kyouka_fuyo',
    name: '강화부여',
    nameJp: '強化付与',
    classLineage: 'shokunin',
    tier: 0,
    grade: 'intermediate',
    multiplier: 0,
    kiCost: 25,
    element: 'earth',
    target: 'single_ally',
    type: 'buff',
    effects: ['대상 무기 공격력 +25%', '3턴 지속', 'INT 기반 효과량'],
    learnLevel: 7,
  },

  // =========================================================================
  // 케모노 (獣 / Kemono) — STR/SPD wild beast fighter
  // =========================================================================
  {
    id: 'kemono_tsume',
    name: '발톱공격',
    nameJp: '爪撃',
    classLineage: 'kemono',
    tier: 0,
    grade: 'basic',
    multiplier: 1.0,
    kiCost: 0,
    element: 'none',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '케모노 기본 공격', '크리티컬률 +5%(야성)'],
    learnLevel: 1,
  },
  {
    id: 'kemono_houkou',
    name: '포효',
    nameJp: '咆哮',
    classLineage: 'kemono',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'none',
    target: 'all_enemies',
    type: 'buff',
    effects: ['디버프: 적 전원 공격력 -15%', '행동 속도 -10%', '2턴 지속', '공포(恐怖) 20%'],
    learnLevel: 1,
  },
  {
    id: 'kemono_yajuu_no_chokan',
    name: '야수의 직감',
    nameJp: '獣の直感',
    classLineage: 'kemono',
    tier: 0,
    grade: 'beginner',
    multiplier: 0,
    kiCost: 10,
    element: 'none',
    target: 'self',
    type: 'buff',
    effects: ['회피율 +25%', '크리티컬률 +15%', '2턴 지속'],
    learnLevel: 3,
  },
  {
    id: 'kemono_kamitsuki',
    name: '물기',
    nameJp: '噛みつき',
    classLineage: 'kemono',
    tier: 0,
    grade: 'beginner',
    multiplier: 1.5,
    kiCost: 10,
    element: 'none',
    target: 'single_enemy',
    type: 'physical',
    effects: ['물리 데미지', '가한 데미지의 15%를 HP로 회복'],
    learnLevel: 6,
  },
];
