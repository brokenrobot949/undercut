// Every item in the game. Phase 2: Blacksmithing, Leatherworking and Alchemy tiers 1-5, gathering materials, bonus loot.
//
// Fields:
//   id          unique, lowercase-with-hyphens. Never change one after release (saves use it).
//   name        shown in the game.
//   tier        1-5, material tier / hero level band.
//   category    'material', 'consumable', 'gear' or 'trade' (vendor-only trade goods).
//               Also 'junk' (gray vendor trash from hero trips; vendor only, never on the
//               auction house) and 'scroll' (a recipe scroll that can be learned or sold).
//   armor       gear only: 'plate', 'mail', 'leather', 'cloth', 'weapon',
//               'cloak' (worn by every class), 'quiver' (hunters: quivers and ammo pouches)
//               or 'bag' (satchels, bought by every class).
//   quality     'poor', 'common', 'uncommon', 'rare' or 'epic'.
//   base        anchor price in copper (100 copper = 1 silver).
//   demand      NPC buyers per hour on the auction house at a normal price.
//   vendorBuy   trade goods only: fixed price at the trade goods vendor.
//   loot        'cloth', 'essence', 'gem', 'junk' or 'scroll': marks items heroes bring back as
//               bonus loot from a zone of that item's tier.
//   teaches     scroll items only: the id of the recipe it teaches.
//   npcStock    false: NPC sellers never list it (endgame materials from raids).
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
  { id: 'steel-bar', name: 'Steel bar', tier: 3, category: 'material', quality: 'common', base: 88, demand: 8 },
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
  { id: 'linen-scraps', name: 'Linen scraps', tier: 1, category: 'material', quality: 'common', base: 6, demand: 17, loot: 'cloth' },
  { id: 'wool-scraps', name: 'Wool scraps', tier: 2, category: 'material', quality: 'common', base: 12, demand: 14, loot: 'cloth' },
  { id: 'silk-scraps', name: 'Silk scraps', tier: 3, category: 'material', quality: 'common', base: 22, demand: 13, loot: 'cloth' },
  { id: 'brocade-scraps', name: 'Brocade scraps', tier: 4, category: 'material', quality: 'common', base: 34, demand: 11, loot: 'cloth' },
  { id: 'samite-scraps', name: 'Samite scraps', tier: 5, category: 'material', quality: 'common', base: 50, demand: 11, loot: 'cloth' },

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

  // ---- Endgame materials: only raid expeditions bring these back, so NPC
  // sellers never stock them (npcStock: false). Buyers still want them. ----
  { id: 'ember-core', name: 'Ember core', tier: 5, category: 'material', quality: 'rare', base: 2500, demand: 0.45, npcStock: false },
  { id: 'voidglass-shard', name: 'Voidglass shard', tier: 5, category: 'material', quality: 'rare', base: 2500, demand: 0.45, npcStock: false },
  { id: 'wyrm-scale', name: 'Wyrm scale', tier: 5, category: 'material', quality: 'rare', base: 2500, demand: 0.45, npcStock: false },

  // ---- Masterwork (epic) items: Exalted quartermaster recipes ----
  { id: 'emberheart-greatsword', name: 'Emberheart greatsword', tier: 5, category: 'gear', armor: 'weapon', quality: 'epic', base: 19130, demand: 0.2 },
  { id: 'wyrmscale-warplate', name: 'Wyrmscale warplate', tier: 5, category: 'gear', armor: 'plate', quality: 'epic', base: 19130, demand: 0.2 },
  { id: 'wyrmscale-hunters-mantle', name: "Wyrmscale hunter\'s mantle", tier: 5, category: 'gear', armor: 'mail', quality: 'epic', base: 16745, demand: 0.2 },
  { id: 'voidglass-studded-jerkin', name: 'Voidglass-studded jerkin', tier: 5, category: 'gear', armor: 'leather', quality: 'epic', base: 16745, demand: 0.2 },
  { id: 'flame-woven-robe', name: 'Flame-woven robe', tier: 5, category: 'gear', armor: 'cloth', quality: 'epic', base: 17143, demand: 0.26 },
  { id: 'voidglass-beaded-cowl', name: 'Voidglass-beaded cowl', tier: 5, category: 'gear', armor: 'cloth', quality: 'epic', base: 17143, demand: 0.26 },
  { id: 'wyrmeye-orb', name: 'Wyrmeye orb', tier: 5, category: 'gear', armor: 'cloth', quality: 'epic', base: 20600, demand: 0.2 },
  { id: 'voidglass-orb', name: 'Voidglass orb', tier: 5, category: 'gear', armor: 'cloth', quality: 'epic', base: 20600, demand: 0.2 },
  { id: 'phoenix-ember-philter', name: 'Phoenix-ember philter', tier: 5, category: 'consumable', quality: 'epic', base: 9193, demand: 2 },
  { id: 'voidglass-tincture-of-clarity', name: 'Voidglass tincture of clarity', tier: 5, category: 'consumable', quality: 'epic', base: 9193, demand: 2 },

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
  { id: 'scroll-boar-tusk-belt', name: 'Recipe scroll: Boar-tusk belt', tier: 1, category: 'scroll', quality: 'uncommon', base: 300, demand: 0.3, loot: 'scroll', teaches: 'boar-tusk-belt' },
  { id: 'scroll-fen-stalker-hood', name: 'Recipe scroll: Fen-stalker hood', tier: 2, category: 'scroll', quality: 'uncommon', base: 800, demand: 0.3, loot: 'scroll', teaches: 'fen-stalker-hood' },
  { id: 'scroll-bear-claw-gauntlets', name: 'Recipe scroll: Bear-claw gauntlets', tier: 3, category: 'scroll', quality: 'uncommon', base: 2000, demand: 0.3, loot: 'scroll', teaches: 'bear-claw-gauntlets' },
  { id: 'scroll-basilisk-eye-mask', name: 'Recipe scroll: Basilisk-eye mask', tier: 4, category: 'scroll', quality: 'uncommon', base: 4000, demand: 0.3, loot: 'scroll', teaches: 'basilisk-eye-mask' },
  { id: 'scroll-drakewing-mantle', name: 'Recipe scroll: Drakewing mantle', tier: 5, category: 'scroll', quality: 'uncommon', base: 8000, demand: 0.3, loot: 'scroll', teaches: 'drakewing-mantle' },
  { id: 'scroll-bottled-sunrise', name: 'Recipe scroll: Bottled sunrise', tier: 1, category: 'scroll', quality: 'uncommon', base: 300, demand: 0.3, loot: 'scroll', teaches: 'bottled-sunrise' },
  { id: 'scroll-fenlight-tonic', name: 'Recipe scroll: Fenlight tonic', tier: 2, category: 'scroll', quality: 'uncommon', base: 800, demand: 0.3, loot: 'scroll', teaches: 'fenlight-tonic' },
  { id: 'scroll-philter-of-second-wind', name: 'Recipe scroll: Philter of second wind', tier: 3, category: 'scroll', quality: 'uncommon', base: 2000, demand: 0.3, loot: 'scroll', teaches: 'philter-of-second-wind' },
  { id: 'scroll-ghostlight-draught', name: 'Recipe scroll: Ghostlight draught', tier: 4, category: 'scroll', quality: 'uncommon', base: 4000, demand: 0.3, loot: 'scroll', teaches: 'ghostlight-draught' },
  { id: 'scroll-draught-of-the-long-night', name: 'Recipe scroll: Draught of the long night', tier: 5, category: 'scroll', quality: 'uncommon', base: 8000, demand: 0.3, loot: 'scroll', teaches: 'draught-of-the-long-night' },

  // ---- Trade goods (vendor only, never on the auction house) ----
  { id: 'smithing-flux', name: 'Smithing flux', tier: 2, category: 'trade', quality: 'common', base: 10, vendorBuy: 10 },
  { id: 'coal', name: 'Coal', tier: 3, category: 'trade', quality: 'common', base: 12, vendorBuy: 12 },
  { id: 'curing-salt', name: 'Curing salt', tier: 1, category: 'trade', quality: 'common', base: 5, vendorBuy: 5 },
  { id: 'waxed-thread', name: 'Waxed thread', tier: 1, category: 'trade', quality: 'common', base: 4, vendorBuy: 4 },
  { id: 'simple-vial', name: 'Simple vial', tier: 1, category: 'trade', quality: 'common', base: 4, vendorBuy: 4 },
  { id: 'stoppered-vial', name: 'Stoppered vial', tier: 3, category: 'trade', quality: 'common', base: 12, vendorBuy: 12 },
  { id: 'cut-glass-vial', name: 'Cut-glass vial', tier: 5, category: 'trade', quality: 'common', base: 25, vendorBuy: 25 },

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
  { id: 'guildsteel-warhammer', name: 'Guildsteel warhammer', tier: 3, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 1605, demand: 0.3 },

  // ---- Blacksmithing, tier 4 (moonsilver) ----
  { id: 'flintstone-grit', name: 'Flintstone grit', tier: 4, category: 'material', quality: 'common', base: 72, demand: 4 },
  { id: 'flintstone-honing-stone', name: 'Flintstone honing stone', tier: 4, category: 'consumable', quality: 'common', base: 35, demand: 8 },
  { id: 'flintstone-balance-weight', name: 'Flintstone balance weight', tier: 4, category: 'consumable', quality: 'common', base: 66, demand: 6 },
  { id: 'moonsilver-glaive', name: 'Moonsilver glaive', tier: 4, category: 'gear', armor: 'weapon', quality: 'common', base: 1330, demand: 0.35 },
  { id: 'moonsilver-scale-greaves', name: 'Moonsilver scale greaves', tier: 4, category: 'gear', armor: 'mail', quality: 'uncommon', base: 1460, demand: 0.35 },
  { id: 'moonsilver-plate-helm', name: 'Moonsilver plate helm', tier: 4, category: 'gear', armor: 'plate', quality: 'common', base: 1600, demand: 0.3 },
  { id: 'moonsilver-lamellar-vest', name: 'Moonsilver lamellar vest', tier: 4, category: 'gear', armor: 'mail', quality: 'uncommon', base: 1630, demand: 0.3 },
  { id: 'moonsilver-bulwark-greaves', name: 'Moonsilver bulwark greaves', tier: 4, category: 'gear', armor: 'plate', quality: 'rare', base: 3104, demand: 0.35 },

  // ---- Blacksmithing, tier 5 (starmetal) ----
  { id: 'basalt-grit', name: 'Basalt grit', tier: 5, category: 'material', quality: 'common', base: 99, demand: 4 },
  { id: 'basalt-honing-stone', name: 'Basalt honing stone', tier: 5, category: 'consumable', quality: 'common', base: 48, demand: 8 },
  { id: 'basalt-balance-weight', name: 'Basalt balance weight', tier: 5, category: 'consumable', quality: 'common', base: 92, demand: 6 },
  { id: 'starmetal-greatsword', name: 'Starmetal greatsword', tier: 5, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 2530, demand: 0.35 },
  { id: 'starmetal-ringmail-cuirass', name: 'Starmetal ringmail cuirass', tier: 5, category: 'gear', armor: 'mail', quality: 'common', base: 2520, demand: 0.35 },
  { id: 'starmetal-plate-breastplate', name: 'Starmetal plate breastplate', tier: 5, category: 'gear', armor: 'plate', quality: 'uncommon', base: 2930, demand: 0.3 },
  { id: 'starmetal-maul', name: 'Starmetal maul', tier: 5, category: 'gear', armor: 'weapon', quality: 'uncommon', base: 3600, demand: 0.3 },
  { id: 'starmetal-vanguard-cuirass', name: 'Starmetal vanguard cuirass', tier: 5, category: 'gear', armor: 'plate', quality: 'rare', base: 4931, demand: 0.35 },

  // ---- Leatherworking, tier 1 (boar) ----
  { id: 'cured-boar-hide', name: 'Cured boar hide', tier: 1, category: 'material', quality: 'common', base: 25, demand: 5 },
  { id: 'soft-armor-kit', name: 'Soft armor kit', tier: 1, category: 'consumable', quality: 'common', base: 31, demand: 12 },
  { id: 'soft-leather-boots', name: 'Soft leather boots', tier: 1, category: 'gear', armor: 'leather', quality: 'common', base: 110, demand: 0.6 },
  { id: 'soft-leather-vest', name: 'Soft leather vest', tier: 1, category: 'gear', armor: 'leather', quality: 'common', base: 125, demand: 0.6 },
  { id: 'linen-lined-cloak', name: 'Linen-lined cloak', tier: 1, category: 'gear', armor: 'cloak', quality: 'common', base: 95, demand: 0.9 },
  { id: 'simple-quiver', name: 'Simple quiver', tier: 1, category: 'gear', armor: 'quiver', quality: 'common', base: 110, demand: 0.4 },
  { id: 'boar-tusk-belt', name: 'Boar-tusk belt', tier: 1, category: 'gear', armor: 'leather', quality: 'uncommon', base: 230, demand: 0.4 },

  // ---- Leatherworking, tier 2 (wolf) ----
  { id: 'cured-wolf-hide', name: 'Cured wolf hide', tier: 2, category: 'material', quality: 'common', base: 38, demand: 5 },
  { id: 'supple-armor-kit', name: 'Supple armor kit', tier: 2, category: 'consumable', quality: 'common', base: 52, demand: 10 },
  { id: 'supple-leather-gloves', name: 'Supple leather gloves', tier: 2, category: 'gear', armor: 'leather', quality: 'common', base: 210, demand: 0.5 },
  { id: 'supple-leather-leggings', name: 'Supple leather leggings', tier: 2, category: 'gear', armor: 'leather', quality: 'common', base: 335, demand: 0.5 },
  { id: 'wolfskin-cloak', name: 'Wolfskin cloak', tier: 2, category: 'gear', armor: 'cloak', quality: 'common', base: 200, demand: 0.8 },
  { id: 'wolfhide-ammo-pouch', name: 'Wolfhide ammo pouch', tier: 2, category: 'gear', armor: 'quiver', quality: 'common', base: 210, demand: 0.35 },
  { id: 'fen-stalker-hood', name: 'Fen-stalker hood', tier: 2, category: 'gear', armor: 'leather', quality: 'uncommon', base: 470, demand: 0.35 },

  // ---- Leatherworking, tier 3 (bear) ----
  { id: 'cured-bear-hide', name: 'Cured bear hide', tier: 3, category: 'material', quality: 'common', base: 56, demand: 5 },
  { id: 'tough-armor-kit', name: 'Tough armor kit', tier: 3, category: 'consumable', quality: 'common', base: 83, demand: 9 },
  { id: 'tough-leather-jerkin', name: 'Tough leather jerkin', tier: 3, category: 'gear', armor: 'leather', quality: 'common', base: 595, demand: 0.4 },
  { id: 'tough-leather-bracers', name: 'Tough leather bracers', tier: 3, category: 'gear', armor: 'leather', quality: 'common', base: 345, demand: 0.4 },
  { id: 'silk-lined-cloak', name: 'Silk-lined cloak', tier: 3, category: 'gear', armor: 'cloak', quality: 'common', base: 400, demand: 0.7 },
  { id: 'bearhide-quiver', name: 'Bearhide quiver', tier: 3, category: 'gear', armor: 'quiver', quality: 'common', base: 395, demand: 0.3 },
  { id: 'bear-claw-gauntlets', name: 'Bear-claw gauntlets', tier: 3, category: 'gear', armor: 'leather', quality: 'uncommon', base: 810, demand: 0.3 },
  { id: 'guild-couriers-boots', name: "Guild courier\'s boots", tier: 3, category: 'gear', armor: 'leather', quality: 'uncommon', base: 799, demand: 0.3 },

  // ---- Leatherworking, tier 4 (basilisk) ----
  { id: 'cured-basilisk-hide', name: 'Cured basilisk hide', tier: 4, category: 'material', quality: 'common', base: 79, demand: 5 },
  { id: 'boiled-armor-kit', name: 'Boiled armor kit', tier: 4, category: 'consumable', quality: 'common', base: 120, demand: 8 },
  { id: 'boiled-leather-cap', name: 'Boiled leather cap', tier: 4, category: 'gear', armor: 'leather', quality: 'common', base: 670, demand: 0.35 },
  { id: 'boiled-leather-spaulders', name: 'Boiled leather spaulders', tier: 4, category: 'gear', armor: 'leather', quality: 'common', base: 890, demand: 0.35 },
  { id: 'basilisk-scale-cloak', name: 'Basilisk-scale cloak', tier: 4, category: 'gear', armor: 'cloak', quality: 'common', base: 695, demand: 0.6 },
  { id: 'basilisk-ammo-pouch', name: 'Basilisk ammo pouch', tier: 4, category: 'gear', armor: 'quiver', quality: 'common', base: 670, demand: 0.3 },
  { id: 'basilisk-eye-mask', name: 'Basilisk-eye mask', tier: 4, category: 'gear', armor: 'leather', quality: 'uncommon', base: 1320, demand: 0.3 },
  { id: 'basilisk-trackers-vest', name: "Basilisk tracker\'s vest", tier: 4, category: 'gear', armor: 'leather', quality: 'rare', base: 2062, demand: 0.35 },

  // ---- Leatherworking, tier 5 (drakeling) ----
  { id: 'cured-drakeling-hide', name: 'Cured drakeling hide', tier: 5, category: 'material', quality: 'common', base: 110, demand: 5 },
  { id: 'ironhide-armor-kit', name: 'Ironhide armor kit', tier: 5, category: 'consumable', quality: 'common', base: 172, demand: 8 },
  { id: 'ironhide-leather-tunic', name: 'Ironhide leather tunic', tier: 5, category: 'gear', armor: 'leather', quality: 'common', base: 1560, demand: 0.35 },
  { id: 'ironhide-leather-boots', name: 'Ironhide leather boots', tier: 5, category: 'gear', armor: 'leather', quality: 'common', base: 1010, demand: 0.35 },
  { id: 'drakeling-cloak', name: 'Drakeling cloak', tier: 5, category: 'gear', armor: 'cloak', quality: 'common', base: 1170, demand: 0.6 },
  { id: 'drakeling-quiver', name: 'Drakeling quiver', tier: 5, category: 'gear', armor: 'quiver', quality: 'common', base: 1130, demand: 0.3 },
  { id: 'drakewing-mantle', name: 'Drakewing mantle', tier: 5, category: 'gear', armor: 'leather', quality: 'uncommon', base: 2410, demand: 0.3 },
  { id: 'drakeling-far-rangers-cloak', name: "Drakeling far-ranger\'s cloak", tier: 5, category: 'gear', armor: 'cloak', quality: 'rare', base: 3192, demand: 0.35 },

  // ---- Tailoring, tier 1 (linen) ----
  { id: 'spun-linen', name: 'Spun linen', tier: 1, category: 'material', quality: 'common', base: 21, demand: 5 },
  { id: 'linen-patch-kit', name: 'Linen patch kit', tier: 1, category: 'consumable', quality: 'common', base: 28, demand: 15.6 },
  { id: 'linen-handwraps', name: 'Linen handwraps', tier: 1, category: 'gear', armor: 'cloth', quality: 'common', base: 107, demand: 0.78 },
  { id: 'linen-robe', name: 'Linen robe', tier: 1, category: 'gear', armor: 'cloth', quality: 'common', base: 116, demand: 0.78 },
  { id: 'linen-satchel', name: 'Linen satchel', tier: 1, category: 'gear', armor: 'bag', quality: 'common', base: 95, demand: 1.17 },
  { id: 'linen-cowl', name: 'Linen cowl', tier: 1, category: 'gear', armor: 'cloth', quality: 'common', base: 107, demand: 0.52 },
  { id: 'hedgewitch-shawl', name: 'Hedgewitch shawl', tier: 1, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 226, demand: 0.52 },
  { id: 'scroll-hedgewitch-shawl', name: 'Recipe scroll: Hedgewitch shawl', tier: 1, category: 'scroll', quality: 'uncommon', base: 300, demand: 0.3, loot: 'scroll', teaches: 'hedgewitch-shawl' },

  // ---- Tailoring, tier 2 (wool) ----
  { id: 'spun-wool', name: 'Spun wool', tier: 2, category: 'material', quality: 'common', base: 37, demand: 5 },
  { id: 'wool-patch-kit', name: 'Wool patch kit', tier: 2, category: 'consumable', quality: 'common', base: 52, demand: 13 },
  { id: 'wool-slippers', name: 'Wool slippers', tier: 2, category: 'gear', armor: 'cloth', quality: 'common', base: 218, demand: 0.65 },
  { id: 'wool-trousers', name: 'Wool trousers', tier: 2, category: 'gear', armor: 'cloth', quality: 'common', base: 341, demand: 0.65 },
  { id: 'wool-satchel', name: 'Wool satchel', tier: 2, category: 'gear', armor: 'bag', quality: 'common', base: 200, demand: 1.04 },
  { id: 'wool-shawl', name: 'Wool shawl', tier: 2, category: 'gear', armor: 'cloth', quality: 'common', base: 218, demand: 0.45 },
  { id: 'lamplighters-hood', name: "Lamplighter's hood", tier: 2, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 468, demand: 0.45 },
  { id: 'scroll-lamplighters-hood', name: "Recipe scroll: Lamplighter's hood", tier: 2, category: 'scroll', quality: 'uncommon', base: 800, demand: 0.3, loot: 'scroll', teaches: 'lamplighters-hood' },

  // ---- Tailoring, tier 3 (silk) ----
  { id: 'spun-silk', name: 'Spun silk', tier: 3, category: 'material', quality: 'common', base: 63, demand: 5 },
  { id: 'silk-patch-kit', name: 'Silk patch kit', tier: 3, category: 'consumable', quality: 'common', base: 91, demand: 11.7 },
  { id: 'silk-gloves', name: 'Silk gloves', tier: 3, category: 'gear', armor: 'cloth', quality: 'common', base: 671, demand: 0.52 },
  { id: 'silk-robe', name: 'Silk robe', tier: 3, category: 'gear', armor: 'cloth', quality: 'common', base: 412, demand: 0.52 },
  { id: 'silk-satchel', name: 'Silk satchel', tier: 3, category: 'gear', armor: 'bag', quality: 'common', base: 456, demand: 0.91 },
  { id: 'silk-sash', name: 'Silk sash', tier: 3, category: 'gear', armor: 'cloth', quality: 'common', base: 449, demand: 0.39 },
  { id: 'night-heron-veil', name: 'Night-heron veil', tier: 3, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 895, demand: 0.39 },
  { id: 'scroll-night-heron-veil', name: 'Recipe scroll: Night-heron veil', tier: 3, category: 'scroll', quality: 'uncommon', base: 2000, demand: 0.3, loot: 'scroll', teaches: 'night-heron-veil' },
  { id: 'guild-clerks-robe', name: "Guild clerk's robe", tier: 3, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 877, demand: 0.39 },

  // ---- Tailoring, tier 4 (brocade) ----
  { id: 'spun-brocade', name: 'Spun brocade', tier: 4, category: 'material', quality: 'common', base: 93, demand: 5 },
  { id: 'brocade-patch-kit', name: 'Brocade patch kit', tier: 4, category: 'consumable', quality: 'common', base: 138, demand: 10.4 },
  { id: 'brocade-slippers', name: 'Brocade slippers', tier: 4, category: 'gear', armor: 'cloth', quality: 'common', base: 763, demand: 0.45 },
  { id: 'brocade-doublet', name: 'Brocade doublet', tier: 4, category: 'gear', armor: 'cloth', quality: 'common', base: 990, demand: 0.45 },
  { id: 'brocade-satchel', name: 'Brocade satchel', tier: 4, category: 'gear', armor: 'bag', quality: 'common', base: 781, demand: 0.78 },
  { id: 'brocade-cowl', name: 'Brocade cowl', tier: 4, category: 'gear', armor: 'cloth', quality: 'common', base: 763, demand: 0.39 },
  { id: 'courtiers-gloves', name: "Courtier's gloves", tier: 4, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 1404, demand: 0.39 },
  { id: 'scroll-courtiers-gloves', name: "Recipe scroll: Courtier's gloves", tier: 4, category: 'scroll', quality: 'uncommon', base: 4000, demand: 0.3, loot: 'scroll', teaches: 'courtiers-gloves' },
  { id: 'archivists-brocade-gloves', name: "Archivist's brocade gloves", tier: 4, category: 'gear', armor: 'cloth', quality: 'rare', base: 2234, demand: 0.45 },

  // ---- Tailoring, tier 5 (samite) ----
  { id: 'spun-samite', name: 'Spun samite', tier: 5, category: 'material', quality: 'common', base: 135, demand: 5 },
  { id: 'samite-patch-kit', name: 'Samite patch kit', tier: 5, category: 'consumable', quality: 'common', base: 201, demand: 10.4 },
  { id: 'samite-robe', name: 'Samite robe', tier: 5, category: 'gear', armor: 'cloth', quality: 'common', base: 1779, demand: 0.45 },
  { id: 'samite-handwraps', name: 'Samite handwraps', tier: 5, category: 'gear', armor: 'cloth', quality: 'common', base: 1170, demand: 0.45 },
  { id: 'samite-satchel', name: 'Samite satchel', tier: 5, category: 'gear', armor: 'bag', quality: 'common', base: 1285, demand: 0.78 },
  { id: 'samite-trousers', name: 'Samite trousers', tier: 5, category: 'gear', armor: 'cloth', quality: 'common', base: 1265, demand: 0.39 },
  { id: 'stargazers-mantle', name: "Stargazer's mantle", tier: 5, category: 'gear', armor: 'cloth', quality: 'uncommon', base: 2642, demand: 0.39 },
  { id: 'scroll-stargazers-mantle', name: "Recipe scroll: Stargazer's mantle", tier: 5, category: 'scroll', quality: 'uncommon', base: 8000, demand: 0.3, loot: 'scroll', teaches: 'stargazers-mantle' },
  { id: 'samite-oracles-robe', name: "Samite oracle's robe", tier: 5, category: 'gear', armor: 'cloth', quality: 'rare', base: 3350, demand: 0.45 },

  // ---- Enchanting materials: dust from disenchanting, and the lucent crystal ----
  { id: 'cinder-dust', name: 'Cinder dust', tier: 1, category: 'material', quality: 'common', base: 10, demand: 20 },
  { id: 'tide-dust', name: 'Tide dust', tier: 2, category: 'material', quality: 'common', base: 20, demand: 18 },
  { id: 'gale-dust', name: 'Gale dust', tier: 3, category: 'material', quality: 'common', base: 40, demand: 16 },
  { id: 'stone-dust', name: 'Stone dust', tier: 4, category: 'material', quality: 'common', base: 65, demand: 14 },
  { id: 'aether-dust', name: 'Aether dust', tier: 5, category: 'material', quality: 'common', base: 100, demand: 14 },
  { id: 'lucent-crystal', name: 'Lucent crystal', tier: 5, category: 'material', quality: 'rare', base: 700, demand: 1 },

  // ---- Enchanting, tier 1 (cinder) ----
  { id: 'cinder-edge-charm', name: 'Cinder edge charm', tier: 1, category: 'consumable', quality: 'common', base: 38, demand: 5 },
  { id: 'cinder-ward-charm', name: 'Cinder ward charm', tier: 1, category: 'consumable', quality: 'common', base: 54, demand: 5 },
  { id: 'cinder-stride-charm', name: 'Cinder stride charm', tier: 1, category: 'consumable', quality: 'common', base: 70, demand: 5 },
  { id: 'cinder-mind-charm', name: 'Cinder mind charm', tier: 1, category: 'consumable', quality: 'common', base: 86, demand: 5 },
  { id: 'cinderglass-focus', name: 'Cinderglass focus', tier: 1, category: 'gear', armor: 'cloth', quality: 'common', base: 218, demand: 0.5 },

  // ---- Enchanting, tier 2 (tide) ----
  { id: 'tide-edge-charm', name: 'Tide edge charm', tier: 2, category: 'consumable', quality: 'common', base: 70, demand: 4 },
  { id: 'tide-ward-charm', name: 'Tide ward charm', tier: 2, category: 'consumable', quality: 'common', base: 102, demand: 4 },
  { id: 'tide-stride-charm', name: 'Tide stride charm', tier: 2, category: 'consumable', quality: 'common', base: 134, demand: 4 },
  { id: 'tide-mind-charm', name: 'Tide mind charm', tier: 2, category: 'consumable', quality: 'common', base: 166, demand: 4 },
  { id: 'tideglass-focus', name: 'Tideglass focus', tier: 2, category: 'gear', armor: 'cloth', quality: 'common', base: 412, demand: 0.5 },

  // ---- Enchanting, tier 3 (gale) ----
  { id: 'gale-edge-charm', name: 'Gale edge charm', tier: 3, category: 'consumable', quality: 'common', base: 134, demand: 4 },
  { id: 'gale-ward-charm', name: 'Gale ward charm', tier: 3, category: 'consumable', quality: 'common', base: 198, demand: 4 },
  { id: 'gale-stride-charm', name: 'Gale stride charm', tier: 3, category: 'consumable', quality: 'common', base: 262, demand: 4 },
  { id: 'gale-mind-charm', name: 'Gale mind charm', tier: 3, category: 'consumable', quality: 'common', base: 326, demand: 4 },
  { id: 'galeglass-focus', name: 'Galeglass focus', tier: 3, category: 'gear', armor: 'cloth', quality: 'common', base: 712, demand: 0.5 },
  { id: 'guild-seal-charm', name: 'Guild seal charm', tier: 3, category: 'consumable', quality: 'uncommon', base: 726, demand: 2 },

  // ---- Enchanting, tier 4 (stone) ----
  { id: 'stone-edge-charm', name: 'Stone edge charm', tier: 4, category: 'consumable', quality: 'common', base: 214, demand: 3.5 },
  { id: 'stone-ward-charm', name: 'Stone ward charm', tier: 4, category: 'consumable', quality: 'common', base: 318, demand: 3.5 },
  { id: 'stone-stride-charm', name: 'Stone stride charm', tier: 4, category: 'consumable', quality: 'common', base: 422, demand: 3.5 },
  { id: 'stone-mind-charm', name: 'Stone mind charm', tier: 4, category: 'consumable', quality: 'common', base: 526, demand: 3.5 },
  { id: 'stoneglass-focus', name: 'Stoneglass focus', tier: 4, category: 'gear', armor: 'cloth', quality: 'common', base: 1106, demand: 0.5 },
  { id: 'lucent-focus', name: 'Lucent focus', tier: 4, category: 'gear', armor: 'cloth', quality: 'rare', base: 4066, demand: 0.35 },

  // ---- Enchanting, tier 5 (aether) ----
  { id: 'aether-edge-charm', name: 'Aether edge charm', tier: 5, category: 'consumable', quality: 'common', base: 326, demand: 3.5 },
  { id: 'aether-ward-charm', name: 'Aether ward charm', tier: 5, category: 'consumable', quality: 'common', base: 486, demand: 3.5 },
  { id: 'aether-stride-charm', name: 'Aether stride charm', tier: 5, category: 'consumable', quality: 'common', base: 646, demand: 3.5 },
  { id: 'aether-mind-charm', name: 'Aether mind charm', tier: 5, category: 'consumable', quality: 'common', base: 806, demand: 3.5 },
  { id: 'aetherglass-focus', name: 'Aetherglass focus', tier: 5, category: 'gear', armor: 'cloth', quality: 'common', base: 1676, demand: 0.5 },
  { id: 'starglass-focus', name: 'Starglass focus', tier: 5, category: 'gear', armor: 'cloth', quality: 'rare', base: 5830, demand: 0.35 },

  // ---- Alchemy, tier 1 ----
  { id: 'faint-mending-draught', name: 'Faint mending draught', tier: 1, category: 'consumable', quality: 'common', base: 18, demand: 14 },
  { id: 'faint-focus-draught', name: 'Faint focus draught', tier: 1, category: 'consumable', quality: 'common', base: 20, demand: 12 },
  { id: 'ox-strength-tonic', name: 'Ox-strength tonic', tier: 1, category: 'consumable', quality: 'common', base: 40, demand: 6 },
  { id: 'owl-wit-tonic', name: 'Owl-wit tonic', tier: 1, category: 'consumable', quality: 'common', base: 42, demand: 6 },
  { id: 'bottled-sunrise', name: 'Bottled sunrise', tier: 1, category: 'consumable', quality: 'uncommon', base: 120, demand: 2 },

  // ---- Alchemy, tier 2 ----
  { id: 'mild-mending-draught', name: 'Mild mending draught', tier: 2, category: 'consumable', quality: 'common', base: 47, demand: 12 },
  { id: 'mild-focus-draught', name: 'Mild focus draught', tier: 2, category: 'consumable', quality: 'common', base: 52, demand: 10 },
  { id: 'thornhide-tonic', name: 'Thornhide tonic', tier: 2, category: 'consumable', quality: 'common', base: 70, demand: 6 },
  { id: 'swiftstep-tonic', name: 'Swiftstep tonic', tier: 2, category: 'consumable', quality: 'common', base: 73, demand: 6 },
  { id: 'fenlight-tonic', name: 'Fenlight tonic', tier: 2, category: 'consumable', quality: 'uncommon', base: 215, demand: 2 },

  // ---- Alchemy, tier 3 ----
  { id: 'sturdy-mending-draught', name: 'Sturdy mending draught', tier: 3, category: 'consumable', quality: 'common', base: 88, demand: 10 },
  { id: 'sturdy-focus-draught', name: 'Sturdy focus draught', tier: 3, category: 'consumable', quality: 'common', base: 94, demand: 9 },
  { id: 'bulwark-elixir', name: 'Bulwark elixir', tier: 3, category: 'consumable', quality: 'common', base: 127, demand: 6 },
  { id: 'keen-eye-elixir', name: 'Keen-eye elixir', tier: 3, category: 'consumable', quality: 'common', base: 130, demand: 6 },
  { id: 'philter-of-second-wind', name: 'Philter of second wind', tier: 3, category: 'consumable', quality: 'uncommon', base: 355, demand: 2 },
  { id: 'assayers-tonic', name: "Assayer\'s tonic", tier: 3, category: 'consumable', quality: 'uncommon', base: 503, demand: 4 },

  // ---- Alchemy, tier 4 ----
  { id: 'potent-mending-draught', name: 'Potent mending draught', tier: 4, category: 'consumable', quality: 'common', base: 125, demand: 9 },
  { id: 'potent-focus-draught', name: 'Potent focus draught', tier: 4, category: 'consumable', quality: 'common', base: 135, demand: 8 },
  { id: 'emberward-draught', name: 'Emberward draught', tier: 4, category: 'consumable', quality: 'common', base: 185, demand: 5 },
  { id: 'frostward-draught', name: 'Frostward draught', tier: 4, category: 'consumable', quality: 'common', base: 190, demand: 5 },
  { id: 'ghostlight-draught', name: 'Ghostlight draught', tier: 4, category: 'consumable', quality: 'uncommon', base: 520, demand: 2 },
  { id: 'elixir-of-the-steady-hand', name: 'Elixir of the steady hand', tier: 4, category: 'consumable', quality: 'rare', base: 1462, demand: 3 },

  // ---- Alchemy, tier 5 ----
  { id: 'grand-mending-draught', name: 'Grand mending draught', tier: 5, category: 'consumable', quality: 'common', base: 194, demand: 9 },
  { id: 'grand-focus-draught', name: 'Grand focus draught', tier: 5, category: 'consumable', quality: 'common', base: 204, demand: 8 },
  { id: 'starlight-elixir', name: 'Starlight elixir', tier: 5, category: 'consumable', quality: 'common', base: 280, demand: 5 },
  { id: 'shadowward-draught', name: 'Shadowward draught', tier: 5, category: 'consumable', quality: 'common', base: 285, demand: 5 },
  { id: 'draught-of-the-long-night', name: 'Draught of the long night', tier: 5, category: 'consumable', quality: 'uncommon', base: 780, demand: 2 },
  { id: 'draught-of-the-iron-will', name: 'Draught of the iron will', tier: 5, category: 'consumable', quality: 'rare', base: 2203, demand: 3 },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

// Items that trade on the auction house. Trade goods come from the vendor and
// junk only sells to a vendor, so neither is listed.
export const tradeableItems = items.filter((item) => item.category !== 'trade' && item.category !== 'junk');
