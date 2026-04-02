// ============================================================================
// Kotoha — Save Game Schema Types
// Generated from: docs/data/09-save-schema.md
// ============================================================================

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type RegionId =
  | 'asagiri'
  | 'kurayamidani'
  | 'uminari'
  | 'hanakage'
  | 'yukishiro'
  | 'kagatsuchi'
  | 'tsuchigumo'
  | 'amanoiwato'
  | 'tokoyo'
  | 'yomiji';

export type BaseClass =
  | 'kenshi'
  | 'miko'
  | 'shinobi'
  | 'yamabushi'
  | 'shokunin'
  | 'kemono';

export type ClassId = string;
export type TraitId = string;
export type SkillId = string;

export type AdventurerState =
  | 'idle'
  | 'expedition'
  | 'training'
  | 'tearoom'
  | 'injured'
  | 'burnout'
  | 'retired';

export type EquipSlot =
  | 'weapon'
  | 'head'
  | 'body'
  | 'hands'
  | 'feet'
  | 'accessory';

export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'legendary'
  | 'divine';

export type PetRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'legendary'
  | 'divine';

export type Element =
  | 'wood'
  | 'fire'
  | 'earth'
  | 'metal'
  | 'water'
  | 'none';

export type Quality =
  | 'poor'
  | 'normal'
  | 'fine'
  | 'masterwork'
  | 'masterpiece';

export type FacilityId =
  | 'smithy'
  | 'apothecary'
  | 'kitchen'
  | 'dojo'
  | 'talisman'
  | 'tearoom'
  | 'recruit'
  | 'quarters'
  | 'storage'
  | 'tavern'
  | 'library'
  | 'garden'
  | 'kennel'
  | 'exchange';

export type DayNight = 'day' | 'night';

export type ExpeditionDepth = 1 | 2 | 3 | 4 | 5;

export type ExpeditionStatus =
  | 'active'
  | 'returning'
  | 'completed'
  | 'waiting_recovery';

export type EncounterType =
  | 'combat'
  | 'discovery'
  | 'trap'
  | 'camp'
  | 'event';

export type CraftJobStatus = 'queued' | 'crafting' | 'completed';

export type CorruptionStage = 0 | 1 | 2 | 3 | 4;

export type PetBondLevel = 0 | 1 | 2 | 3;

export type PetState = 'idle' | 'expedition' | 'training' | 'hatching';

export type TextSpeed = 'slow' | 'normal' | 'fast';

export type CombatLogDetail = 'full' | 'summary';

export type Theme = 'light' | 'dark';

// ---------------------------------------------------------------------------
// Stats (aligned with 00-master-formulas.md)
// ---------------------------------------------------------------------------

