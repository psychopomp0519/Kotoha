/**
 * GameLoop — Tick loop controller.
 *
 * Runs the game tick at a configurable speed using setInterval.
 * The base rate is 1 tick per second (1000ms).
 */

import type { useGameStore } from '../store/gameStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameStore = typeof useGameStore;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let intervalId: ReturnType<typeof setInterval> | null = null;
let currentSpeed = 1;
let storeRef: GameStore | null = null;

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function getIntervalMs(): number {
  return Math.floor(1000 / currentSpeed);
}

function startInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    storeRef?.getState().tick();
  }, getIntervalMs());
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the game loop. Calls store.getState().tick() every interval.
 */
export function startGameLoop(store: GameStore): void {
  storeRef = store;
  currentSpeed = 1;
  startInterval();
}

/**
 * Stop the game loop.
 */
export function stopGameLoop(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  storeRef = null;
}

/**
 * Change the tick speed multiplier (1, 2, or 5).
 * Restarts the interval with the new timing.
 */
export function setSpeed(multiplier: 1 | 2 | 5): void {
  currentSpeed = multiplier;
  if (intervalId !== null) {
    startInterval();
  }
}

/**
 * Get the current speed multiplier.
 */
export function getSpeed(): number {
  return currentSpeed;
}

/**
 * Check if the game loop is currently running.
 */
export function isRunning(): boolean {
  return intervalId !== null;
}
