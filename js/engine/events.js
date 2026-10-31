// Market events and the town crier. A seeded calendar is planned a week
// ahead; each event starts and ends on a clock timer, so events play out
// while the game is closed and replay exactly on catch-up.
//
// While an event runs, it writes multipliers the market reads:
//   state.events.demandMult[itemId]  NPC buyers x this
//   state.events.supplyMult[itemId]  NPC restocking x this

import { events, eventById, calendarDays, firstEventHours } from '../../data/events.js';
import { tradeableItems, itemById } from '../../data/items.js';
import { recipes } from '../../data/recipes.js';
import { schedule } from './clock.js';
import { rngRange, rngPick, rngInt } from './rng.js';
import { hasProfession, recipeProfession } from './skills.js';
import { postGlut } from './market.js';
import { postCommission } from './commissions.js';
import { tutorialDone } from './tutorial.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function createEvents(state, now) {
  state.events = { list: [], nextId: 1, lastStart: {}, demandMult: {}, supplyMult: {} };
  planCalendar(state, now, true);
}

// ---- The calendar ------------------------------------------------------------

// Clock timer: once a day, plan any events that now fall inside the window.
export function planTimer(state, timer) {
  planCalendar(state, timer.at, false);
}

function planCalendar(state, now, isNew) {
  const ev = state.events;
  const until = now + calendarDays * DAY;
  for (const type of events) {
    const gap = () => type.everyDays * DAY * rngRange(state.rng, 0.7, 1.3);
    let at = ev.lastStart[type.id] !== undefined ? ev.lastStart[type.id] + gap()
      : now + (isNew ? firstEventHours * HOUR : 0) + gap() * rngRange(state.rng, 0, 1);
    while (at < until) {
      at = clearOfGroup(state, type, Math.max(at, now));
      const e = { id: ev.nextId++, type: type.id, startsAt: at, endsAt: at + type.hours * HOUR, status: 'planned', itemId: null };
      ev.list.push(e);
      ev.lastStart[type.id] = at;
      schedule(state, 'event-start', at, { id: e.id });
      at += gap();
    }
  }
  ev.list.sort((a, b) => a.startsAt - b.startsAt);
  schedule(state, 'event-plan', now + DAY);
}

// Demand events in the same group never overlap: push this one past any that would.
function clearOfGroup(state, type, at) {
  if (!type.group) return at;
  for (;;) {
    const clash = state.events.list.find((o) => eventById[o.type].group === type.group &&
      o.startsAt < at + type.hours * HOUR && at < o.endsAt);
    if (!clash) return at;
    at = clash.endsAt + HOUR;
  }
}

// ---- Starting and ending -------------------------------------------------------------

// Items an event's `match` picks out.
export function matchingItems(state, match = {}) {
  const cats = [].concat(match.category ?? []);
  const yours = match.yours ? yourItems(state) : null;
  return tradeableItems.filter((i) => (!cats.length || cats.includes(i.category)) &&
    (!match.armor || i.armor === match.armor) &&
    (!match.tiers || match.tiers.includes(i.tier)) &&
    (!match.idHas || match.idHas.some((w) => i.id.includes(w))) &&
    (!yours || yours.has(i.id)));
}

// Items your professions make or use.
function yourItems(state) {
  const set = new Set();
  for (const r of recipes) {
    const prof = recipeProfession(r);
    if (prof && !hasProfession(state, prof)) continue;
    if (!prof && r.station === 'forge' && !hasProfession(state, 'blacksmithing')) continue;
    set.add(r.makes.item);
    for (const m of r.mats) set.add(m.item);
  }
  return set;
}

// Clock timer: an event begins.
export function eventStartTimer(state, timer, summary) {
  const e = state.events.list.find((x) => x.id === timer.data.id);
  if (!e || e.status !== 'planned') return;
  if (!startEvent(state, e, timer.at)) {
    state.events.list = state.events.list.filter((x) => x !== e);
    return;
  }
  summary.lines.push(`Town crier: ${crierLine(e)}`);
}

// Returns false when the event has nothing to act on (no item, no recipe).
function startEvent(state, e, at) {
  const type = eventById[e.type];
  if (type.kind === 'supply' || type.kind === 'glut') {
    const pool = matchingItems(state, type.match);
    if (!pool.length) return false;
    e.itemId = rngPick(state.rng, pool).id;
  }
  if (type.kind === 'glut') {
    const m = state.market.items[e.itemId];
    e.listingId = postGlut(state, e.itemId, rngInt(state.rng, ...type.qty), m.fair * rngRange(state.rng, ...type.priceRange), at, e.endsAt).id;
  }
  if (type.kind === 'drive') {
    if (!tutorialDone(state)) return false;
    const c = postCommission(state, at, 'drive');
    if (!c) return false;
    e.commissionId = c.id;
  }
  e.status = 'active';
  e.startsAt = at;
  schedule(state, 'event-end', e.endsAt, { id: e.id });
  applyEffects(state);
  return true;
}

// Clock timer: an event is over.
export function eventEndTimer(state, timer, summary) {
  const e = state.events.list.find((x) => x.id === timer.data.id);
  if (!e) return;
  state.events.list = state.events.list.filter((x) => x !== e);
  applyEffects(state);
  if (eventById[e.type].kind === 'demand' || eventById[e.type].kind === 'supply') summary.lines.push(`${eventById[e.type].name} is over.`);
}

// Rebuilds the market multipliers from the events running now.
function applyEffects(state) {
  const demand = {};
  const supply = {};
  for (const e of activeEvents(state)) {
    const type = eventById[e.type];
    if (type.kind === 'demand') for (const i of matchingItems(state, type.match)) demand[i.id] = (demand[i.id] ?? 1) * type.mult;
    if (type.kind === 'supply' && e.itemId) supply[e.itemId] = (supply[e.itemId] ?? 1) * type.mult;
  }
  state.events.demandMult = demand;
  state.events.supplyMult = supply;
}

// ---- What the UI reads ------------------------------------------------------------

export function activeEvents(state) {
  return state.events?.list.filter((e) => e.status === 'active') ?? [];
}

// Planned events starting within `hours` (for the Ledger's early warning).
export function upcomingEvents(state, now, hours) {
  return state.events?.list.filter((e) => e.status === 'planned' && e.startsAt <= now + hours * HOUR) ?? [];
}

// Units still left in a glut's big listing (0 once it has sold out).
export function glutLeft(state, e) {
  return state.market.items[e.itemId]?.listings.find((l) => l.id === e.listingId)?.qty ?? 0;
}

export function crierLine(e) {
  const type = eventById[e.type];
  return type.crier.replace('{item}', e.itemId ? itemById[e.itemId].name : 'Something');
}

// ---- Debug ------------------------------------------------------------------------

// Starts an event of this type right now (outside the calendar).
export function debugForceEvent(state, typeId, now) {
  const type = eventById[typeId];
  if (!type) throw new Error('Unknown event.');
  const e = { id: state.events.nextId++, type: typeId, startsAt: now, endsAt: now + type.hours * HOUR, status: 'planned', itemId: null };
  state.events.list.push(e);
  if (!startEvent(state, e, now)) {
    state.events.list = state.events.list.filter((x) => x !== e);
    throw new Error(`Nothing for a ${type.name.toLowerCase()} to act on right now.`);
  }
  return e;
}