/** Base 5-stat system: STR, SPD, INT, SPI, END */
export interface Stats {
  str: number;
  spd: number;
  int: number;
  spi: number;
  end: number;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export interface EquipmentSlots {
  weapon?: string;     // Equipment ID
  head?: string;
  body?: string;
  hands?: string;
  feet?: string;
  accessory?: string;
}

export interface Equipment {
  id: string;                    // UUID (instance)
  templateId: string;            // Equipment template ID
  name: string;
  nameJp: string;
  slot: EquipSlot;
  rarity: Rarity;
  equipLevel: number;            // Minimum equip level
  baseStats: Partial<Stats>;
  attackPower: number;           // Weapon attack power
  defensePower: number;          // Armor defense power
  magicDefense: number;          // Magic defense
  enhanceLevel: number;          // Enhancement 0~10
  element?: Element;
  prefix?: string;               // Prefix ID
  suffix?: string;               // Suffix ID
  setId?: string;
  isNamed: boolean;
  quality: Quality;
  equippedBy?: string;           // Adventurer ID who has it equipped
}

// ---------------------------------------------------------------------------
// Adventurer
// ---------------------------------------------------------------------------

export interface AdventurerName {
  family: string;                // Family name (Korean)
  given: string;                 // Given name (Korean)
  familyJp: string;             // Family name (Japanese)
  givenJp: string;              // Given name (Japanese)
}

export interface Adventurer {
  id: string;                    // UUID
  name: AdventurerName;
  baseClass: BaseClass;          // One of 6 lineages
  currentClass: ClassId;         // Current class ID
  classTier: number;             // Current tier (0~6)
  level: number;                 // 1~100
  exp: number;                   // EXP within current level
  stats: Stats;                  // Current base stats
  traits: TraitId[];             // 2~3 personality traits
  morale: number;                // Morale 0~100
  corruption: number;            // Corruption gauge 0~100
  corruptionStage: CorruptionStage;
  equipment: EquipmentSlots;
  skills: SkillId[];             // Learned skills
  bonds: Record<string, number>; // adventurerId -> Bond Points
  state: AdventurerState;
  recoveryEndTick?: number;      // Injury/burnout recovery completion tick
}

// ---------------------------------------------------------------------------
// Expedition
// ---------------------------------------------------------------------------

export interface EncounterResult {
  [key: string]: unknown;
}

export interface CombatLogEntry {
  [key: string]: unknown;
}

export interface EncounterData {
  type: EncounterType;
  seed: number;                  // Encounter seed
  resolved: boolean;
  result?: EncounterResult;
}

export interface ExpeditionResultAdventurerState {
  id: string;
  hpPercent: number;
  corruptionDelta: number;
  expGained: number;
}

export interface ItemDrop {
  itemId: string;
  quantity: number;
}

export interface ExpeditionResult {
  totalCombats: number;
  wins: number;
  losses: number;
  expGained: number;
  goldGained: number;
  itemsGained: ItemDrop[];
  adventurerStates: ExpeditionResultAdventurerState[];
  eventsTriggered: string[];
  log: CombatLogEntry[];
}

export interface ExpeditionConsumables {
  food?: string;                 // Item ID
  potion?: string;
  talisman?: string;
}

export interface Expedition {
  id: string;
  slotIndex: number;             // 0~3
  partyIds: string[];            // Adventurer IDs (max 4)
  petId?: string;                // Pet ID
  region: RegionId;
  depth: ExpeditionDepth;
  startTick: number;
  estimatedEndTick: number;
  consumables: ExpeditionConsumables;
  encounters: EncounterData[];   // Pre-generated encounter sequence
  currentEncounterIndex: number;
  autoRepeat: boolean;           // Auto-repeat ON/OFF
  status: ExpeditionStatus;
  result?: ExpeditionResult;
  completedRuns: number;         // Auto-repeat completed count
}

// ---------------------------------------------------------------------------
// Facility
// ---------------------------------------------------------------------------

export interface CraftJob {
  recipeId: string;
  startTick: number;
  endTick: number;
  status: CraftJobStatus;
  qualityRoll?: number;          // Quality roll seed
}

export interface FacilityState {
  id: FacilityId;
  level: number;                 // 1~10
  unlocked: boolean;
  productionQueue: CraftJob[];   // Crafting queue
  assignedAdventurerIds: string[]; // Dojo/Tearoom assignment
  lastProcessedTick: number;     // Last processed tick (offline calc)
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface Inventory {
  equipment: Equipment[];              // Owned equipment
  materials: Record<string, number>;   // materialId -> quantity
  consumables: Record<string, number>; // consumableId -> quantity
  maxSlots: number;                    // Storage capacity
}

// ---------------------------------------------------------------------------
// Pet
// ---------------------------------------------------------------------------

export interface Pet {
  id: string;
  speciesId: string;
  name: string;                  // Player-assigned name
  rarity: PetRarity;
  level: number;                 // 1~50
  exp: number;
  bondedAdventurerId?: string;
  bondLevel: PetBondLevel;
  bondPoints: number;
  state: PetState;
  canEvolve: boolean;
  evolutionTarget?: string;      // Evolution target speciesId
}

// ---------------------------------------------------------------------------
// World
// ---------------------------------------------------------------------------

export interface RegionState {
  unlocked: boolean;
  bossDefeated: boolean;
  bossAttempts: number;          // Boss attempt count (codex info unlock)
  depthCleared: number[];        // Clear count per depth
  maxDepthReached: number;
  totalExpeditions: number;
}

export interface WorldTime {
  currentTick: number;
  dayNight: DayNight;            // 43200-tick (12h) cycle
  season: Season;
  gameDay: number;
}

export interface WorldState {
  regions: Record<RegionId, RegionState>;
  time: WorldTime;
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export interface EventHistoryEntry {
  eventId: string;
  choiceId: string;
  tick: number;
}

export interface PendingEvent {
  eventId: string;
  triggeredTick: number;
  context: Record<string, unknown>; // Per-event context
}

export interface EventState {
  flags: Set<string>;            // Active event flags
  history: EventHistoryEntry[];  // Experienced event log
  pendingChoices: PendingEvent[];// Pending choice events (max 3)
  lastEventTick: number;
  dailyEventCount: number;       // Events triggered today
}

// ---------------------------------------------------------------------------
// Quest
// ---------------------------------------------------------------------------

export interface QuestTarget {
  type: string;
  value: number;
  current: number;
}

export interface QuestReward {
  type: string;
  value: number | string;
  quantity?: number;
}

export interface Quest {
  id: string;
  templateId: string;
  description: string;
  target: QuestTarget;
  rewards: QuestReward[];
  completed: boolean;
  expiresAtTick: number;
}

export interface QuestState {
  dailyQuests: Quest[];          // Daily quests (3)
  weeklyQuests: Quest[];         // Weekly quests (2)
  dailyRefreshTick: number;      // Next daily refresh tick
  weeklyRefreshTick: number;
  consecutiveDays: number;       // Consecutive daily quest completion days
}

// ---------------------------------------------------------------------------
// Prestige
// ---------------------------------------------------------------------------

export interface RetiredAdventurer {
  name: { family: string; given: string };
  finalClass: string;
  finalLevel: number;
  retiredAtTick: number;
  achievements: string[];
}

export interface TripleRelic {
  sword: boolean;                // Ame-no-Murakumo
  mirror: boolean;              // Yata-no-Kagami
  jewel: boolean;               // Yasakani-no-Magatama
}

export interface PrestigeState {
  reincarnationCount: number;
  totalMagatama: number;
  currentMagatama: number;
  upgrades: Record<string, number>;  // upgradeId -> current level
  vault: string[];                   // Prestige vault item IDs
  titles: string[];                  // Acquired titles
  hallOfFame: RetiredAdventurer[];
  tripleRelic: TripleRelic;
}

// ---------------------------------------------------------------------------
// Codex
// ---------------------------------------------------------------------------

export interface EnemyCodexEntry {
  discovered: boolean;
  killCount: number;
  observeCount: number;          // Active observation count
  weaknessKnown: boolean;       // Weakness revealed
  statsKnown: boolean;          // Exact stats revealed
  phasePatternKnown: boolean;   // Phase pattern revealed (bosses)
}

export interface CodexState {
  enemies: Record<string, EnemyCodexEntry>;   // enemyId -> info
  items: Set<string>;                          // Discovered item IDs
  classes: Set<string>;                        // Experienced class IDs
  events: Set<string>;                         // Experienced event IDs
  recipes: Set<string>;                        // Discovered recipe IDs
}

// ---------------------------------------------------------------------------
// Settings & Statistics
// ---------------------------------------------------------------------------

export interface GameSettings {
  language: 'ko';               // Currently Korean only
  autoSaveInterval: number;     // Ticks (default 60)
  textSpeed: TextSpeed;
  showDamageNumbers: boolean;
  combatLogDetail: CombatLogDetail;
  soundEnabled: boolean;
  theme: Theme;
}

export interface GameStatistics {
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
  fastestBossKill: Record<string, number>; // bossId -> round count
}

// ---------------------------------------------------------------------------
// Root: SaveGame
// ---------------------------------------------------------------------------

export interface SaveGame {
  // Meta
  version: number;               // Schema version (for migration)
  gameId: string;                // UUID, unique save identifier
  createdAt: number;             // Creation timestamp (Unix ms)
  lastSavedAt: number;           // Last save timestamp

