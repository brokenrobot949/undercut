// Every item in the game. Blacksmithing tiers 1-5.
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
  { id: 'iron-ore', name: 'Iron ore', tier: 3, category: 'material', quality: 'common', base: 30, demand: 12 },
  { id: 'iron-bar', name: 'Iron bar', tier: 3, category: 'material', quality: 'common', base: 46, demand: 10 },
  { id: 'steel-bar', name: 'Steel bar', tier: 3, category: 'material', quality: 'common', base: 80, demand: 8 },
  { id: 'ironstone', name: 'Ironstone', tier: 3, category: 'material', quality: 'common', base: 18, demand: 9 },
  { id: 'moonsilver-ore', name: 'Moonsilver ore', tier: 4, category: 'material', quality: 'common', base: 45, demand: 10 },
  { id: 'moonsilver-bar', name: 'Moonsilver bar', tier: 4, category: 'material', quality: 'common', base: 68, demand: 8 },
  { id: 'flintstone', name: 'Flintstone', tier: 4, category: 'material', quality: 'common', base: 26, demand: 8 },
  { id: 'starmetal-ore', name: 'Starmetal ore', tier: 5, category: 'material', quality: 'common', base: 65, demand: 10 },
  { id: 'starmetal-bar', name: 'Starmetal bar', tier: 5, category: 'material', quality: 'common', base: 98, demand: 8 },
  { id: 'basalt', name: 'Basalt', tier: 5, category: 'material', quality: 'common', base: 36, demand: 8 },

  // ---- Trade goods (vendor only, never on the auction house) ----
  { id: 'smithing-flux', name: 'Smithing flux', tier: 2, category: 'trade', quality: 'common', base: 10, vendorBuy: 10 },
  { id: 'coal', name: 'Coal', tier: 3, category: 'trade', quality: 'common', base: 12, vendorBuy: 12 },

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

  // ---- Blacksmithing, tier 3 (iron and steel) ----
  { id: 'ironstone-grit', name: 'Ironstone grit', tier: 3, category: 'material', quality: 'common', base: 50, demand: 4 },
  { id: 'ironstone-honing-stone', name: 'Ironstone honing stone', tier: 3, category: 'consumable', quality: 'common', base: 24, demand: 9 },
  { id: 'ironstone-balance-weight', name: 'Ironstone balance weight', tier: 3, category: 'consumable', quality: 'common', base: 46, demand: 6 },
  { id: 'iron-flanged-mace', name: 'Iron flanged mace', tier: 3, category: 'gear', armor: 'weapon', quality: 'common', base: 720, demand: 0.4 },
  { id: 'iron-chain-leggings', name: 'Iron chain leggings', tier: 3, category: 'gear', armor: 'mail', quality: 'common', base: 790, demand: 0.4 },
  { id: 'steel-plate-pauldrons', name: 'Steel plate pauldrons', tier: 3, category: 'gear', armor: 'plate', quality: 'uncommon', base: 910, demand: 0.35 },

  // ---- Blacksmithing, tier 4 (moonsilver) ----
  { id: 'flintstone-grit', name: 'Flintstone grit', tier: 4, category: 'material', quality: 'common', base: 72, demand: 4 },
  { id: 'flintstone-honing-stone', name: 'Flintstone honing stone', tier: 4, category: 'consumable', quality: 'common', base: 35, demand: 8 },
  { id: 'flintstone-balance-weight', name: 'Flintstone balance weight', tier: 4, category: 'consumable', quality: 'common', base: 66, demand: 6 },
  { id: 'moonsilver-glaive', name: 'Moonsilver glaive', tier: 4, category: 'gear', armor: 'weapon', quality: 'common', base: 1330, demand: 0.35 },
  { id: 'moonsilver-scale-greaves', name: 'Moonsilver scale greaves', tier: 4, category: 'gear', armor: 'mail', quality: 'uncommon', base: 1460, demand: 0.35 },
  { id: 'moonsilver-plate-helm', name: 'Moonsilver plate helm', tier: 4, category: 'gear', armor: 'plate', quality: 'common', base: 1600, demand: 0.3 },

  // ---- Blacksmithing, tier 5 (starmetal) ----
  { id: 'basalt-grit', name: 'Basalt grit', tier: 5, category: 'material', quality: 'common', base: 99, demand: 4 },
  { id: 'basalt-honing-stone', name: 'Basalt honing stone', tier: 5, category: 'consumable', quality: 'common', base: 48, demand: 8 },
  { id: 'basalt-balance-weight', name: 'Basalt balance weight', tier: 5, category: 'consumable', quality: 'common', base: 92, demand: 6 },
  { id: 'starmetal-greatsword', name: 'Starmetal greatsword', tier: 5, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 2530, demand: 0.35 },
  { id: 'starmetal-ringmail-cuirass', name: 'Starmetal ringmail cuirass', tier: 5, category: 'gear', armor: 'mail', quality: 'common', base: 2520, demand: 0.35 },
  { id: 'starmetal-plate-breastplate', name: 'Starmetal plate breastplate', tier: 5, category: 'gear', armor: 'plate', quality: 'uncommon', base: 2930, demand: 0.3 },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

// Items that trade on the auction house.
export const tradeableItems = items.filter((item) => item.category !== 'trade');
