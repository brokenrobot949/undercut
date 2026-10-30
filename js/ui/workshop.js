// Workshop tab: anvil and forge queues, recipes with profit at current
// prices, and the City Smelter. Skill, ranks and recipe colors arrive in Phase 2.

import { el, coins, openSheet, stepper, progress, countdown, fill } from './components.js';
import { recipes, recipeById } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';
import { tuning } from '../../data/tuning.js';
import { marketValue, cutOn } from '../engine/market.js';
import { lowestOtherPrice } from '../engine/trading.js';
import { queueCraft, cancelOrder, queueSlots, smeltAtCity, smelterFee, maxCraftable } from '../engine/crafting.js';
import { openItemSheet } from './item-sheet.js';

const filters = { canCraft: false, profitable: false };

export function renderWorkshop(ctx) {
  return el('div', { class: 'main-inner' },
    stationPanel(ctx, 'anvil', 'Anvil', 'Blacksmithing'),
    stationPanel(ctx, 'forge', 'Forge', 'Smelting is free here, but takes time. The City Smelter is instant, for a fee.'),
  );
}

function stationPanel(ctx, stationId, title, blurb) {
  const { state } = ctx;
  const queue = state.stations[stationId].queue;
  let list = recipes.filter((r) => r.station === stationId);
  if (filters.canCraft) list = list.filter((r) => maxCraftable(state, r.id) > 0);
  if (filters.profitable) list = list.filter((r) => profitEach(ctx, r) > 0);

  return el('section', { class: 'panel' },
    el('h2', {}, title),
    el('p', { class: 'small dim' }, blurb),
    el('h3', {}, `Queue (${queue.length} / ${queueSlots(state, stationId)})`),
    queue.length ? el('div', { class: 'queue' }, queue.map((order, i) => queueRow(ctx, stationId, order, i === 0)))
      : el('p', { class: 'small dim' }, 'Idle. Pick a recipe below.'),
    el('div', { class: 'btn-row chips' },
      chip(ctx, 'canCraft', 'Can craft now'),
      chip(ctx, 'profitable', 'Profitable')),
    el('div', { class: 'market-list' }, list.length ? list.map((r) => recipeRow(ctx, r))
      : el('p', { class: 'small dim' }, 'No recipes match these filters.')),
  );
}

function chip(ctx, key, label) {
  return el('button', { class: `btn chip${filters[key] ? ' btn-primary' : ''}`, type: 'button', 'aria-pressed': String(filters[key]),
    onclick: () => { filters[key] = !filters[key]; ctx.render(); } }, label);
}

function queueRow(ctx, stationId, order, active) {
  const recipe = recipeById[order.recipeId];
  const seconds = recipe.seconds * 1000;
  const unitEnd = order.unitStartedAt + seconds;
  const orderEnd = order.unitStartedAt + (order.qty - order.done) * seconds;
  return el('div', { class: 'queue-row' },
    el('span', { class: 'item-name' }, `${itemById[recipe.makes.item].name} × ${order.qty * recipe.makes.qty}`),
    el('span', { class: 'small dim' }, active ? [`${order.done} done · all in `, countdown(orderEnd)] : 'waiting'),
    active ? progress(order.unitStartedAt, unitEnd) : null,
    el('button', { class: 'btn small-btn', type: 'button',
      onclick: () => ctx.act((s, now) => cancelOrder(s, stationId, order.id, now)) }, 'Cancel'));
}

// Price to buy one unit now: lowest listing, else market value; trade goods at the vendor.
function unitCost(ctx, itemId) {
  const item = itemById[itemId];
  if (item.category === 'trade') return item.vendorBuy;
  return lowestOtherPrice(ctx.state, itemId) ?? marketValue(ctx.state, itemId, ctx.now()) ?? item.base;
}

// What one unit sells for after the auction house cut.
function saleValue(ctx, itemId) {
  const price = marketValue(ctx.state, itemId, ctx.now()) ?? lowestOtherPrice(ctx.state, itemId) ?? itemById[itemId].base;
  return price - cutOn(price);
}

function matCost(ctx, recipe) {
  return recipe.mats.reduce((sum, m) => sum + unitCost(ctx, m.item) * m.qty, 0);
}

