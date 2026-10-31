// Shop tab (home): "While you were away", commissions, town crier, and the
// Trade Guild with its skill trainer.

import { el, coins, comingSoon, formatDuration } from './components.js';
import { getFaction, getStanding } from '../engine/game.js';
import { itemById } from '../../data/items.js';
import { professions, professionById } from '../../data/professions.js';
import { nextTraining, trainRank } from '../engine/skills.js';
import { skillBar } from './skill-bar.js';

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
      el('h3', {}, 'Trainer'),
      el('p', { class: 'small dim' }, 'Each rank lets your skill climb higher. Train the next one once you reach the cap.'),
      professions.map((p) => trainerRow(ctx, p.id)),
      el('p', { class: 'dim small' }, 'The quartermaster and shop upgrades arrive in Phase 3.')),
  );
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
