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
//   5. First session: a new player of each profession follows the tutorial
//      for an hour. The first sale should land within 5 minutes.

import { newGame, catchUp, collectMailbox } from '../js/engine/game.js';
import { itemById, tradeableItems } from '../data/items.js';
import { professionById } from '../data/professions.js';
import { recipes, recipeById } from '../data/recipes.js';
import { tuning } from '../data/tuning.js';
import {
  demandPerHour, postPlayerListing, lowestListing, unitsSold, supplyDays, demandTag, marketValue, playerListings,
} from '../js/engine/market.js';
import { listItem, cancelListing, undercutPrice, buyItems, buyFromVendor, quoteBuy, sellToVendor } from '../js/engine/trading.js';
import { bagSlots, slotsUsed, roomFor } from '../js/engine/bags.js';
import { queueCraft, maxCraftable, smeltAtCity, queueSlots } from '../js/engine/crafting.js';
import { upgrades } from '../data/upgrades.js';
import { quartermasterRecipes, buyQuartermasterRecipe } from '../js/engine/quartermaster.js';
import { nextUpgrade, buyUpgrade } from '../js/engine/upgrades.js';
import { buyDecor, buyTrophy, buySignStyle, donate, donationOffer, donationEndsAt } from '../js/engine/shop-extras.js';
import { decor, signStyles, donations, trophies } from '../data/shop-extras.js';
import { hireHero, hireFee, zonesFor, raidZonesFor, gatheredProfessions, expeditionSlots, regularsInTown } from '../js/engine/heroes.js';
import { nextWing, buyWing } from '../js/engine/wings.js';
import { zoneById } from '../data/zones.js';
import { canDeliver, deliverCommission, claimTutorialStep } from '../js/engine/commissions.js';
import { tutorialStep, stepMet } from '../js/engine/tutorial.js';
import { tutorialSteps } from '../data/tutorial.js';
import { madeCount } from '../js/engine/bags.js';
import { nextTraining, trainRank, recipeColor, capOf, knowsRecipe, trainerRecipes, learnRecipe, forgeRankNeeded, learnFromScroll, recipeProfession } from '../js/engine/skills.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const START = Date.UTC(2026, 10, 2, 0, 0);
const SEEDS = [11, 22, 33, 44, 55];

const pct = (x) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

