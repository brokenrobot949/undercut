// Tavern tab: the hire board and heroes out gathering.
// Phase 1: miners only. Regulars and the other gathering professions arrive in Phase 2.

import { el, coins, openSheet, countdown, progress, formatDuration, fill } from './components.js';
import { tuning } from '../../data/tuning.js';
import { itemById } from '../../data/items.js';
import { zoneById } from '../../data/zones.js';
import { raceById, classById } from '../../data/races.js';
import {
  zonesFor, hireFee, tripLength, expectedHaul, expeditionSlots, payRefresh, hireHero, heroProfession, perkApplies,
} from '../engine/heroes.js';

const PROFESSION_NAMES = { mining: 'Mining', herbalism: 'Herbalism', skinning: 'Skinning' };

export function renderTavern(ctx) {
  const { state } = ctx;
  const { tavern } = state;
  return el('div', { class: 'main-inner' },
    el('section', { class: 'panel' },
      el('h2', {}, `Out gathering (${tavern.expeditions.length} / ${expeditionSlots(state)})`),
      tavern.expeditions.length ? el('div', { class: 'queue' }, tavern.expeditions.map((trip) => el('div', { class: 'queue-row' },
        el('span', { class: 'item-name' }, `${trip.hero.name} · ${zoneById[trip.zoneId].name}`),
        el('span', { class: 'small dim' }, 'Back in ', countdown(trip.returnsAt)),
        progress(trip.startedAt, trip.returnsAt))))
        : el('p', { class: 'small dim' }, 'Nobody is out. Hire a hero below to gather materials while you are away.')),
    el('section', { class: 'panel' },
      el('h2', {}, 'Hire board'),
      el('p', { class: 'small dim' }, 'New heroes in ', countdown(tavern.nextRefreshAt), '.'),
      tavern.board.length ? el('div', { class: 'hero-list' }, tavern.board.map((hero) => heroCard(ctx, hero)))
        : el('p', { class: 'small dim' }, 'Everyone has been hired. New heroes arrive soon.'),
      el('button', { class: 'btn wide', type: 'button', onclick: () => ctx.act((s) => payRefresh(s)) },
        'See new heroes now (', coins(tuning.tavern.refreshFee), ')')),
  );
}

function perkText(hero) {
  const text = raceById[hero.race].perk.text;
  return perkApplies(hero) ? text : `${text} (no use on this trip)`;
}

function heroCard(ctx, hero) {
  const race = raceById[hero.race];
  const prof = heroProfession(hero);
  const options = zonesFor(hero);
  const cheapest = options.length ? Math.min(...options.map((z) => hireFee(hero, z, tuning.tavern.tripHours[0]))) : null;
  return el('button', { class: 'hero-card', type: 'button', onclick: () => openHireSheet(ctx, hero), disabled: !options.length },
    el('span', { class: 'hero-name' }, hero.name),
    el('span', { class: 'small' }, `Level ${hero.level} ${race.name} ${classById[hero.classId].name}`),
    el('span', { class: 'small' }, `${PROFESSION_NAMES[prof]} ${hero.skills[prof]}`),
    el('span', { class: 'small dim' }, perkText(hero)),
    el('span', { class: 'small hero-fee' }, cheapest !== null ? ['From ', coins(cheapest)] : 'No zone fits this hero yet'));
}

function openHireSheet(ctx, hero) {
  const sheet = openSheet(`Hire ${hero.name}`);
  const options = zonesFor(hero);
  let zone = options[0];
  let hours = 1;
  draw();

  function draw() {
    const fee = hireFee(hero, zone, hours);
    const haul = expectedHaul(hero, zone, hours);
    fill(sheet.body, 
      el('p', { class: 'small' }, `Level ${hero.level} ${raceById[hero.race].name} ${classById[hero.classId].name} · `,
        `${PROFESSION_NAMES[heroProfession(hero)]} ${hero.skills[heroProfession(hero)]} · ${perkText(hero)}`),
      el('div', { class: 'field' },
        el('label', {}, 'Where'),
        el('div', { class: 'btn-row seg' }, options.map((z) => el('button', {
          class: `btn${z === zone ? ' btn-primary' : ''}`, type: 'button', onclick: () => { zone = z; draw(); },
        }, z.name))),
        el('span', { class: 'small dim' }, zone.blurb)),
      el('div', { class: 'field' },
        el('label', {}, 'How long'),
        el('div', { class: 'btn-row seg' }, tuning.tavern.tripHours.map((h) => el('button', {
          class: `btn${h === hours ? ' btn-primary' : ''}`, type: 'button', onclick: () => { hours = h; draw(); },
        }, h < 1 ? `${h * 60} min` : `${h} h`)))),
      el('p', { class: 'small' }, 'Expected haul: ',
        haul.map((h) => `${h.qty} ${itemById[h.item].name.toLowerCase()}`).join(', '),
        `. Back in ${formatDuration(tripLength(hero, hours))}.`),
      el('p', { class: 'small dim' }, 'Every haul varies a little, and now and then a hero comes home with half a load.'),
      ctx.state.tavern.expeditions.length >= expeditionSlots(ctx.state)
        ? el('p', { class: 'small' }, `All ${expeditionSlots(ctx.state)} expedition slots are in use. Hire again when a hero comes home.`)
        : el('button', { class: 'btn btn-primary wide', type: 'button', onclick: () => {
          if (ctx.act((s, now) => hireHero(s, hero.id, zone.id, hours, now)) !== undefined) sheet.close();
        } }, 'Hire for ', coins(fee)),
    );
  }
}
