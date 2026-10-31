// Shop upgrades: levels bought with gold (some need guild standing), and the
// numbers they change. Everything that an upgrade affects reads it from here.

import { tuning } from '../../data/tuning.js';
import { upgrades, upgradeById } from '../../data/upgrades.js';
import { hasStanding } from './guild.js';

export function createUpgrades() {
  return Object.fromEntries(upgrades.map((u) => [u.id, 0]));
}

// Adds upgrades that are new since the save was made, at level 0.
export function syncUpgrades(state) {
  state.upgrades ||= {};
  for (const u of upgrades) state.upgrades[u.id] ??= 0;
}

export function upgradeLevel(state, id) {
  return state.upgrades?.[id] ?? 0;
}

// Price of the next level, or null at the top.
export function upgradeCost(state, id) {
  const u = upgradeById[id];
  const level = upgradeLevel(state, id);
  if (level >= u.levels) return null;
  return Math.round(u.cost * u.growth ** level);
}

// What buying the next level needs: { level, cost, standing, ready, reason },
// or null when the upgrade is maxed.
export function nextUpgrade(state, id) {
  const u = upgradeById[id];
  const level = upgradeLevel(state, id);
  if (level >= u.levels) return null;
  const cost = upgradeCost(state, id);
  const standing = u.standing[level] ?? null;
  let reason = null;
  if (standing && !hasStanding(state, standing)) {
    reason = `Needs ${tuning.standings.find((s) => s.id === standing).name} standing with the guild.`;
  } else if (state.copper < cost) reason = 'Not enough gold.';
  return { level: level + 1, cost, standing, ready: !reason, reason };
}

export function buyUpgrade(state, id) {
  if (!upgradeById[id]) throw new Error('Unknown upgrade.');
  const n = nextUpgrade(state, id);
  if (!n) throw new Error(`${upgradeById[id].name} is already at its top level.`);
  if (!n.ready) throw new Error(n.reason);
  state.copper -= n.cost;
  state.upgrades[id] = n.level;
  return n;
}

// ---- Effects ---------------------------------------------------------------

const per = (state, id) => upgradeLevel(state, id) * upgradeById[id].per;
const maxed = (state, id) => upgradeLevel(state, id) >= upgradeById[id].levels;

export const queueSlotsFor = (state) => tuning.queueSlots + per(state, 'queue');
export const bagSlotsFor = (state) => tuning.bagSlots + per(state, 'bags');
export const listingSlotsFor = (state) => tuning.listingSlots + per(state, 'listings');
export const boardSizeFor = (state) => tuning.tavern.boardSize + per(state, 'table');
export const expeditionSlotsFor = (state) => tuning.tavern.expeditionSlots + per(state, 'charter');
export const commissionSlotsFor = (state, baseSlots) => baseSlots + per(state, 'counter');

// Commission pay multiplier from the counter (1.05 = +5%).
export function commissionPayMult(state) {
  return 1 + upgradeLevel(state, 'counter') * upgradeById.counter.payPer;
}

// Share of a sale the auction house keeps.
export function cutRate(state) {
  return Math.max(0, tuning.market.cut - per(state, 'seal'));
}

// Multiplier on listing deposits.
export function depositMult(state) {
  return Math.max(0, 1 - upgradeLevel(state, 'seal') * upgradeById.seal.depositPer);
}

// Multiplier on craft time at a workstation: bellows at the forge, tools elsewhere.
export function craftTimeMult(state, stationId) {
  return Math.max(0.1, 1 - per(state, stationId === 'forge' ? 'bellows' : 'tools'));
}

// Chance of an extra bar per bar smelted at your forge (top-level bellows only).
export function bonusBarChance(state) {
  return maxed(state, 'bellows') ? upgradeById.bellows.max.bonusBarChance : 0;
}
