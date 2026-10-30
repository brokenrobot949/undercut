// Balance simulator. Runs the real game engine with no browser.
// Run from the repo folder:  node tools/balance-sim.js
//
// Phase 1 reports:
//   1. Quiet market: a week with no player. Prices should sit near base and
//      sales should roughly match demand.
//   2. Flood test: the player lists more than a day's demand at an undercut
//      price. Gate: the price drops 30%+ and recovers within 1-2 days.
//   3. Price vs speed: the same lot listed at different prices. Higher
//      prices should sell slower, lower prices faster.
//   4. Bot players: cautious, flooder and flipper play 60 days with miners,
//      the forge, the anvil and the auction house. Reports gold over time and
//      any item that never sells.

import { newGame, catchUp, collectMailbox } from '../js/engine/game.js';
import { itemById, tradeableItems } from '../data/items.js';
import { recipes, recipeById } from '../data/recipes.js';
import { tuning } from '../data/tuning.js';
import {
  demandPerHour, postPlayerListing, lowestListing, unitsSold, supplyDays, demandTag, marketValue, playerListings,
} from '../js/engine/market.js';
import { listItem, cancelListing, undercutPrice, buyItems, buyFromVendor } from '../js/engine/trading.js';
import { queueCraft, maxCraftable } from '../js/engine/crafting.js';
import { hireHero, hireFee, zonesFor, expeditionSlots } from '../js/engine/heroes.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const START = Date.UTC(2026, 10, 2, 0, 0);
const SEEDS = [11, 22, 33, 44, 55];

const pct = (x) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

function freshGame(seed, factionId = 'red') {
  const state = newGame({ name: 'Sim', factionId, seed, now: START });
  catchUp(state, START + 2 * DAY); // let the market settle
  return state;
}

// Runs the game to `time`, sampling every hour into `onHour(state, t)`.
function runTo(state, time, onHour) {
  let t = state.clock.lastSeenAt;
  while (t < time) {
    t = Math.min(time, t + HOUR);
    catchUp(state, t);
    if (onHour) onHour(state, t);
  }
}

// ---- 1. Quiet market --------------------------------------------------------

