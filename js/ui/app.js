// The app shell: header, tab content and the tab bar.

import { el, coins } from './components.js';
import { getFaction, getStanding } from '../engine/game.js';
import { openSettings } from './settings.js';
import { renderShop } from './shop.js';
import { renderWorkshop } from './workshop.js';
import { renderAuction } from './auction.js';
import { renderTavern } from './tavern.js';
import { renderBags } from './bags.js';

const TABS = [
  { id: 'shop', label: 'Shop', render: renderShop },
  { id: 'workshop', label: 'Workshop', render: renderWorkshop },
  { id: 'auction', label: 'Auction', render: renderAuction },
  { id: 'tavern', label: 'Tavern', render: renderTavern },
  { id: 'bags', label: 'Bags', render: renderBags },
];

// Mounts the shell and returns { render, renderHeader }.
export function mountApp(root, ctx) {
  let activeTab = 'shop';

  const header = el('header', { class: 'header' });
  const main = el('main', { class: 'main', id: 'main' });
  const tabbar = el('nav', { class: 'tabbar', role: 'tablist', 'aria-label': 'Main' });
  root.replaceChildren(el('div', { class: 'app' }, header, main, tabbar));

  function renderHeader() {
    const { state } = ctx;
    const faction = getFaction(state);
    const { current, next } = getStanding(state);
    const pct = next ? ((state.reputation - current.rep) / (next.rep - current.rep)) * 100 : 100;
    root.setAttribute('data-theme', faction.theme);

    header.replaceChildren(
      el('div', { class: 'header-title' },
        el('div', { class: 'shop-name' }, `${state.player.name}'s Shop`),
        el('div', { class: 'standing' },
          el('span', {}, current.name),
          el('div', { class: 'bar', role: 'progressbar', 'aria-label': 'Guild standing',
            'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(pct)) },
            el('span', { style: `width:${pct}%` })))),
      coins(state.copper),
      el('button', { class: 'menu-btn', type: 'button', 'aria-label': 'Settings',
        onclick: () => openSettings(ctx) },
        el('span'), el('span'), el('span')),
    );
  }

  function renderTabs() {
    tabbar.replaceChildren(...TABS.map((tab) => el('button', {
      class: 'tab', type: 'button', role: 'tab',
      'aria-selected': String(tab.id === activeTab),
      onclick: () => { activeTab = tab.id; render(); main.scrollTop = 0; },
    },
      tab.label,
      // Alert dot: something finished while you were away.
      tab.id === 'shop' && ctx.away && activeTab !== 'shop' ? el('span', { class: 'alert-dot', 'aria-label': 'New' }) : null,
    )));
  }

  function render() {
    renderHeader();
    renderTabs();
    const tab = TABS.find((t) => t.id === activeTab);
    main.replaceChildren(tab.render(ctx));
  }

  render();
  return { render, renderHeader };
}