function profitEach(ctx, recipe) {
  return saleValue(ctx, recipe.makes.item) * recipe.makes.qty - matCost(ctx, recipe);
}

function recipeRow(ctx, recipe) {
  const { state } = ctx;
  const out = itemById[recipe.makes.item];
  const can = maxCraftable(state, recipe.id);
  const profit = profitEach(ctx, recipe);
  return el('button', { class: 'market-row', type: 'button', onclick: () => openCraftSheet(ctx, recipe) },
    el('span', { class: `item-name q-${out.quality}` }, `${out.name}${recipe.makes.qty > 1 ? ` × ${recipe.makes.qty}` : ''}`),
    el('span', { class: `market-price ${profit >= 0 ? 'profit' : 'loss'}` }, profit >= 0 ? '+' : '−', coins(Math.abs(profit))),
    el('span', { class: 'small dim market-sub' },
      recipe.mats.map((m) => `${m.qty} ${itemById[m.item].name.toLowerCase()} (${state.bags[m.item] || 0})`).join(', ')),
    el('span', { class: 'small market-tag' }, can ? `can make ${can}` : ''),
  );
}

function openCraftSheet(ctx, recipe) {
  const out = itemById[recipe.makes.item];
  const sheet = openSheet(`${recipe.station === 'forge' ? 'Smelt' : 'Craft'}: ${out.name}`);
  let qtyChoice = 1;
  draw();

  function act(fn) {
    if (ctx.act(fn) !== undefined) draw();
  }

  function draw() {
    const { state } = ctx;
    const can = maxCraftable(state, recipe.id);
    qtyChoice = Math.max(1, Math.min(qtyChoice, Math.max(1, can)));
    const feeText = el('span', {});
    const qty = stepper({ value: qtyChoice, max: Math.max(1, can), onChange: (v) => { qtyChoice = v; updateFee(); } });
    function updateFee() {
      feeText.replaceChildren(coins(smelterFee(recipe.id, qtyChoice)));
    }
    updateFee();
    const profit = profitEach(ctx, recipe);

    fill(sheet.body, 
      el('p', { class: 'small' }, `Makes ${recipe.makes.qty} × `,
        el('button', { class: `link q-${out.quality}`, type: 'button', onclick: () => openItemSheet(ctx, out.id) }, out.name),
        ` in ${recipe.seconds} s each.`),
      el('table', { class: 'listings' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Material'), el('th', {}, 'Need'), el('th', {}, 'Have'), el('th', {}, 'Buy price'))),
        el('tbody', {}, recipe.mats.map((m) => el('tr', { class: (state.bags[m.item] || 0) < m.qty ? 'short' : null },
          el('td', {}, el('button', { class: 'link', type: 'button', onclick: () => openItemSheet(ctx, m.item) }, itemById[m.item].name)),
          el('td', {}, m.qty), el('td', {}, state.bags[m.item] || 0), el('td', {}, coins(unitCost(ctx, m.item))))))),
      el('p', { class: 'small' }, 'Materials cost ', coins(matCost(ctx, recipe)), '. Sells for ',
        coins(saleValue(ctx, recipe.makes.item) * recipe.makes.qty), ' after the cut. ',
        el('strong', { class: profit >= 0 ? 'profit' : 'loss' }, profit >= 0 ? 'Profit ' : 'Loss ', coins(Math.abs(profit))), ' each.'),
      can ? el('div', { class: 'field' }, el('label', {}, `How many (materials for ${can})`), qty.node)
        : el('p', { class: 'small dim' }, 'You need more materials. Tap one above to buy it.'),
      can ? el('button', { class: 'btn btn-primary wide', type: 'button',
        onclick: () => act((s, now) => queueCraft(s, recipe.id, qty.value, now)) },
        recipe.station === 'forge' ? 'Smelt at your forge (free)' : 'Add to queue') : null,
      can && recipe.station === 'forge' ? el('button', { class: 'btn wide', type: 'button',
        onclick: () => act((s) => smeltAtCity(s, recipe.id, qty.value)) },
        'Smelt now at the City Smelter (', feeText, ')') : null,
    );
  }
}
