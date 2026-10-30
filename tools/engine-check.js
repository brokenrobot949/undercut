// Quick checks for the clock, catch-up, random generator and saves.
// Run from the repo folder:  node tools/engine-check.js
// Prints PASS or FAIL for each check. Run it after changing anything in js/engine/.

import { newGame, debugFastForward } from '../js/engine/game.js';
import { advance, schedule, TICK_MS } from '../js/engine/clock.js';
import { createRng, rngNext } from '../js/engine/rng.js';
import { encodeExport, decodeExport, migrate, writeSave, readSave } from '../js/engine/save.js';

const H = 60 * 60 * 1000;
const DAY = 24 * H;
const t0 = Date.UTC(2026, 9, 30, 12, 3); // 3 minutes past a tick mark

let failures = 0;
function check(name, ok, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const game = (seed = 1, now = t0) => newGame({ name: 'Test', factionId: 'red', seed, now });
const rollEachTick = { tick: (s) => rngNext(s.rng), freshMarket() {}, timers: {} };

// Ticks land on every 10-minute mark.
{
  const s = game();
  const sum = advance(s, t0 + 8 * H, rollEachTick);
  check('8 hours runs 48 market ticks', sum.ticks === 48, `got ${sum.ticks}`);
  check('ticks sit on 10-minute marks', s.clock.lastTickAt % TICK_MS === 0);
}

// Timers fire in time order, and before a tick at the same moment.
{
  const s = game();
  const order = [];
  const handlers = {
    tick: (st, at) => order.push(`tick@${(at - t0) / 60000}`),
    freshMarket() {},
    timers: { x: (st, timer) => order.push(`timer${timer.data.n}@${(timer.at - t0) / 60000}`) },
  };
  schedule(s, 'x', t0 + 2 * H, { n: 2 });
  schedule(s, 'x', t0 + 17 * 60000, { n: 1 }); // same moment as the 12:20 tick
  advance(s, t0 + 3 * H, handlers);
  const want = ['tick@7', 'timer1@17', 'tick@17'];
  check('timer fires before a tick at the same time', want.every((e, i) => order[i] === e), order.slice(0, 3).join(', '));
  check('later timer fires at its own time', order.includes('timer2@120'));
  check('fired timers are removed', s.timers.length === 0);
}

// Catching up in many small steps gives exactly the same result as one big step.
{
  const a = game(7);
  const b = game(7);
  advance(a, t0 + 50 * H, rollEachTick);
  for (let i = 1; i <= 50; i++) advance(b, t0 + i * H - 7777, rollEachTick);
  advance(b, t0 + 50 * H, rollEachTick);
  check('split catch-up matches one big catch-up', JSON.stringify(a) === JSON.stringify(b));
}

// The 7-day limit.
{
  const s7 = game();
  const sum7 = advance(s7, t0 + 7 * DAY, rollEachTick);
  check('7 days away replays every tick', sum7.ticks === 7 * 24 * 6 && !sum7.freshMarket, `got ${sum7.ticks}`);

  const s8 = game();
  let fresh = false;
  let fired = false;
  schedule(s8, 'x', t0 + 3 * DAY);
  const sum8 = advance(s8, t0 + 8 * DAY, {
    tick() {}, freshMarket() { fresh = true; }, timers: { x() { fired = true; } },
  });
  check('8 days away starts a fresh market', fresh && sum8.freshMarket && sum8.ticks === 0);
  check('8 days away still finishes timers', fired && s8.timers.length === 0);
}

// Clock going backwards (phone clock changed) does nothing.
{
  const s = game();
  const sum = advance(s, t0 - H, rollEachTick);
  check('clock going backwards is ignored', sum.ticks === 0 && s.clock.lastSeenAt === t0);
}

// Random generator replays exactly from its seed.
{
  const a = createRng(12345);
  const b = createRng(12345);
  const sa = Array.from({ length: 5 }, () => rngNext(a));
  const sb = Array.from({ length: 5 }, () => rngNext(b));
  check('same seed gives the same numbers', sa.join() === sb.join());
  check('numbers are between 0 and 1', sa.every((n) => n >= 0 && n < 1));
}

// Debug fast-forward.
{
  const now = Date.now();
  const s = game(1, now);
  const sum = debugFastForward(s, now, 24);
  check('fast-forward 24 h runs 144 ticks', sum.ticks === 144, `got ${sum.ticks}`);
  check('fast-forward summary covers 24 h', sum.to - sum.from === 24 * H);
}

// Saves.
{
  const s = game();
  advance(s, t0 + 5 * H, rollEachTick);
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  writeSave(storage, s);
  check('save key starts with undercut:', [...store.keys()].every((k) => k.startsWith('undercut:')));
  check('save loads back unchanged', JSON.stringify(readSave(storage)) === JSON.stringify(s));

  const code = encodeExport(s);
  check('export code loads back unchanged', JSON.stringify(decodeExport(code)) === JSON.stringify(s));
  check('export code survives spaces and line breaks', JSON.stringify(decodeExport(`  ${code.slice(0, 50)}\n${code.slice(50)} `)) === JSON.stringify(s));

  const parts = code.split('.');
  const damaged = `${parts[0]}.${parts[1].slice(0, -12)}AAAA.${parts[2]}`;
  let rejected = false;
  try { decodeExport(damaged); } catch { rejected = true; }
  check('damaged export code is rejected', rejected);

  let futureRejected = false;
  try { migrate({ ...s, version: s.version + 1 }); } catch { futureRejected = true; }
  check('save from a newer version is rejected', futureRejected);
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
