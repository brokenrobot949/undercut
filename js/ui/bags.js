// Bags tab: storage grid and the trade goods vendor. One tile per bag slot, so
// the grid adds up to the slot counter. Tap an item to list it, sell it to a
// vendor, or see what it's for.

import { el, coins, itemIcon } from './components.js';
import { items, itemById } from '../../data/items.js';
import { slotsUsed, bagSlots, slotStacks } from '../engine/bags.js';
import { openItemSheet } from './item-sheet.js';

const ORDER = { material: 0, trade: 1, consumable: 2, gear: 3 };

export function renderBags(ctx) {
  const { state } = ctx;
  const held = Object.entries(state.bags)
    .sort(([a], [b]) => ORDER[itemById[a].category] - ORDER[itemById[b].category] || itemById[a].tier - itemById[b].tier);
  const waiting = Object.values(state.mailbox.items).reduce((a, b) => a + b, 0);

  return el('div', { class: 'main-inner' },
    el('section', { class: 'panel' },
      el('h2', {}, `Bags (${slotsUsed(state)} / ${bagSlots(state)} slots)`),
      waiting ? el('p', { class: 'small' }, `${waiting} items are waiting to be collected on the Shop tab.`) : null,
      held.length
        ? el('div', { class: 'bag-grid' }, held.flatMap(([id, qty]) => slotStacks(id, qty).map((n) => el('button', {
          class: `bag-tile border-${itemById[id].quality}`, type: 'button', onclick: () => openItemSheet(ctx, id),
        },
          itemIcon(id),
          el('span', { class: 'bag-name' }, itemById[id].name),
          el('span', { class: 'bag-qty' }, n)))))
        : el('p', { class: 'small dim' }, 'Empty. Buy materials on the Auction tab or hire a miner in the Tavern.')),
    el('section', { class: 'panel' },
      el('h2', {}, 'Trade goods vendor'),
      el('p', { class: 'small dim' }, 'Fixed prices, always in stock.'),
      el('div', { class: 'market-list' }, items.filter((i) => i.category === 'trade').map((item) => el('button', {
        class: 'market-row with-icon', type: 'button', onclick: () => openItemSheet(ctx, item.id),
      },
        itemIcon(item.id, 'sm'),
        el('span', { class: 'item-name' }, item.name),
        el('span', { class: 'market-price' }, coins(item.vendorBuy)),
        el('span', { class: 'small dim market-sub' }, `you have ${state.bags[item.id] || 0}`))))),
  );
}
