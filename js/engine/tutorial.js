// The tutorial: five steps posted at the commission counter by the guild
// quartermaster. The engine notes what the player has done (in any order);
// a step whose goal is met can be claimed for its reward. Normal commissions
// start after the last claim.

import { tutorialSteps } from '../../data/tutorial.js';

export function createTutorial(professionId) {
  return { step: 0, done: false, did: { crafted: {} }, professionId };
}

// Called by engine actions: 'craft' (with a recipe id), 'list', 'buy', 'smelt', 'hire', 'learn'.
export function noteTutorial(state, goal, recipeId = null) {
  const t = state.tutorial;
  if (!t || t.done) return;
  if (goal === 'craft') t.did.crafted[recipeId] = true;
  else t.did[goal] = true;
}

export function tutorialStep(state) {
  const t = state.tutorial;
  if (!t || t.done) return null;
  return tutorialSteps[t.professionId][t.step];
}

export function stepMet(state, step = tutorialStep(state)) {
  if (!step) return false;
  const { did } = state.tutorial;
  return step.goal === 'craft' ? did.crafted[step.recipe] === true : did[step.goal] === true;
}

// Pays the current step's reward and moves on. Returns the step claimed.
export function claimTutorial(state) {
  const step = tutorialStep(state);
  if (!step) throw new Error('The tutorial is finished.');
  if (!stepMet(state, step)) throw new Error('Not done yet.');
  state.copper += step.pay;
  state.reputation += step.rep;
  const t = state.tutorial;
  t.step++;
  if (t.step >= tutorialSteps[t.professionId].length) t.done = true;
  return step;
}

export function tutorialDone(state) {
  return !state.tutorial || state.tutorial.done;
}
