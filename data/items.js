// Every item in the game. Phase 1: Blacksmithing tiers 1-2.
//
// Fields:
//   id          unique, lowercase-with-hyphens. Never change one after release (saves use it).
//   name        shown in the game.
//   tier        1-5, material tier / hero level band.
//   category    'material', 'consumable', 'gear' or 'trade' (vendor-only trade goods).
//   armor       gear only: 'plate', 'mail', 'leather', 'cloth' or 'weapon'.
//   quality     'poor', 'common', 'uncommon', 'rare' or 'epic'.
//   base        anchor price in copper (100 copper = 1 silver).
//   demand      NPC buyers per hour on the auction house at a normal price.
//   vendorBuy   trade goods only: fixed price at the trade goods vendor.
//
// Selling to a vendor pays 25% of base (set in data/tuning.js).

export const items = [
  // ---- Ore, bars and stone ----
  { id: 'copper-ore', name: 'Copper ore', tier: 1, category: 'material', quality: 'common', base: 12, demand: 20 },
  { id: 'copper-bar', name: 'Copper bar', tier: 1, category: 'material', quality: 'common', base: 19, demand: 16 },
  { id: 'rough-stone', name: 'Rough stone', tier: 1, category: 'material', quality: 'common', base: 6, demand: 14 },
  { id: 'tin-ore', name: 'Tin ore', tier: 2, category: 'material', quality: 'common', base: 20, demand: 14 },
  { id: 'tin-bar', name: 'Tin bar', tier: 2, category: 'material', quality: 'common', base: 32, demand: 10 },
  { id: 'bronze-bar', name: 'Bronze bar', tier: 2, category: 'material', quality: 'common', base: 36, demand: 12 },
  { id: 'coarse-stone', name: 'Coarse stone', tier: 2, category: 'material', quality: 'common', base: 12, demand: 10 },

  // ---- Trade goods (vendor only, never on the auction house) ----
  { id: 'smithing-flux', name: 'Smithing flux', tier: 2, category: 'trade', quality: 'common', base: 10, vendorBuy: 10 },

  // ---- Blacksmithing, tier 1 (copper) ----
  { id: 'rough-grit', name: 'Rough grit', tier: 1, category: 'material', quality: 'common', base: 16, demand: 6 },
  { id: 'rough-honing-stone', name: 'Rough honing stone', tier: 1, category: 'consumable', quality: 'common', base: 8, demand: 12 },
  { id: 'rough-balance-weight', name: 'Rough balance weight', tier: 1, category: 'consumable', quality: 'common', base: 15, demand: 8 },
  { id: 'copper-cleaver', name: 'Copper cleaver', tier: 1, category: 'gear', armor: 'weapon', quality: 'common', base: 150, demand: 0.7 },
  { id: 'copper-ringmail-vest', name: 'Copper ringmail vest', tier: 1, category: 'gear', armor: 'mail', quality: 'common', base: 180, demand: 0.6 },
  { id: 'copper-plate-cuffs', name: 'Copper plate cuffs', tier: 1, category: 'gear', armor: 'plate', quality: 'uncommon', base: 175, demand: 0.6 },

  // ---- Blacksmithing, tier 2 (bronze) ----
  { id: 'coarse-grit', name: 'Coarse grit', tier: 2, category: 'material', quality: 'common', base: 33, demand: 5 },
  { id: 'coarse-honing-stone', name: 'Coarse honing stone', tier: 2, category: 'consumable', quality: 'common', base: 16, demand: 10 },
  { id: 'coarse-balance-weight', name: 'Coarse balance weight', tier: 2, category: 'consumable', quality: 'common', base: 31, demand: 7 },
  { id: 'bronze-falchion', name: 'Bronze falchion', tier: 2, category: 'gear', armor: 'weapon', quality: 'common', base: 420, demand: 0.5 },
  { id: 'bronze-scale-hauberk', name: 'Bronze scale hauberk', tier: 2, category: 'gear', armor: 'mail', quality: 'uncommon', base: 500, demand: 0.45 },
  { id: 'bronze-plate-gauntlets', name: 'Bronze plate gauntlets', tier: 2, category: 'gear', armor: 'plate', quality: 'common', base: 420, demand: 0.45 },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

// Items that trade on the auction house.
export const tradeableItems = items.filter((item) => item.category !== 'trade');
