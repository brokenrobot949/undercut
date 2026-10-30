// The auction house simulation. One model, run every 10-minute tick for
// every tradeable item:
//   1. Expired listings come down (player listings go back to the player).
//   2. NPC sellers post new listings near the fair price; some undercut.
//   3. Buyers arrive from the reservoir; each takes the cheapest listing at
//      or under their price limit. Ties go to the older listing.
//   4. The fair price moves toward a target set by how much affordable stock
//      is listed (more stock = lower) and how many buyers are waiting
//      (more waiting = higher). The target sits at base value when the
//      market is normal, so the price always eases back toward base.
//
// All money is in copper. No DOM here.

import { tuning } from '../../data/tuning.js';
import { itemById, tradeableItems } from '../../data/items.js';
import { factions } from '../../data/factions.js';
import { rngNext, rngRange, rngInt, rngChance } from './rng.js';

const M = tuning.market;
const HOUR = 60 * 60 * 1000;
const TICKS_PER_HOUR = 60 / tuning.tickMinutes;
const HISTORY_HOURS = 168; // 7 days of hourly sale records, for the Ledger

// ---- Setup -------------------------------------------------------------

export function createMarket(state, now) {
  const market = { nextListingId: 1, items: {} };
  state.market = market;
  for (const item of tradeableItems) {
    const m = {
      fair: item.base,
      drift: 1,
      reservoir: demandPerHour(state, item) * 2,
      npcPending: 0,
      listings: [],
      histHour: Math.floor(now / HOUR),
      salesCount: new Array(HISTORY_HOURS).fill(0),
      salesSum: new Array(HISTORY_HOURS).fill(0),
    };
    market.items[item.id] = m;
    // Start with a normal amount of NPC stock, as if the market had been running.
    const stockHours = M.npcMaxStockHours * 0.75;
    const posted = { units: 0 };
    while (posted.units < demandPerHour(state, item) * stockHours) {
      postNpcLot(state, item, m, now - rngRange(state.rng, 0, stockHours) * HOUR, posted);
    }
  }
  return market;
}

// ---- Numbers the UI and simulator read ----------------------------------

export function vendorPrice(item) {
  return Math.max(1, Math.floor(item.base * M.vendorShare));
}

export function demandPerHour(state, item) {
  let rate = item.demand * (tuning.populationByTier[item.tier - 1] ?? 1) * (state.market?.items[item.id]?.drift ?? 1);
  if (item.category === 'gear') {
    const faction = factions.find((f) => f.id === state.player.factionId);
    rate *= faction?.armorDemand?.[item.armor] ?? 1;
  }
  return rate;
}

export function lowestListing(state, itemId) {
  return state.market.items[itemId].listings[0] || null;
}

export function listedUnits(state, itemId) {
  return state.market.items[itemId].listings.reduce((n, l) => n + l.qty, 0);
}

// Average sale price over the last `hours`, or null if nothing sold.
export function marketValue(state, itemId, at, hours = 24) {
  const m = state.market.items[itemId];
  rollHistory(m, at);
  let count = 0;
  let sum = 0;
  for (let i = 0; i < hours; i++) {
    const slot = (m.histHour - i + HISTORY_HOURS * 2) % HISTORY_HOURS;
    count += m.salesCount[slot];
    sum += m.salesSum[slot];
  }
  return count ? Math.round(sum / count) : null;
}

export function unitsSold(state, itemId, at, hours = 24) {
  const m = state.market.items[itemId];
  rollHistory(m, at);
  let count = 0;
  for (let i = 0; i < hours; i++) count += m.salesCount[(m.histHour - i + HISTORY_HOURS * 2) % HISTORY_HOURS];
  return count;
}

// How much stock is listed, in days of demand. Listings priced well above
// fair count less, since few buyers will pay them.
export function supplyDays(state, item) {
  const m = state.market.items[item.id];
  let units = 0;
  for (const l of m.listings) units += l.qty * affordability(l.price / m.fair);
  return units / (demandPerHour(state, item) * 24);
}

// Waiting buyers as a share of the full reservoir (0 to 1).
export function scarcity(state, item) {
  const m = state.market.items[item.id];
  return m.reservoir / (demandPerHour(state, item) * M.reservoirHours);
}

// 'hot', 'steady', 'slow' or 'flooded', for the item's demand tag.
export function demandTag(state, item) {
  const m = state.market.items[item.id];
  const days = supplyDays(state, item);
  if (days > M.normalSupplyDays + 0.6) return 'flooded';
  if (m.fair < item.base * 0.88 || days > M.normalSupplyDays + 0.25) return 'slow';
  if (m.fair > item.base * 1.12 || scarcity(state, item) > M.normalScarcity + 0.15) return 'hot';
  return 'steady';
}

// The auction house cut on one sale, rounded down (cheap items pay none).
export function cutOn(price) {
  return Math.floor(price * M.cut);
}

