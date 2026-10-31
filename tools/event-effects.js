// What each market event does to prices and sales, on a quiet market.
// Run: node tools/event-effects.js
import { newGame, debugFastForward } from '../js/engine/game.js';
import { debugForceEvent } from '../js/engine/events.js';
import { unitsSold, demandTag } from '../js/engine/market.js';
import { itemById } from '../data/items.js';

const t0 = Date.UTC(2026, 9, 30, 12, 3);
const H = 3600e3;
const watch = { 'raid-night': 'coarse-honing-stone', 'fresh-recruits': 'bronze-falchion', tournament: 'iron-flanged-mace' };
for (const [type, itemId] of Object.entries({ ...watch, 'ore-shortage': null, glut: null })) {
  const seeds = [1, 2, 3];
  const rows = [];
  for (const seed of seeds) {
    const s = newGame({ name: 'T', factionId: 'red', seed, now: t0 });
    s.events.list = []; s.timers = s.timers.filter((t) => !t.type.startsWith('event'));
    s.player.professions = ['blacksmithing', 'leatherworking', 'alchemy'];
    debugFastForward(s, t0, 48);
    const now = t0 + 48 * H;
    const e = debugForceEvent(s, type, now);
    const id = itemId ?? e.itemId;
    const item = itemById[id];
    const before = { fair: s.market.items[id].fair, sold: unitsSold(s, id, now, 24) };
    const hours = Math.min(24 * H, e.endsAt - now) / H;
    debugFastForward(s, t0, hours);
    const after = { fair: s.market.items[id].fair, sold: unitsSold(s, id, now + hours * H, hours) };
    rows.push({ id: item.name, priceChange: after.fair / before.fair - 1, salesPerDayBefore: before.sold, salesPerDayDuring: after.sold * 24 / hours, tag: demandTag(s, item) });
  }
  const avg = (f) => rows.reduce((n, r) => n + f(r), 0) / rows.length;
  console.log(`${type.padEnd(15)} ${rows.map((r) => r.id).join(', ')}`);
  console.log(`  price ${(avg((r) => r.priceChange) * 100).toFixed(0)}%   sales/day ${avg((r) => r.salesPerDayBefore).toFixed(1)} -> ${avg((r) => r.salesPerDayDuring).toFixed(1)}   tags ${rows.map((r) => r.tag).join(', ')}`);
}
