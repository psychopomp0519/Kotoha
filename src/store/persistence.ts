/**
 * Persistence — Save/load game state to IndexedDB and JSON export/import.
 *
 * Uses idb-keyval for simple key-value IndexedDB access.
 * Handles Set serialization (events.flags) since JSON does not support Sets.
 */

import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { GameState } from './gameStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SAVE_KEY = 'kotoha_save';

// ---------------------------------------------------------------------------
// Serialization helpers — Set<string> ↔ string[]
// ---------------------------------------------------------------------------

/** State fields that are actions (functions), not data. */
const ACTION_KEYS: Set<string> = new Set([
  'newGame', 'tick', 'startExpedition', 'completeExpedition',
  'hireAdventurer', 'addGold', 'removeGold', 'addItem',
]);

/**
 * Strip action functions and convert Sets to arrays for serialization.
 */
function serializeState(state: GameState): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(state)) {
    if (ACTION_KEYS.has(key)) continue;
    data[key] = value;
  }

  // Convert events.flags Set to array
  if (data.events && typeof data.events === 'object') {
    const events = data.events as Record<string, unknown>;
    if (events.flags instanceof Set) {
      data.events = {
        ...events,
        flags: Array.from(events.flags as Set<string>),
      };
    }
  }

  return data;
}

/**
 * Restore Sets from arrays after deserialization.
 */
function deserializeState(data: Record<string, unknown>): Record<string, unknown> {
  // Convert events.flags back to Set
  if (data.events && typeof data.events === 'object') {
    const events = data.events as Record<string, unknown>;
    if (Array.isArray(events.flags)) {
      data.events = {
        ...events,
        flags: new Set(events.flags as string[]),
      };
    }
  }

  return data;
}

// ---------------------------------------------------------------------------
// IndexedDB save/load
// ---------------------------------------------------------------------------

/**
 * Save game state to IndexedDB.
 */
export async function saveGame(state: GameState): Promise<void> {
  const data = serializeState(state);
  await idbSet(SAVE_KEY, data);
}

/**
 * Load game state from IndexedDB, falling back to localStorage backup.
 * Returns null if no save exists.
 */
export async function loadGame(): Promise<Partial<GameState> | null> {
  // Try IndexedDB first
  const raw = await idbGet<Record<string, unknown>>(SAVE_KEY);
  if (raw) return deserializeState(raw) as Partial<GameState>;

  // Fallback: localStorage backup (set during beforeunload)
  try {
    const backup = localStorage.getItem('kotoha_save_backup');
    if (backup) {
      const parsed = JSON.parse(backup) as Record<string, unknown>;
      if (parsed.seed != null) {
        return deserializeState(parsed) as Partial<GameState>;
      }
    }
  } catch { /* ignore parse errors */ }

  return null;
}

// ---------------------------------------------------------------------------
// JSON export/import
// ---------------------------------------------------------------------------

/**
 * Export game state as a JSON string (for manual backup).
 */
export function exportGameJson(state: GameState): string {
  const data = serializeState(state);
  return JSON.stringify(data, null, 2);
}

/**
 * Import game state from a JSON string.
 * Performs basic validation — throws if the data looks wrong.
 */
export function importGameJson(json: string): Partial<GameState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON format');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Save data must be a JSON object');
  }

  const data = parsed as Record<string, unknown>;

  // Basic field validation
  if (typeof data.seed !== 'number') {
    throw new Error('Missing or invalid seed field');
  }
  if (typeof data.currentTick !== 'number') {
    throw new Error('Missing or invalid currentTick field');
  }
  if (!data.guild || typeof data.guild !== 'object') {
    throw new Error('Missing or invalid guild field');
  }
  if (!Array.isArray(data.adventurers)) {
    throw new Error('Missing or invalid adventurers field');
  }

  return deserializeState(data) as Partial<GameState>;
}
