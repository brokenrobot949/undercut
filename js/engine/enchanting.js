// Disenchanting: gear from your bags breaks down into dust, sometimes an
// essence, and from blue and purple gear lucent crystals (data/enchanting.js).

import { itemById } from '../../data/items.js';
import { disenchanting as D } from '../../data/enchanting.js';
import { hasProfession } from './skills.js';
import { bagCount, takeFromBags, addOrMail } from './bags.js';
import { rngChance } from './rng.js';

export function canDisenchant(state, itemId) {
  return hasProfession(state, 'enchanting') && itemById[itemId]?.category === 'gear';
}

// What one item gives on average: [{ item, qty }] (qty can be a fraction).
export function disenchantYield(itemId) {
  const item = itemById[itemId];
  const out = [{ item: D.dustByTier[item.tier - 1], qty: D.dust[item.quality] ?? 2 },
    { item: D.essenceByTier[item.tier - 1], qty: D.essenceChance }];
  if (D.crystals[item.quality]) out.push({ item: D.crystal, qty: D.crystals[item.quality] });
  return out;
}

// Breaks `qty` of an item down. Returns what you got: { itemId: qty }.
export function disenchant(state, itemId, qty = 1) {
  const item = itemById[itemId];
  if (!hasProfession(state, 'enchanting')) throw new Error('Your shop has no Enchanting yet. It opens with a profession wing.');
  if (item?.category !== 'gear') throw new Error('Only gear can be disenchanted.');
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to disenchant.');
  if (qty > bagCount(state, itemId)) throw new Error(`You only have ${bagCount(state, itemId)}.`);
  takeFromBags(state, itemId, qty);
  const got = {};
  const add = (id, n) => { if (n > 0) got[id] = (got[id] || 0) + n; };
  for (let i = 0; i < qty; i++) {
    add(D.dustByTier[item.tier - 1], D.dust[item.quality] ?? 2);
    if (rngChance(state.rng, D.essenceChance)) add(D.essenceByTier[item.tier - 1], 1);
    const c = D.crystals[item.quality] ?? 0;
    add(D.crystal, Math.floor(c) + (rngChance(state.rng, c % 1) ? 1 : 0));
  }
  for (const [id, n] of Object.entries(got)) addOrMail(state, id, n);
  return got;
}
