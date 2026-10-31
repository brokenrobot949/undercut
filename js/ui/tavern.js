// Tavern tab: heroes out gathering, regulars in town, and the hire board.
// Heroes gather with Mining, Herbalism or Skinning (some know two).

import { el, coins, openSheet, countdown, progress, formatDuration, fill } from './components.js';
import { tuning } from '../../data/tuning.js';
import { itemById } from '../../data/items.js';
import { zoneById } from '../../data/zones.js';
import { raceById, classById } from '../../data/races.js';
import {
  zonesFor, hireFee, tripLength, expectedHaul, expeditionSlots, payRefresh, hireHero, heroProfessions, perkApplies, regularsInTown,
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
    regularsPanel(ctx),
    el('section', { class: 'panel' },
      el('h2', {}, 'Hire board'),
      el('p', { class: 'small dim' }, 'New heroes in ', countdown(tavern.nextRefreshAt), '.'),
      tavern.board.length ? el('div', { class: 'hero-list' }, tavern.board.map((hero) => heroCard(ctx, hero)))
        : el('p', { class: 'small dim' }, 'Everyone has been hired. New heroes arrive soon.'),
      el('button', { class: 'btn wide', type: 'button', onclick: () => ctx.act((s) => payRefresh(s)) },
        'See new heroes now (', coins(tuning.tavern.refreshFee), ')')),
  );
}

// Heroes you've hired before. Only those in town can be hired right now.
function regularsPanel(ctx) {
  const { regulars } = ctx.state.tavern;
  if (!regulars.length) return null;
  const here = regularsInTown(ctx.state);
  const away = regulars.filter((r) => r.away).length;
  return el('section', { class: 'panel' },
    el('h2', {}, `Regulars (${regulars.length} / ${tuning.tavern.regulars.max})`),
    el('p', { class: 'small dim' }, `${here.length} in town${away ? `, ${away} out gathering` : ''}. `,
      'Each hire builds loyalty: a cheaper fee and a bigger haul. Regulars gain levels on every trip.'),
    here.length ? el('div', { class: 'hero-list' }, here.map((hero) => heroCard(ctx, hero)))
      : el('p', { class: 'small dim' }, 'None in town right now. They drift in when the board refreshes.'));
}

function loyaltyText(hero) {
  const max = tuning.tavern.regulars.maxLoyalty;
  const stars = `Loyalty ${'★'.repeat(hero.loyalty)}${'☆'.repeat(max - hero.loyalty)}`;
  if (!hero.loyalty) return `${stars} (hire again to build it)`;
  return `${stars} (fee −${Math.round(hero.loyalty * tuning.tavern.regulars.feeCutPerLoyalty * 100)}%, haul +${Math.round(hero.loyalty * tuning.tavern.regulars.yieldPerLoyalty * 100)}%)`;
}

function perkText(hero, zone = null) {
  const text = raceById[hero.race].perk.text;
  return perkApplies(hero, zone) ? text : `${text} (no use ${zone ? 'on this trip' : 'for this hero'})`;
}

function skillsText(hero) {
  return heroProfessions(hero).map((p) => `${PROFESSION_NAMES[p]} ${hero.skills[p]}`).join(' · ');
}

function heroCard(ctx, hero) {
  const race = raceById[hero.race];
  const options = zonesFor(hero);
  const cheapest = options.length ? Math.min(...options.map((z) => hireFee(hero, z, tuning.tavern.tripHours[0]))) : null;
  return el('button', { class: 'hero-card', type: 'button', onclick: () => openHireSheet(ctx, hero), disabled: !options.length },
    el('span', { class: 'hero-name' }, hero.name),
    el('span', { class: 'small' }, `Level ${hero.level} ${race.name} ${classById[hero.classId].name}`),
    el('span', { class: 'small' }, skillsText(hero)),
    hero.loyalty !== undefined ? el('span', { class: 'small loyalty', 'aria-label': `Loyalty ${hero.loyalty} of ${tuning.tavern.regulars.maxLoyalty}` }, loyaltyText(hero)) : null,
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
        `${skillsText(hero)} · ${perkText(hero, zone)}`),
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
      el('p', { class: 'small dim' }, 'Every trip also brings home bonus loot: cloth, junk, essences, gems, and now and then a recipe scroll. Hauls vary a little, and now and then a hero comes home with half a load.'),
      ctx.state.tavern.expeditions.length >= expeditionSlots(ctx.state)
        ? el('p', { class: 'small' }, `All ${expeditionSlots(ctx.state)} expedition slots are in use. Hire again when a hero comes home.`)
        : el('button', { class: 'btn btn-primary wide', type: 'button', onclick: () => {
          if (ctx.act((s, now) => hireHero(s, hero.id, zone.id, hours, now)) !== undefined) sheet.close();
        } }, 'Hire for ', coins(fee)),
    );
  }
}
