// Every item in the game. Phase 2: Blacksmithing tiers 1-5, gathering materials, bonus loot.
//
// Fields:
//   id          unique, lowercase-with-hyphens. Never change one after release (saves use it).
//   name        shown in the game.
//   tier        1-5, material tier / hero level band.
//   category    'material', 'consumable', 'gear' or 'trade' (vendor-only trade goods).
//               Also 'junk' (gray vendor trash from hero trips; vendor only, never on the
//               auction house) and 'scroll' (a recipe scroll that can be learned or sold).
//   armor       gear only: 'plate', 'mail', 'leather', 'cloth' or 'weapon'.
//   quality     'poor', 'common', 'uncommon', 'rare' or 'epic'.
//   base        anchor price in copper (100 copper = 1 silver).
//   demand      NPC buyers per hour on the auction house at a normal price.
//   vendorBuy   trade goods only: fixed price at the trade goods vendor.
//   loot        'cloth', 'essence', 'gem', 'junk' or 'scroll': marks items heroes bring back as
//               bonus loot from a zone of that item's tier.
//   teaches     scroll items only: the id of the recipe it teaches.
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

  // ---- Herbs ----
  { id: 'dawnpetal', name: 'Dawnpetal', tier: 1, category: 'material', quality: 'common', base: 8, demand: 14 },
  { id: 'silverfern', name: 'Silverfern', tier: 1, category: 'material', quality: 'common', base: 10, demand: 12 },
  { id: 'thistlebur', name: 'Thistlebur', tier: 2, category: 'material', quality: 'common', base: 16, demand: 10 },
  { id: 'bruisewort', name: 'Bruisewort', tier: 2, category: 'material', quality: 'common', base: 18, demand: 10 },
  { id: 'ironleaf', name: 'Ironleaf', tier: 3, category: 'material', quality: 'common', base: 28, demand: 9 },
  { id: 'wild-sage', name: 'Wild sage', tier: 3, category: 'material', quality: 'common', base: 30, demand: 9 },
  { id: 'sunbloom', name: 'Sunbloom', tier: 4, category: 'material', quality: 'common', base: 42, demand: 8 },
  { id: 'ghostcap', name: 'Ghostcap', tier: 4, category: 'material', quality: 'common', base: 46, demand: 8 },
  { id: 'starlily', name: 'Starlily', tier: 5, category: 'material', quality: 'common', base: 62, demand: 8 },
  { id: 'barrowmoss', name: 'Barrowmoss', tier: 5, category: 'material', quality: 'common', base: 66, demand: 8 },

  // ---- Hides and leather ----
  { id: 'boar-hide', name: 'Boar hide', tier: 1, category: 'material', quality: 'common', base: 14, demand: 10 },
  { id: 'soft-leather', name: 'Soft leather', tier: 1, category: 'material', quality: 'common', base: 10, demand: 14 },
  { id: 'wolf-hide', name: 'Wolf hide', tier: 2, category: 'material', quality: 'common', base: 24, demand: 9 },
  { id: 'supple-leather', name: 'Supple leather', tier: 2, category: 'material', quality: 'common', base: 18, demand: 12 },
  { id: 'bear-hide', name: 'Bear hide', tier: 3, category: 'material', quality: 'common', base: 38, demand: 8 },
  { id: 'tough-leather', name: 'Tough leather', tier: 3, category: 'material', quality: 'common', base: 30, demand: 10 },
  { id: 'basilisk-hide', name: 'Basilisk hide', tier: 4, category: 'material', quality: 'common', base: 56, demand: 7 },
  { id: 'boiled-leather', name: 'Boiled leather', tier: 4, category: 'material', quality: 'common', base: 44, demand: 9 },
  { id: 'drakeling-hide', name: 'Drakeling hide', tier: 5, category: 'material', quality: 'common', base: 80, demand: 7 },
  { id: 'ironhide-leather', name: 'Ironhide leather', tier: 5, category: 'material', quality: 'common', base: 64, demand: 9 },

  // ---- Cloth (bonus loot) ----
  { id: 'linen-scraps', name: 'Linen scraps', tier: 1, category: 'material', quality: 'common', base: 6, demand: 12, loot: 'cloth' },
  { id: 'wool-scraps', name: 'Wool scraps', tier: 2, category: 'material', quality: 'common', base: 12, demand: 10, loot: 'cloth' },
  { id: 'silk-scraps', name: 'Silk scraps', tier: 3, category: 'material', quality: 'common', base: 22, demand: 9, loot: 'cloth' },
  { id: 'brocade-scraps', name: 'Brocade scraps', tier: 4, category: 'material', quality: 'common', base: 34, demand: 8, loot: 'cloth' },
  { id: 'samite-scraps', name: 'Samite scraps', tier: 5, category: 'material', quality: 'common', base: 50, demand: 8, loot: 'cloth' },

  // ---- Essences (bonus loot) ----
  { id: 'cinder-essence', name: 'Cinder essence', tier: 1, category: 'material', quality: 'uncommon', base: 40, demand: 3, loot: 'essence' },
  { id: 'tide-essence', name: 'Tide essence', tier: 2, category: 'material', quality: 'uncommon', base: 70, demand: 2.5, loot: 'essence' },
  { id: 'gale-essence', name: 'Gale essence', tier: 3, category: 'material', quality: 'uncommon', base: 110, demand: 2, loot: 'essence' },
  { id: 'stone-essence', name: 'Stone essence', tier: 4, category: 'material', quality: 'uncommon', base: 160, demand: 2, loot: 'essence' },
  { id: 'aether-essence', name: 'Aether essence', tier: 5, category: 'material', quality: 'uncommon', base: 240, demand: 2, loot: 'essence' },

  // ---- Gems (bonus loot) ----
  { id: 'quartz', name: 'Quartz', tier: 1, category: 'material', quality: 'uncommon', base: 60, demand: 1.5, loot: 'gem' },
  { id: 'garnet', name: 'Garnet', tier: 2, category: 'material', quality: 'uncommon', base: 110, demand: 1.2, loot: 'gem' },
  { id: 'topaz', name: 'Topaz', tier: 3, category: 'material', quality: 'uncommon', base: 180, demand: 1, loot: 'gem' },
  { id: 'tourmaline', name: 'Tourmaline', tier: 4, category: 'material', quality: 'uncommon', base: 260, demand: 1, loot: 'gem' },
  { id: 'diamond', name: 'Diamond', tier: 5, category: 'material', quality: 'uncommon', base: 400, demand: 1, loot: 'gem' },

  // ---- Junk (gray vendor trash from hero trips; vendor only) ----
  { id: 'bent-horseshoe', name: 'Bent horseshoe', tier: 1, category: 'junk', quality: 'poor', base: 20, loot: 'junk' },
  { id: 'chipped-bone-dice', name: 'Chipped bone dice', tier: 1, category: 'junk', quality: 'poor', base: 28, loot: 'junk' },
  { id: 'rusty-buckle', name: 'Rusty buckle', tier: 2, category: 'junk', quality: 'poor', base: 44, loot: 'junk' },
  { id: 'torn-map-scrap', name: 'Torn map scrap', tier: 2, category: 'junk', quality: 'poor', base: 52, loot: 'junk' },
  { id: 'cracked-tankard', name: 'Cracked tankard', tier: 3, category: 'junk', quality: 'poor', base: 80, loot: 'junk' },
  { id: 'dull-arrowhead', name: 'Dull arrowhead', tier: 3, category: 'junk', quality: 'poor', base: 90, loot: 'junk' },
  { id: 'moth-eaten-cloak', name: 'Moth-eaten cloak', tier: 4, category: 'junk', quality: 'poor', base: 130, loot: 'junk' },
  { id: 'broken-compass', name: 'Broken compass', tier: 4, category: 'junk', quality: 'poor', base: 150, loot: 'junk' },
  { id: 'faded-love-letter', name: 'Faded love letter', tier: 5, category: 'junk', quality: 'poor', base: 200, loot: 'junk' },
  { id: 'tarnished-locket', name: 'Tarnished locket', tier: 5, category: 'junk', quality: 'poor', base: 240, loot: 'junk' },

  // ---- Recipe scrolls (bonus loot; learn the recipe or sell the scroll) ----
  { id: 'scroll-copper-spurred-knuckles', name: 'Recipe scroll: Copper spurred knuckles', tier: 1, category: 'scroll', quality: 'uncommon', base: 300, demand: 0.3, loot: 'scroll', teaches: 'copper-spurred-knuckles' },
  { id: 'scroll-bronze-crested-helm', name: 'Recipe scroll: Bronze crested helm', tier: 2, category: 'scroll', quality: 'uncommon', base: 800, demand: 0.3, loot: 'scroll', teaches: 'bronze-crested-helm' },
  { id: 'scroll-steel-war-pick', name: 'Recipe scroll: Steel war pick', tier: 3, category: 'scroll', quality: 'uncommon', base: 2000, demand: 0.3, loot: 'scroll', teaches: 'steel-war-pick' },
  { id: 'scroll-moonsilver-lamellar-vest', name: 'Recipe scroll: Moonsilver lamellar vest', tier: 4, category: 'scroll', quality: 'uncommon', base: 4000, demand: 0.3, loot: 'scroll', teaches: 'moonsilver-lamellar-vest' },
  { id: 'scroll-starmetal-maul', name: 'Recipe scroll: Starmetal maul', tier: 5, category: 'scroll', quality: 'uncommon', base: 8000, demand: 0.3, loot: 'scroll', teaches: 'starmetal-maul' },

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
  { id: 'copper-spurred-knuckles', name: 'Copper spurred knuckles', tier: 1, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 200, demand: 0.4 },

  // ---- Blacksmithing, tier 2 (bronze) ----
  { id: 'coarse-grit', name: 'Coarse grit', tier: 2, category: 'material', quality: 'common', base: 33, demand: 5 },
  { id: 'coarse-honing-stone', name: 'Coarse honing stone', tier: 2, category: 'consumable', quality: 'common', base: 16, demand: 10 },
  { id: 'coarse-balance-weight', name: 'Coarse balance weight', tier: 2, category: 'consumable', quality: 'common', base: 31, demand: 7 },
  { id: 'bronze-falchion', name: 'Bronze falchion', tier: 2, category: 'gear', armor: 'weapon', quality: 'common', base: 420, demand: 0.5 },
  { id: 'bronze-scale-hauberk', name: 'Bronze scale hauberk', tier: 2, category: 'gear', armor: 'mail', quality: 'uncommon', base: 500, demand: 0.45 },
  { id: 'bronze-plate-gauntlets', name: 'Bronze plate gauntlets', tier: 2, category: 'gear', armor: 'plate', quality: 'common', base: 420, demand: 0.45 },
  { id: 'bronze-crested-helm', name: 'Bronze crested helm', tier: 2, category: 'gear', armor: 'plate', quality: 'uncommon', base: 550, demand: 0.35 },

  // ---- Blacksmithing, tier 3 (iron and steel) ----
  { id: 'ironstone-grit', name: 'Ironstone grit', tier: 3, category: 'material', quality: 'common', base: 50, demand: 4 },
  { id: 'ironstone-honing-stone', name: 'Ironstone honing stone', tier: 3, category: 'consumable', quality: 'common', base: 24, demand: 9 },
  { id: 'ironstone-balance-weight', name: 'Ironstone balance weight', tier: 3, category: 'consumable', quality: 'common', base: 46, demand: 6 },
  { id: 'iron-flanged-mace', name: 'Iron flanged mace', tier: 3, category: 'gear', armor: 'weapon', quality: 'common', base: 720, demand: 0.4 },
  { id: 'iron-chain-leggings', name: 'Iron chain leggings', tier: 3, category: 'gear', armor: 'mail', quality: 'common', base: 790, demand: 0.4 },
  { id: 'steel-plate-pauldrons', name: 'Steel plate pauldrons', tier: 3, category: 'gear', armor: 'plate', quality: 'uncommon', base: 910, demand: 0.35 },
  { id: 'steel-war-pick', name: 'Steel war pick', tier: 3, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 1130, demand: 0.3 },

  // ---- Blacksmithing, tier 4 (moonsilver) ----
  { id: 'flintstone-grit', name: 'Flintstone grit', tier: 4, category: 'material', quality: 'common', base: 72, demand: 4 },
  { id: 'flintstone-honing-stone', name: 'Flintstone honing stone', tier: 4, category: 'consumable', quality: 'common', base: 35, demand: 8 },
  { id: 'flintstone-balance-weight', name: 'Flintstone balance weight', tier: 4, category: 'consumable', quality: 'common', base: 66, demand: 6 },
  { id: 'moonsilver-glaive', name: 'Moonsilver glaive', tier: 4, category: 'gear', armor: 'weapon', quality: 'common', base: 1330, demand: 0.35 },
  { id: 'moonsilver-scale-greaves', name: 'Moonsilver scale greaves', tier: 4, category: 'gear', armor: 'mail', quality: 'uncommon', base: 1460, demand: 0.35 },
  { id: 'moonsilver-plate-helm', name: 'Moonsilver plate helm', tier: 4, category: 'gear', armor: 'plate', quality: 'common', base: 1600, demand: 0.3 },
  { id: 'moonsilver-lamellar-vest', name: 'Moonsilver lamellar vest', tier: 4, category: 'gear', armor: 'mail', quality: 'uncommon', base: 1630, demand: 0.3 },

  // ---- Blacksmithing, tier 5 (starmetal) ----
  { id: 'basalt-grit', name: 'Basalt grit', tier: 5, category: 'material', quality: 'common', base: 99, demand: 4 },
  { id: 'basalt-honing-stone', name: 'Basalt honing stone', tier: 5, category: 'consumable', quality: 'common', base: 48, demand: 8 },
  { id: 'basalt-balance-weight', name: 'Basalt balance weight', tier: 5, category: 'consumable', quality: 'common', base: 92, demand: 6 },
  { id: 'starmetal-greatsword', name: 'Starmetal greatsword', tier: 5, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 2530, demand: 0.35 },
  { id: 'starmetal-ringmail-cuirass', name: 'Starmetal ringmail cuirass', tier: 5, category: 'gear', armor: 'mail', quality: 'common', base: 2520, demand: 0.35 },
  { id: 'starmetal-plate-breastplate', name: 'Starmetal plate breastplate', tier: 5, category: 'gear', armor: 'plate', quality: 'uncommon', base: 2930, demand: 0.3 },
  { id: 'starmetal-maul', name: 'Starmetal maul', tier: 5, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 3600, demand: 0.3 },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

// Items that trade on the auction house. Trade goods come from the vendor and
// junk only sells to a vendor, so neither is listed.
export const tradeableItems = items.filter((item) => item.category !== 'trade' && item.category !== 'junk');
