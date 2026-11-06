// Game state and the actions that change it. No DOM here: the balance
// simulator runs this same code in Node.

import { tuning } from '../../data/tuning.js';
import { factions } from '../../data/factions.js';
import { items, itemById } from '../../data/items.js';
import { addOrMail, addToMailbox } from './bags.js';
import { createRng } from './rng.js';
import { createClock, advance, gameNow, schedule, newSummary } from './clock.js';
import { createMarket, syncMarketItems, marketTick, freshMarket, saleProceeds, sellToFirstCustomer, madeInListing } from './market.js';
import { createTutorial } from './tutorial.js';
import { firstCustomer } from '../../data/tutorial.js';
import { createStations, syncStations, finishUnit } from './crafting.js';
import { createTavern, refreshBoardTimer, expeditionReturns } from './heroes.js';
import { createSkills, createKnownRecipes, syncSkills } from './skills.js';
import { createUpgrades, syncUpgrades } from './upgrades.js';
import { createExtras } from './shop-extras.js';
import { createEvents, planTimer, eventStartTimer, eventEndTimer } from './events.js';
import { createCommissions, commissionPostTimer, commissionExpireTimer } from './commissions.js';
export { collectMailbox } from './bags.js';
export { getStanding } from './guild.js';

export const SAVE_VERSION = 13;

export function newGame({ name, factionId, professionId = 'blacksmithing', seed, now }) {
  const state = {
    version: SAVE_VERSION,
    createdAt: now,
    // professions: the starting one first; wings add the others later.
    player: { name, factionId, professions: [professionId] },
    copper: tuning.startingCopper,
    reputation: 0,
    // Profession skill and trained rank: { blacksmithing: { skill, rank } }.
    skills: createSkills(),
    // Recipes learned: { recipeId: true }. Smelting is always known.
    knownRecipes: createKnownRecipes(),
    bags: { ...tuning.startingBags[professionId] }, // itemId -> quantity
    // Gold and items waiting to be collected (sales, expired listings).
    // `made` counts the waiting units that carry your maker's mark.
    mailbox: { copper: 0, items: {}, made: {} },
    rng: createRng(seed),
    clock: createClock(now),
    timers: [],
    nextTimerId: 1,
    settings: { debug: false, mute: false },
    market: null,
    stations: createStations(),
    tavern: null,
    // Units in your bags you crafted yourself (the maker's mark): { itemId: qty }.
    made: {},
    commissions: null,
    // The five-step tutorial, and the one-time first customer ('waiting', 'coming', 'done').
    tutorial: createTutorial(professionId),
    firstCustomer: 'waiting',
    // Shop upgrade levels: { upgradeId: level }.
    upgrades: createUpgrades(),
    // Market events: the calendar and what's running now (see events.js).
    events: null,
    // Decor, sign styles, trophies and guild donations (see shop-extras.js).
    extras: createExtras(),
  };
  createMarket(state, now);
  createTavern(state, now);
  createCommissions(state, now);
  createEvents(state, now);
  return state;
}

// Throws if a loaded save is missing something the game can't run without.
export function checkSave(state) {
  const ok = state.player && getFaction(state) && state.clock && Number.isFinite(state.clock.lastSeenAt) &&
    state.rng && Number.isFinite(state.rng.state) && Array.isArray(state.timers) && Number.isFinite(state.copper) &&
    state.skills && typeof state.skills === 'object' && state.knownRecipes && typeof state.knownRecipes === 'object';
  if (!ok) throw new Error('This save is damaged or incomplete.');
  return state;
}

export function getFaction(state) {
  return factions.find((f) => f.id === state.player.factionId);
}

// ---- Clock handlers ----------------------------------------------------

// What happens to the player when their listings sell or expire.
function marketHooks(state, summary) {
  return {
    onSale(itemId, listing, price, at) {
      const paid = saleProceeds(listing, price);
      state.mailbox.copper += paid;
      summary.firstSaleAt ??= at;
      const s = (summary.sold[itemId] ||= { qty: 0, copper: 0 });
      s.qty++;
      s.copper += paid;
    },
    onExpire(itemId, listing, at) {
      addToMailbox(state, itemId, listing.qty, madeInListing(listing));
      summary.expired[itemId] = (summary.expired[itemId] || 0) + listing.qty;
    },
  };
}