// What the seller gets for one unit: the price, minus the cut, plus that
// unit's share of the deposit. Call after the unit is taken off the listing.
// Shares are split so that a listing that sells out returns the whole deposit.
export function saleProceeds(listing, price) {
  const sold = listing.startQty - listing.qty;
  const share = Math.floor((listing.deposit * sold) / listing.startQty) -
    Math.floor((listing.deposit * (sold - 1)) / listing.startQty);
  return price - cutOn(price) + share;
}

export function depositFor(item, qty, hours) {
  const d = M.durations.find((x) => x.hours === hours);
  if (!d) throw new Error(`No ${hours} h listing duration.`);
  return Math.ceil(vendorPrice(item) * d.deposit * qty);
}

// ---- Player listings -----------------------------------------------------

// Posts a player listing. The caller has already taken the items and deposit.
export function postPlayerListing(state, itemId, { price, qty, hours, at }) {
  const item = itemById[itemId];
  const listing = {
    id: state.market.nextListingId++,
    seller: 'player',
    price: Math.max(1, Math.round(price)),
    qty,
    startQty: qty,
    postedAt: at,
    expiresAt: at + hours * HOUR,
    deposit: depositFor(item, qty, hours),
  };
  insertListing(state.market.items[itemId].listings, listing);
  return listing;
}

// Takes a player listing down early. Returns it (the caller returns the
// unsold units to the player; their share of the deposit is lost).
export function cancelPlayerListing(state, itemId, listingId) {
  const listings = state.market.items[itemId].listings;
  const i = listings.findIndex((l) => l.id === listingId && l.seller === 'player');
  if (i < 0) return null;
  return listings.splice(i, 1)[0];
}

export function playerListings(state) {
  const out = [];
  for (const [itemId, m] of Object.entries(state.market.items)) {
    m.listings.forEach((l, place) => { if (l.seller === 'player') out.push({ itemId, place, listing: l }); });
  }
  return out;
}

// Buys `qty` units from the cheapest listings. Returns { qty, cost } actually
// bought (stops when listings run out or `maxCost` would be exceeded).
// Player-owned listings are skipped: you can't buy from yourself.
export function buyFromMarket(state, itemId, qty, maxCost, at, hooks) {
  const m = state.market.items[itemId];
  let bought = 0;
  let cost = 0;
  for (let i = 0; i < m.listings.length && bought < qty;) {
    const l = m.listings[i];
    if (l.seller === 'player') { i++; continue; }
    if (cost + l.price > maxCost) break;
    l.qty--;
    bought++;
    cost += l.price;
    recordSale(m, l.price, at);
    if (l.qty === 0) m.listings.splice(i, 1);
  }
  // Buying removes supply; the fair price reacts on the next tick.
  return { qty: bought, cost };
}

// ---- The tick ------------------------------------------------------------

// hooks.onSale(itemId, listing, price, at) and hooks.onExpire(itemId, listing, at)
// are called for player listings only.
export function marketTick(state, at, hooks) {
  for (const item of tradeableItems) {
    const m = state.market.items[item.id];
    driftDemand(state, m);
    const demand = demandPerHour(state, item);
    rollHistory(m, at);
    expireListings(item, m, at, hooks);
    restockNpc(state, item, m, demand, at);
    serveBuyers(state, item, m, demand, at, hooks);
    moveFairPrice(state, item, m, demand);
  }
}

// Long absence: player listings have all expired; the market starts over.
export function freshMarket(state, at, hooks) {
  for (const item of tradeableItems) {
    const m = state.market.items[item.id];
    for (const l of m.listings) if (l.seller === 'player') hooks.onExpire(item.id, l, at);
  }
  const nextId = state.market.nextListingId;
  createMarket(state, at);
  state.market.nextListingId = Math.max(nextId, state.market.nextListingId);
}

// A slow random walk around 1, pulled back toward 1 over about a day.
const TICKS_PER_DAY = TICKS_PER_HOUR * 24;
const DRIFT_STEP = M.demandDrift * Math.sqrt(2 / TICKS_PER_DAY);
function driftDemand(state, m) {
  const noise = (rngNext(state.rng) + rngNext(state.rng) + rngNext(state.rng) - 1.5) * 2 * DRIFT_STEP;
  m.drift = Math.exp(Math.log(m.drift ?? 1) * (1 - 1 / TICKS_PER_DAY) + noise);
}

function expireListings(item, m, at, hooks) {
  if (!m.listings.some((l) => l.expiresAt <= at)) return;
  m.listings = m.listings.filter((l) => {
    if (l.expiresAt > at) return true;
    if (l.seller === 'player') hooks.onExpire(item.id, l, at);
    return false;
  });
}

function restockNpc(state, item, m, demand, at) {
  let npcUnits = 0;
  for (const l of m.listings) if (l.seller === 'npc') npcUnits += l.qty;
  if (npcUnits >= demand * M.npcMaxStockHours) return;
  // Low prices make NPCs hold back; high prices bring more sellers.
  const priceRatio = Math.min(2, m.fair / item.base);
  m.npcPending += (demand / TICKS_PER_HOUR) * M.npcSupply[item.category] * priceRatio ** M.npcPriceElasticity;
  const [minLot] = M.npcLotSize[item.category];
  while (m.npcPending >= minLot) postNpcLot(state, item, m, at);
}

