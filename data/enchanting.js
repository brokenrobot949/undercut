// Disenchanting: breaking gear down into Enchanting materials. Safe to edit.
// You need Enchanting in your shop. It's instant and gives no skill.

export const disenchanting = {
  // Dust of the item's tier per item, by quality.
  dust: { poor: 1, common: 2, uncommon: 3, rare: 4, epic: 6 },
  // Chance of also getting one essence of the item's tier.
  essenceChance: 0.25,
  // Lucent crystals per item, by quality: 0.5 = a 50% chance of one,
  // 1.5 = one, plus a 50% chance of a second.
  crystals: { rare: 0.5, epic: 1.5 },
  // Dust and essence item for each tier (1 to 5).
  dustByTier: ['cinder-dust', 'tide-dust', 'gale-dust', 'stone-dust', 'aether-dust'],
  essenceByTier: ['cinder-essence', 'tide-essence', 'gale-essence', 'stone-essence', 'aether-essence'],
  crystal: 'lucent-crystal',
};
