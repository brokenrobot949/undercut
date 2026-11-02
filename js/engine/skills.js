// Profession skill, ranks and training, recipe colors, and the recipes you know.
//
// Skill runs from 1 to 300. Each rank caps it (75, 150, 225, 300); at the cap,
// crafting gives no skill until the next rank is trained at the Trade Guild.
// A recipe's color comes from your skill against the four numbers in its
// `skill` list, and the color sets the chance of +1 skill when a craft finishes.

import { tuning } from '../../data/tuning.js';
import { professions, professionById, professionForStation, ranks } from '../../data/professions.js';
import { recipes, recipeById } from '../../data/recipes.js';
import { itemById } from '../../data/items.js';
import { rngChance } from './rng.js';
import { takeFromBags } from './bags.js';
import { noteTutorial } from './tutorial.js';
import { standingIndex } from './guild.js';

export const MAX_SKILL = ranks[ranks.length - 1].cap;

// Every profession starts at skill 1, Apprentice rank. Phase 2 opens only
// Blacksmithing for play; the others are tracked so saves don't change shape later.
export function createSkills() {
  return Object.fromEntries(professions.map((p) => [p.id, { skill: 1, rank: 0 }]));
}

export function skillOf(state, professionId) {
  return state.skills[professionId]?.skill ?? 0;
}

export function rankOf(state, professionId) {
  return ranks[state.skills[professionId]?.rank ?? 0];
}

export function capOf(state, professionId) {
  return rankOf(state, professionId).cap;
}

// The profession a recipe levels, or null when it gives no skill (smelting).
export function recipeProfession(recipe) {
  return recipe.skill ? professionForStation[recipe.station] : null;
}

// 'orange', 'yellow', 'green' or 'gray'; 'red' when your skill is too low to
// craft it; null for recipes with no skill (smelting).
export function recipeColor(state, recipe) {
  if (!recipe.skill) return null;
  const skill = skillOf(state, recipeProfession(recipe));
  const [orange, yellow, green, gray] = recipe.skill;
  if (skill < orange) return 'red';
  if (skill >= gray) return 'gray';
  if (skill >= green) return 'green';
  if (skill >= yellow) return 'yellow';
  return 'orange';
}

// Professions this shop has: the starting one first, then any wings opened.
export function hasProfession(state, professionId) {
  return state.player.professions.includes(professionId);
}

export function startingProfession(state) {
  return state.player.professions[0];
}

// Adds skill entries for professions that are new since this save was made.
export function syncSkills(state) {
  for (const p of professions) state.skills[p.id] ||= { skill: 1, rank: 0 };
  // Starting recipes of professions added since the save was made.
  for (const r of recipes) if (r.learn === 'start') state.knownRecipes[r.id] = true;
}

export function checkProfession(state, recipe) {
  const id = professionForStation[recipe.station];
  if (!hasProfession(state, id)) throw new Error(`Your shop has no ${professionById[id].name} yet. It opens with a profession wing.`);
}

// Throws if your skill is too low to craft this recipe.
export function checkSkill(state, recipe) {
  if (recipeColor(state, recipe) === 'red') {
    const prof = professionById[recipeProfession(recipe)];
    throw new Error(`Needs ${prof.name} ${recipe.skill[0]}. You have ${skillOf(state, prof.id)}.`);
  }
}

// Forge recipes for higher ores need a Blacksmithing rank (recipe.rank) at your
// own forge. Returns the rank name still needed, or null. The City Smelter skips this.
export function forgeRankNeeded(state, recipe) {
  if (!recipe.rank) return null;
  const need = ranks.findIndex((r) => r.id === recipe.rank);
  const have = state.skills[professionForStation[recipe.station]]?.rank ?? 0;
  return have >= need ? null : ranks[need].name;
}

export function checkForgeRank(state, recipe) {
  const need = forgeRankNeeded(state, recipe);
  if (need) throw new Error(`Your forge needs ${need} Blacksmithing for this. The City Smelter can do it now, for a fee.`);
}

// Called as each craft finishes: maybe +1 skill, by the recipe's color then.
export function rollSkillUp(state, recipe, summary) {
  const professionId = recipeProfession(recipe);
  if (!professionId) return;
  const chance = tuning.skillUpChance[recipeColor(state, recipe)] ?? 0;
  if (!chance) return;
  const s = state.skills[professionId];
  if (s.skill >= capOf(state, professionId)) {
    summary.skillCapped[professionId] = true;
    return;
  }
  if (!rngChance(state.rng, chance)) return;
  const up = (summary.skillUps[professionId] ||= { from: s.skill, to: s.skill });
  s.skill++;
  up.to = s.skill;
}

