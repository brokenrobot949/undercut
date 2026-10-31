// Crafting professions, and the four skill ranks trained at the Trade Guild.
//
// Professions:
//   id         unique, lowercase-with-hyphens. Never change one after release.
//   name       shown in the game.
//   gathering  the gathering profession that feeds it.
//   stations   workstations whose recipes give this profession skill.
//
// Ranks (shared by every profession), in order:
//   cap        highest skill this rank allows. Skill stops here until you train the next rank.
//   cost       training cost in copper (10,000 = 1 gold). The first rank is free.
//   standing   Trade Guild standing needed to train it (ids from data/tuning.js).

export const professions = [
  { id: 'blacksmithing', name: 'Blacksmithing', gathering: 'mining', stations: ['anvil', 'forge'] },
];

export const ranks = [
  { id: 'apprentice', name: 'Apprentice', cap: 75, cost: 0, standing: 'neutral' },
  { id: 'journeyman', name: 'Journeyman', cap: 150, cost: 50000, standing: 'neutral' },
  { id: 'expert', name: 'Expert', cap: 225, cost: 500000, standing: 'friendly' },
  { id: 'artisan', name: 'Artisan', cap: 300, cost: 2500000, standing: 'honored' },
];

export const professionById = Object.fromEntries(professions.map((p) => [p.id, p]));

// Which profession a workstation's recipes level up.
export const professionForStation = Object.fromEntries(
  professions.flatMap((p) => p.stations.map((s) => [s, p.id])));
