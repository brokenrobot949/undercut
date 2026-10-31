// Player trading: listing, cancelling, buying, and the two vendors.
// Every action checks everything first and only then changes state, so a
// thrown error (shown to the player) never leaves a half-done action.

import { tuning } from '../../data/tuning.js';
import { itemById } from '../../data/items.js';
import { bagCount, roomFor, takeFromBags, addToBags, addOrMail } from './bags.js';
import {
  postPlayerListing, cancelPlayerListing, playerListings, buyFromMarket, depositFor, vendorPrice,
} from './market.js';

const coinText = (c) => `${c} copper`;

// ---- Price helpers -------------------------------------------------------

// Cheapest listing by someone else, or null.
export function lowestOtherPrice(state, itemId) {
  const l = state.market.items[itemId].listings.find((x) => x.seller !== 'player');
  return l ? l.price : null;
}

// 1% under the lowest other listing, and always at least 1 copper under.
export function undercutPrice(state, itemId) {
  const low = lowestOtherPrice(state, itemId);
  if (low === null) return Math.round(state.market.items[itemId].fair);
  const floor = vendorPrice(itemById[itemId]) + 1;
  return Math.max(floor, Math.min(low - 1, Math.floor(low * 0.99)));
}

export function matchPrice(state, itemId) {
  return lowestOtherPrice(state, itemId) ?? Math.round(state.market.items[itemId].fair);
}

// ---- Listing ---------------------------------------------------------------

export function listItem(state, { itemId, qty, price, hours }, now) {
  const item = itemById[itemId];
  if (item.category === 'trade') throw new Error('Trade goods can only be sold to a vendor.');
  if (item.category === 'junk') throw new Error('Nobody on the auction house wants junk. Sell it to a vendor.');
  qty = Math.floor(qty);
  price = Math.round(price);
  if (!(qty >= 1)) throw new Error('Choose how many to list.');
  if (!(price >= 1)) throw new Error('Set a price of at least 1 copper.');
  if (qty > bagCount(state, itemId)) throw new Error(`You only have ${bagCount(state, itemId)}.`);
  if (playerListings(state).length >= tuning.listingSlots) {
    throw new Error(`All ${tuning.listingSlots} listing slots are in use.`);
  }
  const deposit = depositFor(item, qty, hours);
  if (deposit > state.copper) throw new Error(`The deposit is ${coinText(deposit)} and you can't cover it.`);

  takeFromBags(state, itemId, qty);
  state.copper -= deposit;
  return postPlayerListing(state, itemId, { price, qty, hours, at: now });
}

// Unsold units come back; their share of the deposit is lost.
export function cancelListing(state, itemId, listingId) {
  const listing = cancelPlayerListing(state, itemId, listingId);
  if (!listing) throw new Error('That listing is already gone.');
  addOrMail(state, itemId, listing.qty);
  return listing;
}

// ---- Buying ----------------------------------------------------------------

// What buying `qty` would cost right now, cheapest first. Skips your own listings.
export function quoteBuy(state, itemId, qty) {
  let got = 0;
  let cost = 0;
  for (const l of state.market.items[itemId].listings) {
    if (l.seller === 'player') continue;
    const take = Math.min(l.qty, qty - got);
    got += take;
    cost += take * l.price;
    if (got >= qty) break;
  }
  return { qty: got, cost };
}

export function buyItems(state, itemId, qty, now) {
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to buy.');
  if (qty > roomFor(state, itemId)) throw new Error('Not enough room in your bags.');
  const quote = quoteBuy(state, itemId, qty);
  if (quote.qty < qty) throw new Error(`Only ${quote.qty} are listed.`);
  if (quote.cost > state.copper) throw new Error("You can't afford that many.");

  const bought = buyFromMarket(state, itemId, qty, state.copper, now);
  state.copper -= bought.cost;
  addToBags(state, itemId, bought.qty);
  return bought;
}

// ---- Vendors -----------------------------------------------------------------

export function sellToVendor(state, itemId, qty) {
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to sell.');
  const price = vendorPrice(itemById[itemId]);
  takeFromBags(state, itemId, qty);
  state.copper += price * qty;
  return price * qty;
}

// Trade goods vendor: fixed prices, unlimited stock.
export function buyFromVendor(state, itemId, qty) {
  const item = itemById[itemId];
  if (item.category !== 'trade') throw new Error('The vendor does not sell that.');
  qty = Math.floor(qty);
  if (!(qty >= 1)) throw new Error('Choose how many to buy.');
  const cost = item.vendorBuy * qty;
  if (cost > state.copper) throw new Error("You can't afford that many.");
  if (qty > roomFor(state, itemId)) throw new Error('Not enough room in your bags.');
  state.copper -= cost;
  addToBags(state, itemId, qty);
  return cost;
}
