// Shop tab panels for the late-game gold sinks: "Your shop" (decor, sign
// styles and the trophy case) and guild donations.

import { el, coins, toast, countdown } from './components.js';
import { decor, signStyles, donations, trophies } from '../../data/shop-extras.js';
import { tints } from '../../data/icons.js';
import { buyDecor, buyTrophy, buySignStyle, setSignStyle, donate, donationOffer, donationEndsAt } from '../engine/shop-extras.js';
import { hasStanding } from '../engine/guild.js';

// A decor or trophy icon on a dark tile, in its tint.
function extraIcon(thing, owned = true) {
  const url = `url("./assets/icons/${thing.icon.split('/')[1]}.svg")`;
  return el('span', { class: `icon-tile icon-md${owned ? '' : ' unowned'}` },
    el('span', { class: 'icon', 'aria-hidden': 'true', style: `-webkit-mask-image:${url};mask-image:${url};color:${tints[thing.tint]}` }));
}

function buyRow(ctx, thing, owned, onBuy, extra = null) {
  return el('div', { class: 'my-listing with-icon one-line' },
    extraIcon(thing, owned),
    el('span', { class: 'item-name' }, thing.name),
    owned ? el('span', { class: 'small dim' }, 'Owned')
      : el('button', { class: `btn small-btn${ctx.state.copper >= thing.cost ? ' btn-primary' : ''}`, type: 'button',
        disabled: ctx.state.copper < thing.cost, onclick: () => ctx.act((s) => { onBuy(s); toast(`${thing.name}: yours.`); }) }, coins(thing.cost)),
    extra);
}

export function yourShopPanel(ctx) {
  const x = ctx.state.extras;
  const ownedDecor = decor.filter((d) => x.decor[d.id]);
  const ownedTrophies = trophies.filter((t) => x.trophies[t.id]);
  return el('section', { class: 'panel' },
    el('h2', {}, 'Your shop'),
    el('p', { class: 'small dim' }, 'Decor, sign styles and trophies are just for show: something to spend on once your shop has everything it needs.'),
    ownedDecor.length || ownedTrophies.length
      ? el('div', { class: 'showcase' }, [...ownedDecor, ...ownedTrophies].map((t) => el('span', { class: 'showcase-item', title: t.name }, extraIcon(t))))
      : null,
    el('h3', {}, 'Decor'),
    el('div', { class: 'market-list' }, decor.map((d) => buyRow(ctx, d, x.decor[d.id], (s) => buyDecor(s, d.id)))),
    el('h3', {}, 'Shop sign'),
    el('div', { class: 'market-list' },
      el('div', { class: 'my-listing one-line' },
        el('span', { class: 'item-name' }, 'Plain sign'),
        x.sign === null ? el('span', { class: 'small dim' }, 'Up now')
          : el('button', { class: 'btn small-btn', type: 'button', onclick: () => ctx.act((s) => setSignStyle(s, null)) }, 'Use')),
      signStyles.map((g) => el('div', { class: 'my-listing one-line' },
        el('span', { class: `item-name sign-preview sign-style-${g.style}` }, g.name),
        x.sign === g.id ? el('span', { class: 'small dim' }, 'Up now')
          : x.signs[g.id] ? el('button', { class: 'btn small-btn', type: 'button', onclick: () => ctx.act((s) => setSignStyle(s, g.id)) }, 'Use')
            : el('button', { class: `btn small-btn${ctx.state.copper >= g.cost ? ' btn-primary' : ''}`, type: 'button', disabled: ctx.state.copper < g.cost,
              onclick: () => ctx.act((s) => { buySignStyle(s, g.id); toast(`${g.name} is up.`); }) }, coins(g.cost))))),
    el('h3', {}, 'Trophy case'),
    el('div', { class: 'market-list' }, trophies.map((t) => buyRow(ctx, t, x.trophies[t.id], (s) => buyTrophy(s, t.id)))),
  );
}

export function donationsPanel(ctx) {
  const { state } = ctx;
  const now = ctx.now();
  const open = donations.some((d) => hasStanding(state, d.standing));
  return el('section', { class: 'panel' },
    el('h2', {}, 'Guild donations'),
    el('p', { class: 'small dim' }, open
      ? 'Give to the guild for a bonus that lasts a day. Give again to add another day, up to three.'
      : 'From Honored, the guild takes donations for bonuses that last a day.'),
    open ? el('div', { class: 'market-list' }, donations.map((d) => {
      const offer = donationOffer(state, d.id, now);
      const ends = donationEndsAt(state, d.id, now);
      return el('div', { class: 'my-listing with-icon' },
        extraIcon(d),
        el('span', { class: 'item-name' }, d.name),
        el('button', { class: `btn small-btn${offer.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !offer.ready,
          onclick: () => ctx.act((s, t) => { donate(s, d.id, t); toast(`${d.name}: thank you! The bonus runs ${ends ? 'another day' : 'for a day'}.`); }) }, coins(d.cost)),
        el('span', { class: 'small dim market-sub' }, d.blurb, ends ? [' ', el('span', { class: 'estimate' }, 'Running: ', countdown(ends), ' left.')] : ''));
    })) : null);
}
