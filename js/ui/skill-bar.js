// Shared skill pieces: the profession skill bar and recipe color labels.

import { el } from './components.js';
import { professionById } from '../../data/professions.js';
import { tuning } from '../../data/tuning.js';
import { skillOf, rankOf, capOf, MAX_SKILL, nextTraining, knowsRecipe, recipeColor, recipeProfession, startingProfession, hasProfession } from '../engine/skills.js';
import { tutorialDone } from '../engine/tutorial.js';
import { nextWing } from '../engine/wings.js';
import { getStanding } from '../engine/guild.js';
import { recipes } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';

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

// One line saying what to aim for next with your starting profession, once the
// tutorial is over. Plain text plus a cost, for the Shop tab.
export function nextGoal(state) {
  if (!tutorialDone(state)) return null;
  const prof = startingProfession(state);
  const name = professionById[prof].name;
  const skill = skillOf(state, prof);
  const t = nextTraining(state, prof);
  const skillUps = recipes.some((r) => recipeProfession(r) === prof && knowsRecipe(state, r) &&
    ['orange', 'yellow', 'green'].includes(recipeColor(state, r)));
  if (t?.ready) return { text: `Train ${t.rank.name} at the trainer below, for `, cost: t.cost, after: '.' };
  if (t && skill >= capOf(state, prof)) {
    if (/standing/.test(t.reason)) return { text: `Fill commissions to reach ${tuning.standings.find((s) => s.id === t.rank.standing).name} standing with the guild, then train ${t.rank.name}.` };
    return { text: `Save up `, cost: t.cost, after: ` to train ${t.rank.name} at the trainer below.` };
  }
  if (!skillUps && skill < MAX_SKILL) return { text: `None of your ${name} recipes give skill-ups now. Learn a new one at the trainer below.` };
  if (t) return { text: `Reach ${name} ${capOf(state, prof)} (you're at ${skill}), then train ${t.rank.name}.` };
  if (skill < MAX_SKILL) return { text: `Reach ${name} ${MAX_SKILL} (you're at ${skill}).` };
  return endgameGoal(state, name);
}

// Once your first profession is mastered: the next wing, the other
// professions, Exalted, then masterworks.
function endgameGoal(state, name) {
  const wing = nextWing(state);
  if (wing) {
    if (/standing/.test(wing.reason ?? '')) return { text: `You've mastered ${name}. Reach ${tuning.standings.find((s) => s.id === wing.standing).name} standing to open another profession wing.` };
    return { text: 'Open your next profession wing in Shop upgrades below, for ', cost: wing.cost, after: '.' };
  }
  const behind = state.player.professions.find((p) => skillOf(state, p) < MAX_SKILL);
  if (behind) return { text: `Reach ${professionById[behind].name} ${MAX_SKILL} (you're at ${skillOf(state, behind)}).` };
  const { next } = getStanding(state);
  if (next) return { text: `Every profession mastered. Fill commissions to reach ${next.name} standing with the guild.` };
  if (recipes.some((r) => r.masterwork && !knowsRecipe(state, r) && hasProfession(state, recipeProfession(r)))) {
    return { text: "You're the Guildmaster. Buy masterwork recipes from the quartermaster and send raiders for their endgame materials." };
  }
  return { text: "You're the Guildmaster, with every profession mastered. Masterworks and raids are the top of the market now." };
}

// When the next recipe needs materials from a higher tier than anything you
// make now, say which and where to get them.
export function newTierHint(state, prof, recipe) {
  const knownTier = Math.max(0, ...recipes.filter((r) => recipeProfession(r) === prof && knowsRecipe(state, r)).map((r) => r.tier));
  if (recipe.tier <= knownTier) return null;
  const raw = [...new Set(recipe.mats.map((m) => m.item))].filter((id) => !recipes.some((r) => r.makes.item === id && recipeProfession(r) === prof))
    .map((id) => itemById[id]).filter((i) => i.category !== 'trade');
  if (!raw.length) return null;
  return `Tier ${recipe.tier} recipes need new materials (${raw.map((i) => i.name.toLowerCase()).join(', ')}). Buy them on the Auction tab, or hire a hero for a tier ${recipe.tier} zone.`;
}
