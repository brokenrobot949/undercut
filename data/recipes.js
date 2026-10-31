// Recipes. Phase 1: Blacksmithing tiers 1-2, plus smelting at the forge.
//
// Fields:
//   id        unique, lowercase-with-hyphens. Never change one after release.
//   station   'anvil' (crafting) or 'forge' (smelting; the City Smelter can do these too).
//   tier      material tier.
//   makes     { item, qty } produced per craft.
//   mats      list of { item, qty } used per craft.
//   seconds   time per craft.
//   skill     four skill levels: [orange, yellow, green, gray]. You can craft it from the
//             first number; it turns yellow, green and gray at the others (fewer skill-ups).
//             A typical recipe is [n, n+15, n+25, n+35]. Leave it out for no skill-ups
//             (smelting gives none).
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

  // ---- Anvil: Blacksmithing tier 1 ----
  { id: 'rough-grit', station: 'anvil', tier: 1, skill: [1, 16, 26, 36], seconds: 5,
    makes: { item: 'rough-grit', qty: 1 }, mats: [{ item: 'rough-stone', qty: 2 }] },
  { id: 'rough-honing-stone', station: 'anvil', tier: 1, skill: [10, 25, 35, 45], seconds: 5,
    makes: { item: 'rough-honing-stone', qty: 1 }, mats: [{ item: 'rough-stone', qty: 1 }] },
  { id: 'rough-balance-weight', station: 'anvil', tier: 1, skill: [20, 35, 45, 55], seconds: 6,
    makes: { item: 'rough-balance-weight', qty: 1 }, mats: [{ item: 'rough-stone', qty: 2 }] },
  { id: 'copper-cleaver', station: 'anvil', tier: 1, skill: [1, 16, 26, 36], seconds: 20,
    makes: { item: 'copper-cleaver', qty: 1 }, mats: [{ item: 'copper-bar', qty: 4 }, { item: 'rough-grit', qty: 1 }] },
  { id: 'copper-ringmail-vest', station: 'anvil', tier: 1, skill: [30, 45, 55, 65], seconds: 25,
    makes: { item: 'copper-ringmail-vest', qty: 1 }, mats: [{ item: 'copper-bar', qty: 6 }] },
  { id: 'copper-plate-cuffs', station: 'anvil', tier: 1, skill: [40, 55, 65, 75], seconds: 25,
    makes: { item: 'copper-plate-cuffs', qty: 1 }, mats: [{ item: 'copper-bar', qty: 5 }, { item: 'rough-grit', qty: 1 }] },

  // ---- Anvil: Blacksmithing tier 2 ----
  { id: 'coarse-grit', station: 'anvil', tier: 2, skill: [55, 70, 80, 90], seconds: 8,
    makes: { item: 'coarse-grit', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 2 }] },
  { id: 'coarse-honing-stone', station: 'anvil', tier: 2, skill: [65, 80, 90, 100], seconds: 8,
    makes: { item: 'coarse-honing-stone', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 1 }] },
  { id: 'coarse-balance-weight', station: 'anvil', tier: 2, skill: [75, 90, 100, 110], seconds: 10,
    makes: { item: 'coarse-balance-weight', qty: 1 }, mats: [{ item: 'coarse-stone', qty: 2 }] },
  { id: 'bronze-falchion', station: 'anvil', tier: 2, skill: [85, 100, 110, 120], seconds: 40,
    makes: { item: 'bronze-falchion', qty: 1 },
    mats: [{ item: 'bronze-bar', qty: 6 }, { item: 'coarse-grit', qty: 1 }, { item: 'smithing-flux', qty: 1 }] },
  { id: 'bronze-scale-hauberk', station: 'anvil', tier: 2, skill: [95, 110, 120, 130], seconds: 45,
    makes: { item: 'bronze-scale-hauberk', qty: 1 }, mats: [{ item: 'bronze-bar', qty: 8 }, { item: 'smithing-flux', qty: 2 }] },
  { id: 'bronze-plate-gauntlets', station: 'anvil', tier: 2, skill: [105, 120, 130, 140], seconds: 40,
    makes: { item: 'bronze-plate-gauntlets', qty: 1 },
    mats: [{ item: 'bronze-bar', qty: 6 }, { item: 'coarse-grit', qty: 1 }, { item: 'smithing-flux', qty: 1 }] },
];

export const recipeById = Object.fromEntries(recipes.map((r) => [r.id, r]));
