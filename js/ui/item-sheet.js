// The one item sheet: tap any item anywhere to open it. Market info, your
// stock, List / Buy / Vendor, and the recipes that make or use it.

import { el, coins, openSheet, stepper, fill, coinInput, toast, coinText } from './components.js';
import { itemById } from '../../data/items.js';
import { recipes } from '../../data/recipes.js';
import { tuning } from '../../data/tuning.js';
import { bagCount } from '../engine/bags.js';
import {
  marketValue, demandTag, demandPerHour, supplyDays, scarcity, vendorPrice, depositFor, listedUnits, cutOn,
} from '../engine/market.js';
import {
  undercutPrice, matchPrice, lowestOtherPrice, listItem, quoteBuy, buyItems, sellToVendor, buyFromVendor,
} from '../engine/trading.js';

export const TAG_LABELS = { hot: 'Hot', steady: 'Steady', slow: 'Slow', flooded: 'Flooded' };
const TIER_NAMES = ['', 'Copper', 'Bronze', 'Iron', 'Moonsilver', 'Starmetal'];

export function openItemSheet(ctx, itemId) {
  const item = itemById[itemId];
  const sheet = openSheet(item.name);
  // Remember choices between redraws.
  const choice = { listQty: null, price: null, hours: 24, buyQty: 1, vendorQty: 1 };
  draw();

  function draw() {
    const { state } = ctx;
    const have = bagCount(state, itemId);
    const tradeable = item.category !== 'trade';
    fill(sheet.body, 
      el('p', { class: 'small' },
        el('span', { class: `q-${item.quality}` }, item.quality[0].toUpperCase() + item.quality.slice(1)),
        ` · ${TIER_NAMES[item.tier]} tier · ${item.category}${item.armor ? ` (${item.armor})` : ''} · In bags: `,
        el('strong', {}, have)),
      tradeable ? marketInfo() : el('p', { class: 'small dim' }, `Sold by the trade goods vendor for ${item.vendorBuy} copper each.`),
      tradeable && have > 0 ? sellSection(have) : null,
      tradeable ? buySection() : vendorBuySection(),
      have > 0 ? vendorSellSection(have) : null,
      recipeSection(),
      tradeable ? listingsSection() : null,
      tradeable && state.settings.debug ? debugSection() : null,
    );
  }

  function act(fn) {
    if (ctx.act(fn) !== undefined) draw();
  }

  function marketInfo() {
    const { state } = ctx;
    const low = lowestOtherPrice(state, itemId);
    const value = marketValue(state, itemId, ctx.now());
    return el('dl', { class: 'kv' },
      el('dt', {}, 'Lowest listing'), el('dd', {}, low ? coins(low) : 'none'),
      el('dt', {}, 'Market value (24 h)'), el('dd', {}, value ? coins(value) : 'no sales yet'),
      el('dt', {}, 'Demand'), el('dd', {}, el('span', { class: `tag tag-${demandTag(state, item)}` }, TAG_LABELS[demandTag(state, item)])),
      el('dt', {}, 'Vendor pays'), el('dd', {}, coins(vendorPrice(item))));
  }

  function sellSection(have) {
    const { state } = ctx;
    if (choice.listQty === null || choice.listQty > have) choice.listQty = have;
    if (choice.price === null) choice.price = undercutPrice(state, itemId);

    const priceInput = coinInput({ value: choice.price, label: 'Price each', onChange: () => update() });
    const lowNote = el('p', { class: 'small' });
    const summary = el('p', { class: 'small dim' });
    const qty = stepper({ value: choice.listQty, max: have, onChange: (v) => { choice.listQty = v; update(); } });

    function update() {
      choice.price = Math.max(1, priceInput.value);
      const low = lowestOtherPrice(ctx.state, itemId);
      fill(lowNote, low === null ? 'Nobody else is selling this right now.'
        : choice.price < low ? ['You will be the cheapest (lowest other: ', coins(low), ').']
          : choice.price === low ? ['Same as the lowest. Older listings sell first at the same price.']
            : ['Above the lowest (', coins(low), '). Sells only once cheaper ones are gone.']);
      const deposit = depositFor(item, choice.listQty, choice.hours);
      const net = choice.price - cutOn(choice.price);
      fill(summary, 'Deposit ', coins(deposit), ' (back if it sells). You get ', coins(net * choice.listQty),
        ` for all ${choice.listQty} after the ${tuning.market.cut * 100}% cut.`);
    }
    const setPrice = (p) => priceInput.set(p);
    update();

    return el('section', { class: 'panel' },
      el('h3', {}, 'List on the auction house'),
      el('div', { class: 'field' }, el('label', {}, 'How many'), qty.node),
      el('div', { class: 'field' },
        el('label', {}, 'Price each'),
        priceInput.node,
        lowNote,
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn', type: 'button', onclick: () => setPrice(undercutPrice(ctx.state, itemId)) }, 'Undercut'),
          el('button', { class: 'btn', type: 'button', onclick: () => setPrice(matchPrice(ctx.state, itemId)) }, 'Match'))),
      el('div', { class: 'field' },
        el('label', {}, 'Duration'),
        el('div', { class: 'btn-row seg' }, tuning.market.durations.map((d) => el('button', {
          class: `btn${choice.hours === d.hours ? ' btn-primary' : ''}`, type: 'button',
          onclick: () => { choice.hours = d.hours; draw(); },
        }, `${d.hours} h`)))),
      summary,
      el('button', { class: 'btn btn-primary wide', type: 'button', onclick: () => act((s, now) => {
        const listing = listItem(s, { itemId, qty: choice.listQty, price: choice.price, hours: choice.hours }, now);
        toast(`Listed ${listing.qty} × ${item.name}. See it under My listings on the Auction tab.`);
        choice.listQty = null;
      }) }, 'List'),
    );
  }

  function buySection() {
    const { state } = ctx;
    const listed = Object.values(state.market.items[itemId].listings).filter((l) => l.seller !== 'player').reduce((n, l) => n + l.qty, 0);
    if (!listed) return el('section', { class: 'panel' }, el('h3', {}, 'Buy'), el('p', { class: 'small dim' }, 'Nothing listed right now.'));
    const quoteText = el('p', { class: 'small dim' });
    const qty = stepper({ value: Math.min(choice.buyQty, listed), max: listed, onChange: (v) => { choice.buyQty = v; update(); } });
    function update() {
      const q = quoteBuy(ctx.state, itemId, qty.value);
      fill(quoteText, 'Costs ', coins(q.cost), q.qty ? [' (', coins(Math.round(q.cost / q.qty)), ' each on average)'] : '');
    }
    update();
    return el('section', { class: 'panel' },
      el('h3', {}, 'Buy'),
      el('div', { class: 'field' }, el('label', {}, `How many (${listed} listed)`), qty.node),
      quoteText,
      el('button', { class: 'btn btn-primary wide', type: 'button', onclick: () => act((s, now) => {
        const got = buyItems(s, itemId, qty.value, now);
        toast(`Bought ${got.qty} × ${item.name} for ${coinText(got.cost)}. They're in your bags.`);
      }) }, 'Buy cheapest first'));
  }

  function vendorBuySection() {
    const qty = stepper({ value: choice.vendorQty, max: 200, onChange: (v) => { choice.vendorQty = v; } });
    return el('section', { class: 'panel' },
      el('h3', {}, 'Trade goods vendor'),
      el('div', { class: 'field' }, el('label', {}, 'How many'), qty.node),
      el('button', { class: 'btn btn-primary wide', type: 'button', onclick: () => act((s) => buyFromVendor(s, itemId, qty.value)) },
        'Buy from vendor'));
  }

  function vendorSellSection(have) {
    const qty = stepper({ value: Math.min(choice.vendorQty, have), max: have, onChange: (v) => { choice.vendorQty = v; } });
    return el('section', { class: 'panel' },
      el('h3', {}, 'Sell to vendor'),
      el('p', { class: 'small dim' }, 'Instant, at the floor price of ', coins(vendorPrice(item)), ' each.'),
      el('div', { class: 'field' }, qty.node),
      el('button', { class: 'btn wide', type: 'button', onclick: () => act((s) => sellToVendor(s, itemId, qty.value)) }, 'Sell to vendor'));
  }

  function recipeSection() {
    const makes = recipes.filter((r) => r.makes.item === itemId);
    const uses = recipes.filter((r) => r.mats.some((m) => m.item === itemId));
    if (!makes.length && !uses.length) return null;
    const name = (r) => (r.station === 'forge' ? `${itemById[r.makes.item].name} (forge)` : itemById[r.makes.item].name);
    return el('section', {},
      makes.length ? el('p', { class: 'small' }, el('strong', {}, 'Made by: '), makes.map(name).join(', ')) : null,
      uses.length ? el('p', { class: 'small' }, el('strong', {}, 'Used in: '), uses.map(name).join(', ')) : null);
  }

  function listingsSection() {
    const m = ctx.state.market.items[itemId];
    const shown = m.listings.slice(0, 8);
    return el('section', {},
      el('h3', {}, `Listings (${listedUnits(ctx.state, itemId)} units)`),
      el('table', { class: 'listings' },
        el('thead', {}, el('tr', {}, el('th', {}, '#'), el('th', {}, 'Price each'), el('th', {}, 'Qty'), el('th', {}, 'Seller'))),
        el('tbody', {}, shown.map((l, i) => el('tr', { class: l.seller === 'player' ? 'mine' : null },
          el('td', {}, i + 1), el('td', {}, coins(l.price)), el('td', {}, l.qty), el('td', {}, l.seller === 'player' ? 'You' : 'NPC'))))),
      m.listings.length > shown.length ? el('p', { class: 'small dim' }, `and ${m.listings.length - shown.length} more`) : null);
  }

  function debugSection() {
    const { state } = ctx;
    const m = state.market.items[itemId];
    return el('section', { class: 'panel' },
      el('h3', {}, 'Market internals (debug)'),
      el('dl', { class: 'kv' },
        el('dt', {}, 'Base value'), el('dd', {}, `${item.base} c`),
        el('dt', {}, 'Fair price'), el('dd', {}, `${m.fair.toFixed(1)} c (${Math.round((m.fair / item.base) * 100)}% of base)`),
        el('dt', {}, 'Demand'), el('dd', {}, `${demandPerHour(state, item).toFixed(2)} buyers / h`),
        el('dt', {}, 'Waiting buyers'), el('dd', {}, `${m.reservoir.toFixed(1)} (${Math.round(scarcity(state, item) * 100)}% of reservoir)`),
        el('dt', {}, 'Stock listed'), el('dd', {}, `${supplyDays(state, item).toFixed(2)} days of demand`),
        el('dt', {}, 'NPC units pending'), el('dd', {}, m.npcPending.toFixed(1))));
  }
}
