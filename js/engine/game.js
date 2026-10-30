// Game state and the actions that change it. No DOM here: the balance
// simulator runs this same code in Node.

import { tuning } from '../../data/tuning.js';
import { factions } from '../../data/factions.js';
import { createRng } from './rng.js';
import { createClock, advance, gameNow, schedule, newSummary } from './clock.js';

export const SAVE_VERSION = 1;

export function newGame({ name, factionId, seed, now }) {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    player: { name, factionId },
    copper: tuning.startingCopper,
    reputation: 0,
    rng: createRng(seed),
    clock: createClock(now),
    timers: [],
    nextTimerId: 1,
    settings: { debug: false, mute: false },
  };
}

export function getFaction(state) {
  return factions.find((f) => f.id === state.player.factionId);
}

export function getStanding(state) {
  const list = tuning.standings;
  let i = 0;
  while (i + 1 < list.length && state.reputation >= list[i + 1].rep) i++;
  return { current: list[i], next: list[i + 1] || null };
}

// ---- Clock handlers ----------------------------------------------------

const handlers = {
  tick(state, at, summary) {
    // The market simulation plugs in here in Phase 1.
  },
  freshMarket(state, at, summary) {
    // Phase 1 resets the market to a fresh state here.
  },
  timers: {
    'debug-test'(state, timer, summary) {
      summary.lines.push(`Debug test timer (${timer.data.label}) finished.`);
    },
  },
};

// Runs everything that happened up to real time `realNow`.
export function catchUp(state, realNow, summary) {
  return advance(state, gameNow(state, realNow), handlers, summary);
}

// ---- Debug actions -----------------------------------------------------

export function debugFastForward(state, realNow, hours) {
  // Start the summary from the current moment so it covers only the skip.
  catchUp(state, realNow);
  const summary = newSummary(state, null);
  state.clock.offsetMs += hours * 60 * 60 * 1000;
  return catchUp(state, realNow, summary);
}

export function debugAddCopper(state, amount) {
  state.copper += amount;
}

export function debugStartTestTimer(state, realNow, minutes) {
  const label = `${minutes} min`;
  schedule(state, 'debug-test', gameNow(state, realNow) + minutes * 60 * 1000, { label });
}
