// Workshop tab: a switcher for your professions, then each workstation's
// queue and recipes with profit at current prices, the skill bar, and the City
// Smelter at the forge. Recipe names are colored by skill-up odds: orange,
// yellow, green, gray, and red when too hard.

import { el, coins, openSheet, stepper, progress, countdown, fill, itemIcon, toast, confirmDisenchant } from './components.js';
import { disenchant } from '../engine/enchanting.js';
import { recipes, recipeById } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';
import { tuning } from '../../data/tuning.js';
import { marketValue, cutOn } from '../engine/market.js';
import { lowestOtherPrice } from '../engine/trading.js';
import { queueCraft, cancelOrder, queueSlots, smeltAtCity, smelterFee, maxCraftable, unitMs } from '../engine/crafting.js';
import { cutRate } from '../engine/upgrades.js';
import { openItemSheet } from './item-sheet.js';
import { recipeColor, knowsRecipe, trainerRecipes, forgeRankNeeded, hasProfession, startingProfession } from '../engine/skills.js';
import { professions, professionById, professionForStation, stationNames } from '../../data/professions.js';
import { skillBar, colorText, newTierHint } from './skill-bar.js';

const filters = { canCraft: false, skillUps: false, profitable: false };
// The profession shown, kept between visits to the tab.
let shown = null;

const BLURBS = {
  anvil: 'Each finished craft can raise your skill. Orange recipes always do, yellow usually, green sometimes, gray never.',
  forge: 'Smelting is free here, but takes time. The City Smelter is instant, for a fee.',
  workbench: 'Each finished craft can raise your skill. Cure hides here first: most leather goods need them.',
  'alchemy-table': 'Each finished craft can raise your skill. Transmutes turn your herbs into smithing materials.',
  loom: 'Each finished craft can raise your skill. Spin cloth here first: robes, cowls and satchels need it.',
  'enchanting-circle': 'Each finished craft can raise your skill. Disenchant gear below for dust: leveling junk, or cheap gear from the auction house.',
};