// A game with no market events, for the tests that measure the market itself.
// The bots in section 4 play with events on.
function freshGame(seed, factionId = 'red') {
  const state = newGame({ name: 'Sim', factionId, seed, now: START });
  state.events.list = [];
  state.timers = state.timers.filter((x) => !x.type.startsWith('event'));
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
  // Endgame materials have no NPC sellers (only raids bring them), so a
  // market with no players never sells any; leave them out here.
  for (const item of tradeableItems.filter((i) => i.npcStock !== false)) {
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
// Each bot runs one profession's shop and checks in on a schedule, playing
// like a simple player: claim tutorial steps, fill commissions, train the next
// rank when it can, level on the cheapest skill-ups, hire gatherers for the
// tier it needs, smelt (smiths), craft what's profitable, list, and vendor
// leveling junk the market can't take.
//   cautious  every 4 h; lists a few hours' demand at a time, relists when undercut
//   flooder   every 8 h; lists everything it has, never relists
//   flipper   like cautious, and also buys stock listed under 80% of base value
//             (a dip) and relists it once the price is back near base
//   eager     like cautious, but checks in every hour (an engaged first day)
// The tanner (Leatherworking) and alchemist play like the cautious smith.

const BOTS = [
  { name: 'eager', prof: 'blacksmithing', every: 1, listHours: 3, relist: true, flip: false, wings: ['alchemy', 'leatherworking'] },
  { name: 'cautious', prof: 'blacksmithing', every: 4, listHours: 6, relist: true, flip: false, wings: ['alchemy', 'leatherworking'] },
  { name: 'flooder', prof: 'blacksmithing', every: 8, listHours: Infinity, relist: false, flip: false, wings: ['leatherworking', 'alchemy'] },
  { name: 'flipper', prof: 'blacksmithing', every: 4, listHours: 6, relist: true, flip: true, wings: ['leatherworking', 'alchemy'] },
  { name: 'tanner', prof: 'leatherworking', every: 4, listHours: 6, relist: true, flip: false, wings: ['blacksmithing', 'alchemy'] },
  { name: 'alchemist', prof: 'alchemy', every: 4, listHours: 6, relist: true, flip: false, wings: ['blacksmithing', 'leatherworking'] },
];
// Days each bot plays. The Phase 3 gate is at 6 to 8 weeks.
const RUN_DAYS = 70;
// Bots that play like a steady, regular player; the Phase 3 gate is checked on these.
const GATE_BOTS = new Set(['cautious', 'tanner', 'alchemist']);
const SELL_CATEGORIES = new Set(['consumable', 'gear']);
// Materials some recipe uses; the bots keep this many of each and sell the rest.
const KEEP_MATS = 40;
// Grit and cured hides the bots keep made ahead, for leveling and gear.
const INTERMEDIATE_STOCK = 12;
// Materials each profession's recipes use.
const USED_MATS = Object.fromEntries(['blacksmithing', 'leatherworking', 'alchemy'].map((prof) =>
  [prof, new Set(recipes.filter((r) => recipeProfession(r) === prof || (prof === 'blacksmithing' && r.station === 'forge')).flatMap((r) => r.mats.map((m) => m.item)))]));
// Recipes that make a material other recipes of the same profession use
// (grit, cured hides), by profession.
const INTERMEDIATES = Object.fromEntries(['blacksmithing', 'leatherworking', 'alchemy'].map((prof) => {
  const own = recipes.filter((r) => recipeProfession(r) === prof);
  const used = new Set(own.flatMap((r) => r.mats.map((m) => m.item)));
  return [prof, own.filter((r) => itemById[r.makes.item].category === 'material' && used.has(r.makes.item)).map((r) => r.id)];
}));
// Skill milestones the sim records, with the pacing target from DESIGN.md (days).
const MILESTONES = [
  { id: 'skill75', label: 'skill 75', target: null },
  { id: 'journeyman', label: 'Journeyman', target: 1 },
  { id: 'skill150', label: 'skill 150', target: 7 },
  { id: 'friendly', label: 'Friendly', target: 7 },
  { id: 'expert', label: 'Expert', target: 7 },
  { id: 'skill300', label: 'skill 300', target: 21 },
  { id: 'artisan', label: 'Artisan', target: 21 },
  { id: 'honored', label: 'Honored', target: 21 },
  { id: 'revered', label: 'Revered', target: 35 },
  { id: 'exalted', label: 'Exalted', target: 56 },
  { id: 'second', label: '2nd wing', target: null },
  { id: 'third', label: '3rd wing', target: null },
  { id: 'all300', label: 'all 3 at 300', target: 56 },
  { id: 'gate', label: 'GATE', target: 56 },
];

function botValue(state, itemId, now) {
  const item = itemById[itemId];
  if (item.category === 'trade') return item.vendorBuy;
  return marketValue(state, itemId, now) ?? state.market.items[itemId].fair;
}

function botProfit(state, recipe, now) {
  const sale = botValue(state, recipe.makes.item, now) * (1 - tuning.market.cut) * recipe.makes.qty;
  return sale - recipe.mats.reduce((n, m) => n + botValue(state, m.item, now) * m.qty, 0);
}

// The skill-up recipe with the lowest cost per expected skill point, counting
// that about half the product's value comes back when the junk is sold.
function levelingRecipe(state, now, prof) {
  let best = null;
  for (const r of recipes) {
    if (!knowsRecipe(state, r) || recipeProfession(r) !== prof) continue;
    const chance = tuning.skillUpChance[recipeColor(state, r)];
    if (!chance) continue;
    const mats = r.mats.reduce((n, m) => n + botValue(state, m.item, now) * m.qty, 0);
    const back = botValue(state, r.makes.item, now) * r.makes.qty * 0.5;
    const perPoint = Math.max(1, mats - back) / chance;
    if (!best || perPoint < best.perPoint) best = { r, chance, perPoint };
  }
  return best;
}

// Buys whatever is missing for `qty` crafts, if it all costs under `budget`.
function buyMissing(state, recipe, qty, budget, now) {
  const need = recipe.mats.map((m) => ({ item: m.item, qty: m.qty * qty - (state.bags[m.item] || 0) })).filter((m) => m.qty > 0);
  const vendor = (id) => itemById[id].category === 'trade';
  const cost = need.reduce((n, m) => n + (vendor(m.item) ? itemById[m.item].vendorBuy * m.qty : quoteBuy(state, m.item, m.qty).cost), 0);
  if (cost > budget || need.some((m) => !vendor(m.item) && quoteBuy(state, m.item, m.qty).qty < m.qty)) return false;
  for (const m of need) {
    if (vendor(m.item)) buyFromVendor(state, m.item, m.qty);
    else buyItems(state, m.item, m.qty, now);
  }
  return true;
}

function botCheckIn(bot, state, now, stats) {
  const profs = state.player.professions;
  const has = (p) => profs.includes(p);
  const stations = profs.flatMap((p) => professionById[p].stations).filter((s) => s !== 'forge');
  // Materials worth keeping: what the bot's not-yet-gray recipes use (and the
  // forge, for a smith). Old-tier leftovers get sold.
  const usedMats = new Set(recipes.filter((r) => {
    const prof = recipeProfession(r);
    if (!prof) return r.station === 'forge' && has('blacksmithing') && !forgeRankNeeded(state, r);
    return has(prof) && recipeColor(state, r) !== 'gray';
  }).flatMap((r) => r.mats.map((m) => m.item)));
  const summary = catchUp(state, now);
  for (const [id, s] of Object.entries(summary.sold)) {
    stats.sold[id] = (stats.sold[id] || 0) + s.qty;
    if (stats.firstSale === null) stats.firstSale = now - START;
  }
  collectMailbox(state);
  const tryAct = (fn) => { try { return fn(); } catch { return null; } };
  const freeSlots = () => bagSlots(state) - slotsUsed(state);
  const queueFree = (station) => state.stations[station].queue.length < queueSlots(state, station);
  // Gold set aside for the next training rank of every profession that's
  // within 15 skill of its rank cap.
  const training = () => profs.reduce((n, p) => n + (state.skills[p].skill >= capOf(state, p) - 15 ? nextTraining(state, p)?.cost ?? 0 : 0), 0);
  // Bots nearly finish one profession before starting the next: a wing once
  // every profession they have has Artisan trained and skill 270.
  const wingTime = () => profs.every((p) => state.skills[p].rank >= 3 && state.skills[p].skill >= 270) && nextWing(state) && !/standing/.test(nextWing(state).reason ?? '');
  // ...and for that wing.
  const reserve = () => training() + (wingTime() ? nextWing(state).cost : 0);
  // Gold the bot will spend on materials: what's left after training money.
  const spare = () => Math.max(0, state.copper - training());

  // Tutorial: claim any step the bot has already done.
  while (tutorialStep(state) && stepMet(state)) claimTutorialStep(state, now);

  // Commissions: hand in whatever's ready, then queue crafts for the rest.
  for (const c of [...state.commissions.list]) {
    const n = canDeliver(state, c);
    if (n > 0 && (c.type === 'contract' || c.type === 'drive' || n >= c.qty - c.delivered)) {
      const r = tryAct(() => deliverCommission(state, c.id, now));
      if (r) { stats.commissionGold += r.copper; if (r.done) stats.commissions++; }
    }
  }
  for (const c of state.commissions.list) {
    const recipe = recipeById[c.recipeId];
    const queued = state.stations[recipe.station].queue.filter((o) => o.recipeId === recipe.id).reduce((n, o) => n + o.qty - o.done, 0);
    const need = c.qty - c.delivered - madeCount(state, c.itemId) - queued;
    if (need <= 0 || !knowsRecipe(state, recipe) || recipeColor(state, recipe) === 'red' || !queueFree(recipe.station)) continue;
    if (maxCraftable(state, recipe.id) >= need || tryAct(() => buyMissing(state, recipe, need, state.copper * 0.4, now))) {
      tryAct(() => queueCraft(state, recipe.id, need, now));
    }
  }

  // Train each profession's next rank as soon as the bot can.
  for (const p of profs) if (nextTraining(state, p)?.ready) trainRank(state, p);
  // Profession wings: open the next profession when it's time and the gold
  // left after saving for training covers it.
  const wing = nextWing(state);
  if (wingTime() && wing.ready && wing.cost <= state.copper - training()) {
    const pick = bot.wings.find((p) => wing.choices.some((c) => c.id === p));
    buyWing(state, pick);
    stats.wingDays.push((now - START) / DAY);
  }
  // Learn every recipe the trainer offers at this skill, while it costs under
  // half the purse. When nothing known still gives skill-ups, buy the cheapest
  // that does with whatever the purse holds.
  for (const p of profs) {
    for (const o of trainerRecipes(state, p)) {
      if (o.ready && o.cost <= state.copper * 0.5) { learnRecipe(state, o.recipe.id); stats.recipeSpend += o.cost; }
    }
    if (!levelingRecipe(state, now, p)) {
      const next = trainerRecipes(state, p).filter((o) => o.ready && tuning.skillUpChance[recipeColor(state, o.recipe)] > 0).sort((a, b) => a.cost - b.cost)[0];
      if (next) { learnRecipe(state, next.recipe.id); stats.recipeSpend += next.cost; }
    }
  }
  // Quartermaster recipes, while they cost under half of what's left after
  // saving for training.
  for (const o of quartermasterRecipes(state)) {
    if (o.ready && o.cost <= (state.copper - reserve()) * 0.5) { buyQuartermasterRecipe(state, o.recipe.id); stats.recipeSpend += o.cost; }
  }
  // Shop upgrades: buy the cheapest one ready, while it costs under 30% of
  // what's left after saving for training.
  for (;;) {
    const spare = state.copper - reserve();
    const best = upgrades.map((u) => ({ u, n: nextUpgrade(state, u.id) })).filter((x) => x.n?.ready && x.n.cost <= spare * 0.3)
      .sort((a, b) => a.n.cost - b.n.cost)[0];
    if (!best) break;
    buyUpgrade(state, best.u.id);
    stats.upgradeSpend += best.n.cost;
    stats.upgradeLevels++;
  }
  // Gold sinks, once every upgrade is bought: keep each donation running while
  // it costs under 10% of the spare gold, then buy decor, signs and trophies,
  // cheapest first, while each costs under 30%.
  if (upgrades.every((u) => !nextUpgrade(state, u.id))) {
    for (const d of donations) {
      if (!donationEndsAt(state, d.id, now) && donationOffer(state, d.id, now).ready && d.cost <= (state.copper - reserve()) * 0.1) {
        donate(state, d.id, now);
        stats.extrasSpend += d.cost;
      }
    }
    const x = state.extras;
    const shopping = [
      ...decor.filter((d) => !x.decor[d.id]).map((d) => ({ cost: d.cost, buy: () => buyDecor(state, d.id) })),
      ...signStyles.filter((g) => !x.signs[g.id]).map((g) => ({ cost: g.cost, buy: () => buySignStyle(state, g.id) })),
      ...trophies.filter((t) => !x.trophies[t.id]).map((t) => ({ cost: t.cost, buy: () => buyTrophy(state, t.id) })),
    ].sort((a, b) => a.cost - b.cost);
    for (const item of shopping) {
      if (item.cost > (state.copper - reserve()) * 0.3) break;
      item.buy();
      stats.extrasSpend += item.cost;
      stats.extrasBought++;
    }
  }

  const lvls = Object.fromEntries(profs.map((p) => [p, levelingRecipe(state, now, p)]));

  // Raids: once the bot knows a masterwork, keep a level-60 hero raiding for
  // the endgame material it has least of.
  const endgame = [...new Set(recipes.filter((r) => r.masterwork && knowsRecipe(state, r))
    .flatMap((r) => r.mats.map((m) => m.item)).filter((id) => itemById[id].npcStock === false))];
  if (endgame.length && !state.tavern.expeditions.some((e) => zoneById[e.zoneId].raid) && state.tavern.expeditions.length < expeditionSlots(state)) {
    const want = endgame.sort((a, b) => (state.bags[a] || 0) - (state.bags[b] || 0))[0];
    const raidFor = (h) => raidZonesFor(state, h).find((z) => z.loot.raid[0].item === want);
    const raider = [...regularsInTown(state), ...state.tavern.board].find((h) => raidFor(h));
    if (raider) {
      const zone = raidFor(raider);
      const fee = hireFee(raider, zone, zone.hours);
      if (fee <= state.copper * 0.3 && tryAct(() => hireHero(state, raider.id, zone.id, zone.hours, now))) { stats.heroFees += fee; stats.raids++; }
    }
  }

  // Heroes: fill every expedition slot while the bags have room, sharing the
  // slots between the professions' gathering. Each hero goes to the best zone
  // for that gathering: no more than one tier above what the profession is
  // leveling, and (for a smith's miners) only ore its forge can smelt.
  const smeltable = (z) => !has('blacksmithing') ||
    !recipes.some((r) => r.station === 'forge' && r.mats.some((m) => m.item === z.loot.mining[0].item) && forgeRankNeeded(state, r));
  const needs = profs.map((p) => ({ gathering: professionById[p].gathering, tier: lvls[p] ? lvls[p].r.tier : 1 }));
  const gatheringOut = (g) => state.tavern.expeditions.filter((e) => !zoneById[e.zoneId].raid && gatheredProfessions(e.hero, zoneById[e.zoneId]).includes(g)).length;
  while (freeSlots() >= 8 && state.tavern.expeditions.length < expeditionSlots(state)) {
    let hired = false;
    for (const need of [...needs].sort((a, b) => gatheringOut(a.gathering) - gatheringOut(b.gathering))) {
      const usable = (z, h) => z.loot[need.gathering] && h.skills[need.gathering] >= z.minSkill && z.tier <= need.tier + 1 &&
        (need.gathering !== 'mining' || smeltable(z));
      const first = gatheringOut(need.gathering) === 0;
      const rank = (z) => (first && z.tier !== need.tier ? 1 : 0);
      // Regulars in town come first: loyalty makes them cheaper and better.
      const options = [...regularsInTown(state), ...state.tavern.board].flatMap((h) => zonesFor(h).filter((z) => usable(z, h)).map((z) => ({ h, z })))
        .sort((a, b) => rank(a.z) - rank(b.z) || b.z.tier - a.z.tier);
      if (!options.length) continue;
      const { h, z } = options[0];
      const fee = hireFee(h, z, bot.every);
      if (fee > state.copper * 0.3 || !tryAct(() => hireHero(state, h.id, z.id, bot.every, now))) continue;
      stats.heroFees += fee;
      hired = true;
      break;
    }
    if (!hired) break;
  }

  // Forge: smelt all ore the forge's rank allows; make alloys only up to 40
  // bars, buying coal for steel.
  for (const r of recipes.filter((x) => has('blacksmithing') && x.station === 'forge' && !forgeRankNeeded(state, x))) {
    const alloy = r.mats.length > 1;
    if (alloy && (state.bags[r.makes.item] || 0) >= 40) continue;
    if (r.mats.some((m) => m.item === 'coal') && (state.bags.coal || 0) < 10 && (state.bags['iron-bar'] || 0) >= 10) tryAct(() => buyFromVendor(state, 'coal', 10));
    let n = maxCraftable(state, r.id);
    if (alloy) n = Math.min(n, Math.ceil((40 - (state.bags[r.makes.item] || 0)) / r.makes.qty));
    if (n > 0 && queueFree('forge')) tryAct(() => queueCraft(state, r.id, n, now));
  }

  // Flux for gear.
  if (has('blacksmithing') && (state.bags['smithing-flux'] || 0) < 6) tryAct(() => buyFromVendor(state, 'smithing-flux', 10));

  for (const p of profs) {
    // Intermediates (grit, cured hides) for the recipes that need them, buying
    // vendor goods like salt when short.
    for (const id of INTERMEDIATES[p]) {
      const r = recipeById[id];
      if (!knowsRecipe(state, r) || recipeColor(state, r) === 'red' || (state.bags[id] || 0) >= INTERMEDIATE_STOCK || !queueFree(r.station)) continue;
      const n = INTERMEDIATE_STOCK - (state.bags[id] || 0);
      if (maxCraftable(state, id) >= n || tryAct(() => buyMissing(state, r, n, state.copper * 0.1, now))) tryAct(() => queueCraft(state, id, n, now));
      else if (maxCraftable(state, id) > 0) tryAct(() => queueCraft(state, id, maxCraftable(state, id), now));
    }

    // Leveling: queue enough of the cheapest skill-up to reach its next color,
    // buying missing materials when they're affordable.
    const lvl = lvls[p];
    if (lvl && queueFree(lvl.r.station) && !state.stations[lvl.r.station].queue.some((o) => o.recipeId === lvl.r.id)) {
      const s = state.skills[p].skill;
      const nextColorAt = lvl.r.skill.find((n) => n > s) ?? s + 1;
      const capLeft = capOf(state, p) - s;
      const qty = Math.max(0, Math.min(20, Math.ceil(Math.min(nextColorAt - s, capLeft) / lvl.chance)));
      if (qty > 0) {
        const have = maxCraftable(state, lvl.r.id);
        if (have >= qty || tryAct(() => buyMissing(state, lvl.r, qty, spare() * 0.4, now))) {
          if (tryAct(() => queueCraft(state, lvl.r.id, qty, now))) stats.levelCrafts += qty;
        } else if (have > 0 && tryAct(() => queueCraft(state, lvl.r.id, have, now))) stats.levelCrafts += have;
      }
    }
  }

  // Crafting: the most profitable recipes the bags allow, up to a day's demand
  // of each item, counting what's already in bags, listed or queued.
  const ranked = recipes.filter((r) => stations.includes(r.station) && knowsRecipe(state, r) && recipeColor(state, r) !== 'red' && SELL_CATEGORIES.has(itemById[r.makes.item].category))
    .map((r) => ({ r, p: botProfit(state, r, now) })).filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
  const onHand = (itemId) => (state.bags[itemId] || 0) +
    playerListings(state).filter((x) => x.itemId === itemId).reduce((n, x) => n + x.listing.qty, 0) +
    stations.flatMap((s) => state.stations[s].queue).filter((o) => recipeById[o.recipeId].makes.item === itemId).reduce((n, o) => n + o.qty - o.done, 0);
  for (const { r } of ranked) {
    if (!queueFree(r.station)) continue;
    const room = Math.floor(demandPerHour(state, itemById[r.makes.item]) * 24) - onHand(r.makes.item);
    const n = Math.min(maxCraftable(state, r.id), room);
    if (n > 0) tryAct(() => queueCraft(state, r.id, n, now));
  }

  // Selling: finished goods, raw materials beyond what the bot can use, and
  // anything it bought to flip once the price is back near base.
  const mine = playerListings(state);
  for (const [itemId, have] of Object.entries(state.bags)) {
    const item = itemById[itemId];
    // Materials no recipe uses (herbs, hides, cloth, gems, essences from bonus loot) all go up for sale.
    const keep = usedMats.has(itemId) ? KEEP_MATS : 0;
    const surplus = (item.category === 'material' && have > keep) || item.category === 'scroll';
    const flipReady = (stats.flipStock[itemId] || 0) > 0 && undercutPrice(state, itemId) >= item.base * 0.95;
    if (!SELL_CATEGORIES.has(item.category) && !surplus && !flipReady) continue;
    const existing = mine.filter((x) => x.itemId === itemId);
    if (bot.relist) {
      // A relist takes units back to list them again: count them once, not twice.
      for (const x of existing) if (x.place > 0 && tryAct(() => cancelListing(state, itemId, x.listing.id))) { stats.relists++; stats.listed[itemId] -= x.listing.qty; }
    } else if (existing.length) continue;
    const listedNow = playerListings(state).filter((x) => x.itemId === itemId).reduce((n, x) => n + x.listing.qty, 0);
    let want = Math.min(state.bags[itemId] || 0, Math.ceil(demandPerHour(state, item) * bot.listHours) - listedNow);
    if (surplus && !SELL_CATEGORIES.has(item.category)) want = Math.min(want, have - keep);
    if (flipReady) want = Math.max(want, Math.min(state.bags[itemId] || 0, stats.flipStock[itemId]));
    if (want > 0) {
      const before = state.copper;
      if (tryAct(() => listItem(state, { itemId, qty: want, price: undercutPrice(state, itemId), hours: 24 }, now))) {
        stats.deposits += before - state.copper;
        stats.listed[itemId] = (stats.listed[itemId] || 0) + want;
        if (stats.flipStock[itemId]) stats.flipStock[itemId] = Math.max(0, stats.flipStock[itemId] - want);
      }
    }
  }

  // Read any recipe scroll the bot can use; the rest get sold above.
  for (const itemId of Object.keys(state.bags)) {
    if (itemById[itemId].teaches && tryAct(() => learnFromScroll(state, itemId))) stats.scrollsRead++;
  }

  // Junk from trips goes to the vendor.
  for (const [itemId, have] of Object.entries(state.bags)) {
    if (itemById[itemId].category === 'junk' && tryAct(() => sellToVendor(state, itemId, have))) stats.junkSold += have;
  }

  // Leveling junk: vendor finished goods beyond two days of demand.
  for (const [itemId, have] of Object.entries(state.bags)) {
    const item = itemById[itemId];
    if (!SELL_CATEGORIES.has(item.category)) continue;
    const extra = have - Math.max(2, Math.ceil(demandPerHour(state, item) * 48));
    if (extra > 0 && tryAct(() => sellToVendor(state, itemId, extra))) stats.vendored += extra;
  }

  // Flipping: buy listings under 80% of base value, spending at most a fifth
  // of the purse per item. They're relisted above once the price recovers.
  if (bot.flip) {
    for (const item of tradeableItems) {
      const cheap = state.market.items[item.id].listings.filter((l) => l.seller === 'npc' && l.price < item.base * 0.8);
      const qty = cheap.reduce((n, l) => n + l.qty, 0);
      if (!qty) continue;
      const afford = Math.min(qty, Math.floor((state.copper * 0.2) / item.base), roomFor(state, item.id));
      if (afford > 0 && tryAct(() => buyItems(state, item.id, afford, now))) {
        stats.flips += afford;
        stats.flipStock[item.id] = (stats.flipStock[item.id] || 0) + afford;
      }
    }
  }
}

function botRun(bot, seed) {
  const state = newGame({ name: bot.name, factionId: 'red', professionId: bot.prof, seed, now: START });
  const stats = { sold: {}, listed: {}, firstSale: null, heroFees: 0, deposits: 0, relists: 0, flips: 0, flipStock: {}, wingDays: [], raids: 0,
    levelCrafts: 0, vendored: 0, recipeSpend: 0, upgradeSpend: 0, upgradeLevels: 0, extrasSpend: 0, extrasBought: 0, scrollsRead: 0, junkSold: 0, rep: {}, commissions: 0, commissionGold: 0, gold: {}, skill: {}, reached: {}, flooded: {} };
  const checkpoints = [1, 3, 7, 14, 30, 60];
  for (let t = START; t <= START + RUN_DAYS * DAY; t += bot.every * HOUR) {
    botCheckIn(bot, state, t, stats);
    for (const item of tradeableItems) if (demandTag(state, item) === 'flooded') stats.flooded[item.id] = (stats.flooded[item.id] || 0) + 1;
    const s = state.skills[bot.prof];
    const reached = { skill75: s.skill >= 75, journeyman: s.rank >= 1, skill150: s.skill >= 150, skill300: s.skill >= 300,
      friendly: state.reputation >= 3000, expert: s.rank >= 2, artisan: s.rank >= 3,
      honored: state.reputation >= 9000, revered: state.reputation >= 21000, exalted: state.reputation >= 42000,
      second: state.player.professions.length >= 2, third: state.player.professions.length >= 3 };
    reached.all300 = reached.third && state.player.professions.every((p) => state.skills[p].skill >= 300);
    reached.gate = reached.all300 && reached.exalted;
    for (const [id, ok] of Object.entries(reached)) if (ok && stats.reached[id] === undefined) stats.reached[id] = (t - START) / DAY;
    const day = (t - START) / DAY;
    // SIM_TRACE=<bot name> prints that bot's state once a day.
    if (process.env.SIM_TRACE === bot.name && Number.isInteger(day)) {
      console.log(`  trace ${bot.name} d${day}: ${state.player.professions.map((p) => `${p.slice(0, 5)} ${state.skills[p].skill}/${capOf(state, p)}`).join(', ')}; ${gsc(state.copper)}; bags ${slotsUsed(state)}/${bagSlots(state)} mail ${Object.keys(state.mailbox.items).length}; q ${Object.values(state.stations).filter((s) => s.queue).map((s) => s.queue.length).join("")}; rep ${state.reputation}; out ${state.tavern.expeditions.map((e) => zoneById[e.zoneId].tier).join(',')}; lvl ${state.player.professions.map((p) => { const l = levelingRecipe(state, t, p); return l ? `${l.r.id}(${(state.bags[l.r.mats[0].item] || 0)})` : '-'; }).join(' ')}`);
    }
    if (checkpoints.includes(day)) { stats.gold[day] = state.copper; stats.skill[day] = s.skill; stats.rep[day] = state.reputation; }
  }
  stats.checkIns = Math.floor((RUN_DAYS * 24) / bot.every) + 1;
  stats.finalSkills = state.player.professions.map((p) => `${p.slice(0, 5)} ${state.skills[p].skill}`).join(', ');
  const regs = state.tavern.regulars;
  stats.regulars = regs.length;
  stats.bestLoyalty = Math.max(0, ...regs.map((r) => r.loyalty));
  stats.topLevel = Math.max(0, ...regs.map((r) => r.level));
  return stats;
}

const gsc = (c) => `${(c / 10000).toFixed(1)}g`;

function botReport() {
  console.log(`\n4. BOT PLAYERS (${RUN_DAYS} days, real check-ins, 2 seeds averaged; gold in hand)`);
  console.log(`${pad('bot', 10)}${['day 1', 'day 3', 'day 7', 'day 14', 'day 30', 'day 60'].map((d) => lpad(d, 9)).join('')}${lpad('1st sale', 10)}${lpad('hero fees', 11)}${lpad('deposits', 10)}`);
  const problems = [];
  const allListed = {};
  const allSold = {};
  const pacing = [];
  for (const bot of BOTS) {
    const runs = [101, 202].map((seed) => botRun(bot, seed));
    const avg = (f) => runs.reduce((n, r) => n + f(r), 0) / runs.length;
    const gold = [1, 3, 7, 14, 30, 60].map((d) => lpad(gsc(avg((r) => r.gold[d] ?? 0)), 9)).join('');
    const first = avg((r) => r.firstSale ?? 60 * DAY) / (60 * 1000);
    console.log(`${pad(bot.name, 10)}${gold}${lpad(`${Math.round(first)} min`, 10)}${lpad(gsc(avg((r) => r.heroFees)), 11)}${lpad(gsc(avg((r) => r.deposits)), 10)}`);
    console.log(`${pad('', 10)}skill ${[1, 3, 7, 14, 30, 60].map((d) => `d${d} ${Math.round(avg((r) => r.skill[d] ?? 0))}`).join(', ')}` +
      `; reputation d7 ${Math.round(avg((r) => r.rep[7] ?? 0))}, d30 ${Math.round(avg((r) => r.rep[30] ?? 0))}; ${Math.round(avg((r) => r.commissions))} commissions (${gsc(avg((r) => r.commissionGold))})` +
      `; ${Math.round(avg((r) => r.levelCrafts))} leveling crafts, ${Math.round(avg((r) => r.vendored))} vendored, ${gsc(avg((r) => r.recipeSpend))} on recipes, ${gsc(avg((r) => r.upgradeSpend))} on ${avg((r) => r.upgradeLevels).toFixed(0)} upgrade levels, ${gsc(avg((r) => r.extrasSpend))} on gold sinks (${avg((r) => r.extrasBought).toFixed(0)} of 13 bought)`);
    for (const r of runs) {
      for (const [id, n] of Object.entries(r.listed)) allListed[id] = (allListed[id] || 0) + n;
      for (const [id, n] of Object.entries(r.sold)) allSold[id] = (allSold[id] || 0) + n;
    }
    const flooded = Object.entries(runs[0].flooded).filter(([, n]) => n > runs[0].checkIns * 0.25).map(([id]) => itemById[id].name);
    if (flooded.length) console.log(`${pad('', 10)}flooded over 25% of the time: ${flooded.join(', ')}`);
    console.log(`${pad('', 10)}${avg((r) => r.scrollsRead).toFixed(1)} recipe scrolls read, ${Math.round(avg((r) => r.junkSold))} junk vendored, ` +
      `${avg((r) => r.regulars).toFixed(1)} regulars (best loyalty ${avg((r) => r.bestLoyalty).toFixed(1)}, top level ${Math.round(avg((r) => r.topLevel))})`);
    if (bot.flip) console.log(`${pad('', 10)}flipped ${Math.round(avg((r) => r.flips))} units`);
    console.log(`${pad('', 10)}day ${RUN_DAYS}: ${runs.map((r) => r.finalSkills).join(' | ')}; ${avg((r) => r.raids).toFixed(0)} raids`);
    // Phase 3 gate: Exalted with all three professions at 300 in 6 to 8 weeks.
    if (GATE_BOTS.has(bot.name)) {
      for (const r of runs) {
        const d = r.reached.gate;
        if (d === undefined || d > 56 || d < 42) problems.push(`${bot.name} bot: Exalted with all three at 300 on ${d === undefined ? 'no day' : `day ${d.toFixed(1)}`} (gate: day 42-56)`);
      }
    }
    if (avg((r) => r.gold[60]) < tuning.startingCopper) problems.push(`${bot.name} bot ends with less gold than it started with`);
    pacing.push({ runs, first });
  }

  // Pacing targets from DESIGN.md. Phase 2 content is still being built, so
  // misses show here but don't count as problems until the Phase 2 gate.
  console.log('\nPacing (day each milestone was reached, one column per seed):');
  console.log(`${pad('milestone', 14)}${lpad('target', 8)}${BOTS.map((b) => lpad(b.name, 18)).join('')}`);
  const fmt = (d) => (d === undefined ? 'never' : d.toFixed(1));
  console.log(`${pad('first sale', 14)}${lpad('5 min', 8)}${pacing.map((p) => lpad(`${Math.round(p.first)} min`, 18)).join('')}`);
  for (const m of MILESTONES) {
    console.log(`${pad(m.label, 14)}${lpad(m.target ? `day ${m.target}` : '', 8)}${pacing.map((p) => lpad(p.runs.map((r) => fmt(r.reached[m.id])).join(' / '), 18)).join('')}`);
  }

  console.log('\nItems the bots listed vs sold (all bots):');
  for (const [id, n] of Object.entries(allListed).sort((a, b) => b[1] - a[1])) {
    const sold = allSold[id] || 0;
    console.log(`  ${pad(itemById[id].name, 24)}${lpad(n, 7)} listed${lpad(sold, 7)} sold (${Math.round((sold / n) * 100)}%)`);
    if (sold === 0) problems.push(`${itemById[id].name}: bots listed ${n} and never sold one`);
  }
  return problems;
}

// ---- 5. First session -----------------------------------------------------------
// A brand-new player of each profession follows the tutorial, looking at the
// game every 30 seconds for the first hour. Checks the first-sale target.

const FIRST_BUY = { blacksmithing: 'copper-ore', leatherworking: 'soft-leather', alchemy: 'dawnpetal' };

function sessionAct(state, now, stats) {
  const tryAct = (fn) => { try { return fn(); } catch { return null; } };
  const prof = state.player.professions[0];
  const step = tutorialStep(state);
  if (!step) return;
  const busy = (station) => state.stations[station].queue.length > 0;
  const craft = (id) => {
    const r = recipeById[id];
    if (busy(r.station)) return;
    if (tryAct(() => queueCraft(state, id, 1, now))) return;
    // Missing an intermediate (grit, cured hide): make that first.
    for (const m of r.mats) {
      if ((state.bags[m.item] || 0) >= m.qty) continue;
      const maker = recipes.find((x) => x.makes.item === m.item && knowsRecipe(state, x));
      if (maker) tryAct(() => queueCraft(state, maker.id, m.qty, now));
    }
  };
  if (step.goal === 'craft') craft(step.recipe);
  if (step.goal === 'list') {
    const sell = Object.keys(state.bags).find((id) => SELL_CATEGORIES.has(itemById[id].category));
    if (sell) tryAct(() => listItem(state, { itemId: sell, qty: 1, price: undercutPrice(state, sell), hours: 2 }, now));
  }
  if (step.goal === 'buy') tryAct(() => buyItems(state, FIRST_BUY[prof], 2, now));
  if (step.goal === 'smelt') tryAct(() => smeltAtCity(state, 'smelt-copper', 1));
  if (step.goal === 'learn') {
    const offer = trainerRecipes(state, prof).find((o) => o.ready);
    if (offer) tryAct(() => learnRecipe(state, offer.recipe.id));
    else {
      // Keep crafting for skill with whatever the bags allow.
      const r = recipes.find((x) => recipeProfession(x) === prof && knowsRecipe(state, x) && recipeColor(state, x) === 'orange' && maxCraftable(state, x.id) > 0);
      if (r) craft(r.id);
    }
  }
  if (step.goal === 'hire') {
    const h = state.tavern.board[0];
    tryAct(() => hireHero(state, h.id, zonesFor(h)[0].id, 0.25, now));
  }
  while (tutorialStep(state) && stepMet(state)) claimTutorialStep(state, now);
  if (!tutorialStep(state) && stats.doneAt === null) stats.doneAt = now - START;
}

function firstSession() {
  console.log('\n5. FIRST SESSION (a new player follows the tutorial, looking every 30 s; 3 seeds)');
  console.log(`${pad('profession', 16)}${lpad('first sale', 14)}${lpad('tutorial done', 16)}${lpad('gold after 1 h', 16)}`);
  const problems = [];
  for (const prof of ['blacksmithing', 'leatherworking', 'alchemy']) {
    const rows = [301, 302, 303].map((seed) => {
      const state = newGame({ name: 'New', factionId: seed % 2 ? 'red' : 'blue', professionId: prof, seed, now: START });
      const stats = { firstSale: null, doneAt: null };
      for (let t = START; t <= START + HOUR; t += 30 * 1000) {
        const sum = catchUp(state, t);
        if (sum.firstSaleAt && stats.firstSale === null) stats.firstSale = sum.firstSaleAt - START;
        collectMailbox(state);
        sessionAct(state, t, stats);
      }
      return { ...stats, copper: state.copper };
    });
    const fmt = (ms) => (ms === null ? 'never' : `${(ms / 60000).toFixed(1)} min`);
    console.log(`${pad(prof, 16)}${lpad(rows.map((r) => fmt(r.firstSale)).join(' / '), 14 + 14)}${lpad(rows.map((r) => fmt(r.doneAt)).join(' / '), 30)}${lpad(gsc(rows.reduce((n, r) => n + r.copper, 0) / rows.length), 12)}`);
    for (const r of rows) {
      if (r.firstSale === null || r.firstSale > 5 * 60 * 1000) problems.push(`${prof}: first sale took ${fmt(r.firstSale)} (target under 5 min)`);
      if (r.doneAt === null) problems.push(`${prof}: a new player didn't finish the tutorial in the first hour`);
    }
  }
  return problems;
}

// ---- Run ------------------------------------------------------------------

const started = Date.now();
// SIM_ONLY=bots runs just the bot players (quicker while tuning).
const problems = process.env.SIM_ONLY === 'bots' ? botReport()
  : [...quietMarket(), ...floodTest(), ...priceVsSpeed(), ...botReport(), ...firstSession()];
console.log(`\nAuction house cut ${tuning.market.cut * 100}%. Ran in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n- ${problems.join('\n- ')}` : '\nNo problems found.');
process.exitCode = problems.length ? 1 : 0;
