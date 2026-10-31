// The guild quartermaster: better recipes (learn: 'quartermaster' in
// data/recipes.js), sold for gold once you have the standing and the skill.

import { tuning } from '../../data/tuning.js';
import { recipes, recipeById } from '../../data/recipes.js';
import { hasStanding } from './guild.js';
import { hasProfession, knowsRecipe, recipeProfession, skillOf } from './skills.js';
import { noteTutorial } from './tutorial.js';

const standingName = (id) => tuning.standings.find((s) => s.id === id).name;

// What the quartermaster offers your professions, lowest standing then skill
// first: [{ recipe, cost, ready, reason }]. Recipes you know are left out.
export function quartermasterRecipes(state) {
  const order = (id) => tuning.standings.findIndex((s) => s.id === id);
  return recipes
    .filter((r) => r.learn === 'quartermaster' && hasProfession(state, recipeProfession(r)) && !knowsRecipe(state, r))
    .sort((a, b) => order(a.standing) - order(b.standing) || a.skill[0] - b.skill[0])
    .map((recipe) => {
      let reason = null;
      if (!hasStanding(state, recipe.standing)) reason = `Needs ${standingName(recipe.standing)} standing with the guild.`;
      else if (skillOf(state, recipeProfession(recipe)) < recipe.skill[0]) reason = `Needs skill ${recipe.skill[0]}.`;
      else if (state.copper < recipe.price) reason = 'Not enough gold.';
      return { recipe, cost: recipe.price, ready: !reason, reason };
    });
}

export function buyQuartermasterRecipe(state, recipeId) {
  const recipe = recipeById[recipeId];
  if (!recipe || recipe.learn !== 'quartermaster') throw new Error('The quartermaster doesn\'t sell that recipe.');
  if (knowsRecipe(state, recipe)) throw new Error('You already know that recipe.');
  const offer = quartermasterRecipes(state).find((o) => o.recipe.id === recipeId);
  if (!offer) throw new Error('Your shop doesn\'t have that profession yet.');
  if (!offer.ready) throw new Error(offer.reason);
  state.copper -= offer.cost;
  state.knownRecipes[recipeId] = true;
  noteTutorial(state, 'learn');
  return recipe;
}

// Where to get a quartermaster recipe, for hints elsewhere.
export function quartermasterHint(recipe) {
  return `Buy the recipe from the quartermaster (${standingName(recipe.standing)}, skill ${recipe.skill[0]}).`;
}
