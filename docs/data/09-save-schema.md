# 09 — Save Game Schema (세이브 데이터 스키마)

> 단일 세이브, 하나의 진실 원천. 이 문서가 IndexedDB에 저장되는 모든 것을 정의한다.

---

## 루트 스키마

```typescript
interface SaveGame {
  // 메타
  version: number;           // 스키마 버전 (마이그레이션용)
  gameId: string;            // UUID, 세이브 고유 식별자
  createdAt: number;         // 생성 시각 (Unix ms)
  lastSavedAt: number;       // 마지막 저장 시각

  // 시드
  seed: number;              // 게임 시드 (uint32)
  currentTick: number;       // 현재 게임 틱 (= 경과 초)

  // 길드
  guild: GuildState;

  // 모험가
  adventurers: Adventurer[];

  // 원정
  expeditions: Expedition[];

  // 시설
  facilities: FacilityState[];

  // 인벤토리
  inventory: Inventory;

  // 펫
  pets: Pet[];

  // 월드
  world: WorldState;

  // 이벤트
  events: EventState;

  // 퀘스트
  quests: QuestState;

  // 환생 (프레스티지)
  prestige: PrestigeState;

  // 도감
  codex: CodexState;

  // 설정
  settings: GameSettings;

  // 통계
  statistics: GameStatistics;
}
```

---

## 각 서브스키마

### GuildState

```typescript
interface GuildState {
  name: string;                  // 길드 이름 (기본: "コトハ屋")
  description: string;           // 진행도에 따라 변하는 묘사 텍스트
  gold: number;                  // 보유 금화
  maxAdventurers: number;        // 모험가 보유 상한 (8 + 숙소 확장)
  expeditionSlots: number;       // 원정 슬롯 수 (초기 1, 최대 4)
  unlockedRegions: RegionId[];   // 해금된 지역 목록
  currentSeason: Season;         // 현재 계절
  currentDay: number;            // 게임 내 경과 일수
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type RegionId = 'asagiri' | 'kurayamidani' | 'uminari' | 'hanakage'
              | 'yukishiro' | 'kagatsuchi' | 'tsuchigumo' | 'amanoiwato'
              | 'tokoyo' | 'yomiji';
```

### Adventurer

```typescript
interface Adventurer {
  id: string;                    // UUID
  name: {
    family: string;              // 성 (한국어)
    given: string;               // 이름 (한국어)
    familyJp: string;            // 성 (일본어)
    givenJp: string;             // 이름 (일본어)
  };
  baseClass: BaseClass;          // 6계통 중 하나
  currentClass: ClassId;         // 현재 클래스 ID
  classTier: number;             // 현재 Tier (0~6)
  level: number;                 // 1~100
  exp: number;                   // 현재 레벨 내 경험치
  stats: Stats;                  // 현재 기본 스탯
  traits: TraitId[];             // 성격 특성 2~3개
  morale: number;                // 사기 0~100
  corruption: number;            // 요기 침식 게이지 0~100
  corruptionStage: 0 | 1 | 2 | 3 | 4;
  equipment: EquipmentSlots;
  skills: SkillId[];             // 습득한 스킬 목록
  bonds: Record<string, number>; // 상대 adventurerId → BP
  state: AdventurerState;
  recoveryEndTick?: number;      // 부상/번아웃 회복 완료 틱
}

type BaseClass = 'kenshi' | 'miko' | 'shinobi' | 'yamabushi' | 'shokunin' | 'kemono';
type AdventurerState = 'idle' | 'expedition' | 'training' | 'tearoom' | 'injured' | 'burnout' | 'retired';

interface Stats {
  str: number;
  spd: number;
  int: number;
  spi: number;
  end: number;
}

interface EquipmentSlots {
  weapon?: string;     // Equipment ID
  head?: string;
  body?: string;
  hands?: string;
  feet?: string;
  accessory?: string;
}
```

### Expedition

```typescript
interface Expedition {
  id: string;
  slotIndex: number;             // 0~3
  partyIds: string[];            // 모험가 ID (최대 4)
  petId?: string;                // 펫 ID
  region: RegionId;
  depth: 1 | 2 | 3 | 4 | 5;
  startTick: number;
  estimatedEndTick: number;
  consumables: {
    food?: string;               // Item ID
    potion?: string;
    talisman?: string;
  };
  encounters: EncounterData[];   // 사전 생성된 조우 시퀀스
  currentEncounterIndex: number;
  autoRepeat: boolean;           // 자동 반복 ON/OFF
  status: 'active' | 'returning' | 'completed' | 'waiting_recovery';
  result?: ExpeditionResult;
  completedRuns: number;         // 자동 반복 완료 횟수
}

interface EncounterData {
  type: 'combat' | 'discovery' | 'trap' | 'camp' | 'event';
  seed: number;                  // 이 조우의 시드
  resolved: boolean;
  result?: EncounterResult;
}

interface ExpeditionResult {
  totalCombats: number;
  wins: number;
  losses: number;
  expGained: number;
  goldGained: number;
  itemsGained: { itemId: string; quantity: number }[];
  adventurerStates: {
    id: string;
    hpPercent: number;
    corruptionDelta: number;
    expGained: number;
  }[];
  eventsTriggered: string[];
  log: CombatLogEntry[];
}
```

