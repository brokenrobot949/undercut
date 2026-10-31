// Late-game gold sinks: decor, sign styles, guild donations and trophies
// (data/shop-extras.js). Donations give timed bonuses that other engine
// modules read through donationMult().

import { tuning } from '../../data/tuning.js';
import { decor, signStyles, donations, trophies } from '../../data/shop-extras.js';
import { hasStanding } from './guild.js';

const HOUR = 60 * 60 * 1000;
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const decorById = byId(decor);
const signById = byId(signStyles);
const donationById = byId(donations);
const trophyById = byId(trophies);

// decor, signs, trophies: { id: true } once bought. sign: the style shown (null = plain).
// donations: { id: time the bonus ends }.
export function createExtras() {
  return { decor: {}, signs: {}, sign: null, trophies: {}, donations: {} };
}

function pay(state, cost) {
  if (state.copper < cost) throw new Error('Not enough gold.');
  state.copper -= cost;
}

function buyOnce(state, list, key, id, what) {
  const thing = list[id];
  if (!thing) throw new Error(`Unknown ${what}.`);
  if (state.extras[key][id]) throw new Error(`You already have the ${thing.name.toLowerCase()}.`);
  pay(state, thing.cost);
  state.extras[key][id] = true;
  return thing;
}

export const buyDecor = (state, id) => buyOnce(state, decorById, 'decor', id, 'decor');
export const buyTrophy = (state, id) => buyOnce(state, trophyById, 'trophies', id, 'trophy');

// Buys a sign style and puts it up.
export function buySignStyle(state, id) {
  const sign = buyOnce(state, signById, 'signs', id, 'sign style');
  state.extras.sign = id;
  return sign;
}

// Switches to a sign style you own, or back to the plain sign (null).
export function setSignStyle(state, id) {
  if (id !== null && !state.extras.signs[id]) throw new Error("You don't own that sign yet.");
  state.extras.sign = id;
}

// The CSS style of the sign in use, or null for the plain one.
export function signStyleOf(state) {
  return signById[state.extras?.sign]?.style ?? null;
}

// What donating now needs: { ready, reason, endsAt } (endsAt: when the bonus would end).
export function donationOffer(state, id, now) {
  const d = donationById[id];
  const running = Math.max(now, state.extras.donations[id] ?? 0);
  const endsAt = running + d.hours * HOUR;
  let reason = null;
  if (!hasStanding(state, d.standing)) reason = `Needs ${tuning.standings.find((s) => s.id === d.standing).name} standing with the guild.`;
  else if (endsAt - now > d.maxHours * HOUR) reason = `Already paid up for the next ${d.maxHours - d.hours} hours.`;
  else if (state.copper < d.cost) reason = 'Not enough gold.';
  return { ready: !reason, reason, endsAt };
}

export function donate(state, id, now) {
  const d = donationById[id];
  if (!d) throw new Error('Unknown donation.');
  const offer = donationOffer(state, id, now);
  if (!offer.ready) throw new Error(offer.reason);
  pay(state, d.cost);
  state.extras.donations[id] = offer.endsAt;
  return d;
}

// When a donation's bonus ends, or null if it isn't running.
export function donationEndsAt(state, id, now) {
  const end = state.extras?.donations?.[id] ?? 0;
  return end > now ? end : null;
}

// The multiplier for an effect ('haul', 'deposit' or 'commission') right now: 1 when none runs.
export function donationMult(state, effect, now) {
  let mult = 1;
  for (const d of donations) if (d.effect === effect && donationEndsAt(state, d.id, now)) mult *= d.value;
  return mult;
}
