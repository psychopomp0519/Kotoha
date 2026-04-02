# 10 — Event System (시드 기반 이벤트 시스템)

> 같은 세계에서도 매번 다른 이야기가 펼쳐진다.

---

## 개요

코토하의 이벤트 시스템은 **시드 기반 결정론적 랜덤**으로 동작한다. AI가 아닌, 풍부한 이벤트 풀 + 조건부 트리거 + 가중치 시스템으로 동적인 서사를 만든다.

### 핵심 원칙

1. **결정론적**: 같은 시드 + 같은 게임 상태 → 같은 이벤트 (재현 가능, 디버깅 용이)
2. **반응형**: 게임 상태(지역, 클래스, 진행도, 이전 선택)에 따라 다른 이벤트 발생
3. **연쇄형**: 한 이벤트의 선택이 후속 이벤트의 트리거 조건이 됨
4. **확장 용이**: 새 이벤트 = JSON 데이터 항목 추가
5. **모든 콘텐츠 접근 가능**: 시드는 순서를 바꿀 뿐, 접근을 차단하지 않는다
6. **선택은 영구 잠금 없음**: 어떤 선택도 다른 콘텐츠를 영원히 차단하지 않는다

---

## 시드 시스템

### 시드 생성

```
게임 시드 = 세이브 생성 시 랜덤 생성 (uint32)
환생 시 = 새 시드 생성 (이전 시드 + 환생 횟수로 파생)
```

### 이벤트 결정 흐름

```
이벤트 판정 틱 도달
  └→ 이벤트 풀에서 현재 조건에 맞는 이벤트 필터링
  └→ 가중치 계산 (게임 상태 기반)
  └→ PRNG(시드 + 현재 틱) → 가중치 기반 선택
  └→ 선택된 이벤트 표시
```

### PRNG 구현

```typescript
// seedrandom 또는 유사 라이브러리 사용
function eventRandom(seed: number, tick: number, salt: string): number {
  return prng(seed ^ tick ^ hashString(salt));
  // 0~1 사이 부동소수점 반환
}
```

---

## 이벤트 발생 빈도 & 타이밍

### 체크 주기

| 유형 | 체크 시점 | 빈도 제한 |
|------|-----------|-----------|
| 원정 조우 (ENCOUNTER) | 원정 조우 생성 시 (5~10% 확률로 이벤트 조우 발생) | 원정당 최대 2회 |
| 길드 이벤트 (GUILD) | 능동 세션 시작 시 + 매 600틱(10분)마다 | 세션당 최대 2회 |
| 모험가 개인 (PERSONAL) | 레벨업/전직/유대 변경 시 | 1일 최대 1회 |
| 세계 이벤트 (WORLD) | 지역 클리어/보스 격파 시 | 해당 이벤트 1회성 |
| 계절 이벤트 (SEASON) | 게임 내 계절 전환 시점 + 계절 중 1회 | 계절당 최대 3회 |
| 연쇄 이벤트 (CHAIN) | 선행 이벤트 완료 후 쿨다운 경과 시 | 쿨다운별 차등 |

### 세션당 이벤트 총량

- **능동 세션**: 길드 이벤트 최대 2회 + 원정 이벤트 (진행 중인 원정에 따라)
- **방치 후 복귀**: 이벤트는 발생했지만 선택 보류됨 → 복귀 시 선택 요청 (최대 3개 대기)
- **방치 중 자동 처리**: 이벤트 발생 시 "기본 선택" 자동 적용 (첫 번째 선택지)

### 이벤트 유형 상세

| 유형 | 코드 | 발생 시점 | 빈도 |
|------|------|-----------|------|
| 원정 조우 | ENCOUNTER | 원정 중 | 높음 (5~10% 조우) |
| 길드 이벤트 | GUILD | 능동 세션 | 중간 (세션당 0~2회) |
| 모험가 개인 | PERSONAL | 조건 충족 시 | 낮음 |
| 세계 이벤트 | WORLD | 특정 진행도 | 매우 낮음 |
| 계절 이벤트 | SEASON | 게임 내 계절 전환 | 계절당 1~3회 |
| 연쇄 이벤트 | CHAIN | 이전 선택 후 | 조건부 |

---

## 조건부 트리거

각 이벤트는 발동 조건(trigger)을 가진다. 조건을 모두 충족해야 이벤트 풀에 포함.

### 조건 유형

