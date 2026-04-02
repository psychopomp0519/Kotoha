# 07 — Quest Pool (퀘스트 풀)

> 일일/주간 퀘스트 생성용 템플릿과 보상 테이블.

---

## 일일 퀘스트 (매일 3개 랜덤 선택)

### 전투형

| ID | 템플릿 | 변수 | 보상 |
|----|--------|------|------|
| dq_kill_1 | "{요괴} {N}마리 처치" | 요괴=현재지역 풀, N=3~10 | XP: N×적Lv×10, 금화: N×적Lv×3 |
| dq_kill_2 | "엘리트 {요괴} 처치" | 요괴=현재지역 엘리트 | XP: 적Lv×50, 금화: 적Lv×15, 소재×1 |
| dq_kill_3 | "원정에서 전투 {N}회 승리" | N=5~15 | XP: N×30, 금화: N×10 |
| dq_kill_4 | "원소 약점 공격으로 {N}회 처치" | N=3~8 | XP: N×40, 금화: N×15 |
| dq_kill_5 | "크리티컬로 {N}회 처치" | N=3~8 | XP: N×35, 금화: N×12 |

### 수집형

| ID | 템플릿 | 변수 | 보상 |
|----|--------|------|------|
| dq_gather_1 | "{소재} {N}개 획득" | 소재=현재지역 일반, N=3~8 | 금화: N×20, 희귀소재×1 |
| dq_gather_2 | "원정에서 발견 조우 {N}회" | N=2~5 | 금화: N×30, 랜덤소재×2 |
| dq_gather_3 | "금화 {N} 획득" | N=지역별 기준×3 | 금화 보너스 +50%, 소재×1 |
| dq_gather_4 | "보물상자 {N}개 개봉" | N=1~3 | 금화: N×100, 강화석(소)×N |
| dq_gather_5 | "요리 {N}개 제작" | N=2~5 | XP: N×20, 식재료×3 |

### 탐험형

| ID | 템플릿 | 변수 | 보상 |
|----|--------|------|------|
| dq_explore_1 | "{지역} 깊이{D} 클리어" | D=현재 가능 깊이 | XP: D×100, 금화: D×50 |
| dq_explore_2 | "원정 {N}회 완료" | N=2~5 | XP: N×50, 금화: N×30 |
| dq_explore_3 | "함정 {N}개 해제" | N=1~3 | XP: N×40, 금화: N×25, 소재 |
| dq_explore_4 | "야영에서 모험가 회복" | — | 사기 +10(파티), XP×30 |
| dq_explore_5 | "숨겨진 장소 발견" | — | XP: 200, 희귀소재×1 |

---

## 주간 퀘스트 (매주 2개)

| ID | 템플릿 | 조건 | 보상 |
|----|--------|------|------|
| wq_boss_retry | "보스 재도전" | 클리어한 보스 존재 | 주간 전용 소재×2, XP: 보스Lv×200 |
| wq_guild_goal_1 | "시설 업그레이드 1회" | — | 금화: 시설비용×0.3 반환, 소재×3 |
| wq_guild_goal_2 | "유대 포인트 {N} 이상 축적" | N=50~200 | XP: N×5, 사기 +15(해당 쌍) |
| wq_guild_goal_3 | "도감 {N}종 등록" | N=3~10 | XP: N×50, 서재 연구 부스트 |
| wq_guild_goal_4 | "모험가 {N}명 레벨업" | N=2~4 | XP 보너스: 다음 레벨업 XP -10% |
| wq_guild_goal_5 | "제작 아이템 {N}개 완성" | N=5~15 | 제작 소재×5, 금화: N×50 |

---

## 퀘스트 생성 규칙

```typescript
function generateDailyQuests(seed: number, gameState: GameState): Quest[] {
  const rng = seedRandom(seed + gameState.currentDay);
  const pool = [...COMBAT_QUESTS, ...GATHER_QUESTS, ...EXPLORE_QUESTS];

  // 카테고리별 최소 1개 보장
  const selected: Quest[] = [
    pickRandom(COMBAT_QUESTS, rng),
    pickRandom(GATHER_QUESTS, rng),
    pickRandom(EXPLORE_QUESTS, rng),
  ];

  // 변수 바인딩 (현재 지역/진행도 기준)
  return selected.map(q => bindVariables(q, gameState));
}

function generateWeeklyQuests(seed: number, gameState: GameState): Quest[] {
  const rng = seedRandom(seed + gameState.currentWeek);
  return [
    pickRandom(WEEKLY_QUESTS.filter(q => meetsCondition(q, gameState)), rng),
    pickRandom(WEEKLY_QUESTS.filter(q => meetsCondition(q, gameState)), rng),
  ];
}
```

### 보상 스케일링

```
보상 배율 = 1.0 + (현재 지역 번호 - 1) × 0.3
예: 제3국 = ×1.6, 제5국 = ×2.2
```

### 연속 완료 보너스

```
7일 연속 일퀘 완료 → 주간 보너스 소재 ×3
미완료 시 소멸, 다음날 유사 퀘스트 재등장
```

---

## 퀘스트 데이터 구조

```typescript
interface Quest {
  id: string;
  template: string;
  type: 'daily' | 'weekly';
  category: 'combat' | 'gather' | 'explore' | 'guild';
  description: string;
  target: { type: string; value: number; current: number };
  rewards: QuestReward[];
  expiresAt: number;  // 틱
  completed: boolean;
}

interface QuestReward {
  type: 'exp' | 'gold' | 'item' | 'morale' | 'material';
  value: number | string;
  quantity?: number;
}
```
