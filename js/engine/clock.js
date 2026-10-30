// The one clock. Everything in the game happens at a timestamp (milliseconds).
//
// Game time is real time plus a debug offset, so fast-forward just moves the
// offset forward and lets catch-up replay what happened in between.
//
// advance() walks from the last time the game was seen up to now, in order:
// every scheduled timer fires at its own time, and a market tick runs on every
// 10-minute mark. A timer due at the same moment as a tick fires first.

import { tuning } from '../../data/tuning.js';

export const TICK_MS = tuning.tickMinutes * 60 * 1000;
export const MAX_CATCH_UP_MS = tuning.catchUpMaxDays * 24 * 60 * 60 * 1000;

export function createClock(now) {
  return {
    offsetMs: 0,
    lastSeenAt: now,
    lastTickAt: alignToTick(now),
    ticksRun: 0,
  };
}

export function alignToTick(time) {
  return Math.floor(time / TICK_MS) * TICK_MS;
}

export function gameNow(state, realNow) {
  return realNow + state.clock.offsetMs;
}

// Adds a timer. `type` picks the handler that runs when it is due.
export function schedule(state, type, at, data = {}) {
  const timer = { id: state.nextTimerId++, type, at, data };
  state.timers.push(timer);
  return timer;
}

export function cancelTimer(state, id) {
  state.timers = state.timers.filter((t) => t.id !== id);
}

// Earliest timer; ties go to the one scheduled first.
function nextTimer(state) {
  let best = null;
  for (const t of state.timers) {
    if (!best || t.at < best.at || (t.at === best.at && t.id < best.id)) best = t;
  }
  return best;
}

function fireTimer(state, timer, handlers, summary) {
  cancelTimer(state, timer.id);
  const handler = handlers.timers[timer.type];
  if (handler) handler(state, timer, summary);
  summary.timersFired++;
}

// Brings the game up to time `to`. Handlers:
//   tick(state, at, summary)         one market tick
//   timers[type](state, timer, summary)
//   freshMarket(state, at, summary)  after an absence longer than catch-up covers
// Returns a summary the UI turns into "While you were away".
export function advance(state, to, handlers, summary = newSummary(state, to)) {
  const clock = state.clock;
  if (to <= clock.lastSeenAt) return summary;

  if (to - clock.lastSeenAt > MAX_CATCH_UP_MS) {
    // Too long to replay: timers resolve in order, the market starts fresh.
    let timer;
    while ((timer = nextTimer(state)) && timer.at <= to) fireTimer(state, timer, handlers, summary);
    clock.lastTickAt = alignToTick(to);
    handlers.freshMarket(state, to, summary);
    summary.freshMarket = true;
  } else {
    while (true) {
      const tickAt = clock.lastTickAt + TICK_MS;
      const tickDue = tickAt <= to;
      const timer = nextTimer(state);
      if (timer && timer.at <= to && (!tickDue || timer.at <= tickAt)) {
        fireTimer(state, timer, handlers, summary);
      } else if (tickDue) {
        handlers.tick(state, tickAt, summary);
        clock.lastTickAt = tickAt;
        clock.ticksRun++;
        summary.ticks++;
      } else {
        break;
      }
    }
  }

  clock.lastSeenAt = to;
  summary.to = to;
  return summary;
}

export function newSummary(state, to) {
  return {
    from: state.clock.lastSeenAt,
    to,
    ticks: 0,
    timersFired: 0,
    freshMarket: false,
    lines: [], // plain-language lines for the "While you were away" screen
  };
}
