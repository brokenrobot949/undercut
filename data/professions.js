// Crafting professions, their workstations, and the four skill ranks trained
// at the Trade Guild.
//
// Professions:
//   id         unique, lowercase-with-hyphens. Never change one after release.
//   name       shown in the game.
//   gathering  the gathering profession that feeds it (null: none of its own).
//   stations   workstations whose recipes give this profession skill.
//   blurb      one line for the new-game screen.
//   startable  false: can't be a shop's first profession, only opened with a wing.
//
// The player picks one profession when starting a shop; it is permanent. The
// other two open with profession wings (see wings below).
//
// Ranks (shared by every profession), in order:
//   cap        highest skill this rank allows. Skill stops here until you train the next rank.
//   cost       training cost in copper (10,000 = 1 gold). The first rank is free.
//   standing   Trade Guild standing needed to train it (ids from data/tuning.js).

export const professions = [
  { id: 'blacksmithing', name: 'Blacksmithing', gathering: 'mining', stations: ['anvil', 'forge'],
    blurb: 'Weapons, plate and mail, grit, honing stones and balance weights. Miners bring your ore.' },
  { id: 'leatherworking', name: 'Leatherworking', gathering: 'skinning', stations: ['workbench'],
    blurb: 'Leather armor, armor kits, cloaks, quivers and ammo pouches. Skinners bring your hides.' },
  { id: 'alchemy', name: 'Alchemy', gathering: 'herbalism', stations: ['alchemy-table'],
    blurb: 'Mending and focus draughts, tonics, elixirs, wards and transmutes. Herbalists bring your herbs.' },
  { id: 'tailoring', name: 'Tailoring', gathering: null, stations: ['loom'],
    blurb: 'Robes, cowls, handwraps, satchels and patch kits. Every hero trip brings cloth, and more of it once you tailor.' },
];

// Profession wings, bought on the Shop tab: the first wing opens your second
// profession, the next your third, and so on. You pick which profession each opens.
//   standing   Trade Guild standing needed (ids from data/tuning.js)
//   cost       price in copper (10,000 = 1 gold)
// A new wing also comes with that profession's starter materials
// (tuning.startingBags), so you can craft right away.
export const wings = [
  { standing: 'friendly', cost: 30000 },
  { standing: 'honored', cost: 80000 },
  { standing: 'revered', cost: 150000 },
  { standing: 'exalted', cost: 250000 },
];

// Workstation names, as shown in the Workshop.
export const stationNames = { anvil: 'Anvil', forge: 'Forge', workbench: 'Workbench', 'alchemy-table': 'Alchemy table', loom: 'Loom' };

export const ranks = [
  { id: 'apprentice', name: 'Apprentice', cap: 75, cost: 0, standing: 'neutral' },
  { id: 'journeyman', name: 'Journeyman', cap: 150, cost: 10000, standing: 'neutral' },
  { id: 'expert', name: 'Expert', cap: 225, cost: 40000, standing: 'friendly' },
  { id: 'artisan', name: 'Artisan', cap: 300, cost: 100000, standing: 'honored' },
];

export const professionById = Object.fromEntries(professions.map((p) => [p.id, p]));

// Which profession a workstation's recipes level up.
export const professionForStation = Object.fromEntries(
  professions.flatMap((p) => p.stations.map((s) => [s, p.id])));
