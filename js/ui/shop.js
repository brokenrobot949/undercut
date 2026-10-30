// Shop tab (home): "While you were away", commissions, town crier, guild.

import { el, comingSoon, formatDuration } from './components.js';
import { getFaction, getStanding } from '../engine/game.js';

export function renderShop(ctx) {
  const { state } = ctx;
  const faction = getFaction(state);
  const { current, next } = getStanding(state);

  return el('div', { class: 'main-inner' },
    ctx.away ? awayPanel(ctx) : null,
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
  const items = [];
  if (s.freshMarket) items.push('You were gone a long time, so the market has moved on to a fresh state.');
  else if (s.ticks) items.push(`The market updated ${s.ticks} time${s.ticks === 1 ? '' : 's'}.`);
  items.push(...s.lines);

  return el('section', { class: 'panel' },
    el('h2', {}, 'While you were away'),
    el('p', { class: 'dim' }, `You were away ${formatDuration(s.to - s.from)}.`),
    el('ul', { class: 'list' }, items.map((line) => el('li', {}, line))),
    el('div', { class: 'btn-row', style: 'margin-top:12px' },
      el('button', { class: 'btn btn-primary', type: 'button', onclick: () => ctx.dismissAway() }, 'Collect all')),
  );
}
