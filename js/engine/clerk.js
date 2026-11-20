// The auctioneer's clerk, a shop upgrade. Level 1 relists your listings that
// expire unsold; level 2 and up also checks live listings now and then and
// changes their price to stay first in line. The clerk never prices above the
// price you set (the listing's `top`) or below your floor (a share of it).
// All numbers are in the `clerk` entry of data/upgrades.js.

import { upgradeById } from '../../data/upgrades.js';
import { itemById } from '../../data/items.js';
import { upgradeLevel, depositMult, cutRate } from './upgrades.js';
import { postPlayerListing, depositFor, vendorPrice, insertListing, playerListings, madeInListing } from './market.js';

const C = upgradeById.clerk;
const HOUR = 60 * 60 * 1000;

export const clerkRelistLimit = C.relists;
export const clerkFloors = C.floors;

// The saved settings: on/off, the floor, and when live listings were last checked.
export function createClerk() {
  return { on: true, floor: C.floor, lastCheckAt: 0 };
}

export const clerkLevel = (state) => upgradeLevel(state, 'clerk');

// Bought and switched on.
export const clerkActive = (state) => clerkLevel(state) >= 1 && state.clerk?.on !== false;

// Hours between checks of live listings, or null when the clerk doesn't check them.
export const clerkCheckHours = (state) => C.checkHours[clerkLevel(state) - 1] ?? null;

export const clerkFloorShare = (state) => state.clerk?.floor ?? C.floor;

export function setClerkOn(state, on) {
  state.clerk ||= createClerk();
  state.clerk.on = Boolean(on);
}

export function setClerkFloor(state, floor) {
  if (!C.floors.includes(floor)) throw new Error('Pick one of the floor choices.');
  state.clerk ||= createClerk();
  state.clerk.floor = floor;
}

// The lowest price the clerk will ask for a listing first priced at `top`.
export function clerkFloorPrice(state, itemId, top) {
  return Math.min(top, Math.max(vendorPrice(itemById[itemId]) + 1, Math.ceil(top * clerkFloorShare(state))));
}

// The price the clerk wants for `listing`: just under the cheapest listing by
// someone else, kept between your floor and the price you set. With nobody
// else selling, the price you set.
export function clerkPrice(state, itemId, listing) {
  const top = listing.top ?? listing.price;
  const floor = clerkFloorPrice(state, itemId, top);
  const other = state.market.items[itemId].listings.find((l) => l.seller !== 'player');
  if (!other) return top;
  const under = Math.min(other.price - 1, Math.floor(other.price * 0.99));
  return Math.min(top, Math.max(floor, under));
}

// A listing just expired unsold (it's already off the auction house). Relists
// it if the clerk is on, it has relists left and you can pay the new deposit.
// Returns true if relisted.
export function clerkRelist(state, itemId, listing, at, summary) {
  if (!clerkActive(state) || (listing.relists || 0) >= C.relists) return false;
  const hours = Math.round((listing.expiresAt - listing.postedAt) / HOUR);
  let deposit;
  try {
    deposit = depositFor(itemById[itemId], listing.qty, hours, depositMult(state, at));
  } catch {
    return false; // an unusual duration (shouldn't happen): send it home
  }
  if (deposit > state.copper) return false;
  const price = clerkPrice(state, itemId, listing);
  state.copper -= deposit;
  const relisted = postPlayerListing(state, itemId, {
    price, qty: listing.qty, hours, at, deposit, cut: cutRate(state), made: madeInListing(listing),
  });
  relisted.top = listing.top ?? listing.price;
  relisted.relists = (listing.relists || 0) + 1;
  if (summary) {
    summary.relisted ||= {};
    summary.relisted[itemId] = (summary.relisted[itemId] || 0) + listing.qty;
  }
  return true;
}

// Run before each market tick: when a check is due, moves every live listing
// to the clerk's price. Free: no new deposit, and the time left stays.
export function clerkCheck(state, at, summary) {
  const hours = clerkActive(state) ? clerkCheckHours(state) : null;
  if (!hours) return;
  state.clerk ||= createClerk();
  if (at - (state.clerk.lastCheckAt || 0) < hours * HOUR) return;
  state.clerk.lastCheckAt = at;
  for (const { itemId, listing } of playerListings(state)) {
    const price = clerkPrice(state, itemId, listing);
    if (price === listing.price) continue;
    listing.top ??= listing.price;
    const listings = state.market.items[itemId].listings;
    listings.splice(listings.indexOf(listing), 1);
    listing.price = price;
    insertListing(listings, listing);
    if (summary) summary.repriced = (summary.repriced || 0) + 1;
  }
}
