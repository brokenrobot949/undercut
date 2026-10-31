// Profession wings: open your second and third professions, gated by guild
// standing and bought with gold.

import { tuning } from '../../data/tuning.js';
import { professions, professionById, wings } from '../../data/professions.js';
import { hasProfession } from './skills.js';
import { hasStanding } from './guild.js';
import { addOrMail } from './bags.js';

// The next wing: { cost, standing, ready, reason, choices }, where choices are
// the professions it could open; null once every profession is open.
export function nextWing(state) {
  const wing = wings[state.player.professions.length - 1];
  const choices = professions.filter((p) => !hasProfession(state, p.id));
  if (!wing || !choices.length) return null;
  let reason = null;
  if (!hasStanding(state, wing.standing)) {
    reason = `Needs ${tuning.standings.find((s) => s.id === wing.standing).name} standing with the guild.`;
  } else if (state.copper < wing.cost) reason = 'Not enough gold.';
  return { cost: wing.cost, standing: wing.standing, ready: !reason, reason, choices };
}

// Opens a profession: pays for the wing and hands over its starter materials.
export function buyWing(state, professionId) {
  if (!professionById[professionId]) throw new Error('Unknown profession.');
  if (hasProfession(state, professionId)) throw new Error(`Your shop already has ${professionById[professionId].name}.`);
  const n = nextWing(state);
  if (!n) throw new Error('Your shop has every profession already.');
  if (!n.ready) throw new Error(n.reason);
  state.copper -= n.cost;
  state.player.professions.push(professionId);
  for (const [item, qty] of Object.entries(tuning.startingBags[professionId] ?? {})) addOrMail(state, item, qty);
  return n;
}
