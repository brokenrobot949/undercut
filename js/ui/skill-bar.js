// Shared skill pieces: the profession skill bar and recipe color labels.

import { el } from './components.js';
import { professionById } from '../../data/professions.js';
import { tuning } from '../../data/tuning.js';
import { skillOf, rankOf, capOf } from '../engine/skills.js';

// `capHint` adds a reminder to train when skill is stuck at the rank cap.
export function skillBar(state, professionId, { capHint = false } = {}) {
  const skill = skillOf(state, professionId);
  const cap = capOf(state, professionId);
  const atCap = capHint && skill >= cap && cap < 300;
  return el('div', { class: 'skill-line' },
    el('span', {}, el('strong', {}, professionById[professionId].name), ` ${skill} / ${cap}`,
      el('span', { class: 'dim' }, ` · ${rankOf(state, professionId).name}`)),
    el('div', { class: 'bar skill-bar', role: 'progressbar', 'aria-label': `${professionById[professionId].name} skill`,
      'aria-valuemin': '0', 'aria-valuemax': String(cap), 'aria-valuenow': String(skill) },
      el('span', { style: `width:${(skill / cap) * 100}%` })),
    atCap ? el('p', { class: 'small skill-capped' }, 'Skill is capped. Train the next rank at the Trade Guild (Shop tab).') : null);
}

const COLOR_TEXT = { orange: 'Orange', yellow: 'Yellow', green: 'Green', gray: 'Gray' };

// "Yellow: 75% skill-up chance", or the skill needed for a red recipe.
export function colorText(recipe, color) {
  if (!color) return 'No skill-ups (smelting)';
  if (color === 'red') return `Needs skill ${recipe.skill[0]}`;
  return `${COLOR_TEXT[color]}: ${Math.round(tuning.skillUpChance[color] * 100)}% skill-up chance`;
}
