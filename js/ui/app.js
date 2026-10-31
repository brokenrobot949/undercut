// The app shell: header, tab content and the tab bar.

import { el, setTheme, updateLive, uiIcon, tickingCoins } from './components.js';
import { getFaction, getStanding } from '../engine/game.js';
import { shopSigns } from '../../data/guild.js';
import { signStyleOf } from '../engine/shop-extras.js';
import { openSettings } from './settings.js';
import { renderShop, TUTORIAL_TABS } from './shop.js';
import { tutorialStep, stepMet } from '../engine/tutorial.js';
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

  // Redrawing under a finger can swallow the tap, so redraws wait for it to lift.
  let pointerDown = false;
  let pendingRender = false;
  root.addEventListener('pointerdown', () => { pointerDown = true; }, true);
  const release = () => {
    pointerDown = false;
    if (pendingRender) { pendingRender = false; setTimeout(render, 0); }
  };
  root.addEventListener('pointerup', release, true);
  root.addEventListener('pointercancel', release, true);

  let headerKey = '';
  let shownCopper = null; // gold last drawn in the header, so a rise can count up
  function renderHeader() {
    const { state } = ctx;
    updateLive(ctx.now());
    const key = `${state.copper}|${state.reputation}|${state.player.name}|${state.player.factionId}|${state.extras?.sign}`;
    if (key === headerKey) return;
    headerKey = key;
    const faction = getFaction(state);
    const { current, share } = getStanding(state);
    const pct = share * 100;
    setTheme(faction.theme);

    header.replaceChildren(
      el('div', { class: 'header-title' },
        el('div', { class: `shop-name sign-${shopSigns[current.id].sign}${signStyleOf(state) ? ` sign-style-${signStyleOf(state)}` : ''}` }, `${state.player.name}'s Shop`),
        el('div', { class: 'standing' },
          el('span', {}, current.name, shopSigns[current.id].title ? el('span', { class: 'shop-title' }, ` · ${shopSigns[current.id].title}`) : null),
          el('div', { class: 'bar', role: 'progressbar', 'aria-label': 'Guild standing',
            'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(pct)) },
            el('span', { style: `width:${pct}%` })))),
      tickingCoins(shownCopper ?? state.copper, state.copper),
      el('button', { class: 'menu-btn', type: 'button', 'aria-label': 'Settings',
        onclick: () => openSettings(ctx) },
        el('span'), el('span'), el('span')),
    );
    shownCopper = state.copper;
  }

  function renderTabs() {
    // During the tutorial, a glow shows where the current step is done, or the
    // Shop tab once it's ready to claim.
    const step = tutorialStep(ctx.state);
    const hintTab = step && (stepMet(ctx.state) ? 'shop' : TUTORIAL_TABS[step.goal]);
    tabbar.replaceChildren(...TABS.map((tab) => el('button', {
      class: `tab${tab.id === hintTab && tab.id !== activeTab ? ' tab-hint' : ''}`, type: 'button', role: 'tab',
      'aria-selected': String(tab.id === activeTab),
      onclick: () => { activeTab = tab.id; render(); main.scrollTop = 0; },
    },
      uiIcon(tab.id),
      tab.label,
      // Alert dot: something finished while you were away.
      tab.id === 'shop' && ctx.away && activeTab !== 'shop' ? el('span', { class: 'alert-dot', 'aria-label': 'New' }) : null,
    )));
  }

  ctx.render = render;
  ctx.goTab = (id) => { activeTab = id; render(); main.scrollTop = 0; };

  function render() {
    if (pointerDown) { pendingRender = true; return; }
    headerKey = '';
    renderTabs();
    const tab = TABS.find((t) => t.id === activeTab);
    const scroll = main.scrollTop;
    main.replaceChildren(tab.render(ctx));
    main.scrollTop = scroll;
    renderHeader();
  }

  render();
  return { render, renderHeader };
}
