// Commissions: named heroes post requests at the shop counter. Each asks for
// an item you can make (or will soon), a quantity and a deadline, and pays a
// premium over market value plus Trade Guild reputation. Only items you made
// count (the maker's mark). Declining is free; unclaimed requests expire.

import { commissionTuning as CT, commissionTypes, contractRequesters } from '../../data/commissions.js';
import { recipes, recipeById } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';
import { zones } from '../../data/zones.js';
import { races, classById } from '../../data/races.js';
import { heroNames } from '../../data/names.js';
import { tuning } from '../../data/tuning.js';
import { schedule, cancelTimer } from './clock.js';
import { rngInt, rngPick, rngNext } from './rng.js';
import { madeCount, takeFromBags } from './bags.js';
import { marketValue } from './market.js';
import { hasProfession, knowsRecipe, recipeProfession, skillOf } from './skills.js';
import { tutorialDone, claimTutorial } from './tutorial.js';
import { commissionSlotsFor, commissionPayMult } from './upgrades.js';

const HOUR = 60 * 60 * 1000;

// Commission slots at the counter, after upgrades.
export function commissionSlots(state) {
  return commissionSlotsFor(state, CT.slots);
}

export function createCommissions(state, now) {
  state.commissions = { list: [], nextId: 1 };
  if (tutorialDone(state)) postCommission(state, now);
  schedule(state, 'commission-post', now + CT.postEveryHours * HOUR);
}

// Clock timer: a new request every couple of hours, if the counter has room.
export function commissionPostTimer(state, timer, summary) {
  // While the tutorial runs, its steps are the only requests.
  const c = tutorialDone(state) && state.commissions.list.length < commissionSlots(state) ? postCommission(state, timer.at) : null;
  if (c) summary.lines.push(`New commission: ${requestText(c)}.`);
  schedule(state, 'commission-post', timer.at + CT.postEveryHours * HOUR);
}

// Clock timer: a request runs out.
export function commissionExpireTimer(state, timer, summary) {
  const c = state.commissions.list.find((x) => x.id === timer.data.id);
  if (!c) return;
  state.commissions.list = state.commissions.list.filter((x) => x !== c);
  summary.lines.push(`Commission expired: ${requestText(c)}.`);
}

export function requestText(c) {
  const item = itemById[c.itemId];
  return `${c.requester.name} wanted ${c.qty} × ${item.name}`;
}

// ---- Posting -----------------------------------------------------------------

// Recipes a request may ask for: your professions, a sellable result, and a
// skill level near yours. Scroll-only recipes only once you know them.
function candidates(state, category = null) {
  return recipes.filter((r) => {
    const prof = recipeProfession(r);
    if (!prof || !hasProfession(state, prof)) return false;
    const item = itemById[r.makes.item];
    if (!['consumable', 'gear'].includes(item.category) || (category && item.category !== category)) return false;
    if (r.learn === 'scroll' && !knowsRecipe(state, r)) return false;
    const skill = skillOf(state, prof);
    return r.skill[0] <= skill + CT.reachAbove && r.skill[0] >= skill - CT.reachBelow;
  });
}

function pickType(state) {
  const types = commissionTypes.filter((t) => t.id !== 'regular' || state.tavern?.regulars?.length);
  let r = rngNext(state.rng) * types.reduce((n, t) => n + t.weight, 0);
  return types.find((t) => (r -= t.weight) < 0) ?? types[0];
}

export function postCommission(state, now, forced = null) {
  const type = forced ? commissionTypes.find((t) => t.id === forced) : pickType(state);
  const category = type.id === 'contract' ? 'consumable' : type.id === 'regular' ? 'gear' : null;
  let pool = candidates(state, category);
  let regular = null;
  if (type.id === 'regular') {
    regular = rngPick(state.rng, state.tavern.regulars);
    const armor = classById[regular.classId].armor;
    const fits = pool.filter((r) => [armor, 'weapon', 'cloak'].includes(itemById[r.makes.item].armor));
    if (fits.length) pool = fits;
  }
  if (!pool.length) return null;
  const recipe = rngPick(state.rng, pool);
  const item = itemById[recipe.makes.item];
  const [lo, hi] = type.qty[item.category];
  const qty = rngInt(state.rng, lo, hi);
  const value = marketValue(state, item.id, now) ?? state.market.items[item.id]?.fair ?? item.base;
  const expiresAt = now + rngInt(state.rng, type.hours[0], type.hours[1]) * HOUR;
  const c = {
    id: state.commissions.nextId++,
    type: type.id,
    requester: regular ? { name: regular.name, race: regular.race, classId: regular.classId, level: regular.level, regularId: regular.id }
      : type.id === 'contract' ? { name: rngPick(state.rng, contractRequesters) } : randomRequester(state, item.tier),
    itemId: item.id,
    recipeId: recipe.id,
    qty,
    delivered: 0,
    pay: Math.round(type.payMult * commissionPayMult(state) * value * qty),
    rep: commissionRep(type, item, value * qty),
    postedAt: now,
    expiresAt,
  };
  c.timerId = schedule(state, 'commission-expire', expiresAt, { id: c.id }).id;
  state.commissions.list.push(c);
  return c;
}

