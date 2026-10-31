// Quick checks for the clock, catch-up, random generator and saves.
// Run from the repo folder:  node tools/engine-check.js
// Prints PASS or FAIL for each check. Run it after changing anything in js/engine/.

import { newGame, debugFastForward, catchUp, collectMailbox, SAVE_VERSION } from '../js/engine/game.js';
import { listItem, undercutPrice, lowestOtherPrice, quoteBuy, buyItems, sellToVendor } from '../js/engine/trading.js';
import { queueCraft, cancelOrder, smeltAtCity } from '../js/engine/crafting.js';
import { hireHero, zonesFor, expectedHaul, hireFee, regularsInTown } from '../js/engine/heroes.js';
import { tuning } from '../data/tuning.js';
import { zoneById } from '../data/zones.js';
import { itemById } from '../data/items.js';
import { roomFor, addOrMail } from '../js/engine/bags.js';
import { saleProceeds } from '../js/engine/market.js';
import { advance, schedule, TICK_MS } from '../js/engine/clock.js';
import { createRng, rngNext } from '../js/engine/rng.js';
import { recipeColor, nextTraining, trainRank, debugSetSkill, learnRecipe, trainerRecipes, learnFromScroll, debugUnlockProfessions } from '../js/engine/skills.js';
import { recipes, recipeById } from '../data/recipes.js';
import { ranks } from '../data/professions.js';
import { encodeExport, decodeExport, migrate, writeSave, readSave } from '../js/engine/save.js';

const H = 60 * 60 * 1000;
const DAY = 24 * H;
const t0 = Date.UTC(2026, 9, 30, 12, 3); // 3 minutes past a tick mark

