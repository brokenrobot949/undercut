// Auction House tab: My Listings, then Browse with a search box and filters
// (category, items in your bags, items your craft uses or makes). Tap any item
// to buy or sell it.

import { el, coins, countdown, toast, itemIcon } from './components.js';
import { tradeableItems, itemById } from '../../data/items.js';
import { tuning } from '../../data/tuning.js';
import { lowestListing, listedUnits, demandTag, playerListings } from '../engine/market.js';
import { cancelListing } from '../engine/trading.js';
import { listingSlotsFor } from '../engine/upgrades.js';
import { openItemSheet, TAG_LABELS } from './item-sheet.js';
import { recipes } from '../../data/recipes.js';
import { hasProfession, recipeProfession } from '../engine/skills.js';
import { professionForStation } from '../../data/professions.js';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'material', label: 'Materials' },
  { id: 'consumable', label: 'Consumables' },
  { id: 'gear', label: 'Gear' },
  { id: 'scroll', label: 'Recipe scrolls' },
];

// Browse filters, kept while you move between tabs.
const browse = { query: '', category: 'all', bags: false, craft: true };

// Items your professions' recipes use or make (smelting counts for smiths,
// and for everyone via the City Smelter).
function craftItems(state) {
  const ids = new Set();
  for (const r of recipes) {
    const prof = recipeProfession(r) ?? professionForStation[r.station];
    if (!hasProfession(state, prof) && r.station !== 'forge') continue;
    ids.add(r.makes.item);
    for (const m of r.mats) ids.add(m.item);
  }
  return ids;
}

function browseList(ctx) {
  const { state } = ctx;
  const q = browse.query.trim().toLowerCase();
  const mine = browse.craft ? craftItems(state) : null;
  const list = tradeableItems.filter((item) =>
    (browse.category === 'all' || item.category === browse.category) &&
    (!browse.bags || (state.bags[item.id] || 0) > 0) &&
    (!mine || mine.has(item.id) || (state.bags[item.id] || 0) > 0) &&
    (!q || item.name.toLowerCase().includes(q)))
    .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.category) - CATEGORIES.findIndex((c) => c.id === b.category) || a.tier - b.tier);
  return list.length ? list.map((item) => marketRow(ctx, item))
    : el('p', { class: 'small dim' }, browse.bags ? 'Nothing in your bags matches. Turn off "In your bags" to see everything.' : 'No items match.');
}

export function renderAuction(ctx) {
  const results = el('div', { class: 'market-list' });
  const refresh = () => { results.replaceChildren(...[browseList(ctx)].flat()); };
  const chip = (label, on, toggle) => el('button', { class: `btn chip${on ? ' btn-primary' : ''}`, type: 'button', 'aria-pressed': String(on),
    onclick: () => { toggle(); ctx.render(); } }, label);
  const search = el('input', { type: 'search', class: 'search', placeholder: 'Search items', value: browse.query,
    'aria-label': 'Search items', oninput: (e) => { browse.query = e.target.value; refresh(); } });
  refresh();
  return el('div', { class: 'main-inner' },
    myListings(ctx),
    el('section', { class: 'panel' },
      el('h2', {}, 'Browse'),
      search,
      el('div', { class: 'btn-row chips' },
        chip('In your bags', browse.bags, () => { browse.bags = !browse.bags; }),
        chip('For your craft', browse.craft, () => { browse.craft = !browse.craft; })),
      el('div', { class: 'btn-row chips' }, CATEGORIES.map((c) =>
        chip(c.label, browse.category === c.id, () => { browse.category = c.id; }))),
      results),
  );
}

function myListings(ctx) {
  const mine = playerListings(ctx.state);
  return el('section', { class: 'panel' },
    el('h2', {}, `My listings (${mine.length} / ${listingSlotsFor(ctx.state)})`),
    mine.length ? el('div', { class: 'market-list' }, mine.map(({ itemId, place, listing }) => el('div', { class: 'my-listing with-icon' },
      itemIcon(itemId, 'sm'),
      el('button', { class: `link item-name q-${itemById[itemId].quality}`, type: 'button', onclick: () => openItemSheet(ctx, itemId) },
        `${listing.qty} × ${itemById[itemId].name}`),
      el('span', { class: 'market-price' }, coins(listing.price), ' each'),
      el('span', { class: 'small dim market-sub' },
        place === 0 ? 'Cheapest listed' : `${ordinal(place + 1)} in line`, ' · ', countdown(listing.expiresAt), ' left',
        listing.startQty > listing.qty ? ` · ${listing.startQty - listing.qty} sold` : ''),
      el('button', { class: 'btn small-btn', type: 'button',
        onclick: () => ctx.act((s) => {
          const gone = cancelListing(s, itemId, listing.id);
          toast(`Cancelled. ${gone.qty} × ${itemById[itemId].name} back in your bags; the deposit is kept by the auction house.`);
        }) }, 'Cancel'))))
      : el('p', { class: 'small dim' }, 'Nothing listed. To sell, turn on "In your bags" below and tap an item.'));
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function marketRow(ctx, item) {
  const { state } = ctx;
  const lowest = lowestListing(state, item.id);
  const tag = demandTag(state, item);
  const have = state.bags[item.id] || 0;
  return el('button', { class: 'market-row with-icon', type: 'button', onclick: () => openItemSheet(ctx, item.id) },
    itemIcon(item.id, 'sm'),
    el('span', { class: `item-name q-${item.quality}` }, item.name),
    el('span', { class: `tag tag-${tag}` }, TAG_LABELS[tag]),
    el('span', { class: 'market-price' }, lowest ? coins(lowest.price) : el('span', { class: 'dim' }, 'none listed')),
    el('span', { class: 'small dim market-sub' }, `${listedUnits(state, item.id)} listed${have ? ` · you have ${have}` : ''}`),
  );
}
