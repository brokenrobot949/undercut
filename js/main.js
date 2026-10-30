// Startup, the live clock loop, catch-up and saving.

import { tuning } from '../data/tuning.js';
import { newGame, catchUp, debugFastForward } from './engine/game.js';
import { readSave, writeSave, backupAndClear, decodeExport } from './engine/save.js';
import { mountApp } from './ui/app.js';
import { renderNewGame } from './ui/new-game.js';
import { el, toast } from './ui/components.js';

const VERSION = 'v0.0.1';
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

  // Every player action goes through here: change state, save, redraw.
  act(fn) {
    fn(ctx.state);
    save();
    app.render();
  },
  dismissAway() {
    ctx.away = null;
    app.render();
  },
  fastForward(hours) {
    showAway(debugFastForward(ctx.state, Date.now(), hours), true);
    save();
    app.render();
  },
  importCode(code) {
    const state = decodeExport(code);
    backupAndClear(storage);
    ctx.state = state;
    ctx.away = null;
    catchUpNow(true);
    save();
    app.render();
  },
  newGame() {
    if (!confirm('Start a new game? Your current shop will be replaced. (A backup copy is kept on this device.)')) return;
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
  if (!force && !long && !summary.lines.length) return;
  const prev = ctx.away;
  ctx.away = prev ? {
    ...summary,
    from: Math.min(prev.from, summary.from),
    ticks: prev.ticks + summary.ticks,
    timersFired: prev.timersFired + summary.timersFired,
    freshMarket: prev.freshMarket || summary.freshMarket,
    lines: [...prev.lines, ...summary.lines],
  } : summary;
}

function catchUpNow(asCheckIn) {
  const summary = catchUp(ctx.state, Date.now());
  if (asCheckIn) showAway(summary);
  else summary.lines.forEach((line) => toast(line));
  return summary;
}

// While the page is open, the clock advances once a second.
function startLoop() {
  stopLoop();
  loopTimer = setInterval(() => {
    const summary = catchUpNow(false);
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
    onStart({ name, factionId }) {
      const seed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0;
      startGame(newGame({ name, factionId, seed, now: Date.now() }));
    },
  });
}

function showLoadError(error) {
  root.setAttribute('data-theme', 'red');
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

let saved = null;
try {
  saved = readSave(storage);
} catch (error) {
  showLoadError(error);
}
if (saved) startGame(saved);
else if (saved === null && !root.hasChildNodes()) showNewGame();