### FacilityState

```typescript
interface FacilityState {
  id: FacilityId;
  level: number;                 // 1~10
  unlocked: boolean;
  productionQueue: CraftJob[];   // 제작 대기열
  assignedAdventurerIds: string[]; // 도장/다실 배치
  lastProcessedTick: number;     // 마지막 처리 틱 (오프라인 계산용)
}

interface CraftJob {
  recipeId: string;
  startTick: number;
  endTick: number;
  status: 'queued' | 'crafting' | 'completed';
  qualityRoll?: number;          // 품질 판정용 시드
}

type FacilityId = 'smithy' | 'apothecary' | 'kitchen' | 'dojo' | 'talisman'
               | 'tearoom' | 'recruit' | 'quarters' | 'storage' | 'tavern'
               | 'library' | 'garden' | 'kennel' | 'exchange';
```

### Inventory

```typescript
interface Inventory {
  equipment: Equipment[];        // 보유 장비
  materials: Record<string, number>; // materialId → 수량
  consumables: Record<string, number>; // consumableId → 수량
  maxSlots: number;              // 창고 용량
}

interface Equipment {
  id: string;                    // UUID (인스턴스)
  templateId: string;            // 장비 템플릿 ID
  name: string;
  nameJp: string;
  slot: EquipSlot;
  rarity: Rarity;
  equipLevel: number;            // 착용 최소 레벨
  baseStats: Partial<Stats>;
  attackPower: number;           // 무기 공격력
  defensePower: number;          // 방어구 방어력
  magicDefense: number;          // 술법 방어
  enhanceLevel: number;          // 강화 0~10
  element?: Element;
  prefix?: string;               // 접두사 ID
  suffix?: string;               // 접미사 ID
  setId?: string;
  isNamed: boolean;
  quality: Quality;
  equippedBy?: string;           // 장착한 모험가 ID
}

type EquipSlot = 'weapon' | 'head' | 'body' | 'hands' | 'feet' | 'accessory';
type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine';
type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'none';
type Quality = 'poor' | 'normal' | 'fine' | 'masterwork' | 'masterpiece';
```

### Pet

```typescript
interface Pet {
  id: string;
  speciesId: string;
  name: string;                  // 플레이어 지정 이름
  rarity: PetRarity;
  level: number;                 // 1~50
  exp: number;
  bondedAdventurerId?: string;
  bondLevel: 0 | 1 | 2 | 3;
  bondPoints: number;
  state: 'idle' | 'expedition' | 'training' | 'hatching';
  canEvolve: boolean;
  evolutionTarget?: string;      // 진화 대상 speciesId
}

type PetRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'divine';
```

### WorldState

```typescript
interface WorldState {
  regions: Record<RegionId, RegionState>;
  time: {
    currentTick: number;
    dayNight: 'day' | 'night';   // 43200틱(12시간) 사이클
    season: Season;
    gameDay: number;
  };
}

interface RegionState {
  unlocked: boolean;
  bossDefeated: boolean;
  bossAttempts: number;          // 보스 도전 횟수 (도감 정보 해금용)
  depthCleared: number[];        // 각 깊이 클리어 횟수
  maxDepthReached: number;
  totalExpeditions: number;
}
```

### EventState

```typescript
interface EventState {
  flags: Set<string>;            // 활성 이벤트 플래그
  history: EventHistoryEntry[];  // 경험한 이벤트 기록
  pendingChoices: PendingEvent[];// 선택 대기 중인 이벤트 (최대 3)
  lastEventTick: number;
  dailyEventCount: number;       // 오늘 발생한 이벤트 수
}

interface EventHistoryEntry {
  eventId: string;
  choiceId: string;
  tick: number;
}

interface PendingEvent {
  eventId: string;
  triggeredTick: number;
  context: Record<string, any>;  // 이벤트별 컨텍스트
}
```

### QuestState

```typescript
interface QuestState {
  dailyQuests: Quest[];          // 오늘의 일일 퀘스트 (3개)
  weeklyQuests: Quest[];         // 이번주 주간 퀘스트 (2개)
  dailyRefreshTick: number;      // 다음 일일 갱신 틱
  weeklyRefreshTick: number;
  consecutiveDays: number;       // 연속 일퀘 완료 일수
}

interface Quest {
  id: string;
  templateId: string;
  description: string;
  target: { type: string; value: number; current: number };
  rewards: { type: string; value: number | string; quantity?: number }[];
  completed: boolean;
  expiresAtTick: number;
}
```

