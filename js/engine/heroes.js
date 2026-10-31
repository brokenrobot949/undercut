// The tavern: a hire board of heroes, and expeditions to gathering zones.
// Each hero knows one or two of Mining, Herbalism and Skinning, and gathers
// with every one of them the zone has loot for. Every trip also brings home
// bonus loot (data/loot.js). A trip never fails: a bad haul just brings home
// half the gathered load.
//
// Regulars: the first hire makes a hero a regular. Each later hire adds a
// loyalty level (cheaper fee, bigger haul), and every trip earns levels, so a
// regular you keep hiring grows into higher zones. Regulars in town show in
// their own row, next to the board.

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
import { knowsRecipe, recipeColor, recipeProfession, startingProfession } from './skills.js';
import { noteTutorial } from './tutorial.js';
import { boardSizeFor, expeditionSlotsFor } from './upgrades.js';

const HOUR = 60 * 60 * 1000;
const TV = tuning.tavern;

export function createTavern(state, now) {
  state.tavern = { board: [], expeditions: [], regulars: [], nextHeroId: 1, nextRefreshAt: now + TV.refreshHours * HOUR };
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
  const pair = professionById[startingProfession(state)].gathering;
  for (let i = 0; i < boardSizeFor(state); i++) state.tavern.board.push(rollHero(state, i === 0 ? { band, pair } : {}));
}

// Highest tier among known recipes of your starting profession that still give
// skill; tier 1 for a new shop.
function workingTier(state) {
  if (!state.skills || !state.player.professions) return 1;
  let tier = 1;
  for (const r of recipes) {
    if (recipeProfession(r) !== startingProfession(state)) continue;
    const color = recipeColor(state, r);
    if (color && color !== 'red' && color !== 'gray' && knowsRecipe(state, r)) tier = Math.max(tier, r.tier);
  }
  return tier;
}

function rollHero(state, { band = null, pair = null } = {}) {
  const factionRaces = races.filter((r) => r.faction === state.player.factionId);
  const race = rngPick(state.rng, factionRaces);
  // New faces only: skip names your regulars already have.
  const taken = new Set(state.tavern.regulars.map((r) => r.name));
  const names = heroNames[race.id].filter((n) => !taken.has(n));
  const [minLevel, maxLevel] = TV.heroLevels;
  // More low-level heroes than high ones.
  const level = band ? rngInt(state.rng, Math.max(minLevel, band[0]), band[1])
    : minLevel + Math.floor((maxLevel - minLevel + 1) * rngNext(state.rng) ** 1.4);
  return {
    id: state.tavern.nextHeroId++,
    name: rngPick(state.rng, names.length ? names : heroNames[race.id]),
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

// Clock timer: the board refreshes every few hours, and regulars drift in and out of town.
export function refreshBoardTimer(state, timer) {
  rollBoard(state);
  // A regular back from a trip in the last few hours stays; the rest come and go.
  for (const r of state.tavern.regulars) {
    if (r.away) continue;
    const justBack = timer.at - (r.backAt ?? 0) < TV.refreshHours * HOUR;
    r.inTown = justBack || rngChance(state.rng, TV.regulars.inTownChance);
  }
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
  const mult = (p.type === 'fee' ? p.value : 1) * (1 - (hero.loyalty ?? 0) * TV.regulars.feeCutPerLoyalty);
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
  const loyal = 1 + (hero.loyalty ?? 0) * TV.regulars.yieldPerLoyalty;
  return skillBonus * share * loyal * (p.type === 'yield' && p.profession === prof ? p.value : 1);
}

// Average gathered haul, for the hire screen: [{ item, qty }]. Bonus loot not included.
export function expectedHaul(hero, zone, hours) {
  return gatheredProfessions(hero, zone).flatMap((prof) =>
    zone.loot[prof].map((l) => ({ item: l.item, qty: Math.round(l.perHour * hours * yieldMult(hero, zone, prof)) })));
}

export function expeditionSlots(state) {
  return expeditionSlotsFor(state);
}

// Regulars who are in town and free to hire.
export function regularsInTown(state) {
  return state.tavern.regulars.filter((r) => r.inTown && !r.away);
}

export function hireHero(state, heroId, zoneId, hours, now) {
  const regular = regularsInTown(state).find((r) => r.id === heroId);
  const hero = regular ?? state.tavern.board.find((h) => h.id === heroId);
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
  noteTutorial(state, 'hire');
  const r = regular ?? makeRegular(state, hero);
  if (regular) r.loyalty = Math.min(TV.regulars.maxLoyalty, r.loyalty + 1);
  r.away = true;
  r.inTown = false;
  r.lastHiredAt = now;
  const returnsAt = now + tripLength(r, hours);
  const timer = schedule(state, 'expedition', returnsAt, { heroId });
  // The trip keeps its own copy of the hero; levels earned go back to the regular on return.
  state.tavern.expeditions.push({ hero: { ...r }, zoneId, hours, fee, startedAt: now, returnsAt, timerId: timer.id });
  return fee;
}

// A first hire: the hero leaves the board and joins your regulars. If the
// tavern already remembers the most regulars it can, the least loyal one who
// isn't away is forgotten.
function makeRegular(state, hero) {
  const t = state.tavern;
  t.board = t.board.filter((h) => h.id !== hero.id);
  if (t.regulars.length >= TV.regulars.max) {
    const home = t.regulars.filter((x) => !x.away).sort((a, b) => a.loyalty - b.loyalty || a.lastHiredAt - b.lastHiredAt);
    if (home.length) t.regulars = t.regulars.filter((x) => x !== home[0]);
  }
  const r = { ...hero, loyalty: 0, xp: 0, inTown: false, away: false, lastHiredAt: 0 };
  t.regulars.push(r);
  return r;
}

// Levels earned on a trip: every level adds 5 to each gathering skill.
function gainLevels(state, trip, summary) {
  const r = state.tavern.regulars.find((x) => x.id === trip.hero.id);
  if (!r) return;
  r.away = false;
  r.inTown = true; // a hero just back stays in town for at least one full board refresh
  r.backAt = trip.returnsAt;
  const [, maxLevel] = TV.heroLevels;
  r.xp += trip.hours * TV.regulars.levelsPerTripHour;
  const from = r.level;
  while (r.xp >= 1 && r.level < maxLevel) {
    r.xp -= 1;
    r.level++;
    for (const p of Object.keys(r.skills)) r.skills[p] = Math.min(300, r.skills[p] + 5);
  }
  if (r.level >= maxLevel) r.xp = 0;
  if (r.level > from) summary.lines.push(`${r.name} is now level ${r.level}.`);
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
  gainLevels(state, trip, summary);
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
