/**
 * Kotoha — Main Zustand Game Store (Phase 1)
 *
 * Practical subset of the full SaveGame schema.
 * Covers guild management, adventurers, expeditions, facilities, and inventory.
 */

import { create } from 'zustand';
import type {
  Adventurer,
  CraftJob,
  Expedition,
  ExpeditionDepth,
  PendingEvent,
  RegionId,
  Season,
  Stats,
  TraitId,
} from '../core/types';
import {
  CLASS_BASE_STATS,
  type ClassName,
  EXPEDITION_BASE_TICKS,
  SEASON,
} from '../data/constants';
import { TUTORIAL_ADVENTURERS } from '../data/names';
import { generateCandidates, type RecruitCandidate } from '../engine/adventurer/Recruitment';
import { processExpedition, calculateExpeditionTicks } from '../engine/expedition/ExpeditionEngine';

// ---------------------------------------------------------------------------
// Region ID list (ordered by index)
// ---------------------------------------------------------------------------

const REGION_IDS: RegionId[] = [
  'asagiri', 'kurayamidani', 'uminari', 'hanakage', 'yukishiro',
  'kagatsuchi', 'tsuchigumo', 'amanoiwato', 'tokoyo', 'yomiji',
];

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface GameState {
  // Meta
  seed: number;
  currentTick: number;

  // Guild
  guild: {
    name: string;
    gold: number;
    expeditionSlots: number;
  };

  // Adventurers (simplified)
  adventurers: Adventurer[];

  // Expeditions
  expeditions: Expedition[];

  // Facilities
  facilities: Record<string, { level: number; queue: CraftJob[] }>;

  // Inventory
  inventory: { items: Record<string, number> };

  // World
  world: {
    currentSeason: Season;
    dayCount: number;
    unlockedRegions: number[];
  };

  // Events
  events: {
    flags: Set<string>;
    pending: PendingEvent[];
  };

  // Recruitment
  recruitCandidates: RecruitCandidate[];

  // Actions
  newGame: () => void;
  tick: () => void;
  startExpedition: (adventurerIds: string[], regionIndex: number, depth: number) => void;
  completeExpedition: (expeditionId: string) => void;
  hireAdventurer: (candidateIndex: number) => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => void;
  addItem: (itemId: string, quantity: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId(): string {
  return crypto.randomUUID();
}

function statsFromClass(className: ClassName): Stats {
  const base = CLASS_BASE_STATS[className];
  return {
    str: base.STR,
    spd: base.SPD,
    int: base.INT,
    spi: base.SPI,
    end: base.END,
  };
}

function makeTutorialAdventurers(): Adventurer[] {
  // Fixed family names for tutorial adventurers (first 3 from family pool)
  const tutorialFamilies = [
    { ko: '사쿠라', jp: 'さくら' },
    { ko: '아오야마', jp: 'あおやま' },
    { ko: '쿠로카와', jp: 'くろかわ' },
  ];

  return TUTORIAL_ADVENTURERS.map((ta, i) => ({
    id: makeId(),
    name: {
      family: tutorialFamilies[i].ko,
      given: ta.givenName,
      familyJp: tutorialFamilies[i].jp,
      givenJp: ta.givenNameJp,
    },
    baseClass: ta.baseClass,
    currentClass: ta.baseClass,
    classTier: 0,
    level: 1,
    exp: 0,
    stats: statsFromClass(ta.baseClass),
    traits: [] as TraitId[],
    morale: 70,
    corruption: 0,
    corruptionStage: 0 as const,
    equipment: {},
    skills: [],
    bonds: {},
    state: 'idle' as const,
  }));
}

function initialState() {
  const seed = (Math.random() * 0xFFFFFFFF) >>> 0;
  return {
    seed,
    currentTick: 0,
    guild: {
      name: 'コトハ屋',
      gold: 200,
      expeditionSlots: 1,
    },
    adventurers: makeTutorialAdventurers(),
    expeditions: [] as Expedition[],
    facilities: {
      smithy: { level: 1, queue: [] },
      apothecary: { level: 0, queue: [] },
      kitchen: { level: 0, queue: [] },
      dojo: { level: 0, queue: [] },
      tearoom: { level: 0, queue: [] },
      recruit: { level: 1, queue: [] },
    } as Record<string, { level: number; queue: CraftJob[] }>,
    inventory: { items: {} as Record<string, number> },
    world: {
      currentSeason: 'spring' as Season,
      dayCount: 0,
      unlockedRegions: [0],
    },
    events: {
      flags: new Set<string>(),
      pending: [] as PendingEvent[],
    },
    recruitCandidates: [] as RecruitCandidate[],
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState(),

  // -- New Game ---------------------------------------------------------------
  newGame: () => {
    const fresh = initialState();
    // Generate initial recruit candidates
    fresh.recruitCandidates = generateCandidates(fresh.seed, 3, 0);
    set(fresh);
  },

  // -- Tick -------------------------------------------------------------------
  tick: () => {
    set((state) => {
      const nextTick = state.currentTick + 1;

      // Process season / day advancement
      const totalDayTicks = SEASON.TICKS_PER_DAY;
      const newDayCount = Math.floor(nextTick / totalDayTicks);
      const seasonIndex = Math.floor(newDayCount / SEASON.DAYS_PER_SEASON) % 4;
      const newSeason = SEASON.ORDER[seasonIndex];

      // Check completed expeditions
      const completedExpeditions: Expedition[] = [];
      const activeExpeditions: Expedition[] = [];

      for (const exp of state.expeditions) {
        if (exp.status === 'active' && nextTick >= exp.estimatedEndTick) {
          completedExpeditions.push({ ...exp, status: 'completed' });
        } else {
          activeExpeditions.push(exp);
        }
      }

      // Process facility queues
      const updatedFacilities = { ...state.facilities };
      for (const [facId, fac] of Object.entries(updatedFacilities)) {
        if (fac.queue.length > 0) {
          const updatedQueue = fac.queue.map((job) => {
            if (job.status === 'crafting' && nextTick >= job.endTick) {
              return { ...job, status: 'completed' as const };
            }
            return job;
          });
          updatedFacilities[facId] = { ...fac, queue: updatedQueue };
        }
      }

      return {
        currentTick: nextTick,
        expeditions: [...activeExpeditions, ...completedExpeditions],
        facilities: updatedFacilities,
        world: {
          ...state.world,
          dayCount: newDayCount,
          currentSeason: newSeason,
        },
      };
    });
  },

  // -- Start Expedition -------------------------------------------------------
  startExpedition: (adventurerIds: string[], regionIndex: number, depth: number) => {
    const state = get();

    // Validate
    const activeCount = state.expeditions.filter(e => e.status === 'active').length;
    if (activeCount >= state.guild.expeditionSlots) return;
    if (adventurerIds.length === 0 || adventurerIds.length > 4) return;
    if (!state.world.unlockedRegions.includes(regionIndex)) return;

    // Calculate duration
    const partyAdventurers = state.adventurers.filter(a => adventurerIds.includes(a.id));
    const avgSpd = partyAdventurers.reduce((sum, a) => sum + a.stats.spd, 0) / partyAdventurers.length;
    const baseTicks = EXPEDITION_BASE_TICKS[depth] ?? 300;
    const totalTicks = calculateExpeditionTicks(baseTicks, avgSpd);

    const expedition: Expedition = {
      id: makeId(),
      slotIndex: activeCount,
      partyIds: adventurerIds,
      region: REGION_IDS[regionIndex],
      depth: depth as ExpeditionDepth,
      startTick: state.currentTick,
      estimatedEndTick: state.currentTick + totalTicks,
      consumables: {},
      encounters: [],
      currentEncounterIndex: 0,
      autoRepeat: false,
      status: 'active',
      completedRuns: 0,
    };

    // Mark adventurers as on expedition
    const updatedAdventurers = state.adventurers.map(a =>
      adventurerIds.includes(a.id) ? { ...a, state: 'expedition' as const } : a,
    );

    set({
      expeditions: [...state.expeditions, expedition],
      adventurers: updatedAdventurers,
    });
  },

  // -- Complete Expedition ----------------------------------------------------
  completeExpedition: (expeditionId: string) => {
    const state = get();
    const expedition = state.expeditions.find(e => e.id === expeditionId);
    if (!expedition || expedition.status !== 'completed') return;

    const regionIndex = REGION_IDS.indexOf(expedition.region);

    // Process expedition outcome
    const outcome = processExpedition({
      seed: state.seed ^ state.currentTick,
      regionIndex,
      depth: expedition.depth,
      expeditionCount: expedition.completedRuns,
      partyAverageSpd: 10, // simplified
      isIdle: false,
    });

    // Distribute XP and return adventurers to idle
    const xpPerAdventurer = Math.floor(outcome.totalXp / expedition.partyIds.length);
    const updatedAdventurers = state.adventurers.map(a => {
      if (!expedition.partyIds.includes(a.id)) return a;
      return {
        ...a,
        exp: a.exp + xpPerAdventurer,
        state: 'idle' as const,
      };
    });

    // Add gold
    const newGold = state.guild.gold + outcome.totalGold;

    // Add drops to inventory
    const newItems = { ...state.inventory.items };
    for (const drop of outcome.drops) {
      newItems[drop.itemId] = (newItems[drop.itemId] ?? 0) + drop.quantity;
    }

    // Remove expedition
    const remainingExpeditions = state.expeditions.filter(e => e.id !== expeditionId);

    set({
      adventurers: updatedAdventurers,
      guild: { ...state.guild, gold: newGold },
      inventory: { items: newItems },
      expeditions: remainingExpeditions,
    });
  },

  // -- Hire Adventurer --------------------------------------------------------
  hireAdventurer: (candidateIndex: number) => {
    const state = get();
    const candidate = state.recruitCandidates[candidateIndex];
    if (!candidate) return;
    if (state.guild.gold < candidate.recruitCost) return;

    const newAdventurer: Adventurer = {
      id: makeId(),
      name: {
        family: candidate.name.family,
        given: candidate.name.given,
        familyJp: candidate.name.familyJp,
        givenJp: candidate.name.givenJp,
      },
      baseClass: candidate.className,
      currentClass: candidate.className,
      classTier: 0,
      level: candidate.level,
      exp: 0,
      stats: candidate.baseStats,
      traits: candidate.traits,
      morale: 50,
      corruption: 0,
      corruptionStage: 0,
      equipment: {},
      skills: [],
      bonds: {},
      state: 'idle',
    };

    const updatedCandidates = state.recruitCandidates.filter((_, i) => i !== candidateIndex);

    set({
      adventurers: [...state.adventurers, newAdventurer],
      guild: { ...state.guild, gold: state.guild.gold - candidate.recruitCost },
      recruitCandidates: updatedCandidates,
    });
  },

  // -- Gold -------------------------------------------------------------------
  addGold: (amount: number) => {
    set((state) => ({
      guild: { ...state.guild, gold: state.guild.gold + amount },
    }));
  },

  removeGold: (amount: number) => {
    set((state) => ({
      guild: { ...state.guild, gold: Math.max(0, state.guild.gold - amount) },
    }));
  },

  // -- Inventory --------------------------------------------------------------
  addItem: (itemId: string, quantity: number) => {
    set((state) => ({
      inventory: {
        items: {
          ...state.inventory.items,
          [itemId]: (state.inventory.items[itemId] ?? 0) + quantity,
        },
      },
    }));
  },
}));