### PrestigeState

```typescript
interface PrestigeState {
  reincarnationCount: number;
  totalMagatama: number;
  currentMagatama: number;
  upgrades: Record<string, number>;  // upgradeId → 현재 레벨
  vault: string[];                   // 환생 금고 아이템 ID
  titles: string[];                  // 획득 칭호
  hallOfFame: RetiredAdventurer[];
  tripleRelic: {
    sword: boolean;                  // 천총운검
    mirror: boolean;                 // 야타노카가미
    jewel: boolean;                  // 야사카노마가타마
  };
}

interface RetiredAdventurer {
  name: { family: string; given: string };
  finalClass: string;
  finalLevel: number;
  retiredAtTick: number;
  achievements: string[];
}
```

### CodexState

```typescript
interface CodexState {
  enemies: Record<string, EnemyCodexEntry>;   // enemyId → 정보
  items: Set<string>;                          // 발견한 아이템 ID
  classes: Set<string>;                        // 경험한 클래스 ID
  events: Set<string>;                         // 경험한 이벤트 ID
  recipes: Set<string>;                        // 발견한 레시피 ID
}

interface EnemyCodexEntry {
  discovered: boolean;
  killCount: number;
  observeCount: number;          // 능동 관찰 횟수
  weaknessKnown: boolean;       // 약점 공개 여부
  statsKnown: boolean;          // 정확한 스탯 공개 여부
  phasePatternKnown: boolean;   // 페이즈 패턴 공개 (보스용)
}
```

### GameSettings & Statistics

```typescript
interface GameSettings {
  language: 'ko';               // 현재 한국어만
  autoSaveInterval: number;     // 틱 (기본 60)
  textSpeed: 'slow' | 'normal' | 'fast';
  showDamageNumbers: boolean;
  combatLogDetail: 'full' | 'summary';
  soundEnabled: boolean;
  theme: 'light' | 'dark';
}

interface GameStatistics {
  totalPlayTicks: number;
  totalExpeditions: number;
  totalCombats: number;
  totalKills: number;
  totalBossKills: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalItemsCrafted: number;
  totalEventsExperienced: number;
  longestWinStreak: number;
  fastestBossKill: Record<string, number>; // bossId → 라운드 수
}
```

---

## 저장 전략

| 항목 | 값 |
|------|-----|
| 저장소 | IndexedDB (주) + localStorage (비상 백업, 압축) |
| 자동 저장 | 모든 의사결정 후 즉시 + 60틱(1분)마다 |
| 스키마 버전 | `version: 1` (업데이트 시 마이그레이션) |
| 백업 | 설정 메뉴에서 JSON 내보내기/가져오기 |
| 세이브 슬롯 | 1개 (단일 세이브) |

### 마이그레이션 전략

```typescript
const CURRENT_VERSION = 1;

function migrateSave(save: any): SaveGame {
  let data = save;
  if (data.version < 1) data = migrateV0toV1(data);
  // if (data.version < 2) data = migrateV1toV2(data);
  return data as SaveGame;
}
```

---

## 초기 상태 (신규 게임)

```typescript
function createNewGame(guildName: string): SaveGame {
  const seed = Math.floor(Math.random() * 0xFFFFFFFF);
  return {
    version: CURRENT_VERSION,
    gameId: generateUUID(),
    createdAt: Date.now(),
    lastSavedAt: Date.now(),
    seed,
    currentTick: 0,
    guild: {
      name: guildName || 'コトハ屋',
      description: '허름한 오두막. 비가 새는 지붕 아래, 세 명의 모험가가 모였다.',
      gold: 200,
      maxAdventurers: 8,
      expeditionSlots: 1,
      unlockedRegions: ['asagiri'],
      currentSeason: 'spring',
      currentDay: 0,
    },
    adventurers: [
      createStartingAdventurer('야요이', 'kenshi', seed),
      createStartingAdventurer('카에데', 'miko', seed + 1),
      createStartingAdventurer('렌', 'shinobi', seed + 2),
    ],
    expeditions: [],
    facilities: createInitialFacilities(),
    inventory: { equipment: [], materials: {}, consumables: {}, maxSlots: 50 },
    pets: [],
    world: createInitialWorld(),
    events: { flags: new Set(), history: [], pendingChoices: [], lastEventTick: 0, dailyEventCount: 0 },
    quests: { dailyQuests: [], weeklyQuests: [], dailyRefreshTick: 86400, weeklyRefreshTick: 604800, consecutiveDays: 0 },
    prestige: createInitialPrestige(),
    codex: { enemies: {}, items: new Set(), classes: new Set(), events: new Set(), recipes: new Set() },
    settings: { language: 'ko', autoSaveInterval: 60, textSpeed: 'normal', showDamageNumbers: true, combatLogDetail: 'full', soundEnabled: true, theme: 'light' },
    statistics: createEmptyStatistics(),
  };
}
```