export function renderWorkshop(ctx) {
  const mine = professions.filter((p) => hasProfession(ctx.state, p.id));
  if (!shown || !hasProfession(ctx.state, shown)) shown = startingProfession(ctx.state);
  return el('div', { class: 'main-inner' },
    mine.length > 1 ? el('div', { class: 'btn-row seg profession-switch', role: 'tablist' }, mine.map((p) => el('button', {
      class: `btn${p.id === shown ? ' btn-primary' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(p.id === shown),
      onclick: () => { shown = p.id; ctx.render(); },
    }, p.name))) : null,
    professionById[shown].stations.map((s) => stationPanel(ctx, s, stationNames[s], BLURBS[s])),
    shown === 'enchanting' ? disenchantPanel(ctx) : null,
    hasProfession(ctx.state, 'blacksmithing') ? null : smelterPanel(ctx),
  );
}

// Shops without a forge can still use the City Smelter: instant, for a fee.
// Disenchanting: every piece of gear in your bags, with a button to break one down.
function disenchantPanel(ctx) {
  const gear = Object.entries(ctx.state.bags).filter(([id]) => itemById[id].category === 'gear')
    .sort((a, b) => itemById[a[0]].tier - itemById[b[0]].tier || itemById[a[0]].name.localeCompare(itemById[b[0]].name));
  return el('section', { class: 'panel' },
    el('h2', {}, 'Disenchant'),
    el('p', { class: 'small dim' }, 'Break gear down into dust of its tier, with a chance of an essence. Blue and purple gear can give lucent crystals. Instant, and it gives no skill.'),
    gear.length ? el('div', { class: 'market-list' }, gear.map(([id, qty]) => el('div', { class: 'my-listing with-icon one-line' },
      itemIcon(id, 'sm'),
      el('button', { class: `link item-name q-${itemById[id].quality}`, type: 'button', onclick: () => openItemSheet(ctx, id) }, `${qty} × ${itemById[id].name}`),
      el('button', { class: 'btn small-btn', type: 'button', onclick: () => confirmDisenchant(id, 1) && ctx.act((s) => {
        const got = disenchant(s, id, 1);
        toast(`Got ${Object.entries(got).map(([g, n]) => `${n} × ${itemById[g].name}`).join(', ')}.`);
      }) }, 'Disenchant'))))
      : el('p', { class: 'small dim' }, 'No gear in your bags. Craft some, or buy cheap gear on the auction house.'));
}

function smelterPanel(ctx) {
  return el('section', { class: 'panel' },
    el('h2', {}, 'City Smelter'),
    el('p', { class: 'small dim' }, 'Your shop has no forge, but the City Smelter turns ore into bars instantly, for a fee.'),
    el('div', { class: 'market-list' }, recipes.filter((r) => r.station === 'forge').map((r) => recipeRow(ctx, r))));
}

function stationPanel(ctx, stationId, title, blurb) {
  const { state } = ctx;
  const prof = professionForStation[stationId];
  const first = professionById[prof].stations[0] === stationId;
  const queue = state.stations[stationId].queue;
  let list = recipes.filter((r) => r.station === stationId && knowsRecipe(state, r));
  if (filters.canCraft) list = list.filter((r) => maxCraftable(state, r.id) > 0 && recipeColor(state, r) !== 'red');
  if (filters.skillUps) list = list.filter((r) => ['orange', 'yellow', 'green'].includes(recipeColor(state, r)));
  if (filters.profitable) list = list.filter((r) => profitEach(ctx, r) > 0);

  return el('section', { class: 'panel' },
    el('h2', {}, title),
    first ? skillBar(state, prof, { capHint: true }) : null,
    el('p', { class: 'small dim' }, blurb),
    el('h3', {}, `Queue (${queue.length} / ${queueSlots(state, stationId)})`),
    queue.length ? el('div', { class: 'queue' }, queue.map((order, i) => queueRow(ctx, stationId, order, i === 0)))
      : el('p', { class: 'small dim' }, 'Idle. Pick a recipe below.'),
    el('div', { class: 'btn-row chips' },
      chip(ctx, 'canCraft', 'Can craft now'),
      stationId !== 'forge' ? chip(ctx, 'skillUps', 'Gives skill-ups') : null,
      chip(ctx, 'profitable', 'Profitable')),
    el('div', { class: 'market-list' }, list.length ? list.map((r) => recipeRow(ctx, r))
      : el('p', { class: 'small dim' }, 'No recipes match these filters.')),
    first ? trainerHint(ctx, prof) : null,
  );
}

// "2 new recipes at the trainer" when there's something you could learn now.
function trainerHint(ctx, prof) {
  const offers = trainerRecipes(ctx.state, prof);
  const ready = offers.filter((o) => o.recipe.skill[0] <= ctx.state.skills[prof].skill).length;
  if (!offers.length) return null;
  const tierHint = newTierHint(ctx.state, prof, offers[0].recipe);
  return el('p', { class: `small trainer-hint${ready ? ' ready' : ''}` },
    ready ? `${ready} new recipe${ready === 1 ? '' : 's'} for your skill at the Trade Guild trainer (Shop tab).`
      : `Next recipe at the trainer: skill ${offers[0].recipe.skill[0]}.`,
    tierHint ? ` ${tierHint}` : '');
}

function chip(ctx, key, label) {
  return el('button', { class: `btn chip${filters[key] ? ' btn-primary' : ''}`, type: 'button', 'aria-pressed': String(filters[key]),
    onclick: () => { filters[key] = !filters[key]; ctx.render(); } }, label);
}

function queueRow(ctx, stationId, order, active) {
  const recipe = recipeById[order.recipeId];
  const seconds = unitMs(ctx.state, recipe);
  const unitEnd = order.unitStartedAt + seconds;
  const orderEnd = order.unitStartedAt + (order.qty - order.done) * seconds;
  return el('div', { class: 'queue-row with-icon' },
    itemIcon(recipe.makes.item, 'sm'),
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
  return price - cutOn(price, cutRate(ctx.state));
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
  const color = recipeColor(state, recipe);
  return el('button', { class: `market-row with-icon${color ? ` skill-${color}` : ''}`, type: 'button', onclick: () => openCraftSheet(ctx, recipe),
    'aria-label': color ? `${out.name}, ${colorText(recipe, color)}` : null },
    itemIcon(out.id, 'sm'),
    el('span', { class: `item-name ${color ? `skill-text-${color}` : `q-${out.quality}`}` }, `${out.name}${recipe.makes.qty > 1 ? ` × ${recipe.makes.qty}` : ''}`),
    el('span', { class: `market-price ${profit >= 0 ? 'profit' : 'loss'}` }, profit >= 0 ? '+' : '−', coins(Math.abs(profit))),
    el('span', { class: 'small dim market-sub' },
      recipe.mats.map((m) => `${m.qty} ${itemById[m.item].name.toLowerCase()} (${state.bags[m.item] || 0})`).join(', ')),
    el('span', { class: 'small market-tag' }, color === 'red' ? `needs ${recipe.skill[0]}`
      : hasProfession(state, professionForStation[recipe.station]) && forgeRankNeeded(state, recipe) ? `forge: ${forgeRankNeeded(state, recipe)}`
        : can ? `can make ${can}` : ''),
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
    const color = recipeColor(state, recipe);
    const can = color === 'red' ? 0 : maxCraftable(state, recipe.id);
    const ownForge = hasProfession(state, professionForStation[recipe.station]);
    const rankNeed = ownForge ? forgeRankNeeded(state, recipe) : null;
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
        ` in ${+(unitMs(state, recipe) / 1000).toFixed(1)} s each.`),
      color ? el('p', { class: `small skill-text-${color}` }, colorText(recipe, color),
        color === 'red' ? '' : `. Turns ${['yellow', 'green', 'gray'].map((c, i) => `${c} at ${recipe.skill[i + 1]}`).join(', ')}.`) : null,
      el('table', { class: 'listings' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Material'), el('th', {}, 'Need'), el('th', {}, 'Have'), el('th', {}, 'Buy price'))),
        el('tbody', {}, recipe.mats.map((m) => el('tr', { class: (state.bags[m.item] || 0) < m.qty ? 'short' : null },
          el('td', {}, el('button', { class: 'link', type: 'button', onclick: () => openItemSheet(ctx, m.item) }, itemById[m.item].name)),
          el('td', {}, m.qty), el('td', {}, state.bags[m.item] || 0), el('td', {}, coins(unitCost(ctx, m.item))))))),
      el('p', { class: 'small' }, 'Materials cost ', coins(matCost(ctx, recipe)), '. Sells for ',
        coins(saleValue(ctx, recipe.makes.item) * recipe.makes.qty), ' after the cut. ',
        el('strong', { class: profit >= 0 ? 'profit' : 'loss' }, profit >= 0 ? 'Profit ' : 'Loss ', coins(Math.abs(profit))), ' each.'),
      can ? el('div', { class: 'field' }, el('label', {}, `How many (materials for ${can})`), qty.node)
        : el('p', { class: 'small dim' }, color === 'red' ? 'Your skill is too low to make this yet.' : 'You need more materials. Tap one above to buy it.'),
      can && rankNeed ? el('p', { class: 'small dim' }, `Your forge needs ${rankNeed} Blacksmithing to smelt this. The City Smelter can do it now.`) : null,
      can && ownForge && !rankNeed ? el('button', { class: 'btn btn-primary wide', type: 'button',
        onclick: () => act((s, now) => queueCraft(s, recipe.id, qty.value, now)) },
        recipe.station === 'forge' ? 'Smelt at your forge (free)' : 'Add to queue') : null,
      can && recipe.station === 'forge' ? el('button', { class: 'btn wide', type: 'button',
        onclick: () => act((s) => smeltAtCity(s, recipe.id, qty.value)) },
        'Smelt now at the City Smelter (', feeText, ')') : null,
    );
  }
}
