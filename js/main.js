// Startup, the live clock loop, catch-up and saving.

import { tuning } from '../data/tuning.js';
import { newGame, catchUp, collectMailbox, debugFastForward } from './engine/game.js';
import { itemById } from '../data/items.js';
import { gameNow } from './engine/clock.js';
import { readSave, writeSave, backupAndClear, decodeExport, listBackups, readBackup } from './engine/save.js';
import { mountApp } from './ui/app.js';
import { renderNewGame } from './ui/new-game.js';
import { el, toast, soldToast, setTheme } from './ui/components.js';

const VERSION = 'v0.1.0';
// Absences shorter than this don't open the "While you were away" summary.
const AWAY_MIN_MS = 60 * 1000;

const root = document.getElementById('root');
const storage = window.localStorage;

let app = null;
let loopTimer = null;
let saveWarned = false;

// Shared with every UI module. `state` is replaced on import or new game.
const ctx = {
  version: VERSION,
  state: null,
  away: null,

  // Current game time (real time plus any debug fast-forward).
  now() {
    return gameNow(ctx.state, Date.now());
  },

  // Every player action goes through here: catch up, change state, save,
  // redraw. Engine actions throw a plain-language Error when they can't be
  // done; that becomes a toast. Returns the action's result, or undefined.
  act(fn) {
    catchUpNow(false);
    try {
      const result = fn(ctx.state, ctx.now());
      save();
      app.render();
      return result ?? true;
    } catch (error) {
      if (!(error instanceof Error) || error instanceof TypeError || error instanceof ReferenceError) throw error;
      toast(error.message);
      return undefined;
    }
  },
  // "Collect all": gold and returned items go to your purse and bags.
  collectAll() {
    const allFit = collectMailbox(ctx.state);
    ctx.away = null;
    save();
    app.render();
    if (!allFit) toast('Your bags are full. The rest is waiting on the Shop tab.');
  },
  fastForward(hours) {
    showAway(debugFastForward(ctx.state, Date.now(), hours), true);
    save();
    app.render();
  },
  importCode(code) {
    // Decode and catch up on the side, so a bad code never replaces the live game.
    const state = decodeExport(code);
    const summary = catchUp(state, Date.now());
    backupAndClear(storage);
    ctx.state = state;
    ctx.away = null;
    showAway(summary);
    save();
    app.render();
  },
  restoreBackup(key) {
    const state = readBackup(storage, key);
    const summary = catchUp(state, Date.now());
    backupAndClear(storage);
    ctx.state = state;
    ctx.away = null;
    showAway(summary);
    save();
    app.render();
  },
  listBackups() {
    return listBackups(storage);
  },
  newGame() {
    if (!confirm('Start a new game? Your current shop will be replaced. (The last 3 games are kept as backups on this device.)')) return;
    stopLoop();
    backupAndClear(storage);
    ctx.state = null;
    ctx.away = null;
    app = null;
    showNewGame();
  },
};

function save() {
  if (!ctx.state) return;
  try {
    writeSave(storage, ctx.state);
  } catch (e) {
    if (!saveWarned) toast("Couldn't save. Is private browsing on?");
    saveWarned = true;
  }
}

// Adds a catch-up summary to the "While you were away" panel.
function showAway(summary, force = false) {
  const long = summary.to - summary.from >= AWAY_MIN_MS;
  if (!force && !long && !summary.lines.length && !summary.returns.length) return;
  const prev = ctx.away;
  ctx.away = prev ? {
    ...summary,
    from: Math.min(prev.from, summary.from),
    ticks: prev.ticks + summary.ticks,
    timersFired: prev.timersFired + summary.timersFired,
    freshMarket: prev.freshMarket || summary.freshMarket,
    lines: [...prev.lines, ...summary.lines],
    sold: mergeCounts(prev.sold, summary.sold),
    expired: mergeCounts(prev.expired, summary.expired),
    crafted: mergeCounts(prev.crafted, summary.crafted),
    returns: [...prev.returns, ...summary.returns],
  } : summary;
}

// Adds up per-item counts: plain numbers, or { qty, copper } records.
function mergeCounts(a, b) {
  const out = structuredClone(a);
  for (const [id, v] of Object.entries(b)) {
    if (typeof v === 'number') out[id] = (out[id] || 0) + v;
    else out[id] = { qty: (out[id]?.qty || 0) + v.qty, copper: (out[id]?.copper || 0) + v.copper };
  }
  return out;
}

function catchUpNow(asCheckIn) {
  const summary = catchUp(ctx.state, Date.now());
  if (asCheckIn) {
    showAway(summary);
  } else {
    summary.lines.forEach((line) => toast(line));
    for (const [id, s] of Object.entries(summary.sold)) soldToast(id, s.qty, s.copper);
    for (const o of summary.ordersDone) toast(`Made ${o.qty} × ${itemById[o.item].name}.`);
    for (const r of summary.returns) toast(`${r.name} is back from ${r.zone}. Collect on the Shop tab.`);
  }
  return summary;
}

// While the page is open, the clock advances once a second.
function startLoop() {
  stopLoop();
  loopTimer = setInterval(() => {
    // A long gap with the page still visible (laptop lid shut, phone locked
    // without a visibility event) counts as a check-in too.
    const gap = gameNow(ctx.state, Date.now()) - ctx.state.clock.lastSeenAt;
    const summary = catchUpNow(gap >= AWAY_MIN_MS);
    if (summary.ticks || summary.timersFired) {
      save();
      app.render();
    } else {
      app.renderHeader();
    }
  }, 1000);
}
function stopLoop() {
  clearInterval(loopTimer);
  loopTimer = null;
}

function startGame(state) {
  ctx.state = state;
  catchUpNow(true);
  save();
  app = mountApp(root, ctx);
  startLoop();
}

function showNewGame() {
  renderNewGame(root, {
    onStart({ name, factionId, professionId }) {
      const seed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0;
      startGame(newGame({ name, factionId, professionId, seed, now: Date.now() }));
    },
  });
}

function showLoadError(error) {
  setTheme('red');
  root.replaceChildren(el('div', { class: 'new-game' },
    el('h1', { class: 'title-mark' }, 'Undercut'),
    el('section', { class: 'panel' },
      el('h2', {}, "Your save couldn't be loaded"),
      el('p', {}, error.message),
      el('p', { class: 'small dim' }, 'Try a hard refresh first. Starting over keeps a backup copy of the old save on this device.'),
      el('button', { class: 'btn btn-danger', type: 'button', onclick: () => { backupAndClear(storage); showNewGame(); } }, 'Start over'))));
}

// ---- Saving on the way out -------------------------------------------

setInterval(save, tuning.autosaveSeconds * 1000);

document.addEventListener('visibilitychange', () => {
  if (!ctx.state || !app) return;
  if (document.visibilityState === 'hidden') {
    stopLoop();
    save();
  } else {
    // Coming back to the tab counts as a check-in.
    catchUpNow(true);
    save();
    app.render();
    startLoop();
  }
});
window.addEventListener('pagehide', save);

// ---- Start -----------------------------------------------------------

try {
  const saved = readSave(storage);
  if (saved) startGame(saved);
  else showNewGame();
} catch (error) {
  stopLoop();
  ctx.state = null; // stops autosave from writing a broken game over the save
  app = null;
  showLoadError(error);
}