function postNpcLot(state, item, m, at, counter) {
  const [minLot, maxLot] = M.npcLotSize[item.category];
  const qty = Math.max(1, Math.min(rngInt(state.rng, minLot, maxLot), Math.round(m.npcPending) || maxLot));
  m.npcPending = Math.max(0, m.npcPending - qty);
  if (counter) counter.units += qty;

  const lowest = m.listings[0];
  const roll = rngNext(state.rng);
  let price;
  if (roll < M.npcBargainShare) {
    price = m.fair * rngRange(state.rng, ...M.npcBargainRange);
  } else if (lowest && roll < M.npcBargainShare + M.npcUndercutShare) {
    price = lowest.price * (1 - rngRange(state.rng, 0.01, 0.05));
  } else {
    price = m.fair * rngRange(state.rng, ...M.npcPriceRange);
  }
  // NPCs never list at or below the vendor price; they'd just vendor it.
  // On cheap items a 1-5% undercut rounds to the same copper, so they match instead.
  price = Math.max(vendorPrice(item) + 1, Math.round(price));

  insertListing(m.listings, {
    id: state.market.nextListingId++,
    seller: 'npc',
    price,
    qty,
    postedAt: at,
    expiresAt: at + (rngChance(state.rng, 0.5) ? 8 : 24) * HOUR,
  });
}

function serveBuyers(state, item, m, demand, at, hooks) {
  m.reservoir = Math.min(m.reservoir + demand / TICKS_PER_HOUR, demand * M.reservoirHours);
  const shoppersExact = m.reservoir * M.shopperShare;
  let shoppers = Math.floor(shoppersExact) + (rngNext(state.rng) < shoppersExact % 1 ? 1 : 0);
  shoppers = Math.min(shoppers, Math.floor(m.reservoir));

  for (let s = 0; s < shoppers && m.listings.length; s++) {
    // Sum of three random numbers: most buyers near fair, a few far off.
    const r = (rngNext(state.rng) + rngNext(state.rng) + rngNext(state.rng) - 1.5) / 1.5;
    const limit = m.fair * (1 + M.buyerSpread * r);
    const l = m.listings[0];
    if (l.price > limit) continue; // too dear for this buyer; they keep waiting
    l.qty--;
    m.reservoir--;
    recordSale(m, l.price, at);
    if (l.seller === 'player') hooks.onSale(item.id, l, l.price, at);
    if (l.qty === 0) m.listings.shift();
  }
}

function moveFairPrice(state, item, m, demand) {
  const extraStock = Math.max(0, supplyDays(state, item) - M.normalSupplyDays);
  // Waiting buyers only push the price up when stock is short. In a flooded
  // market they're waiting for it to get cheaper.
  const waiting = extraStock > 0 ? 0 : Math.max(0, m.reservoir / (demand * M.reservoirHours) - M.normalScarcity);
  const target = item.base / (1 + M.floodStrength * extraStock) * (1 + M.scarcityStrength * waiting);
  m.fair += (target - m.fair) * M.followRate;
  m.fair = Math.min(item.base * M.maxPriceMult, Math.max(vendorPrice(item) * 1.2, m.fair));
}

// 1 for listings at or under fair, fading to 0 at fair x affordableUpTo.
function affordability(ratio) {
  if (ratio <= 1) return 1;
  if (ratio >= M.affordableUpTo) return 0;
  return (M.affordableUpTo - ratio) / (M.affordableUpTo - 1);
}

// ---- Helpers -------------------------------------------------------------

// Keeps listings sorted: cheapest first, then oldest, then first posted.
function insertListing(listings, listing) {
  let lo = 0;
  let hi = listings.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const o = listings[mid];
    const before = o.price < listing.price || (o.price === listing.price &&
      (o.postedAt < listing.postedAt || (o.postedAt === listing.postedAt && o.id < listing.id)));
    if (before) lo = mid + 1; else hi = mid;
  }
  listings.splice(lo, 0, listing);
}

function rollHistory(m, at) {
  const hour = Math.floor(at / HOUR);
  if (hour - m.histHour >= HISTORY_HOURS) {
    m.salesCount.fill(0);
    m.salesSum.fill(0);
    m.histHour = hour;
    return;
  }
  while (m.histHour < hour) {
    m.histHour++;
    m.salesCount[m.histHour % HISTORY_HOURS] = 0;
    m.salesSum[m.histHour % HISTORY_HOURS] = 0;
  }
}

function recordSale(m, price, at) {
  rollHistory(m, at);
  m.salesCount[m.histHour % HISTORY_HOURS]++;
  m.salesSum[m.histHour % HISTORY_HOURS] += price;
}
