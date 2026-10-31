// The tavern: a hire board of heroes, and expeditions to gathering zones.
// Each hero knows one or two of Mining, Herbalism and Skinning, and gathers
// with every one of them the zone has loot for. Every trip also brings home
// bonus loot (data/loot.js). A trip never fails: a bad haul just brings home
// half the gathered load.

import { tuning } from '../../data/tuning.js';
import { zones, zoneById } from '../../data/zones.js';
import { races, raceById } from '../../data/races.js';
import { heroNames, badHaulLines } from '../../data/names.js';
import { items } from '../../data/items.js';
import { professionById } from '../../data/professions.js';
import { generalLoot } from '../../data/loot.js';
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

export const GATHERING = ['mining', 'herbalism', 'skinning'];

// The first hero on the board always gathers for your profession at the tier
// you're crafting in, so a shop is never left without a hero it can use. The
// rest roll any level and professions.
function rollBoard(state) {
  state.tavern.board = [];
  const band = zones.find((z) => z.tier === workingTier(state))?.levels;
  // Until the starting profession choice arrives, every shop is a smithy.
  const pair = professionById.blacksmithing.gathering;
  for (let i = 0; i < TV.boardSize; i++) state.tavern.board.push(rollHero(state, i === 0 ? { band, pair } : {}));
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

function rollHero(state, { band = null, pair = null } = {}) {
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
    skills: rollGathering(state, level, pair),
  };
}

// One or two gathering professions, each skilled to about 5 per level.
function rollGathering(state, level, pair) {
  const profs = [pair ?? rngPick(state.rng, GATHERING)];
  if (rngChance(state.rng, TV.dualProfessionChance)) profs.push(rngPick(state.rng, GATHERING.filter((p) => p !== profs[0])));
  return Object.fromEntries(profs.map((p) => [p, Math.min(300, level * 5 + rngInt(state.rng, 0, 20))]));
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

export function heroProfessions(hero) {
  return Object.keys(hero.skills);
}

// The professions a hero gathers with in a zone.
export function gatheredProfessions(hero, zone) {
  return heroProfessions(hero).filter((p) => zone.loot[p] && hero.skills[p] >= zone.minSkill);
}

export function zonesFor(hero) {
  return zones.filter((z) => hero.level >= z.levels[0] && hero.level <= z.levels[1] && gatheredProfessions(hero, z).length);
}

function perk(hero) {
  return raceById[hero.race].perk;
}

// Whether the hero's racial perk does anything for the gathering they do
// (in a zone, if one is given).
export function perkApplies(hero, zone = null) {
  const p = perk(hero);
  if (p.type !== 'yield') return true;
  return (zone ? gatheredProfessions(hero, zone) : heroProfessions(hero)).includes(p.profession);
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

// Gathering speed for one profession: skill above the zone's minimum, the
// racial perk, and the split when a hero gathers with two professions.
function yieldMult(hero, zone, prof) {
  const p = perk(hero);
  const skillBonus = 1 + Math.min(0.5, (hero.skills[prof] - zone.minSkill) / 200);
  const share = gatheredProfessions(hero, zone).length > 1 ? TV.dualGatherShare : 1;
  return skillBonus * share * (p.type === 'yield' && p.profession === prof ? p.value : 1);
}

// Average gathered haul, for the hire screen: [{ item, qty }]. Bonus loot not included.
export function expectedHaul(hero, zone, hours) {
  return gatheredProfessions(hero, zone).flatMap((prof) =>
    zone.loot[prof].map((l) => ({ item: l.item, qty: Math.round(l.perHour * hours * yieldMult(hero, zone, prof)) })));
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
  const p = perk(hero);
  const profs = gatheredProfessions(hero, zone);
  const bad = rngChance(state.rng, TV.badHaulChance * (p.type === 'badHaul' ? p.value : 1));

  const haul = [];
  const give = (item, qty) => {
    const h = haul.find((x) => x.item === item);
    if (h) h.qty += qty; else haul.push({ item, qty });
    state.mailbox.items[item] = (state.mailbox.items[item] || 0) + qty;
  };
  for (const prof of profs) {
    const mult = yieldMult(hero, zone, prof);
    for (const l of zone.loot[prof]) {
      const exact = l.perHour * trip.hours * mult * rngRange(state.rng, 1 - TV.haulSpread, 1 + TV.haulSpread) * (bad ? 0.5 : 1);
      const qty = Math.floor(exact) + (rngNext(state.rng) < exact % 1 ? 1 : 0);
      if (qty > 0) give(l.item, qty);
    }
  }
  rollBonusLoot(state, zone, trip.hours, p.type === 'extraLoot' ? p.value : 0, give);
  const lines = badHaulLines[profs[0]] ?? badHaulLines.mining;
  const line = bad ? rngPick(state.rng, lines).replace('{name}', hero.name).replace('{zone}', zone.name) : null;
  summary.returns.push({ name: hero.name, zone: zone.name, haul, line });
}

// Bonus loot from the zone's tier: cloth, junk, essences, gems, and now and
// then a recipe scroll. give(itemId, qty) adds it to the haul.
function rollBonusLoot(state, zone, hours, extraRolls, give) {
  const ofKind = (kind) => items.filter((i) => i.loot === kind && i.tier === zone.tier);
  const rolls = Math.max(1, Math.ceil(hours * generalLoot.rollsPerHour)) + extraRolls;
  for (let i = 0; i < rolls; i++) {
    let r = rngNext(state.rng);
    const entry = generalLoot.table.find((e) => (r -= e.chance) < 0) ?? generalLoot.table[generalLoot.table.length - 1];
    const choices = ofKind(entry.loot);
    if (choices.length) give(rngPick(state.rng, choices).id, rngInt(state.rng, ...entry.qty));
  }
  const scrolls = ofKind('scroll');
  if (scrolls.length && rngChance(state.rng, generalLoot.scrollChancePerHour * hours)) give(rngPick(state.rng, scrolls).id, 1);
}
