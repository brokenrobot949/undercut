// Hero trip fee as a share of the haul's market value, per zone and trip length.
// Target: 40-60% on 1-8 h trips. Run: node tools/trip-cost.js [skill above zone minimum, default 20]
import { zones } from '../data/zones.js';
import { itemById } from '../data/items.js';
import { hireFee, expectedHaul } from '../js/engine/heroes.js';
import { newGame, debugFastForward } from '../js/engine/game.js';
import { tuning } from '../data/tuning.js';
const t0 = Date.UTC(2026, 9, 30, 12, 3);
const s = newGame({ name: 'T', factionId: 'red', seed: 3, now: t0 });
debugFastForward(s, t0, 72);
const extra = Number(process.argv[2] ?? 20);
let sum = {};
for (const z of zones) {
  const profs = Object.keys(z.loot);
  const row = [];
  for (const h of tuning.tavern.tripHours) {
    let fee = 0, val = 0;
    for (const p of profs) {
      const hero = { level: z.levels[1], skills: { [p]: z.minSkill + extra }, race: 'orc', loyalty: 0 };
      fee += hireFee(hero, z, h);
      val += expectedHaul(hero, z, h).reduce((n, x) => n + x.qty * s.market.items[x.item].fair, 0);
    }
    const r = fee / val; sum[h] = (sum[h] ?? 0) + r / zones.length;
    row.push(`${h}h ${(r * 100).toFixed(0)}%`);
  }
  console.log(z.id.padEnd(20), row.join('  '));
}
console.log('average', Object.entries(sum).map(([h, r]) => `${h}h ${(r * 100).toFixed(0)}%`).join('  '));