// ---- Training at the Trade Guild ---------------------------------------------

// What training the next rank needs: { rank, cost, ready, reason }, or null at the top rank.
export function nextTraining(state, professionId) {
  const s = state.skills[professionId];
  const rank = ranks[s.rank + 1];
  if (!rank) return null;
  const cap = ranks[s.rank].cap;
  const needStanding = tuning.standings.findIndex((x) => x.id === rank.standing);
  let reason = null;
  if (s.skill < cap) reason = `Reach skill ${cap} first.`;
  else if (standingIndex(state) < needStanding) reason = `Needs ${tuning.standings[needStanding].name} standing with the guild.`;
  else if (state.copper < rank.cost) reason = 'Not enough gold.';
  return { rank, cost: rank.cost, ready: !reason, reason };
}

export function trainRank(state, professionId) {
  if (!hasProfession(state, professionId)) throw new Error('Your shop doesn\'t have that profession yet.');
  const t = nextTraining(state, professionId);
  if (!t) throw new Error('You have already trained the highest rank.');
  if (!t.ready) throw new Error(t.reason);
  state.copper -= t.cost;
  state.skills[professionId].rank++;
  return t.rank;
}

// ---- Debug -------------------------------------------------------------------

// Sets skill directly, training whatever rank that skill needs.
export function debugSetSkill(state, professionId, skill) {
  skill = Math.max(1, Math.min(MAX_SKILL, Math.round(skill)));
  const s = state.skills[professionId];
  s.skill = skill;
  s.rank = ranks.findIndex((r) => r.cap >= skill);
}

// ---- Recipes you know ------------------------------------------------------------
// state.knownRecipes is { recipeId: true }. Smelting (no skill) is always known.
// The rest start known ('start') or are bought from the guild trainer once
// your skill reaches the recipe's first number.

export function createKnownRecipes() {
  return Object.fromEntries(recipes.filter((r) => r.learn === 'start').map((r) => [r.id, true]));
}

export function knowsRecipe(state, recipe) {
  return !recipe.skill || state.knownRecipes[recipe.id] === true;
}

export function checkKnown(state, recipe) {
  if (!knowsRecipe(state, recipe)) throw new Error('You haven\'t learned that recipe. The Trade Guild trainer sells it.');
}

// Trainer recipes for a profession you don't know yet, cheapest skill first:
// [{ recipe, cost, ready, reason }].
export function trainerRecipes(state, professionId) {
  return recipes
    .filter((r) => typeof r.learn === 'number' && recipeProfession(r) === professionId && !knowsRecipe(state, r))
    .sort((a, b) => a.skill[0] - b.skill[0])
    .map((recipe) => {
      let reason = null;
      if (skillOf(state, professionId) < recipe.skill[0]) reason = `Needs skill ${recipe.skill[0]}.`;
      else if (state.copper < recipe.learn) reason = 'Not enough gold.';
      return { recipe, cost: recipe.learn, ready: !reason, reason };
    });
}

export function learnRecipe(state, recipeId) {
  const recipe = recipeById[recipeId];
  if (!recipe || typeof recipe.learn !== 'number') throw new Error('The trainer doesn\'t sell that recipe.');
  checkProfession(state, recipe);
  if (knowsRecipe(state, recipe)) throw new Error('You already know that recipe.');
  const offer = trainerRecipes(state, recipeProfession(recipe)).find((o) => o.recipe.id === recipeId);
  if (!offer.ready) throw new Error(offer.reason);
  state.copper -= offer.cost;
  state.knownRecipes[recipeId] = true;
  noteTutorial(state, 'learn');
  return recipe;
}

// Opens every profession, as if all the wings were built.
export function debugUnlockProfessions(state) {
  for (const p of professions) if (!hasProfession(state, p.id)) state.player.professions.push(p.id);
}

export function debugLearnAll(state) {
  for (const r of recipes) if (r.skill) state.knownRecipes[r.id] = true;
}

// Reads a recipe scroll from your bags: learns its recipe and uses up the scroll.
// Needs the recipe's first skill number, like the trainer.
export function learnFromScroll(state, itemId) {
  const recipe = recipeById[itemById[itemId]?.teaches];
  if (!recipe) throw new Error('That isn\'t a recipe scroll.');
  if (knowsRecipe(state, recipe)) throw new Error('You already know that recipe. You could sell the scroll instead.');
  checkProfession(state, recipe);
  const profession = recipeProfession(recipe);
  if (skillOf(state, profession) < recipe.skill[0]) throw new Error(`Needs ${professionById[profession].name} ${recipe.skill[0]} to learn.`);
  takeFromBags(state, itemId, 1);
  state.knownRecipes[recipe.id] = true;
  return recipe;
}