  // Seed
  seed: number;                  // Game seed (uint32)
  currentTick: number;           // Current game tick (= elapsed seconds)

  // Guild
  guild: GuildState;

  // Adventurers
  adventurers: Adventurer[];

  // Expeditions
  expeditions: Expedition[];

  // Facilities
  facilities: FacilityState[];

  // Inventory
  inventory: Inventory;

  // Pets
  pets: Pet[];

  // World
  world: WorldState;

  // Events
  events: EventState;

  // Quests
  quests: QuestState;

  // Prestige
  prestige: PrestigeState;

  // Codex
  codex: CodexState;

  // Settings
  settings: GameSettings;

  // Statistics
  statistics: GameStatistics;
}

// ---------------------------------------------------------------------------
// GuildState
// ---------------------------------------------------------------------------

export interface GuildState {
  name: string;                  // Guild name (default: "コトハ屋")
  description: string;           // Description text that changes with progress
  gold: number;                  // Gold held
  maxAdventurers: number;        // Adventurer cap (8 + quarters expansion)
  expeditionSlots: number;       // Expedition slots (initial 1, max 4)
  unlockedRegions: RegionId[];   // Unlocked region list
  currentSeason: Season;         // Current season
  currentDay: number;            // In-game elapsed days
}

// ---------------------------------------------------------------------------
// Schema version constant
// ---------------------------------------------------------------------------

export const CURRENT_VERSION = 1;
