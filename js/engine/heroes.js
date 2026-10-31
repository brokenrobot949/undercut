// The tavern: a hire board of heroes, and expeditions to gathering zones.
// Phase 1: every hero on the board is a miner; Herbalism and Skinning arrive
// in Phase 2. A trip never fails: a bad haul just brings home half a load.

import { tuning } from '../../data/tuning.js';
import { zones, zoneById } from '../../data/zones.js';
import { races, raceById } from '../../data/races.js';
import { heroNames, badHaulLines } from '../../data/names.js';
import { schedule } from './clock.js';
import { rngNext, rngInt, rngPick, rngChance, rngRange } from './rng.js';
import { recipes } from '../../data/recipes.js';
import { knowsRecipe, recipeColor } from './skills.js';

const HOUR = 60 * 60 * 1000;
const TV = tuning.tavern;

export function createTavern(state, now) {
  state.tavern = { board: [], expeditions: [], nextHeroId: 1, nextRefreshAt: now + TV.refreshHours * HOUR };
  rollBoard(state);
  schedule(state, 'tavern-refresh', state.tavern.nextRefreshAt);
}

// The first hero on the board always suits the tier you're crafting in, so a
// new shop isn't left without a miner it can use. The rest roll any level.
function rollBoard(state) {
  state.tavern.board = [];
  const band = zones.find((z) => z.tier === workingTier(state))?.levels;
  for (let i = 0; i < TV.boardSize; i++) state.tavern.board.push(rollHero(state, i === 0 ? band : null));
}

// Highest tier among known recipes that still give skill; tier 1 for a new shop.
function workingTier(state) {
  if (!state.skills) return 1;
  let tier = 1;
  for (const r of recipes) {
    const color = recipeColor(state, r);
    if (color && color !== 'red' && color !== 'gray' && knowsRecipe(state, r)) tier = Math.max(tier, r.tier);
  }
  return tier;
}

function rollHero(state, band = null) {
  const factionRaces = races.filter((r) => r.faction === state.player.factionId);
  const race = rngPick(state.rng, factionRaces);
  const [minLevel, maxLevel] = TV.heroLevels;
  // More low-level heroes than high ones.
  const level = band ? rngInt(state.rng, Math.max(minLevel, band[0]), band[1])
    : minLevel + Math.floor((maxLevel - minLevel + 1) * rngNext(state.rng) ** 1.4);
  return {
    id: state.tavern.nextHeroId++,
    name: rngPick(state.rng, heroNames[race.id]),
    race: race.id,
    classId: rngPick(state.rng, race.classes),
    level,
    skills: { mining: Math.min(300, level * 5 + rngInt(state.rng, 0, 20)) },
  };
}

// Clock timer: the board refreshes every few hours.
export function refreshBoardTimer(state, timer) {
  rollBoard(state);
  state.tavern.nextRefreshAt = timer.at + TV.refreshHours * HOUR;
  schedule(state, 'tavern-refresh', state.tavern.nextRefreshAt);
}

// Pay to see new heroes now. The free refresh stays on its schedule.
export function payRefresh(state) {
  if (TV.refreshFee > state.copper) throw new Error("You can't cover the refresh fee.");
  state.copper -= TV.refreshFee;
  rollBoard(state);
}

// ---- Hiring -------------------------------------------------------------------

export function heroProfession(hero) {
  return Object.keys(hero.skills)[0];
}

export function zonesFor(hero) {
  const prof = heroProfession(hero);
  return zones.filter((z) => z.loot[prof] && hero.level >= z.levels[0] && hero.level <= z.levels[1] &&
    hero.skills[prof] >= z.minSkill);
}

function perk(hero) {
  return raceById[hero.race].perk;
}

// Whether the hero's racial perk does anything for the gathering they do.
// (Extra general loot arrives with general loot in Phase 2.)
export function perkApplies(hero) {
  const p = perk(hero);
  if (p.type === 'yield') return p.profession === heroProfession(hero);
  return p.type !== 'extraLoot';
}

export function hireFee(hero, zone, hours) {
  const p = perk(hero);
  const mult = p.type === 'fee' ? p.value : 1;
  return Math.max(1, Math.round(zone.feePerHour * hours ** TV.feeExponent * mult));
}

export function tripLength(hero, hours) {
  const p = perk(hero);
  return hours * HOUR * (p.type === 'tripTime' ? p.value : 1);
}

function yieldMult(hero, zone) {
  const prof = heroProfession(hero);
  const p = perk(hero);
  const skillBonus = 1 + Math.min(0.5, (hero.skills[prof] - zone.minSkill) / 200);
  return skillBonus * (p.type === 'yield' && p.profession === prof ? p.value : 1);
}

// Average haul, for the hire screen: [{ item, qty }].
export function expectedHaul(hero, zone, hours) {
  const mult = yieldMult(hero, zone);
  return zone.loot[heroProfession(hero)].map((l) => ({ item: l.item, qty: Math.round(l.perHour * hours * mult) }));
}

export function expeditionSlots(state) {
  return TV.expeditionSlots;
}

export function hireHero(state, heroId, zoneId, hours, now) {
  const hero = state.tavern.board.find((h) => h.id === heroId);
  if (!hero) throw new Error('That hero has left the tavern.');
  const zone = zoneById[zoneId];
  if (!zone || !zonesFor(hero).includes(zone)) throw new Error(`${hero.name} can't gather there.`);
  if (!TV.tripHours.includes(hours)) throw new Error('Pick a trip length.');
  if (state.tavern.expeditions.length >= expeditionSlots(state)) {
    throw new Error(`All ${expeditionSlots(state)} expedition slots are in use.`);
  }
  const fee = hireFee(hero, zone, hours);
  if (fee > state.copper) throw new Error(`${hero.name} wants ${fee} copper and you can't cover it.`);

  state.copper -= fee;
  state.tavern.board = state.tavern.board.filter((h) => h.id !== heroId);
  const returnsAt = now + tripLength(hero, hours);
  const timer = schedule(state, 'expedition', returnsAt, { heroId });
  state.tavern.expeditions.push({ hero, zoneId, hours, fee, startedAt: now, returnsAt, timerId: timer.id });
  return fee;
}

// Clock timer: a hero comes home. The haul is rolled now, in order, so
// catch-up gives the same result as watching it happen.
export function expeditionReturns(state, timer, summary) {
  const i = state.tavern.expeditions.findIndex((e) => e.hero.id === timer.data.heroId);
  if (i < 0) return;
  const [trip] = state.tavern.expeditions.splice(i, 1);
  const { hero } = trip;
  const zone = zoneById[trip.zoneId];
  const mult = yieldMult(hero, zone);
  const p = perk(hero);
  const bad = rngChance(state.rng, TV.badHaulChance * (p.type === 'badHaul' ? p.value : 1));

  const haul = [];
  for (const l of zone.loot[heroProfession(hero)]) {
    const exact = l.perHour * trip.hours * mult * rngRange(state.rng, 1 - TV.haulSpread, 1 + TV.haulSpread) * (bad ? 0.5 : 1);
    const qty = Math.floor(exact) + (rngNext(state.rng) < exact % 1 ? 1 : 0);
    if (qty > 0) {
      haul.push({ item: l.item, qty });
      state.mailbox.items[l.item] = (state.mailbox.items[l.item] || 0) + qty;
    }
  }
  const line = bad ? rngPick(state.rng, badHaulLines).replace('{name}', hero.name).replace('{zone}', zone.name) : null;
  summary.returns.push({ name: hero.name, zone: zone.name, haul, line });
}