function quietMarket() {
  console.log('\n1. QUIET MARKET (7 days, no player, 5 seeds averaged)');
  console.log(`${pad('item', 24)}${lpad('fair/base', 10)}${lpad('low/hi', 14)}${lpad('sold/day', 10)}${lpad('demand/day', 12)}${lpad('stock(d)', 10)}  tags`);
  const problems = [];
  for (const item of tradeableItems) {
    let fairSum = 0, n = 0, lo = Infinity, hi = 0, sold = 0, demand = 0, stock = 0;
    const tags = {};
    for (const seed of SEEDS) {
      const state = freshGame(seed);
      const end = state.clock.lastSeenAt + 7 * DAY;
      runTo(state, end, (s) => {
        const ratio = s.market.items[item.id].fair / item.base;
        fairSum += ratio; n++;
        lo = Math.min(lo, ratio); hi = Math.max(hi, ratio);
        stock += supplyDays(s, item);
        const tag = demandTag(s, item);
        tags[tag] = (tags[tag] || 0) + 1;
      });
      sold += unitsSold(state, item.id, end, 168) / 7;
      demand += demandPerHour(state, item) * 24;
    }
    const avg = fairSum / n;
    sold /= SEEDS.length; demand /= SEEDS.length;
    const tagText = Object.entries(tags).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / n * 100)}%`).join(', ');
    console.log(`${pad(item.name, 24)}${lpad(avg.toFixed(2), 10)}${lpad(`${lo.toFixed(2)}-${hi.toFixed(2)}`, 14)}${lpad(sold.toFixed(1), 10)}${lpad(demand.toFixed(1), 12)}${lpad((stock / n).toFixed(2), 10)}  ${tagText}`);
    if (avg < 0.9 || avg > 1.1) problems.push(`${item.name}: average price ${pct(avg - 1)} from base`);
    if (sold < demand * 0.6) problems.push(`${item.name}: sells ${Math.round(sold / demand * 100)}% of demand`);
  }
  return problems;
}

// ---- 2. Flood test --------------------------------------------------------

function floodTest() {
  console.log('\n2. FLOOD TEST (list 1 day of demand at 1% under the lowest, 24 h, 5 seeds averaged)');
  console.log('Gate: price drops 30% or more, and recovers to 90% of base within 1-2 days.');
  console.log(`${pad('item', 24)}${lpad('units', 7)}${lpad('lowest fair', 13)}${lpad('drop', 7)}${lpad('recovered', 11)}${lpad('sold', 7)}${lpad('avg sale', 10)}`);
  const problems = [];
  for (const id of ['copper-bar', 'rough-honing-stone', 'coarse-balance-weight', 'copper-cleaver', 'bronze-scale-hauberk']) {
    const item = itemById[id];
    let drop = 0, recover = 0, recovered = 0, sold = 0, revenue = 0, units = 0;
    for (const seed of SEEDS) {
      const state = freshGame(seed);
      const t0 = state.clock.lastSeenAt;
      const before = state.market.items[id].fair;
      const qty = Math.max(3, Math.round(demandPerHour(state, item) * 24));
      const price = Math.max(1, Math.floor((lowestListing(state, id)?.price ?? before) * 0.99));
      units = qty;
      const listing = postPlayerListing(state, id, { price, qty, hours: 24, at: t0 });
      let low = before, back = null;
      runTo(state, t0 + 5 * DAY, (s, t) => {
        const fair = s.market.items[id].fair;
        if (fair < low) low = fair;
        if (back === null && low < before * 0.9 && fair >= item.base * 0.9 && t > t0 + HOUR) back = (t - t0) / DAY;
      });
      drop += 1 - low / before;
      if (back !== null) { recover += back; recovered++; }
      sold += qty - listing.qty;
      revenue += (qty - listing.qty) * price;
    }
    const k = SEEDS.length;
    const avgDrop = drop / k;
    const recText = recovered ? `${(recover / recovered).toFixed(1)} d${recovered < k ? ` (${recovered}/${k})` : ''}` : 'never';
    console.log(`${pad(item.name, 24)}${lpad(units, 7)}${lpad(`${pct(-avgDrop)}`, 13)}${lpad(avgDrop >= 0.3 ? 'ok' : 'LOW', 7)}${lpad(recText, 11)}${lpad(`${Math.round(sold / k / units * 100)}%`, 7)}${lpad(Math.round(revenue / Math.max(1, sold)), 10)}`);
    if (avgDrop < 0.3) problems.push(`${item.name}: flood only dropped the price ${Math.round(avgDrop * 100)}%`);
    if (!recovered || recover / recovered > 2) problems.push(`${item.name}: recovery took ${recText}`);
  }
  return problems;
}

// ---- 3. Price vs speed ------------------------------------------------------

function priceVsSpeed() {
  console.log('\n3. PRICE VS SPEED (a lot of 2 hours\' demand, 24 h listing, 5 seeds averaged)');
  const mults = [0.8, 0.9, 1.0, 1.1, 1.2, 1.35];
  console.log(`${pad('item', 24)}${mults.map((m) => lpad(`x${m}`, 14)).join('')}`);
  console.log(`${pad('', 24)}${mults.map(() => lpad('sold / hours', 14)).join('')}`);
  const problems = [];
  for (const id of ['copper-bar', 'rough-honing-stone', 'copper-cleaver', 'bronze-falchion']) {
    const item = itemById[id];
    const cells = [];
    let prevSold = Infinity;
    for (const mult of mults) {
      let soldShare = 0, hours = 0, finished = 0;
      for (const seed of SEEDS) {
        const state = freshGame(seed);
        const t0 = state.clock.lastSeenAt;
        const qty = Math.max(1, Math.round(demandPerHour(state, item) * 2));
        const listing = postPlayerListing(state, id, { price: state.market.items[id].fair * mult, qty, hours: 24, at: t0 });
        let done = null;
        runTo(state, t0 + DAY, (s, t) => { if (done === null && listing.qty === 0) done = (t - t0) / HOUR; });
        soldShare += (qty - listing.qty) / qty;
        if (done !== null) { hours += done; finished++; }
      }
      const share = soldShare / SEEDS.length;
      cells.push(lpad(`${Math.round(share * 100)}% / ${finished ? Math.round(hours / finished) + 'h' : '-'}`, 14));
      if (share > prevSold + 0.1) problems.push(`${item.name}: listing at x${mult} sold more than a cheaper listing`);
      prevSold = share;
    }
    console.log(`${pad(item.name, 24)}${cells.join('')}`);
  }
  return problems;
}

// ---- 4. Bot players -----------------------------------------------------------
// Each bot checks in on a schedule and does what a player would: collect, hire
// miners, smelt at the forge, craft the most profitable recipes, and list.
//   cautious  every 4 h; lists a few hours' demand at a time, relists when undercut
//   flooder   every 8 h; lists everything it has, never relists
//   flipper   like cautious, and also buys listings under 80% of fair to relist

const BOTS = [
  { name: 'cautious', every: 4, listHours: 6, relist: true, flip: false },
  { name: 'flooder', every: 8, listHours: Infinity, relist: false, flip: false },
  { name: 'flipper', every: 4, listHours: 6, relist: true, flip: true },
];
const SELL_CATEGORIES = new Set(['consumable', 'gear']);

function botValue(state, itemId, now) {
  const item = itemById[itemId];
  if (item.category === 'trade') return item.vendorBuy;
  return marketValue(state, itemId, now) ?? state.market.items[itemId].fair;
}

function botProfit(state, recipe, now) {
  const sale = botValue(state, recipe.makes.item, now) * (1 - tuning.market.cut) * recipe.makes.qty;
  return sale - recipe.mats.reduce((n, m) => n + botValue(state, m.item, now) * m.qty, 0);
}

function botCheckIn(bot, state, now, stats) {
  const summary = catchUp(state, now);
  for (const [id, s] of Object.entries(summary.sold)) {
    stats.sold[id] = (stats.sold[id] || 0) + s.qty;
    if (stats.firstSale === null) stats.firstSale = now - START;
  }
  collectMailbox(state);
  const tryAct = (fn) => { try { return fn(); } catch { return null; } };

  // Heroes: fill every expedition slot, best zone first, trip until the next
  // check-in, unless the bags already hold plenty of raw materials.
  const raw = Object.entries(state.bags).filter(([id]) => itemById[id].category === 'material').reduce((n, [, q]) => n + q, 0);
  while (raw < 200 && state.tavern.expeditions.length < expeditionSlots(state)) {
    const options = state.tavern.board.flatMap((h) => zonesFor(h).map((z) => ({ h, z })))
      .sort((a, b) => b.z.tier - a.z.tier);
    if (!options.length) break;
    const { h, z } = options[0];
    const fee = hireFee(h, z, bot.every);
    if (fee > state.copper * 0.3 || !tryAct(() => hireHero(state, h.id, z.id, bot.every, now))) break;
    stats.heroFees += fee;
  }

  // Forge: smelt all ore, alloy bronze from matching bars.
  for (const id of ['smelt-copper', 'smelt-tin', 'alloy-bronze']) {
    const n = maxCraftable(state, id);
    if (n > 0 && state.stations.forge.queue.length < tuning.queueSlots) tryAct(() => queueCraft(state, id, n, now));
  }

  // Flux for bronze gear.
  if ((state.bags['bronze-bar'] || 0) >= 6 && (state.bags['smithing-flux'] || 0) < 4) tryAct(() => buyFromVendor(state, 'smithing-flux', 6));

  // Anvil: keep some grit on hand, then the most profitable recipes the bags allow.
  if ((state.bags['rough-grit'] || 0) < 3 && maxCraftable(state, 'rough-grit') >= 3) tryAct(() => queueCraft(state, 'rough-grit', 3, now));
  if ((state.bags['coarse-grit'] || 0) < 3 && maxCraftable(state, 'coarse-grit') >= 3) tryAct(() => queueCraft(state, 'coarse-grit', 3, now));
  const ranked = recipes.filter((r) => r.station === 'anvil' && SELL_CATEGORIES.has(itemById[r.makes.item].category))
    .map((r) => ({ r, p: botProfit(state, r, now) })).filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
  // Make up to a day's demand of each item, counting what's already in bags,
  // listed or queued. Flooding one item is what the market punishes.
  const onHand = (itemId) => (state.bags[itemId] || 0) +
    playerListings(state).filter((x) => x.itemId === itemId).reduce((n, x) => n + x.listing.qty, 0) +
    state.stations.anvil.queue.filter((o) => recipeById[o.recipeId].makes.item === itemId).reduce((n, o) => n + o.qty - o.done, 0);
  for (const { r } of ranked) {
    if (state.stations.anvil.queue.length >= tuning.queueSlots) break;
    const room = Math.floor(demandPerHour(state, itemById[r.makes.item]) * 24) - onHand(r.makes.item);
    const n = Math.min(maxCraftable(state, r.id), room);
    if (n > 0) tryAct(() => queueCraft(state, r.id, n, now));
  }

  // Selling: finished goods, plus raw materials beyond what the bot can use.
  const mine = playerListings(state);
  for (const [itemId, have] of Object.entries(state.bags)) {
    const item = itemById[itemId];
    const surplus = item.category === 'material' && have > 150;
    if (!SELL_CATEGORIES.has(item.category) && !surplus) continue;
    const existing = mine.filter((x) => x.itemId === itemId);
    if (bot.relist) {
      for (const x of existing) if (x.place > 0) { tryAct(() => cancelListing(state, itemId, x.listing.id)); stats.relists++; }
    } else if (existing.length) continue;
    const listedNow = playerListings(state).filter((x) => x.itemId === itemId).reduce((n, x) => n + x.listing.qty, 0);
    const want = Math.min(state.bags[itemId] || 0, Math.ceil(demandPerHour(state, item) * bot.listHours) - listedNow);
    if (want > 0) {
      const before = state.copper;
      if (tryAct(() => listItem(state, { itemId, qty: want, price: undercutPrice(state, itemId), hours: 24 }, now))) {
        stats.deposits += before - state.copper;
        stats.listed[itemId] = (stats.listed[itemId] || 0) + want;
      }
    }
  }

  // Flipping: buy anything listed well under fair, relist next time at market.
  if (bot.flip) {
    for (const item of tradeableItems) {
      if (!SELL_CATEGORIES.has(item.category)) continue;
      const m = state.market.items[item.id];
      const cheap = m.listings.find((l) => l.seller === 'npc' && l.price < m.fair * 0.8);
      if (cheap && cheap.price * cheap.qty < state.copper * 0.2) {
        if (tryAct(() => buyItems(state, item.id, cheap.qty, now))) stats.flips += cheap.qty;
      }
    }
  }
}

function botRun(bot, seed) {
  const state = newGame({ name: bot.name, factionId: 'red', seed, now: START });
  const stats = { sold: {}, listed: {}, firstSale: null, heroFees: 0, deposits: 0, relists: 0, flips: 0, gold: {}, flooded: {} };
  const checkpoints = [1, 3, 7, 14, 30, 60];
  for (let t = START; t <= START + 60 * DAY; t += bot.every * HOUR) {
    botCheckIn(bot, state, t, stats);
    for (const item of tradeableItems) if (demandTag(state, item) === 'flooded') stats.flooded[item.id] = (stats.flooded[item.id] || 0) + 1;
    const day = (t - START) / DAY;
    if (checkpoints.includes(day)) stats.gold[day] = state.copper;
  }
  stats.checkIns = Math.floor((60 * 24) / bot.every) + 1;
  return stats;
}

const gsc = (c) => `${(c / 10000).toFixed(1)}g`;

function botReport() {
  console.log('\n4. BOT PLAYERS (60 days, real check-ins, 2 seeds averaged; gold in hand)');
  console.log(`${pad('bot', 10)}${['day 1', 'day 3', 'day 7', 'day 14', 'day 30', 'day 60'].map((d) => lpad(d, 9)).join('')}${lpad('1st sale', 10)}${lpad('hero fees', 11)}${lpad('deposits', 10)}`);
  const problems = [];
  const allListed = {};
  const allSold = {};
  for (const bot of BOTS) {
    const runs = [101, 202].map((seed) => botRun(bot, seed));
    const avg = (f) => runs.reduce((n, r) => n + f(r), 0) / runs.length;
    const gold = [1, 3, 7, 14, 30, 60].map((d) => lpad(gsc(avg((r) => r.gold[d] ?? 0)), 9)).join('');
    const first = avg((r) => r.firstSale ?? 60 * DAY) / (60 * 1000);
    console.log(`${pad(bot.name, 10)}${gold}${lpad(`${Math.round(first)} min`, 10)}${lpad(gsc(avg((r) => r.heroFees)), 11)}${lpad(gsc(avg((r) => r.deposits)), 10)}`);
    for (const r of runs) {
      for (const [id, n] of Object.entries(r.listed)) allListed[id] = (allListed[id] || 0) + n;
      for (const [id, n] of Object.entries(r.sold)) allSold[id] = (allSold[id] || 0) + n;
    }
    const flooded = Object.entries(runs[0].flooded).filter(([, n]) => n > runs[0].checkIns * 0.25).map(([id]) => itemById[id].name);
    if (flooded.length) console.log(`${pad('', 10)}flooded over 25% of the time: ${flooded.join(', ')}`);
    if (bot.flip) console.log(`${pad('', 10)}flipped ${Math.round(avg((r) => r.flips))} units`);
    if (avg((r) => r.gold[60]) < tuning.startingCopper) problems.push(`${bot.name} bot ends with less gold than it started with`);
  }
  console.log('\nItems the bots listed vs sold (all bots):');
  for (const [id, n] of Object.entries(allListed).sort((a, b) => b[1] - a[1])) {
    const sold = allSold[id] || 0;
    console.log(`  ${pad(itemById[id].name, 24)}${lpad(n, 7)} listed${lpad(sold, 7)} sold (${Math.round((sold / n) * 100)}%)`);
    if (sold === 0) problems.push(`${itemById[id].name}: bots listed ${n} and never sold one`);
  }
  return problems;
}

// ---- Run ------------------------------------------------------------------

const started = Date.now();
const problems = [...quietMarket(), ...floodTest(), ...priceVsSpeed(), ...botReport()];
console.log(`\nAuction house cut ${tuning.market.cut * 100}%. Ran in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n- ${problems.join('\n- ')}` : '\nNo problems found.');
process.exitCode = problems.length ? 1 : 0;
