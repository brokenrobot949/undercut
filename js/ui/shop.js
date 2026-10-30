// Shop tab (home): "While you were away", commissions, town crier, guild.

import { el, coins, comingSoon, formatDuration } from './components.js';
import { getFaction, getStanding } from '../engine/game.js';
import { itemById } from '../../data/items.js';

export function renderShop(ctx) {
  const { state } = ctx;
  const faction = getFaction(state);
  const { current, next } = getStanding(state);
  const mailboxFull = state.mailbox.copper > 0 || Object.keys(state.mailbox.items).length > 0;

  return el('div', { class: 'main-inner' },
    ctx.away || mailboxFull ? awayPanel(ctx) : null,
    comingSoon('Commission counter', 'Heroes will post requests here. Arrives in Phase 2.'),
    comingSoon('Town crier', 'Market events will be announced here. Arrives in Phase 3.'),
    el('section', { class: 'panel' },
      el('h2', {}, faction.guild),
      el('p', {}, `Standing: ${current.name}`,
        next ? el('span', { class: 'dim' }, ` · ${state.reputation.toLocaleString()} / ${next.rep.toLocaleString()} reputation`) : null),
      el('p', { class: 'dim small' }, 'Training, the quartermaster and shop upgrades arrive in later phases.')),
  );
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
