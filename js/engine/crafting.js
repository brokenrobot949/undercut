// Crafting queues (anvil, forge) and the City Smelter.
//
// Each workstation has a queue of orders: one recipe times a quantity.
// Materials are taken when the order is queued. The order at the front works
// one unit at a time; each unit finishes on a clock timer, so crafting carries
// on exactly while the game is closed. Finished items go to bags (or the
// mailbox when bags are full).

import { tuning } from '../../data/tuning.js';
import { recipeById } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';
import { schedule, cancelTimer } from './clock.js';
import { checkMats, takeFromBags, addOrMail } from './bags.js';

export const STATIONS = ['anvil', 'forge'];

export function createStations() {
  return { anvil: { queue: [] }, forge: { queue: [] }, nextOrderId: 1 };
}

export function queueSlots(state, station) {
  return tuning.queueSlots;
}

export function queueCraft(state, recipeId, qty, now) {
  const recipe = recipeById[recipeId];
  if (!recipe) throw new Error('Unknown recipe.');
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to make.');
  const station = state.stations[recipe.station];
  if (station.queue.length >= queueSlots(state, recipe.station)) {
    throw new Error(`The ${recipe.station} queue is full (${queueSlots(state, recipe.station)} orders).`);
  }
  checkMats(state, recipe.mats, qty);

  for (const m of recipe.mats) takeFromBags(state, m.item, m.qty * qty);
  const order = { id: state.stations.nextOrderId++, recipeId, qty, done: 0, unitStartedAt: null, timerId: null };
  station.queue.push(order);
  if (station.queue.length === 1) startUnit(state, recipe.station, now);
  return order;
}

// Takes an order out of the queue. Materials for unmade units come back.
export function cancelOrder(state, stationId, orderId, now) {
  const station = state.stations[stationId];
  const i = station.queue.findIndex((o) => o.id === orderId);
  if (i < 0) throw new Error('That order is already finished.');
  const [order] = station.queue.splice(i, 1);
  if (order.timerId !== null) cancelTimer(state, order.timerId);
  const recipe = recipeById[order.recipeId];
  for (const m of recipe.mats) addOrMail(state, m.item, m.qty * (order.qty - order.done));
  if (i === 0 && station.queue.length) startUnit(state, stationId, now);
}

function startUnit(state, stationId, at) {
  const order = state.stations[stationId].queue[0];
  const recipe = recipeById[order.recipeId];
  order.unitStartedAt = at;
  order.timerId = schedule(state, 'craft', at + recipe.seconds * 1000, { station: stationId }).id;
}

// Clock timer handler: one unit finished.
export function finishUnit(state, timer, summary) {
  const stationId = timer.data.station;
  const station = state.stations[stationId];
  const order = station.queue[0];
  if (!order) return;
  const recipe = recipeById[order.recipeId];
  addOrMail(state, recipe.makes.item, recipe.makes.qty);
  summary.crafted[recipe.makes.item] = (summary.crafted[recipe.makes.item] || 0) + recipe.makes.qty;
  order.done++;
  order.timerId = null;
  if (order.done >= order.qty) {
    station.queue.shift();
    summary.ordersDone.push({ item: recipe.makes.item, qty: order.qty * recipe.makes.qty });
  }
  // The next unit starts the moment this one ends, even while you're away.
  if (station.queue.length) startUnit(state, stationId, timer.at);
}

// When the whole queue of a station will be done.
export function queueEndsAt(state, stationId) {
  const queue = state.stations[stationId].queue;
  if (!queue.length) return null;
  let t = queue[0].unitStartedAt;
  for (const o of queue) t += (o.qty - o.done) * recipeById[o.recipeId].seconds * 1000;
  return t;
}

// ---- City Smelter: instant, for a fee -----------------------------------------

export function smelterFee(recipeId, qty) {
  const recipe = recipeById[recipeId];
  const bars = recipe.makes.qty * qty;
  return Math.ceil(itemById[recipe.makes.item].base * tuning.smelterFee * bars);
}

export function smeltAtCity(state, recipeId, qty) {
  const recipe = recipeById[recipeId];
  if (!recipe || recipe.station !== 'forge') throw new Error('The City Smelter only smelts ore and alloys.');
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to smelt.');
  checkMats(state, recipe.mats, qty);
  const fee = smelterFee(recipeId, qty);
  if (fee > state.copper) throw new Error(`The fee is ${fee} copper and you can't cover it.`);
  for (const m of recipe.mats) takeFromBags(state, m.item, m.qty * qty);
  state.copper -= fee;
  // Bars that don't fit wait in the mailbox.
  addOrMail(state, recipe.makes.item, recipe.makes.qty * qty);
  return fee;
}

// How many crafts the bags can cover right now.
export function maxCraftable(state, recipeId) {
  const recipe = recipeById[recipeId];
  return Math.min(...recipe.mats.map((m) => Math.floor((state.bags[m.item] || 0) / m.qty)));
}
