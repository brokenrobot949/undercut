// Profit margin of every recipe at base prices, by profession and tier:
// (sale after the 5% cut - material cost) / material cost.
// Run: node tools/recipe-margins.js
import { recipes } from '../data/recipes.js';
import { itemById } from '../data/items.js';
import { recipeProfession } from '../js/engine/skills.js';

const price = (id) => itemById[id].base ?? itemById[id].vendorBuy;
const rows = {};
for (const r of recipes) {
  const prof = recipeProfession(r);
  if (!prof || r.masterwork) continue;
  const out = itemById[r.makes.item];
  if (out.category === 'material') continue;
  const cost = r.mats.reduce((n, m) => n + price(m.item) * m.qty, 0);
  const margin = (price(out.id) * r.makes.qty * 0.95 - cost) / cost;
  (rows[`${prof} t${r.tier} ${out.category}`] ||= []).push(margin);
}
for (const [k, ms] of Object.entries(rows).sort()) {
  const avg = ms.reduce((a, b) => a + b, 0) / ms.length;
  console.log(`${k.padEnd(32)} avg ${(avg * 100).toFixed(0)}%  (${ms.map((m) => Math.round(m * 100)).join(', ')})`);
}
