// ============================================================================
// Kotoha — Personality Trait Data
// Source: docs/data/05-trait-matrix.md
// ============================================================================

import type { TraitId } from '../core/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TraitEffects {
  combat?: string;
  exploration?: string;
  social?: string;
}

export interface Trait {
  id: TraitId;
  name: string;
  nameJp: string;
  effects: TraitEffects;
}

export interface Synergy {
  traits: [TraitId, TraitId];
  name: string;
  nameJp: string;
  effect: string;
  condition?: string;
}

export interface Friction {
  traits: [TraitId, TraitId] | [TraitId, string];
  name: string;
  nameJp: string;
  effect: string;
}

// ---------------------------------------------------------------------------
// All 12 Personality Traits
// ---------------------------------------------------------------------------

export const TRAITS: Trait[] = [
  {
    id: 'brave',
    name: '용감',
    nameJp: '勇敢',
    effects: {
      combat: '보스전 ATK +10%, 도주 확률 -50%',
      social: '사기 감소 -5%',
    },
  },
  {
    id: 'cautious',
    name: '신중',
    nameJp: '慎重',
    effects: {
      combat: '행동 속도 -5%',
      exploration: '함정 감지 +20%',
    },
  },
  {
    id: 'curious',
    name: '호기심',
    nameJp: '好奇心',
    effects: {
      exploration: '숨겨진 발견 +15%, 함정 회피 -10%',
      social: '이벤트 발생률 +10%',
    },
  },
  {
    id: 'gentle',
    name: '온화',
    nameJp: '温和',
    effects: {
      combat: '공격력 -5%',
      social: '유대 속도 +30%',
    },
  },
  {
    id: 'loner',
    name: '고독',
    nameJp: '孤高',
    effects: {
      combat: '파티 내 자신만 생존 시 전 스탯 +10%',
      exploration: '단독 탐험 보너스 +15%',
      social: '유대 속도 -50%',
    },
  },
  {
    id: 'greedy',
    name: '탐욕',
    nameJp: '貪欲',
    effects: {
      exploration: '전리품 수량 +20%',
      social: '사기 회복 -10%',
    },
  },
  {
    id: 'loyal',
    name: '충직',
    nameJp: '忠義',
    effects: {
      social: '사기 유지 +15%, 길드 이벤트 긍정',
    },
  },
  {
    id: 'wanderer',
    name: '방랑',
    nameJp: '放浪',
    effects: {
      exploration: '탐험 속도 +10%, 이벤트 +20%',
    },
  },
  {
    id: 'glutton',
    name: '먹보',
    nameJp: '大食',
    effects: {
      combat: '음식 버프 +50%',
      exploration: '음식 소비 x2',
      social: '요리 관련 이벤트 +30%',
    },
  },
  {
    id: 'artisan',
    name: '장인기질',
    nameJp: '匠気',
    effects: {
      social: '제작 품질 +15',
    },
  },
  {
    id: 'spirited',
    name: '영감',
    nameJp: '霊感',
    effects: {
      exploration: '요기 감지 +25%, 침식 저항 +15%',
      social: '요괴 이벤트 +20%',
    },
  },
  {
    id: 'nocturnal',
    name: '야행성',
    nameJp: '夜行',
    effects: {
      combat: '밤: 전 스탯 +15%, 낮: -5%',
      exploration: '밤 원정 보너스',
    },
  },
];

// ---------------------------------------------------------------------------
// Synergy Matrix — bonuses when two traits coexist in a party
// ---------------------------------------------------------------------------

export const SYNERGIES: Synergy[] = [
  {
    traits: ['brave', 'cautious'],
    name: '견제와 균형',
    nameJp: '牽制と均衡',
    effect: '파티 생존률 +5%',
    condition: '전위/후위 분산 시',
  },
  {
    traits: ['brave', 'loyal'],
    name: '충의의 검',
    nameJp: '忠義の剣',
    effect: '보스전 ATK +5% 추가',
  },
  {
    traits: ['cautious', 'spirited'],
    name: '육감',
    nameJp: '第六感',
    effect: '함정 감지 +10% 추가, 기습 회피 +15%',
  },
  {
    traits: ['curious', 'wanderer'],
    name: '탐험가의 혼',
    nameJp: '探検家の魂',
    effect: '숨겨진 발견 +10% 추가',
  },
  {
    traits: ['gentle', 'loyal'],
    name: '화목',
    nameJp: '和睦',
    effect: '파티 전체 사기 회복 +5',
  },
  {
    traits: ['gentle', 'glutton'],
    name: '함께 먹자',
    nameJp: '共に食す',
    effect: '음식 버프 파티 전체 적용 시 +5%',
  },
  {
    traits: ['artisan', 'cautious'],
    name: '명장의 눈',
    nameJp: '名匠の目',
    effect: '제작 품질 +10 추가',
    condition: '쇼쿠닌 계통 포함 시',
  },
  {
    traits: ['spirited', 'nocturnal'],
    name: '영야',
    nameJp: '霊夜',
    effect: '밤 원정 시 요괴 감지 +20%',
  },
  {
    traits: ['brave', 'wanderer'],
    name: '무모한 도전',
    nameJp: '無謀な挑戦',
    effect: '깊은 깊이 진입 시 XP +10%',
    condition: '깊이 3+',
  },
  {
    traits: ['curious', 'spirited'],
    name: '신비 탐구',
    nameJp: '神秘探求',
    effect: '이벤트 숨겨진 선택지 확률 +10%',
  },
  {
    traits: ['glutton', 'wanderer'],
    name: '미식 기행',
    nameJp: '美食紀行',
    effect: '식재료 발견 확률 +25%',
  },
  {
    traits: ['loyal', 'artisan'],
    name: '길드의 기둥',
    nameJp: 'ギルドの柱',
    effect: '시설 업그레이드 비용 -5%',
  },
];

// ---------------------------------------------------------------------------
// Friction Matrix — penalties when two traits coexist in a party
// ---------------------------------------------------------------------------

export const FRICTIONS: Friction[] = [
  {
    traits: ['loner', 'loner'],
    name: '무언의 긴장',
    nameJp: '無言の緊張',
    effect: '유대 형성 불가 (개별 전투력 보너스는 유지)',
  },
  {
    traits: ['greedy', 'gentle'],
    name: '가치관 충돌',
    nameJp: '価値観の衝突',
    effect: '사기 회복 -10%',
  },
  {
    traits: ['greedy', 'loyal'],
    name: '이익과 명예',
    nameJp: '利と名',
    effect: '금화 획득 -5% (충직 측 불만)',
  },
  {
    traits: ['loner', 'gentle'],
    name: '닿지 않는 손',
    nameJp: '届かぬ手',
    effect: '온화 측 사기 -3/원정',
  },
  {
    traits: ['nocturnal', 'non_nocturnal_x3'],
    name: '생활 리듬 불일치',
    nameJp: '生活不一致',
    effect: '야행성 모험가 사기 -2/원정',
  },
];
