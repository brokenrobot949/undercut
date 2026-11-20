// Auction House tab: My Listings, then Browse with a search box and filters
// (category, items in your bags, items your craft uses or makes). Starred
// items sit in a Favorites box at the top of Browse. Tap any item to buy or
// sell it.

import { el, coins, countdown, toast, itemIcon } from './components.js';
import { tradeableItems, itemById } from '../../data/items.js';
import { tuning } from '../../data/tuning.js';
import { lowestListing, listedUnits, demandTag, playerListings } from '../engine/market.js';
import { cancelListing, isFavoriteItem } from '../engine/trading.js';
import { listingSlotsFor } from '../engine/upgrades.js';
import { clerkLevel, clerkActive, clerkCheckHours, clerkFloors, clerkFloorShare, clerkRelistLimit, setClerkOn, setClerkFloor } from '../engine/clerk.js';
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

// Starred items, always shown whatever the filters say, in Browse order.
function favoritesBox(ctx) {
  const { state } = ctx;
  const favs = tradeableItems.filter((item) => isFavoriteItem(state, item.id))
    .sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.category) - CATEGORIES.findIndex((c) => c.id === b.category) || a.tier - b.tier);
  if (!favs.length) return el('p', { class: 'small dim fav-tip' }, 'Tip: open an item and tap ☆ Favorite to pin it in a Favorites box here.');
  return el('div', { class: 'recipe-group favorites' },
    el('h3', { class: 'group-head' }, el('span', { class: 'fav-star', 'aria-hidden': 'true' }, '★'), ' Favorites'),
    el('div', { class: 'market-list' }, favs.map((item) => marketRow(ctx, item, { inFavorites: true }))));
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
      favoritesBox(ctx),
      search,
      el('div', { class: 'btn-row chips' },
        chip('In your bags', browse.bags, () => { browse.bags = !browse.bags; }),
        chip('For your craft', browse.craft, () => { browse.craft = !browse.craft; })),
      el('div', { class: 'btn-row chips' }, CATEGORIES.map((c) =>
        chip(c.label, browse.category === c.id, () => { browse.category = c.id; }))),
      results),
  );
}

// The auctioneer's clerk: on/off and the floor, once the upgrade is bought.
function clerkBox(ctx) {
  const { state } = ctx;
  if (!clerkLevel(state)) return null;
  const on = clerkActive(state);
  const every = clerkCheckHours(state);
  const pct = (x) => `${Math.round(x * 100)}%`;
  return el('div', { class: 'clerk-box' },
    el('div', { class: 'clerk-head' },
      el('strong', {}, "Auctioneer's clerk"),
      el('button', { class: `btn chip${on ? ' btn-primary' : ''}`, type: 'button', 'aria-pressed': String(on),
        onclick: () => ctx.act((s) => setClerkOn(s, !on)) }, on ? 'On' : 'Off')),
    el('p', { class: 'small dim' }, on
      ? `Relists a listing that expires unsold, up to ${clerkRelistLimit} times${every ? `, and checks your listings every ${every >= 1 ? `${every} h` : `${Math.round(every * 60)} min`} to keep them first in line` : ''}. Never above the price you set, never below your floor.`
      : 'Switched off: your listings come home when they expire.'),
    on ? el('div', { class: 'field' },
      el('label', {}, 'Lowest price, as a share of the price you set'),
      el('div', { class: 'btn-row chips' }, clerkFloors.map((f) => el('button', {
        class: `btn chip${clerkFloorShare(state) === f ? ' btn-primary' : ''}`, type: 'button', 'aria-pressed': String(clerkFloorShare(state) === f),
        onclick: () => ctx.act((s) => setClerkFloor(s, f)) }, pct(f))))) : null);
}

function myListings(ctx) {
  const mine = playerListings(ctx.state);
  // With a clerk that checks live listings, the undercut tip isn't needed.
  const undercut = mine.some((x) => x.place > 0) && !(clerkActive(ctx.state) && clerkCheckHours(ctx.state));
  const clerkOn = clerkActive(ctx.state);
  return el('section', { class: 'panel' },
    el('h2', {}, `My listings (${mine.length} / ${listingSlotsFor(ctx.state)})`),
    clerkBox(ctx),
    // Selling tip: a listing that isn't first in line waits behind the ones ahead.
    undercut ? el('p', { class: 'small sell-tip warn' }, el('strong', {}, 'Tip: '),
      'A listing that is not first in line waits until the ones ahead of it sell. To move up, cancel it and list it again just under the lowest price (the old deposit is kept).') : null,
    mine.length ? el('div', { class: 'market-list' }, mine.map(({ itemId, place, listing }) => el('div', { class: 'my-listing with-icon' },
      itemIcon(itemId, 'sm'),
      el('button', { class: `link item-name q-${itemById[itemId].quality}`, type: 'button', onclick: () => openItemSheet(ctx, itemId) },
        `${listing.qty} × ${itemById[itemId].name}`),
      el('span', { class: 'market-price' }, coins(listing.price), ' each'),
      el('span', { class: 'small dim market-sub' },
        place === 0 ? 'Cheapest listed' : `${ordinal(place + 1)} in line`, ' · ', countdown(listing.expiresAt), ' left',
        listing.startQty > listing.qty ? ` · ${listing.startQty - listing.qty} sold` : '',
        clerkOn ? ` · relisted ${listing.relists || 0} / ${clerkRelistLimit}` : ''),
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

function marketRow(ctx, item, { inFavorites = false } = {}) {
  const { state } = ctx;
  const fav = !inFavorites && isFavoriteItem(state, item.id);
  const lowest = lowestListing(state, item.id);
  const tag = demandTag(state, item);
  const have = state.bags[item.id] || 0;
  return el('button', { class: 'market-row with-icon', type: 'button', onclick: () => openItemSheet(ctx, item.id) },
    itemIcon(item.id, 'sm'),
    el('span', { class: `item-name q-${item.quality}` },
      fav ? el('span', { class: 'fav-star', 'aria-label': 'Favorite' }, '★ ') : null, item.name),
    el('span', { class: `tag tag-${tag}` }, TAG_LABELS[tag]),
    el('span', { class: 'market-price' }, lowest ? coins(lowest.price) : el('span', { class: 'dim' }, 'none listed')),
    el('span', { class: 'small dim market-sub' }, `${listedUnits(state, item.id)} listed${have ? ` · you have ${have}` : ''}`),
  );
}