```typescript
interface EventTrigger {
  // 지역 조건
  region?: RegionId | RegionId[];
  depth?: { min?: number; max?: number };

  // 모험가 조건
  hasClass?: ClassId | ClassId[];       // 파티/길드에 해당 클래스 존재
  hasClassTier?: { base: BaseClass; minTier: number };
  adventurerLevel?: { min?: number; max?: number };
  partySize?: { min?: number; max?: number };

  // 진행 조건
  clearedRegions?: number;              // 클리어한 지역 수
  reincarnation?: { min?: number; max?: number };
  totalKills?: { min?: number };
  bossKills?: { min?: number };

  // 시간 조건
  season?: Season;
  timeOfDay?: 'day' | 'night';
  gameDay?: { min?: number };           // 게임 시작 후 경과 일수

  // 플래그 조건
  hasFlag?: EventFlag[];                // 이전 이벤트에서 설정된 플래그
  notHasFlag?: EventFlag[];             // 이 플래그가 없어야 함

  // 상태 조건
  morale?: { min?: number; max?: number };
  corruption?: { min?: number };
  hasPet?: PetSpeciesId;
  hasItem?: ItemId | ItemId[];             // 인벤토리에 해당 아이템 보유
  gold?: { min?: number };
  facilityLevel?: { facility: FacilityId; level: number };

  // 이벤트 이력
  eventSeen?: EventId[];                // 이 이벤트를 본 적이 있어야
  eventNotSeen?: EventId[];             // 이 이벤트를 본 적이 없어야
  cooldown?: number;                    // 마지막 이벤트 발생 후 최소 틱 수
}
```

---

## 가중치 시스템

조건을 충족한 이벤트들 중 최종 선택은 가중치로 결정.

### 기본 가중치

각 이벤트에 기본 가중치(1~100)가 설정됨.

### 동적 가중치 보정

```
최종 가중치 = 기본 가중치 × 희귀도 보정 × 반복 보정 × 상황 보정

희귀도 보정: 흔함 ×1.0, 보통 ×0.5, 드묾 ×0.2, 매우 드묾 ×0.05
반복 보정: 최근 본 이벤트일수록 감소 (본 지 N틱 → ×min(N/10000, 1.0))
상황 보정: 게임 상태에 따라 ×0.5~×2.0
```

### 상황 보정 예시

| 상황 | 보정 | 이유 |
|------|------|------|
| 첫 원정 | 튜토리얼 이벤트 ×5.0 | 신규 유도 |
| 사기 < 30 | 긍정적 이벤트 ×2.0 | 게임 이탈 방지 |
| 보스전 직후 | 보상/스토리 이벤트 ×3.0 | 성취감 강화 |
| 같은 지역 장기 체류 | 해당 지역 이벤트 ×0.5, 힌트 이벤트 ×2.0 | 정체 방지 |
| 환생 직후 | 회고/도전 이벤트 ×3.0 | 동기부여 |

---

## 이벤트 구조

### 기본 구조

```typescript
interface GameEvent {
  id: EventId;
  type: EventType;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'unique';
  trigger: EventTrigger;
  baseWeight: number;

  // 텍스트
  title: string;
  titleJp: string;
  narrative: string;            // 서술 텍스트 (1~3문단)

  // 선택지
  choices: EventChoice[];

  // 메타
  chainId?: string;             // 연쇄 이벤트 그룹 ID
  chainOrder?: number;          // 연쇄 내 순서
  tags: string[];               // 분류 태그
  oneTime: boolean;             // 1회성 이벤트?
}

interface EventChoice {
  id: string;
  text: string;                 // 선택지 텍스트
  condition?: EventTrigger;     // 이 선택지가 보이는 조건 (선택적)
  results: EventResult[];       // 가능한 결과 (가중 랜덤)
}

interface EventResult {
  weight: number;               // 결과 가중치
  narrative: string;            // 결과 서술
  effects: EventEffect[];       // 기계적 효과
  setFlags?: EventFlag[];       // 설정할 플래그
  clearFlags?: EventFlag[];     // 해제할 플래그
  triggerEvent?: EventId;       // 즉시 후속 이벤트
  chainNext?: EventId;          // 이후 조건 충족 시 발생할 연쇄
}

interface EventEffect {
  type: 'gold' | 'item' | 'exp' | 'morale' | 'stat' | 'corruption'
      | 'recruit' | 'heal' | 'damage' | 'bond' | 'reputation'
      | 'unlock_region' | 'unlock_recipe' | 'pet';
  target?: 'party' | 'random_member' | 'all_guild' | 'specific';
  value: number | string;
}
```

### 아이템 value 예약어

| 예약어 | 의미 | 구현 |
|--------|------|------|
| `rare_random` | 현재 지역 희귀 등급 소재 중 랜덤 1개 | `시드 기반 RNG로 해당 지역 희귀 소재 풀에서 선택` |
| `normal_random` | 현재 지역 일반 등급 소재 중 랜덤 1개 | 위와 동일, 일반 등급 풀 |
| `food_random` | 식재료 중 랜덤 1개 | 식재료 풀에서 선택 |
| 그 외 문자열 | 해당 ID의 아이템 직접 지급 | `mat_fox_bead`, `wpn_katana_1` 등 |

