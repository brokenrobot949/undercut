// Shop tab (home): "While you were away", commissions, town crier, and the
// Trade Guild with its skill trainer.

import { el, coins, comingSoon, formatDuration, countdown, toast, coinText } from './components.js';
import { commissionTypes, commissionTuning } from '../../data/commissions.js';
import { raceById, classById } from '../../data/races.js';
import { canDeliver, deliverCommission, declineCommission, recipeHint } from '../engine/commissions.js';
import { madeCount } from '../engine/bags.js';
import { openItemSheet } from './item-sheet.js';
import { getFaction, getStanding } from '../engine/game.js';
import { itemById } from '../../data/items.js';
import { professions, professionById } from '../../data/professions.js';
import { nextTraining, trainRank, trainerRecipes, learnRecipe, recipeColor, hasProfession } from '../engine/skills.js';
import { colorText } from './skill-bar.js';
import { skillBar } from './skill-bar.js';

export function renderShop(ctx) {
  const { state } = ctx;
  const faction = getFaction(state);
  const { current, next } = getStanding(state);
  const mailboxFull = state.mailbox.copper > 0 || Object.keys(state.mailbox.items).length > 0;

  return el('div', { class: 'main-inner' },
    ctx.away || mailboxFull ? awayPanel(ctx) : null,
    commissionPanel(ctx),
    comingSoon('Town crier', 'Market events will be announced here. Arrives in Phase 3.'),
    el('section', { class: 'panel' },
      el('h2', {}, faction.guild),
      el('p', {}, `Standing: ${current.name}`,
        next ? el('span', { class: 'dim' }, ` · ${state.reputation.toLocaleString()} / ${next.rep.toLocaleString()} reputation`) : null),
      el('h3', {}, 'Trainer'),
      el('p', { class: 'small dim' }, 'Each rank lets your skill climb higher. Train the next one once you reach the cap. Recipes go on sale as your skill reaches them.'),
      professions.filter((p) => hasProfession(ctx.state, p.id)).flatMap((p) => [trainerRow(ctx, p.id), recipeOffers(ctx, p.id)]),
      el('p', { class: 'dim small' }, 'The quartermaster and shop upgrades arrive in Phase 3.')),
  );
}

