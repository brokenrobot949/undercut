// Bags: the player's storage. state.bags maps itemId -> quantity.
// Materials and consumables stack (tuning.stackSize per slot); gear takes a slot each.
// Anything that doesn't fit waits in the mailbox until there's room.

import { tuning } from '../../data/tuning.js';
import { itemById } from '../../data/items.js';
import { bagSlotsFor } from './upgrades.js';

export function bagCount(state, itemId) {
  return state.bags[itemId] || 0;
}

export function bagSlots(state) {
  return bagSlotsFor(state);
}

function stacks(itemId) {
  return itemById[itemId].category !== 'gear';
}

export function slotsFor(itemId, qty) {
  if (qty <= 0) return 0;
  return stacks(itemId) ? Math.ceil(qty / tuning.stackSize) : qty;
}

// How a pile of an item sits in your bags: the quantity in each slot it takes.
export function slotStacks(itemId, qty) {
  if (!stacks(itemId)) return Array(qty).fill(1);
  const full = Array(Math.floor(qty / tuning.stackSize)).fill(tuning.stackSize);
  return qty % tuning.stackSize ? [...full, qty % tuning.stackSize] : full;
}

export function slotsUsed(state) {
  let used = 0;
  for (const [id, qty] of Object.entries(state.bags)) used += slotsFor(id, qty);
  return used;
}

// How many more units of an item fit.
export function roomFor(state, itemId) {
  const free = bagSlots(state) - slotsUsed(state);
  if (!stacks(itemId)) return Math.max(0, free);
  const have = bagCount(state, itemId);
  const topUp = have % tuning.stackSize === 0 ? 0 : tuning.stackSize - (have % tuning.stackSize);
  return topUp + Math.max(0, free) * tuning.stackSize;
}

// Adds what fits; the rest goes to the mailbox. Returns units that went to bags.
export function addOrMail(state, itemId, qty) {
  const fit = Math.min(qty, roomFor(state, itemId));
  if (fit > 0) state.bags[itemId] = bagCount(state, itemId) + fit;
  if (qty > fit) state.mailbox.items[itemId] = (state.mailbox.items[itemId] || 0) + (qty - fit);
  return fit;
}

// Puts units in the mailbox; `made` of them carry your maker's mark.
export function addToMailbox(state, itemId, qty, made = 0) {
  state.mailbox.items[itemId] = (state.mailbox.items[itemId] || 0) + qty;
  if (made > 0) state.mailbox.made[itemId] = (state.mailbox.made[itemId] || 0) + made;
}

// addOrMail for units where `made` of them carry your maker's mark. The marked
// units fill the bags first.
export function addOrMailMade(state, itemId, qty, made) {
  const fit = Math.min(qty, roomFor(state, itemId));
  if (fit > 0) state.bags[itemId] = bagCount(state, itemId) + fit;
  const markedInBags = Math.min(made, fit);
  if (markedInBags > 0) markMade(state, itemId, markedInBags);
  if (qty > fit) addToMailbox(state, itemId, qty - fit, made - markedInBags);
}

// Adds to bags only; throws if there's no room.
export function addToBags(state, itemId, qty) {
  if (qty > roomFor(state, itemId)) throw new Error('Your bags are full.');
  state.bags[itemId] = bagCount(state, itemId) + qty;
}

export function takeFromBags(state, itemId, qty) {
  const have = bagCount(state, itemId);
  if (qty > have) throw new Error(`You only have ${have} ${itemById[itemId].name.toLowerCase()}.`);
  if (have === qty) delete state.bags[itemId];
  else state.bags[itemId] = have - qty;
  // Bought units leave first, so what's left keeps your maker's mark.
  if (state.made?.[itemId] > bagCount(state, itemId)) {
    if (bagCount(state, itemId)) state.made[itemId] = bagCount(state, itemId);
    else delete state.made[itemId];
  }
}

// ---- Maker's mark ----------------------------------------------------------
// state.made counts the units in your bags that you crafted yourself.
// Commissions only accept these. The mark stays with units away from your
// bags too: a listing's `made` and state.mailbox.made count them.

export function markMade(state, itemId, qty) {
  state.made[itemId] = (state.made[itemId] || 0) + qty;
}

export function madeCount(state, itemId) {
  return Math.min(state.made?.[itemId] || 0, bagCount(state, itemId));
}

// Throws unless every material is in the bags, `times` over.
export function checkMats(state, mats, times = 1) {
  for (const m of mats) {
    if (bagCount(state, m.item) < m.qty * times) {
      throw new Error(`Not enough ${itemById[m.item].name.toLowerCase()}: need ${m.qty * times}, have ${bagCount(state, m.item)}.`);
    }
  }
}

// Collect all: gold, then as many waiting items as fit.
export function collectMailbox(state) {
  state.copper += state.mailbox.copper;
  state.mailbox.copper = 0;
  const left = {};
  const leftMade = {};
  for (const [itemId, qty] of Object.entries(state.mailbox.items)) {
    const fit = Math.min(qty, roomFor(state, itemId));
    if (fit > 0) state.bags[itemId] = bagCount(state, itemId) + fit;
    // Marked units come out first, like everywhere else.
    const made = state.mailbox.made[itemId] || 0;
    const markedOut = Math.min(made, fit);
    if (markedOut > 0) markMade(state, itemId, markedOut);
    if (qty > fit) left[itemId] = qty - fit;
    if (made > markedOut) leftMade[itemId] = made - markedOut;
  }
  state.mailbox.items = left;
  state.mailbox.made = leftMade;
  return Object.keys(left).length === 0;
}