---

## 이벤트 예시

### 원정 조우 — "하얀 여우"

```json
{
  "id": "encounter_white_fox",
  "type": "ENCOUNTER",
  "rarity": "uncommon",
  "trigger": {
    "region": ["asagiri", "kurayamidani"],
    "season": "winter",
    "notHasFlag": ["white_fox_resolved"]
  },
  "baseWeight": 30,
  "title": "하얀 여우",
  "titleJp": "白い狐",
  "narrative": "원정 도중, 눈 위에 하얀 여우 한 마리가 앉아 있다. 꼬리가 셋이다. 여우는 파티를 빤히 바라보다가, 고개를 숲 안쪽으로 돌린다. 마치 따라오라는 듯이.",
  "choices": [
    {
      "id": "follow",
      "text": "여우를 따라간다",
      "results": [
        {
          "weight": 70,
          "narrative": "여우를 따라가자, 숲 깊은 곳에 오래된 신사가 있었다. 신사 앞에 보물상자가 놓여 있다.",
          "effects": [
            { "type": "item", "value": "rare_random", "target": "party" },  // rare_random = 현재 지역 희귀 등급 소재 중 시드 기반 랜덤 1개
            { "type": "exp", "value": 500, "target": "party" }
          ],
          "setFlags": ["white_fox_followed"]
        },
        {
          "weight": 30,
          "narrative": "여우를 따라갔지만, 안개 속에서 길을 잃었다. 한참을 헤맨 끝에 원래 길로 돌아왔다.",
          "effects": [
            { "type": "morale", "value": -5, "target": "party" }
          ],
          "setFlags": ["white_fox_lost"]
        }
      ]
    },
    {
      "id": "ignore",
      "text": "무시하고 지나간다",
      "results": [
        {
          "weight": 100,
          "narrative": "여우는 한참 파티를 바라보다가, 조용히 숲 속으로 사라졌다.",
          "effects": [],
          "setFlags": ["white_fox_ignored"]
        }
      ]
    },
    {
      "id": "offer_food",
      "text": "음식을 건넨다",
      "condition": { "hasFlag": [] },
      "results": [
        {
          "weight": 100,
          "narrative": "여우가 음식을 받아 먹고, 꼬리를 한 번 흔들었다. 그리고 입에서 작은 구슬 하나를 내려놓았다.",
          "effects": [
            { "type": "item", "value": "fox_bead" },
            { "type": "morale", "value": 10, "target": "party" }
          ],
          "setFlags": ["white_fox_befriended"],
          "chainNext": "chain_fox_return"
        }
      ]
    }
  ],
  "chainId": "white_fox_saga",
  "chainOrder": 1,
  "tags": ["fox", "shrine", "mystery"],
  "oneTime": false
}
```

### 연쇄 이벤트 — "여우의 은혜"

```json
{
  "id": "chain_fox_return",
  "type": "GUILD",
  "rarity": "rare",
  "trigger": {
    "hasFlag": ["white_fox_befriended"],
    "gameDay": { "min": 3 },
    "cooldown": 7200
  },
  "baseWeight": 80,
  "title": "여우의 은혜",
  "titleJp": "狐の恩返し",
  "narrative": "아침에 길드 문 앞에 작은 보따리가 놓여 있었다. 안에는 희귀한 약초와 함께, 여우 털로 만든 부적이 들어있다. 보따리 옆에는 여우 발자국이 남아 있었다.",
  "choices": [
    {
      "id": "accept",
      "text": "감사히 받는다",
      "results": [
        {
          "weight": 100,
          "narrative": "보따리의 약초는 놀랍도록 신선했고, 부적에서는 따뜻한 기운이 느껴졌다.",
          "effects": [
            { "type": "item", "value": "rare_herb", "target": "party" },
            { "type": "item", "value": "fox_talisman" },
            { "type": "morale", "value": 15, "target": "all_guild" }
          ],
          "setFlags": ["fox_debt_1"],
          "chainNext": "chain_fox_crisis"
        }
      ]
    }
  ]
}
```

---

## 연쇄 이벤트 구조

### 연쇄 그룹 예시: "하얀 여우 이야기"

```
1. 하얀 여우 (원정 조우)
   ├→ [따라감] → 숨겨진 신사 발견
   ├→ [무시] → (끝, 나중에 다른 변주로 재등장 가능)
   └→ [음식 건넴] → 여우 구슬 획득
        └→ 2. 여우의 은혜 (길드, 3일 후)
             └→ 3. 여우의 위기 (원정, 1주 후)
                  ├→ [도움] → 여우가 펫으로 동행
                  └→ [외면] → 여우 구슬 특수 효과 해금
```