// Reputation for an order: the table value for its kind and tier, scaled by
// what the order is worth (see repValueRef in data/commissions.js).
function commissionRep(type, item, orderValue) {
  const size = Math.min(1, Math.max(CT.repFloor, orderValue / (CT.repValueRef[item.tier - 1] * (type.repRefMult ?? 1))));
  return Math.max(1, Math.round(type.rep[item.tier - 1] * size * CT.repScale));
}

// A hero from your faction, at a level that wears this tier.
function randomRequester(state, tier) {
  const race = rngPick(state.rng, races.filter((r) => r.faction === state.player.factionId));
  const [lo, hi] = zones.find((z) => z.tier === tier).levels;
  return { name: rngPick(state.rng, heroNames[race.id]), race: race.id, classId: rngPick(state.rng, race.classes), level: rngInt(state.rng, Math.max(lo, 5), hi) };
}

// ---- Handing in -----------------------------------------------------------------

// How many you can hand in now: items you made, up to what's still wanted.
export function canDeliver(state, c) {
  return Math.min(madeCount(state, c.itemId), c.qty - c.delivered);
}

// Hands in what you have. Guild contracts take parts; the rest need the full amount.
// Pays gold and reputation for what was handed in. Returns { copper, rep, done }.
export function deliverCommission(state, id, now) {
  const c = state.commissions.list.find((x) => x.id === id);
  if (!c) throw new Error('That commission is gone.');
  const n = canDeliver(state, c);
  const partial = c.type === 'contract';
  if (n <= 0 || (!partial && n < c.qty)) {
    throw new Error(`You need ${c.qty - c.delivered} ${itemById[c.itemId].name.toLowerCase()} you made yourself.`);
  }
  const before = c.delivered;
  takeFromBags(state, c.itemId, n);
  c.delivered += n;
  // Pay out the share for this part, so the parts always add up to the whole.
  const share = (d) => ({ copper: Math.round((c.pay * d) / c.qty), rep: Math.round((c.rep * d) / c.qty) });
  const copper = share(c.delivered).copper - share(before).copper;
  const rep = share(c.delivered).rep - share(before).rep;
  state.copper += copper;
  state.reputation += rep;
  const done = c.delivered >= c.qty;
  if (done) {
    state.commissions.list = state.commissions.list.filter((x) => x !== c);
    cancelTimer(state, c.timerId);
    if (c.type === 'regular') rewardRegular(state, c.requester.regularId);
  }
  return { copper, rep, done };
}

// Claims a finished tutorial step. After the last one, the first real request posts.
export function claimTutorialStep(state, now) {
  const step = claimTutorial(state);
  if (tutorialDone(state) && !state.commissions.list.length) postCommission(state, now);
  return step;
}

export function declineCommission(state, id) {
  const c = state.commissions.list.find((x) => x.id === id);
  if (!c) return;
  state.commissions.list = state.commissions.list.filter((x) => x !== c);
  cancelTimer(state, c.timerId);
}

// A filled regular's request: a loyalty level and a big level boost.
function rewardRegular(state, regularId) {
  const r = state.tavern.regulars.find((x) => x.id === regularId);
  if (!r) return;
  const type = commissionTypes.find((t) => t.id === 'regular');
  const [, maxLevel] = tuning.tavern.heroLevels;
  r.loyalty = Math.min(tuning.tavern.regulars.maxLoyalty, r.loyalty + 1);
  const gain = Math.min(type.levelBoost, maxLevel - r.level);
  r.level += gain;
  for (const p of Object.keys(r.skills)) r.skills[p] = Math.min(300, r.skills[p] + gain * 5);
}

// Where to get a recipe you don't know yet, for the counter.
export function recipeHint(state, c) {
  const r = recipeById[c.recipeId];
  if (knowsRecipe(state, r)) return null;
  return `Learn the recipe at the Trade Guild trainer (skill ${r.skill[0]}).`;
}
