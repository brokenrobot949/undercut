// How often each kind of item shows each demand tag over 4 quiet days.
// Target: Hot about 1 check in 8 or less. Run: node tools/demand-tags.js
import { items, itemById } from '../data/items.js';
import { newGame, debugFastForward } from '../js/engine/game.js';
import { demandTag, scarcity, supplyDays } from '../js/engine/market.js';
const t0 = Date.UTC(2026, 9, 30, 12, 3);
const s = newGame({ name: 'T', factionId: 'red', seed: 5, now: t0 });
debugFastForward(s, t0, 24);
const counts = {}; const why = {};
let now = t0 + 24 * 3600e3;
for (let i = 0; i < 6 * 24 * 4; i++) {
  debugFastForward(s, now, 1 / 6); now += 600e3;
  if (i % 3) continue;
  for (const it of items) {
    if (!s.market.items[it.id]) continue;
    const k = it.loot === 'gem' ? 'gem' : it.category;
    const tag = demandTag(s, it);
    counts[k] ??= {}; counts[k][tag] = (counts[k][tag] ?? 0) + 1;
    if (tag === 'hot') { why[k] ??= { price: 0, scarce: 0 }; const m = s.market.items[it.id]; if (m.fair > it.base * 1.12) why[k].price++; else why[k].scarce++; }
  }
}
for (const [k, c] of Object.entries(counts)) {
  const tot = Object.values(c).reduce((a, b) => a + b, 0);
  console.log(k.padEnd(12), Object.entries(c).map(([t, n]) => `${t} ${(n / tot * 100).toFixed(0)}%`).join('  '), JSON.stringify(why[k] ?? {}));
}