### 연쇄 이벤트 설계 원칙

1. **분기는 2~3개**: 선택 부담 적당히
2. **모든 분기에 보상**: "나쁜 선택"은 없고, "다른 보상"이 있다
3. **최대 5단계**: 너무 길면 기억 못함
4. **재도전 가능**: 연쇄 완료 후 60 game-day 쿨다운 → 같은 연쇄 재시작, 다른 선택 가능
5. **영구 차단 없음**: 선택 A를 해도 선택 B의 보상은 다른 경로로 획득 가능

### 콘텐츠 접근 보장 시스템

**미경험 이벤트 우선 로테이션:**
- 매 30 game-day마다 "이벤트 로테이션 체크" 수행
- 아직 경험하지 못한 이벤트의 가중치 ×2.0 부스트
- 환생 시 새 시드 → 미경험 이벤트가 우선 배치

**선택 분기 재경험:**
- 연쇄 이벤트 완료 후 쿨다운(60일) 경과 시 재시작 가능
- 재시작 시 이전과 다른 선택지를 고를 수 있음
- 모든 분기 보상을 하나의 세이브에서 수집 가능

**콘텐츠 잠금 방지 규칙:**
1. 이벤트 선택이 다른 이벤트를 영구 차단하는 구조 금지
2. setFlags로 차단하는 이벤트는 반드시 대안 접근 경로 존재
3. oneTime 이벤트도 환생 시 재등장 (새 시드로 다시 경험 가능)

---

## 이벤트 카테고리 & 목표 수량

### 초기 구현 (Phase 6) 목표: 200+ 이벤트

| 카테고리 | 수량 | 설명 |
|----------|------|------|
| 원정 조우 (범용) | 30 | 어느 지역에서나 발생 가능 |
| 원정 조우 (지역별) | 30 (5×6지역) | 지역 특화 이벤트 |
| 길드 이벤트 | 15 | 길드 운영 관련 |
| 모험가 개인 | 10 | 클래스/성격 기반 |
| 세계/스토리 | 10 | 메인 스토리 진행 |
| 계절 이벤트 | 8 (2×4계절) | 계절 특화 |
| 연쇄 이벤트 | 5 (각 3~5단계) | 심화 스토리 |
| 일일/주간 퀘스트 | 30 (풀) | 퀘스트 풀에서 일일 3 + 주간 2 선택 |
| **합계** | **~213** | |

### 장기 목표 (Phase 8+): 400+ 이벤트

- 지역별 20개씩 (120)
- 클래스별 전용 이벤트 (60)
- 환생 전용 이벤트 (30)
- 펫 관련 이벤트 (20)
- 히든 이벤트 (20)
- 시즌 이벤트 확장 (20)
- 연쇄 이벤트 확장 (30)

---

## 이벤트 텍스트 작성 가이드

→ 상세한 문체 가이드는 `13-narrative-design.md` 참조

### 기본 규칙

1. **짧게**: 서술 1~3문단 (100~300자), 선택지 1문장
2. **구체적으로**: "무언가 좋은 일이" (X) → "보따리 안에 희귀약초가" (O)
3. **감각적으로**: 시각, 청각, 후각 묘사 포함
4. **일본어 병기**: 중요 명사는 한국어(일본어) 형식

---

## 구현 참고: 이벤트 매니저

```typescript
class EventManager {
  private pool: GameEvent[];
  private prng: SeededRandom;
  private flags: Set<EventFlag>;
  private history: EventHistory[];

  // 매 세션/원정 조우 시 호출
  checkForEvent(context: EventContext): GameEvent | null {
    const eligible = this.pool.filter(e => this.matchesTrigger(e, context));
    if (eligible.length === 0) return null;

    const weights = eligible.map(e => this.calculateWeight(e, context));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // 이벤트 발생 자체의 확률 체크
    const eventChance = this.getEventChance(context);
    if (this.prng.next() > eventChance) return null;

    // 가중치 기반 선택
    return this.weightedSelect(eligible, weights);
  }

  // 선택 처리
  resolveChoice(event: GameEvent, choiceId: string): EventResult {
    const choice = event.choices.find(c => c.id === choiceId);
    const result = this.weightedSelect(choice.results, choice.results.map(r => r.weight));

    // 플래그 설정
    result.setFlags?.forEach(f => this.flags.add(f));
    result.clearFlags?.forEach(f => this.flags.delete(f));

    // 이력 기록
    this.history.push({ eventId: event.id, choiceId, resultIndex, tick: currentTick });

    return result;
  }
}
```
