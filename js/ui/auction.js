// Auction House tab: My Listings, then browse by category. Tap any item to
// buy or sell it.

import { el, coins, countdown, toast } from './components.js';
import { tradeableItems, itemById } from '../../data/items.js';
import { tuning } from '../../data/tuning.js';
import { lowestListing, listedUnits, demandTag, playerListings } from '../engine/market.js';
import { cancelListing } from '../engine/trading.js';
import { openItemSheet, TAG_LABELS } from './item-sheet.js';

const CATEGORIES = [
  { id: 'material', label: 'Materials' },
  { id: 'consumable', label: 'Consumables' },
  { id: 'gear', label: 'Gear' },
  { id: 'scroll', label: 'Recipe scrolls' },
];

export function renderAuction(ctx) {
  return el('div', { class: 'main-inner' },
    myListings(ctx),
    CATEGORIES.map((cat) => el('section', { class: 'panel' },
      el('h2', {}, cat.label),
      el('div', { class: 'market-list' },
        tradeableItems.filter((item) => item.category === cat.id).map((item) => marketRow(ctx, item))))),
  );
}

function myListings(ctx) {
  const mine = playerListings(ctx.state);
  return el('section', { class: 'panel' },
    el('h2', {}, `My listings (${mine.length} / ${tuning.listingSlots})`),
    mine.length ? el('div', { class: 'market-list' }, mine.map(({ itemId, place, listing }) => el('div', { class: 'my-listing' },
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
      : el('p', { class: 'small dim' }, 'Nothing listed. Tap an item below, or one in your Bags, to sell it.'));
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
  return el('button', { class: 'market-row', type: 'button', onclick: () => openItemSheet(ctx, item.id) },
    el('span', { class: `item-name q-${item.quality}` }, item.name),
    el('span', { class: `tag tag-${tag}` }, TAG_LABELS[tag]),
    el('span', { class: 'market-price' }, lowest ? coins(lowest.price) : el('span', { class: 'dim' }, 'none listed')),
    el('span', { class: 'small dim market-sub' }, `${listedUnits(state, item.id)} listed${have ? ` · you have ${have}` : ''}`),
  );
}