const handlers = {
  tick(state, at, summary) {
    marketTick(state, at, marketHooks(state, summary));
  },
  freshMarket(state, at, summary) {
    freshMarket(state, at, marketHooks(state, summary));
  },
  timers: {
    craft: (state, timer, summary) => finishUnit(state, timer, summary),
    expedition: (state, timer, summary) => expeditionReturns(state, timer, summary),
    'tavern-refresh': (state, timer) => refreshBoardTimer(state, timer),
    'commission-post': (state, timer, summary) => commissionPostTimer(state, timer, summary),
    'commission-expire': (state, timer, summary) => commissionExpireTimer(state, timer, summary),
    'event-plan': (state, timer) => planTimer(state, timer),
    'event-start': (state, timer, summary) => eventStartTimer(state, timer, summary),
    'event-end': (state, timer, summary) => eventEndTimer(state, timer, summary),
    // A customer looks at your first listing: buys it if the price is fair.
    'first-customer'(state, timer, summary) {
      const { itemId, listingId } = timer.data;
      const m = state.market.items[itemId];
      const l = m.listings.find((x) => x.id === listingId && x.seller === 'player');
      if (l && l.price <= m.fair * firstCustomer.maxPriceMult) {
        sellToFirstCustomer(state, itemId, listingId, firstCustomer.maxUnits, timer.at, marketHooks(state, summary));
        state.firstCustomer = 'done';
      } else {
        // Too dear, or already gone: the next listing gets another visit.
        state.firstCustomer = 'waiting';
        if (l) summary.lines.push(`A customer looked at your ${itemById[itemId].name.toLowerCase()} but found the price too high. Try listing nearer the market.`);
      }
    },
    'debug-test'(state, timer, summary) {
      summary.lines.push(`Debug test timer (${timer.data.label}) finished.`);
    },
  },
};

function gameSummary(state) {
  const summary = newSummary(state, null);
  summary.sold = {}; // itemId -> { qty, copper }
  summary.expired = {}; // itemId -> qty returned
  summary.crafted = {}; // itemId -> qty made
  summary.ordersDone = []; // whole orders finished: { item, qty }
  summary.returns = []; // heroes home: { name, zone, haul, line }
  summary.skillUps = {}; // professionId -> { from, to }
  summary.skillCapped = {}; // professionId -> true when skill-ups were lost at a rank cap
  return summary;
}

// Runs everything that happened up to real time `realNow`.
export function catchUp(state, realNow, summary = gameSummary(state)) {
  if (!state.market) createMarket(state, state.clock.lastSeenAt);
  else syncMarketItems(state, state.clock.lastSeenAt);
  syncStations(state);
  syncSkills(state);
  syncUpgrades(state);
  state.extras ||= createExtras();
  if (!state.tavern) createTavern(state, state.clock.lastSeenAt);
  if (!state.commissions) createCommissions(state, state.clock.lastSeenAt);
  if (!state.events) createEvents(state, state.clock.lastSeenAt);
  return advance(state, gameNow(state, realNow), handlers, summary);
}

// ---- Debug actions -----------------------------------------------------

export function debugFastForward(state, realNow, hours) {
  const summary = gameSummary(state);
  catchUp(state, realNow, summary);
  state.clock.offsetMs += hours * 60 * 60 * 1000;
  return catchUp(state, realNow, summary);
}

// Adds a stack of every material and trade good (overflow waits in the mailbox).
export function debugAddMaterials(state, qty = 20) {
  for (const item of items) if (item.category === 'material' || item.category === 'trade') addOrMail(state, item.id, qty);
}

export function debugAddCopper(state, amount) {
  state.copper += amount;
}

export function debugStartTestTimer(state, realNow, minutes) {
  const label = `${minutes} min`;
  schedule(state, 'debug-test', gameNow(state, realNow) + minutes * 60 * 1000, { label });
}
