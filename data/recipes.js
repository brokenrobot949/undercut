// Recipes. Blacksmithing tiers 1-5, plus smelting at the forge.
//
// Fields:
//   id        unique, lowercase-with-hyphens. Never change one after release.
//   station   'anvil' (crafting) or 'forge' (smelting; the City Smelter can do these too).
//   tier      material tier.
//   makes     { item, qty } produced per craft.
//   mats      list of { item, qty } used per craft.
//   seconds   time per craft.
//   rank      forge only: the Blacksmithing rank needed to smelt it at your own forge ('journeyman', 'expert' or 'artisan'). Leave it out for Apprentice. The City Smelter ignores it.
//   skill     four skill levels: [orange, yellow, green, gray]. You can craft it from the
//             first number; it turns yellow, green and gray at the others (fewer skill-ups).
//             A typical recipe is [n, n+15, n+25, n+35]. Leave it out for no skill-ups
//             (smelting gives none).
//   learn     how you get it: 'start' (known from the start) or a price in copper at the
//             Trade Guild trainer, who sells it once your skill reaches its first number.
//             Recipes with no skill (smelting) are always known.
//
// Every material named here must exist in data/items.js.

export const recipes = [
  // ---- Forge: smelting ----
  { id: 'smelt-copper', station: 'forge', tier: 1, seconds: 20,
    makes: { item: 'copper-bar', qty: 1 }, mats: [{ item: 'copper-ore', qty: 1 }] },
  { id: 'smelt-tin', station: 'forge', tier: 2, seconds: 20,
    makes: { item: 'tin-bar', qty: 1 }, mats: [{ item: 'tin-ore', qty: 1 }] },
  { id: 'alloy-bronze', station: 'forge', tier: 2, seconds: 25,
    makes: { item: 'bronze-bar', qty: 2 }, mats: [{ item: 'copper-bar', qty: 1 }, { item: 'tin-bar', qty: 1 }] },
  { id: 'smelt-iron', station: 'forge', tier: 3, rank: 'journeyman', seconds: 30,
    makes: { item: 'iron-bar', qty: 1 }, mats: [{ item: 'iron-ore', qty: 1 }] },
  { id: 'alloy-steel', station: 'forge', tier: 3, rank: 'journeyman', seconds: 35,
    makes: { item: 'steel-bar', qty: 1 }, mats: [{ item: 'iron-bar', qty: 1 }, { item: 'coal', qty: 1 }] },
  { id: 'smelt-moonsilver', station: 'forge', tier: 4, rank: 'expert', seconds: 45,
    makes: { item: 'moonsilver-bar', qty: 1 }, mats: [{ item: 'moonsilver-ore', qty: 1 }] },
  { id: 'smelt-starmetal', station: 'forge', tier: 5, rank: 'artisan', seconds: 60,
    makes: { item: 'starmetal-bar', qty: 1 }, mats: [{ item: 'starmetal-ore', qty: 1 }] },

  // ---- Anvil: Blacksmithing tier 1 ----
  { id: 'rough-grit', station: 'anvil', tier: 1, skill: [1, 16, 26, 36], learn: 'start', seconds: 5,
    makes: { item: 'rough-grit', qty: 1 }, mats: [{ item: 'rough-stone', qty: 2 }] },
  { id: 'rough-honing-stone', station: 'anvil', tier: 1, skill: [10, 25, 35, 45], learn: 50, seconds: 5,
    makes: { item: 'rough-honing-stone', qty: 1 }, mats: [{ item: 'rough-stone', qty: 1 }] },
  { id: 'rough-balance-weight', station: 'anvil', tier: 1, skill: [20, 35, 45, 55], learn: 100, seconds: 6,
    makes: { item: 'rough-balance-weight', qty: 1 }, mats: [{ item: 'rough-stone', qty: 2 }] },
  { id: 'copper-cleaver', station: 'anvil', tier: 1, skill: [1, 16, 26, 36], learn: 'start', seconds: 20,
    makes: { item: 'copper-cleaver', qty: 1 }, mats: [{ item: 'copper-bar', qty: 4 }, { item: 'rough-grit', qty: 1 }] },
  { id: 'copper-ringmail-vest', station: 'anvil', tier: 1, skill: [30, 45, 55, 65], learn: 400, seconds: 25,
    makes: { item: 'copper-ringmail-vest', qty: 1 }, mats: [{ item: 'copper-bar', qty: 6 }] },
  { id: 'copper-plate-cuffs', station: 'anvil', tier: 1, skill: [40, 55, 65, 75], learn: 500, seconds: 25,
    makes: { item: 'copper-plate-cuffs', qty: 1 }, mats: [{ item: 'copper-bar', qty: 5 }, { item: 'rough-grit', qty: 1 }] },

  // ---- Anvil: Blacksmithing tier 2 ----
  { id: 'coarse-grit', station: 'anvil', tier: 2, skill: [55, 70, 80, 90], learn: 300, seconds: 8,
    makes: { item: 'coarse-grit', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 2 }] },
  { id: 'coarse-honing-stone', station: 'anvil', tier: 2, skill: [65, 80, 90, 100], learn: 500, seconds: 8,
    makes: { item: 'coarse-honing-stone', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 1 }] },
  { id: 'coarse-balance-weight', station: 'anvil', tier: 2, skill: [75, 90, 100, 110], learn: 800, seconds: 10,
    makes: { item: 'coarse-balance-weight', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 2 }] },
  { id: 'bronze-falchion', station: 'anvil', tier: 2, skill: [85, 100, 110, 120], learn: 1500, seconds: 40,
    makes: { item: 'bronze-falchion', qty: 1 },
    mats: [{ item: 'bronze-bar', qty: 6 }, { item: 'coarse-grit', qty: 1 }, { item: 'smithing-flux', qty: 1 }] },
  { id: 'bronze-scale-hauberk', station: 'anvil', tier: 2, skill: [95, 110, 120, 130], learn: 2000, seconds: 45,
    makes: { item: 'bronze-scale-hauberk', qty: 1 }, mats: [{ item: 'bronze-bar', qty: 8 }, { item: 'smithing-flux', qty: 2 }] },
  { id: 'bronze-plate-gauntlets', station: 'anvil', tier: 2, skill: [105, 120, 130, 140], learn: 2500, seconds: 40,
    makes: { item: 'bronze-plate-gauntlets', qty: 1 },
    mats: [{ item: 'bronze-bar', qty: 6 }, { item: 'coarse-grit', qty: 1 }, { item: 'smithing-flux', qty: 1 }] },

  // ---- Anvil: Blacksmithing tier 3 ----
  { id: 'ironstone-grit', station: 'anvil', tier: 3, skill: [125, 140, 150, 160], learn: 3000, seconds: 10,
    makes: { item: 'ironstone-grit', qty: 1 }, mats: [{ item: 'ironstone', qty: 2 }] },
  { id: 'ironstone-honing-stone', station: 'anvil', tier: 3, skill: [135, 150, 160, 170], learn: 4000, seconds: 10,
    makes: { item: 'ironstone-honing-stone', qty: 1 }, mats: [{ item: 'ironstone', qty: 1 }] },
  { id: 'ironstone-balance-weight', station: 'anvil', tier: 3, skill: [145, 160, 170, 180], learn: 5000, seconds: 12,
    makes: { item: 'ironstone-balance-weight', qty: 1 }, mats: [{ item: 'ironstone', qty: 2 }] },
  { id: 'iron-flanged-mace', station: 'anvil', tier: 3, skill: [155, 170, 180, 190], learn: 10000, seconds: 60,
    makes: { item: 'iron-flanged-mace', qty: 1 },
    mats: [{ item: 'iron-bar', qty: 8 }, { item: 'ironstone-grit', qty: 1 }, { item: 'smithing-flux', qty: 2 }] },
  { id: 'iron-chain-leggings', station: 'anvil', tier: 3, skill: [165, 180, 190, 200], learn: 12000, seconds: 65,
    makes: { item: 'iron-chain-leggings', qty: 1 }, mats: [{ item: 'iron-bar', qty: 10 }, { item: 'smithing-flux', qty: 2 }] },
  { id: 'steel-plate-pauldrons', station: 'anvil', tier: 3, skill: [175, 190, 200, 210], learn: 15000, seconds: 70,
    makes: { item: 'steel-plate-pauldrons', qty: 1 },
    mats: [{ item: 'steel-bar', qty: 6 }, { item: 'ironstone-grit', qty: 1 }, { item: 'smithing-flux', qty: 2 }] },

  // ---- Anvil: Blacksmithing tier 4 ----
  { id: 'flintstone-grit', station: 'anvil', tier: 4, skill: [190, 205, 215, 225], learn: 6000, seconds: 12,
    makes: { item: 'flintstone-grit', qty: 1 }, mats: [{ item: 'flintstone', qty: 2 }] },
  { id: 'flintstone-honing-stone', station: 'anvil', tier: 4, skill: [200, 215, 225, 235], learn: 8000, seconds: 12,
    makes: { item: 'flintstone-honing-stone', qty: 1 }, mats: [{ item: 'flintstone', qty: 1 }] },
  { id: 'flintstone-balance-weight', station: 'anvil', tier: 4, skill: [210, 225, 235, 245], learn: 10000, seconds: 15,
    makes: { item: 'flintstone-balance-weight', qty: 1 }, mats: [{ item: 'flintstone', qty: 2 }] },
  { id: 'moonsilver-glaive', station: 'anvil', tier: 4, skill: [220, 235, 245, 255], learn: 20000, seconds: 80,
    makes: { item: 'moonsilver-glaive', qty: 1 },
    mats: [{ item: 'moonsilver-bar', qty: 10 }, { item: 'flintstone-grit', qty: 1 }, { item: 'smithing-flux', qty: 2 }] },
  { id: 'moonsilver-scale-greaves', station: 'anvil', tier: 4, skill: [230, 245, 255, 265], learn: 25000, seconds: 85,
    makes: { item: 'moonsilver-scale-greaves', qty: 1 }, mats: [{ item: 'moonsilver-bar', qty: 12 }, { item: 'smithing-flux', qty: 3 }] },
  { id: 'moonsilver-plate-helm', station: 'anvil', tier: 4, skill: [240, 255, 265, 275], learn: 30000, seconds: 90,
    makes: { item: 'moonsilver-plate-helm', qty: 1 },
    mats: [{ item: 'moonsilver-bar', qty: 10 }, { item: 'steel-bar', qty: 2 }, { item: 'flintstone-grit', qty: 1 }, { item: 'smithing-flux', qty: 2 }] },

  // ---- Anvil: Blacksmithing tier 5 ----
  { id: 'basalt-grit', station: 'anvil', tier: 5, skill: [250, 265, 275, 285], learn: 15000, seconds: 15,
    makes: { item: 'basalt-grit', qty: 1 }, mats: [{ item: 'basalt', qty: 2 }] },
  { id: 'basalt-honing-stone', station: 'anvil', tier: 5, skill: [258, 273, 283, 293], learn: 18000, seconds: 15,
    makes: { item: 'basalt-honing-stone', qty: 1 }, mats: [{ item: 'basalt', qty: 1 }] },
  { id: 'basalt-balance-weight', station: 'anvil', tier: 5, skill: [266, 281, 291, 301], learn: 20000, seconds: 18,
    makes: { item: 'basalt-balance-weight', qty: 1 }, mats: [{ item: 'basalt', qty: 2 }] },
  { id: 'starmetal-greatsword', station: 'anvil', tier: 5, skill: [274, 289, 299, 309], learn: 40000, seconds: 100,
    makes: { item: 'starmetal-greatsword', qty: 1 },
    mats: [{ item: 'starmetal-bar', qty: 12 }, { item: 'basalt-grit', qty: 2 }, { item: 'smithing-flux', qty: 3 }] },
  { id: 'starmetal-ringmail-cuirass', station: 'anvil', tier: 5, skill: [282, 297, 307, 317], learn: 45000, seconds: 110,
    makes: { item: 'starmetal-ringmail-cuirass', qty: 1 }, mats: [{ item: 'starmetal-bar', qty: 14 }, { item: 'smithing-flux', qty: 3 }] },
  { id: 'starmetal-plate-breastplate', station: 'anvil', tier: 5, skill: [290, 305, 315, 325], learn: 50000, seconds: 120,
    makes: { item: 'starmetal-plate-breastplate', qty: 1 },
    mats: [{ item: 'starmetal-bar', qty: 12 }, { item: 'steel-bar', qty: 4 }, { item: 'basalt-grit', qty: 1 }, { item: 'smithing-flux', qty: 3 }] },
];

export const recipeById = Object.fromEntries(recipes.map((r) => [r.id, r]));