// Recipes the trainer sells: everything you can learn now, then the next few.
function recipeOffers(ctx, professionId) {
  const offers = trainerRecipes(ctx.state, professionId);
  if (!offers.length) return el('p', { class: 'small dim' }, 'You know every recipe the trainer sells.');
  const skill = ctx.state.skills[professionId].skill;
  const shown = [...offers.filter((o) => o.recipe.skill[0] <= skill), ...offers.filter((o) => o.recipe.skill[0] > skill).slice(0, 3)];
  return el('div', { class: 'market-list trainer-recipes' }, shown.map((o) => {
    const out = itemById[o.recipe.makes.item];
    const color = recipeColor(ctx.state, o.recipe);
    return el('div', { class: `my-listing skill-${color}` },
      el('span', { class: `item-name skill-text-${color}` }, out.name),
      el('button', { class: `btn small-btn${o.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !o.ready,
        onclick: () => ctx.act((s) => learnRecipe(s, o.recipe.id)) }, 'Learn ', coins(o.cost)),
      el('span', { class: 'small dim market-sub' }, color === 'red' ? colorText(o.recipe, color) : o.reason || colorText(o.recipe, color)));
  }));
}

function trainerRow(ctx, professionId) {
  const t = nextTraining(ctx.state, professionId);
  return el('div', { class: 'trainer-row' },
    skillBar(ctx.state, professionId),
    t ? el('button', { class: `btn wide${t.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !t.ready,
      onclick: () => ctx.act((s) => trainRank(s, professionId)) },
      `Train ${t.rank.name} (skill to ${t.rank.cap}) · `, t.cost ? coins(t.cost) : 'free') : el('p', { class: 'small dim' }, 'Highest rank trained.'),
    t && !t.ready ? el('p', { class: 'small dim' }, t.reason) : null);
}

// The commission counter: requests from heroes, paid in gold and reputation.
// Only items you made yourself count.
function commissionPanel(ctx) {
  const { list } = ctx.state.commissions;
  return el('section', { class: 'panel' },
    el('h2', {}, `Commission counter (${list.length} / ${commissionTuning.slots})`),
    el('p', { class: 'small dim' }, `Heroes post requests here, about one every ${commissionTuning.postEveryHours} hours. They pay well, and they're how you earn standing with the guild. Only items you crafted count.`),
    list.length ? el('div', { class: 'commission-list' }, list.map((c) => commissionCard(ctx, c)))
      : el('p', { class: 'small dim' }, 'No requests right now. A new one will be posted soon.'));
}

function requesterText(c) {
  const r = c.requester;
  if (!r.race) return r.name;
  return `${r.name}, ${raceById[r.race].name} ${classById[r.classId].name}, level ${r.level}${r.regularId ? ' (your regular)' : ''}`;
}

function commissionCard(ctx, c) {
  const { state } = ctx;
  const type = commissionTypes.find((t) => t.id === c.type);
  const item = itemById[c.itemId];
  const left = c.qty - c.delivered;
  const made = madeCount(state, c.itemId);
  const n = canDeliver(state, c);
  const partial = c.type === 'contract';
  const ready = partial ? n > 0 : n >= left;
  const hint = recipeHint(state, c);
  return el('div', { class: `commission-card type-${c.type}` },
    el('div', { class: 'commission-head' },
      el('span', { class: 'commission-type' }, type.name),
      el('span', { class: 'small dim' }, 'Ends in ', countdown(c.expiresAt))),
    el('p', { class: 'small' }, requesterText(c), ' wants'),
    el('p', {}, el('strong', {}, `${c.qty} × `),
      el('button', { class: `link q-${item.quality}`, type: 'button', onclick: () => openItemSheet(ctx, item.id) }, item.name)),
    el('p', { class: 'small' }, 'Pays ', coins(c.pay), ` and ${c.rep} reputation`,
      partial ? ` (paid by the part, ${c.delivered} of ${c.qty} delivered)` : '',
      c.type === 'regular' ? ', plus loyalty and 3 levels for your regular' : '', '.'),
    el('p', { class: 'small dim' }, `You've made ${made} in your bags.`, hint ? ` ${hint}` : ''),
    el('div', { class: 'btn-row' },
      el('button', { class: `btn${ready ? ' btn-primary' : ''}`, type: 'button', disabled: !ready, onclick: () => {
        const r = ctx.act((s, now) => deliverCommission(s, c.id, now));
        if (r && r.copper !== undefined) toast(`Handed in. +${coinText(r.copper)}, +${r.rep} reputation.`);
      } }, partial && n < left ? `Deliver ${n}` : 'Hand in'),
      el('button', { class: 'btn', type: 'button', onclick: () => ctx.act((s) => declineCommission(s, c.id)) }, 'Decline')));
}

function awayPanel(ctx) {
  const s = ctx.away;
  const { mailbox } = ctx.state;
  const items = [];
  if (s) {
    if (s.freshMarket) items.push('You were gone a long time, so the market has moved on to a fresh state.');
    else if (s.ticks) items.push(`The market updated ${s.ticks} time${s.ticks === 1 ? '' : 's'}.`);
    for (const [id, sale] of Object.entries(s.sold || {})) {
      items.push(el('span', {}, `Sold ${sale.qty} × ${itemById[id].name} for `, coins(sale.copper), '.'));
    }
    for (const [id, qty] of Object.entries(s.expired || {})) {
      items.push(`Listing expired: ${qty} × ${itemById[id].name} came back.`);
    }
    for (const [id, qty] of Object.entries(s.crafted || {})) {
      items.push(`Finished: ${qty} × ${itemById[id].name}.`);
    }
    for (const r of s.returns || []) {
      const haul = r.haul.map((h) => `${h.qty} ${itemById[h.item].name.toLowerCase()}`).join(', ');
      items.push(r.line ? `${r.line} (${haul})` : `${r.name} came back from ${r.zone} with ${haul}.`);
    }
    for (const [id, up] of Object.entries(s.skillUps || {})) {
      items.push(`${professionById[id].name} rose from ${up.from} to ${up.to}.`);
    }
    for (const id of Object.keys(s.skillCapped || {})) {
      items.push(`${professionById[id].name} is at its rank cap. Train the next rank to keep improving.`);
    }
    items.push(...s.lines);
  }
  const waiting = Object.entries(mailbox.items);

  return el('section', { class: 'panel' },
    el('h2', {}, s ? 'While you were away' : 'Ready to collect'),
    s ? el('p', { class: 'dim' }, `You were away ${formatDuration(s.to - s.from)}.`) : null,
    items.length ? el('ul', { class: 'list' }, items.map((line) => el('li', {}, line))) : null,
    mailbox.copper || waiting.length ? el('p', { style: 'margin-top:12px' }, 'To collect: ',
      mailbox.copper ? coins(mailbox.copper) : null,
      waiting.length ? ` ${waiting.map(([id, qty]) => `${qty} × ${itemById[id].name}`).join(', ')}` : null) : null,
    el('div', { class: 'btn-row', style: 'margin-top:12px' },
      el('button', { class: 'btn btn-primary', type: 'button', onclick: () => ctx.collectAll() }, 'Collect all')),
  );
}