let failures = 0;
function check(name, ok, detail = '') {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const game = (seed = 1, now = t0) => newGame({ name: 'Test', factionId: 'red', seed, now });
// Marks every recipe learned, for checks that aren't about learning.
const learnAll = (s) => { for (const r of recipes) s.knownRecipes[r.id] = true; return s; };
const rollEachTick = { tick: (s) => rngNext(s.rng), freshMarket() {}, timers: {} };

// Ticks land on every 10-minute mark.
{
  const s = game();
  const sum = advance(s, t0 + 8 * H, rollEachTick);
  check('8 hours runs 48 market ticks', sum.ticks === 48, `got ${sum.ticks}`);
  check('ticks sit on 10-minute marks', s.clock.lastTickAt % TICK_MS === 0);
}

// Timers fire in time order, and before a tick at the same moment.
{
  const s = game();
  const order = [];
  const handlers = {
    tick: (st, at) => order.push(`tick@${(at - t0) / 60000}`),
    freshMarket() {},
    timers: { x: (st, timer) => order.push(`timer${timer.data.n}@${(timer.at - t0) / 60000}`) },
  };
  schedule(s, 'x', t0 + 2 * H, { n: 2 });
  schedule(s, 'x', t0 + 17 * 60000, { n: 1 }); // same moment as the 12:20 tick
  advance(s, t0 + 3 * H, handlers);
  const want = ['tick@7', 'timer1@17', 'tick@17'];
  check('timer fires before a tick at the same time', want.every((e, i) => order[i] === e), order.slice(0, 3).join(', '));
  check('later timer fires at its own time', order.includes('timer2@120'));
  check('fired timers are removed', s.timers.every((t) => t.type !== 'x'));
}

// Catching up in many small steps gives exactly the same result as one big step.
{
  const a = game(7);
  const b = game(7);
  advance(a, t0 + 50 * H, rollEachTick);
  for (let i = 1; i <= 50; i++) advance(b, t0 + i * H - 7777, rollEachTick);
  advance(b, t0 + 50 * H, rollEachTick);
  check('split catch-up matches one big catch-up', JSON.stringify(a) === JSON.stringify(b));
}

// The 7-day limit.
{
  const s7 = game();
  const sum7 = advance(s7, t0 + 7 * DAY, rollEachTick);
  check('7 days away replays every tick', sum7.ticks === 7 * 24 * 6 && !sum7.freshMarket, `got ${sum7.ticks}`);

  const s8 = game();
  let fresh = false;
  let fired = false;
  schedule(s8, 'x', t0 + 3 * DAY);
  const sum8 = advance(s8, t0 + 8 * DAY, {
    tick() {}, freshMarket() { fresh = true; }, timers: { x() { fired = true; } },
  });
  check('8 days away starts a fresh market', fresh && sum8.freshMarket && sum8.ticks === 0);
  check('8 days away still finishes timers', fired && s8.timers.length === 0);
}

// Clock going backwards (phone clock changed) does nothing.
{
  const s = game();
  const sum = advance(s, t0 - H, rollEachTick);
  check('clock going backwards is ignored', sum.ticks === 0 && s.clock.lastSeenAt === t0);
}

// Random generator replays exactly from its seed.
{
  const a = createRng(12345);
  const b = createRng(12345);
  const sa = Array.from({ length: 5 }, () => rngNext(a));
  const sb = Array.from({ length: 5 }, () => rngNext(b));
  check('same seed gives the same numbers', sa.join() === sb.join());
  check('numbers are between 0 and 1', sa.every((n) => n >= 0 && n < 1));
}

// Debug fast-forward.
{
  const now = Date.now();
  const s = game(1, now);
  const sum = debugFastForward(s, now, 24);
  check('fast-forward 24 h runs 144 ticks', sum.ticks === 144, `got ${sum.ticks}`);
  check('fast-forward summary covers 24 h', sum.to - sum.from === 24 * H);
}

// Saves.
{
  const s = game();
  advance(s, t0 + 5 * H, rollEachTick);
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  writeSave(storage, s);
  check('save key starts with undercut:', [...store.keys()].every((k) => k.startsWith('undercut:')));
  check('save loads back unchanged', JSON.stringify(readSave(storage)) === JSON.stringify(s));

  const code = encodeExport(s);
  check('export code loads back unchanged', JSON.stringify(decodeExport(code)) === JSON.stringify(s));
  check('export code survives spaces and line breaks', JSON.stringify(decodeExport(`  ${code.slice(0, 50)}\n${code.slice(50)} `)) === JSON.stringify(s));

  const parts = code.split('.');
  const damaged = `${parts[0]}.${parts[1].slice(0, -12)}AAAA.${parts[2]}`;
  let rejected = false;
  try { decodeExport(damaged); } catch { rejected = true; }
  check('damaged export code is rejected', rejected);

  let futureRejected = false;
  try { migrate({ ...s, version: s.version + 1 }); } catch { futureRejected = true; }
  check('save from a newer version is rejected', futureRejected);
}

// ---- Phase 1: trading, crafting, smelting, tavern, bags -------------------

const real = (state) => state.clock.lastSeenAt; // game time = real time here (no offset)

// Selling: deposit taken, sale pays price minus 5% cut plus the deposit back.
{
  const s = game(3);
  catchUp(s, t0 + H);
  s.bags['copper-bar'] = 10;
  const copperBefore = s.copper;
  const price = undercutPrice(s, 'copper-bar');
  const listing = listItem(s, { itemId: 'copper-bar', qty: 10, price, hours: 24 }, real(s));
  check('listing takes items and deposit', !s.bags['copper-bar'] && s.copper === copperBefore - listing.deposit);
  check('undercut price is below the lowest other listing', price < lowestOtherPrice(s, 'copper-bar') || lowestOtherPrice(s, 'copper-bar') === 1);
  catchUp(s, t0 + 13 * H);
  const sold = 10 - listing.qty;
  const paid = sold * (price - Math.floor(price * 0.05)) + Math.floor((listing.deposit * sold) / 10);
  check('undercut listing sells within 12 h', sold > 0, `${sold} of 10 sold`);
  check('sales land in the mailbox, minus the cut, plus deposit back', s.mailbox.copper === paid, `${s.mailbox.copper} vs ${paid}`);
  collectMailbox(s);
  check('collect moves mailbox gold to purse', s.mailbox.copper === 0 && s.copper === copperBefore - listing.deposit + paid);
}

// A listing that sells out returns the whole deposit, even when the deposit is
// smaller than the quantity, and cheap items pay no cut.
{
  const listing = { startQty: 20, qty: 20, deposit: 16 };
  let paid = 0;
  for (let i = 0; i < 20; i++) { listing.qty--; paid += saleProceeds(listing, 5); }
  check('selling out returns the full deposit', paid === 20 * 5 + 16, `${paid} vs ${20 * 5 + 16}`);
}

// Listing too high never sells, and expires back to the mailbox.
{
  const s = game(4);
  catchUp(s, t0 + H);
  s.bags['rough-stone'] = 5;
  const listing = listItem(s, { itemId: 'rough-stone', qty: 5, price: 500, hours: 2 }, real(s));
  catchUp(s, t0 + 4 * H);
  check('overpriced listing does not sell', listing.qty === 5);
  check('expired listing comes back to the mailbox', s.mailbox.items['rough-stone'] === 5);
}

// Buying takes the cheapest listings first and costs what the quote said.
{
  const s = game(5);
  catchUp(s, t0 + H);
  s.copper = 100000;
  const quote = quoteBuy(s, 'tin-ore', 30);
  const before = s.copper;
  buyItems(s, 'tin-ore', 30, real(s));
  check('buying costs exactly the quote', before - s.copper === quote.cost && s.bags['tin-ore'] === 30);
  let threw = false;
  try { buyItems(s, 'tin-ore', 1e6, real(s)); } catch { threw = true; }
  check('buying more than is listed is refused', threw);
}

// Crafting keeps going while away, exactly on time.
{
  const s = game(6);
  s.bags = { 'rough-stone': 20 };
  s.skills.blacksmithing.skill = 10;
  learnAll(s);
  queueCraft(s, 'rough-honing-stone', 10, t0); // 5 s each
  queueCraft(s, 'rough-grit', 5, t0); // 5 s each, 2 stone each
  check('queueing takes materials', !s.bags['rough-stone']);
  catchUp(s, t0 + 49 * 1000);
  check('9 honing stones done after 49 s', s.bags['rough-honing-stone'] === 9, `got ${s.bags['rough-honing-stone']}`);
  catchUp(s, t0 + 75 * 1000);
  check('whole queue done after 75 s', s.bags['rough-honing-stone'] === 10 && s.bags['rough-grit'] === 5 && !s.stations.anvil.queue.length);
}

// Cancelling an order returns materials for unmade units.
{
  const s = game(7);
  s.bags = { 'copper-ore': 10 };
  const order = queueCraft(s, 'smelt-copper', 10, t0); // 20 s each
  catchUp(s, t0 + 45 * 1000);
  cancelOrder(s, 'forge', order.id, t0 + 45 * 1000);
  check('cancel returns unused ore', s.bags['copper-ore'] === 8 && s.bags['copper-bar'] === 2);
}

// City Smelter: instant, fee is 25% of the bars' base value.
{
  const s = game(8);
  s.bags = { 'copper-bar': 3, 'tin-bar': 3 };
  const before = s.copper;
  smeltAtCity(s, 'alloy-bronze', 3);
  check('smelter makes bronze instantly', s.bags['bronze-bar'] === 6 && !s.bags['copper-bar']);
  check('smelter fee is 25% of bar value', before - s.copper === Math.ceil(36 * 0.25 * 6));
}

// Tavern: hire a miner, the haul arrives in the mailbox when they return.
{
  const s = game(9);
  s.copper = 100000;
  const hero = s.tavern.board.find((h) => zonesFor(h).length);
  const zone = zonesFor(hero)[0];
  hireHero(s, hero.id, zone.id, 1, t0);
  check('hiring takes the hero off the board', !s.tavern.board.some((h) => h.id === hero.id) && s.tavern.expeditions.length === 1);
  catchUp(s, t0 + 2 * H);
  const got = Object.values(s.mailbox.items).reduce((a, b) => a + b, 0);
  check('hero returns with a haul', s.tavern.expeditions.length === 0 && got > 0, `${got} items`);
  catchUp(s, t0 + 5 * H);
  check('board refreshes after 4 hours', s.tavern.board.length === 3);
}

// Skill: recipe colors, skill-ups on finished crafts, rank caps and training.
{
  const s = learnAll(game(11));
  const cleaver = recipeById['copper-cleaver']; // skill [1, 16, 26, 36]
  const colors = [1, 16, 26, 36].map((n) => { s.skills.blacksmithing.skill = n; return recipeColor(s, cleaver); });
  check('recipe colors follow its skill levels', colors.join() === 'orange,yellow,green,gray', colors.join());
  check('smelting has no color', recipeColor(s, recipeById['smelt-copper']) === null);
  s.skills.blacksmithing.skill = 1;
  let threw = false;
  try { queueCraft(s, 'copper-plate-cuffs', 1, t0); } catch { threw = true; }
  check('a recipe above your skill is refused', threw);

  s.bags = { 'rough-stone': 20 };
  queueCraft(s, 'rough-grit', 10, t0); // orange until 16: every craft is +1
  const sum = catchUp(s, t0 + 60 * 1000);
  check('orange crafts give +1 skill each', s.skills.blacksmithing.skill === 11 && sum.skillUps.blacksmithing?.to === 11,
    `skill ${s.skills.blacksmithing.skill}`);
  s.bags = { 'copper-ore': 5 };
  queueCraft(s, 'smelt-copper', 5, t0 + 60 * 1000);
  catchUp(s, t0 + 4 * 60 * 1000);
  check('smelting gives no skill', s.skills.blacksmithing.skill === 11);
}
{
  const s = learnAll(game(12));
  debugSetSkill(s, 'blacksmithing', 75);
  s.bags = { 'coarse-stone': 12 };
  queueCraft(s, 'coarse-balance-weight', 3, t0); // orange, but Apprentice caps skill at 75
  const sum = catchUp(s, t0 + 60 * 1000);
  check('skill stops at the rank cap', s.skills.blacksmithing.skill === 75 && sum.skillCapped.blacksmithing === true);
  s.copper = ranks[1].cost - 1;
  check('training needs the gold', nextTraining(s, 'blacksmithing').reason === 'Not enough gold.');
  s.copper = ranks[1].cost + 500;
  trainRank(s, 'blacksmithing');
  check('training Journeyman costs its price and lifts the cap', s.copper === 500 && s.skills.blacksmithing.rank === 1);
  queueCraft(s, 'coarse-balance-weight', 3, t0 + 60 * 1000);
  catchUp(s, t0 + 2 * 60 * 1000);
  check('skill rises again after training', s.skills.blacksmithing.skill === 78, `skill ${s.skills.blacksmithing.skill}`);
  s.reputation = 0;
  debugSetSkill(s, 'blacksmithing', 150);
  s.copper = 1e7;
  check('Expert training needs Friendly standing', /Friendly/.test(nextTraining(s, 'blacksmithing').reason));
}

// Bags: stacks of 20, gear one per slot, overflow waits in the mailbox.
{
  const s = game(10);
  s.bags = {};
  check('empty bags fit 48 stacks', roomFor(s, 'copper-ore') === 48 * 20);
  s.bags = { 'copper-cleaver': 47 };
  addOrMail(s, 'copper-cleaver', 3);
  check('full bags overflow to the mailbox', s.bags['copper-cleaver'] === 48 && s.mailbox.items['copper-cleaver'] === 2);
}

// Recipes: start with a few, buy the rest from the trainer once skill allows.
{
  const s = game(13);
  check('a new shop knows the starting recipes', s.knownRecipes['rough-grit'] && s.knownRecipes['copper-cleaver'] && !s.knownRecipes['rough-honing-stone']);
  s.bags = { 'rough-stone': 10 };
  s.skills.blacksmithing.skill = 10;
  let threw = false;
  try { queueCraft(s, 'rough-honing-stone', 1, t0); } catch { threw = true; }
  check('an unlearned recipe is refused', threw);
  s.bags = { 'copper-ore': 2 };
  check('smelting needs no learning', queueCraft(s, 'smelt-copper', 1, t0) !== undefined);
  s.skills.blacksmithing.skill = 5;
  check('the trainer waits for your skill', /skill 10/.test(trainerRecipes(s, 'blacksmithing').find((o) => o.recipe.id === 'rough-honing-stone').reason));
  s.skills.blacksmithing.skill = 10;
  const before = s.copper;
  learnRecipe(s, 'rough-honing-stone');
  check('learning costs the trainer price', before - s.copper === recipeById['rough-honing-stone'].learn && s.knownRecipes['rough-honing-stone']);
  threw = false;
  try { learnRecipe(s, 'rough-honing-stone'); } catch { threw = true; }
  check('a recipe can only be learned once', threw);
}
{
  const v4 = game(14);
  v4.version = 4;
  delete v4.knownRecipes;
  v4.skills.blacksmithing.skill = 32;
  const s = migrate(JSON.parse(JSON.stringify(v4)));
  check('version 4 save keeps recipes its skill could already make',
    s.knownRecipes['copper-ringmail-vest'] && s.knownRecipes['rough-balance-weight'] && !s.knownRecipes['copper-plate-cuffs']);
}

// Forge: higher ores need a rank at your own forge; the City Smelter doesn't care.
{
  const s = game(15);
  s.bags = { 'iron-ore': 4 };
  let threw = false;
  try { queueCraft(s, 'smelt-iron', 2, t0); } catch { threw = true; }
  check('an Apprentice forge refuses iron', threw);
  smeltAtCity(s, 'smelt-iron', 1);
  check('the City Smelter smelts iron at any rank', s.bags['iron-bar'] === 1);
  debugSetSkill(s, 'blacksmithing', 80); // Journeyman
  check('a Journeyman forge smelts iron', queueCraft(s, 'smelt-iron', 2, t0) !== undefined);
}

// Tavern: the first hero on the board suits the tier you're crafting in.
{
  const fresh = game(16);
  check('a new shop gets a tier 1 hero first', fresh.tavern.board[0].level <= 15, `level ${fresh.tavern.board[0].level}`);
  const s = learnAll(game(17));
  debugSetSkill(s, 'blacksmithing', 160);
  catchUp(s, t0 + 4 * H + 60000); // board refresh
  const lv = s.tavern.board[0].level;
  check('at skill 160 the first hero suits tier 3', lv >= 25 && lv <= 35, `level ${lv}`);
}

// New items in a content update join an old save's market instead of crashing it.
{
  const s = game(18);
  delete s.market.items['starmetal-bar'];
  delete s.market.items['iron-ore'];
  let ok = true;
  try { catchUp(s, t0 + 2 * H); } catch { ok = false; }
  check('an old market gains new items on load', ok && s.market.items['starmetal-bar'] && s.market.items['iron-ore'].listings.length > 0);
}

// Gathering: herbalists and skinners, two-profession heroes, bonus loot.
{
  const s = game(19);
  s.copper = 1e6;
  const hero = { id: 999, name: 'Test', race: 'orc', classId: 'warrior', level: 10, skills: { herbalism: 60, skinning: 60 } };
  const glade = zoneById['fernwhistle-glade'];
  check('a herbalist-skinner can go to the glade but not the mine', zonesFor(hero).includes(glade) && !zonesFor(hero).some((z) => z.loot.mining));
  const both = expectedHaul(hero, glade, 4);
  const solo = expectedHaul({ ...hero, skills: { herbalism: 60 } }, glade, 4);
  const qty = (h, id) => h.find((x) => x.item === id)?.qty ?? 0;
  check('two professions gather both, each at 60%', qty(both, 'boar-hide') > 0 && Math.abs(qty(both, 'dawnpetal') - qty(solo, 'dawnpetal') * 0.6) <= 1,
    `${qty(both, 'dawnpetal')} vs ${qty(solo, 'dawnpetal')}`);
  s.tavern.board.push(hero);
  hireHero(s, 999, 'fernwhistle-glade', 8, t0);
  catchUp(s, t0 + 9 * H);
  const got = Object.keys(s.mailbox.items);
  check('a trip brings home herbs and hides', got.includes('dawnpetal') && got.includes('soft-leather'));
  check('every trip brings bonus loot from its tier', got.some((id) => itemById[id].loot && itemById[id].tier === 1));
}
{
  const s = game(20);
  s.bags = { 'bent-horseshoe': 2 };
  let threw = false;
  try { listItem(s, { itemId: 'bent-horseshoe', qty: 1, price: 50, hours: 2 }, t0); } catch { threw = true; }
  check('junk cannot be listed on the auction house', threw && !s.market.items['bent-horseshoe']);
  const before = s.copper;
  sellToVendor(s, 'bent-horseshoe', 2);
  check('junk sells to a vendor', s.copper - before === 2 * Math.floor(20 * 0.25));
  s.bags = { 'scroll-copper-spurred-knuckles': 1 };
  s.skills.blacksmithing.skill = 20;
  threw = false;
  try { learnFromScroll(s, 'scroll-copper-spurred-knuckles'); } catch { threw = true; }
  check('a scroll waits for the skill it needs', threw && s.bags['scroll-copper-spurred-knuckles'] === 1);
  s.skills.blacksmithing.skill = 35;
  learnFromScroll(s, 'scroll-copper-spurred-knuckles');
  check('reading a scroll teaches the recipe and uses it up', s.knownRecipes['copper-spurred-knuckles'] && !s.bags['scroll-copper-spurred-knuckles']);
  check('scroll recipes are not sold by the trainer', !trainerRecipes(s, 'blacksmithing').some((o) => o.recipe.learn === 'scroll'));
}

// Regulars: the first hire makes a regular; re-hires build loyalty; trips earn levels.
{
  const s = game(21);
  s.copper = 1e7;
  const hero = s.tavern.board[0];
  const zone = zonesFor(hero)[0];
  const firstFee = hireFee(hero, zone, 8);
  hireHero(s, hero.id, zone.id, 8, t0);
  const reg = () => s.tavern.regulars.find((r) => r.id === hero.id);
  check('a first hire makes the hero a regular', reg() && reg().loyalty === 0 && !s.tavern.board.some((h) => h.id === hero.id));
  const sum = catchUp(s, t0 + 9 * H);
  check('a trip earns levels', reg().level === hero.level + 1 && sum.lines.some((l) => l.includes('is now level')), `level ${reg().level}`);
  check('a regular just home is in town', regularsInTown(s).some((r) => r.id === hero.id));
  hireHero(s, hero.id, zonesFor(reg())[0].id, 8, t0 + 9 * H); // a level gained can move them to the next band
  check('hiring again adds loyalty', reg().loyalty === 1);
  catchUp(s, t0 + 18 * H);
  const loyal = { ...reg(), level: hero.level, skills: { ...hero.skills } };
  check('loyalty cuts the fee 4% a level', hireFee(loyal, zone, 8) === Math.round(firstFee * (1 - tuning.tavern.regulars.feeCutPerLoyalty)), `${hireFee(loyal, zone, 8)} vs ${firstFee}`);
  const more = expectedHaul({ ...loyal, loyalty: 5 }, zone, 8).reduce((n, h) => n + h.qty, 0);
  const base = expectedHaul({ ...loyal, loyalty: 0 }, zone, 8).reduce((n, h) => n + h.qty, 0);
  check('loyalty raises the haul', more > base, `${more} vs ${base}`);
}
{
  const s = game(22);
  s.copper = 1e8;
  const max = tuning.tavern.regulars.max;
  for (let i = 0; i < max + 2; i++) {
    const h = s.tavern.board.find((x) => zonesFor(x).length);
    if (!h) { catchUp(s, s.clock.lastSeenAt + 4 * H + 60000); i--; continue; }
    const now = s.clock.lastSeenAt;
    hireHero(s, h.id, zonesFor(h)[0].id, 0.25, now);
    catchUp(s, now + 0.5 * H);
  }
  check(`the tavern remembers at most ${max} regulars`, s.tavern.regulars.length === max, `${s.tavern.regulars.length}`);
}

// Three professions: you start with one; the others are locked until a wing opens.
{
  const s = newGame({ name: 'Tan', factionId: 'blue', professionId: 'leatherworking', seed: 23, now: t0 });
  check('a leatherworker starts with hides and thread', s.bags['boar-hide'] > 0 && s.bags['waxed-thread'] > 0 && !s.bags['copper-bar']);
  check('a leatherworker\'s first hero is a skinner', 'skinning' in s.tavern.board[0].skills);
  queueCraft(s, 'cured-boar-hide', 2, t0);
  catchUp(s, t0 + 60 * 1000);
  check('workbench crafts raise Leatherworking', s.skills.leatherworking.skill === 3 && s.bags['cured-boar-hide'] === 2 && s.skills.blacksmithing.skill === 1);
  s.bags['rough-stone'] = 4;
  let threw = false;
  try { queueCraft(s, 'rough-grit', 1, t0 + 60 * 1000); } catch { threw = true; }
  check('a profession you don\'t have is refused', threw);
  debugUnlockProfessions(s);
  check('opening all professions allows the anvil', queueCraft(s, 'rough-grit', 1, t0 + 60 * 1000) !== undefined);
}
{
  const s = learnAll(newGame({ name: 'Alc', factionId: 'red', professionId: 'alchemy', seed: 24, now: t0 }));
  check('an alchemist\'s first hero is a herbalist', 'herbalism' in s.tavern.board[0].skills);
  debugSetSkill(s, 'alchemy', 180);
  s.bags = { 'iron-bar': 4, ironleaf: 2 };
  queueCraft(s, 'transmute-iron-to-moonsilver', 2, t0);
  catchUp(s, t0 + 2 * 60 * 1000);
  check('a transmute makes two bars from two', s.bags['moonsilver-bar'] === 4 && !s.bags['iron-bar']);
}

// Old saves upgrade.
{
  const v1 = { version: 1, createdAt: t0, player: { name: 'Old', factionId: 'blue' }, copper: 5000, reputation: 0,
    rng: { seed: 1, state: 1 }, clock: { offsetMs: 0, lastSeenAt: t0, lastTickAt: t0 - (t0 % TICK_MS), ticksRun: 0 },
    timers: [], nextTimerId: 1, settings: { debug: false, mute: false } };
  const s = migrate(structuredClone(v1));
  catchUp(s, t0 + H);
  check('version 1 save upgrades and runs', s.version === SAVE_VERSION && s.player.professions[0] === 'blacksmithing' && s.stations.workbench && s.skills.alchemy && Array.isArray(s.tavern.regulars) && s.knownRecipes['copper-cleaver'] && s.skills.blacksmithing.skill === 1 && s.market && s.tavern.board.length === 3 && s.stations.anvil);
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
