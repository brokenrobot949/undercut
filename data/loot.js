// Bonus loot: every hero trip brings some home on top of what the hero gathers.
// Which item comes back is picked from items whose `loot` field matches, at
// the zone's tier (see data/items.js). A bad haul doesn't touch bonus loot.

export const generalLoot = {
  // Rolls per trip: one per hour of trip length, at least one. Risen get one more.
  rollsPerHour: 1,

  // Each roll gives one of these. The chances add up to 1.
  table: [
    { loot: 'cloth', chance: 0.45, qty: [1, 3] },
    { loot: 'junk', chance: 0.29, qty: [1, 1] },
    { loot: 'essence', chance: 0.20, qty: [1, 1] },
    { loot: 'gem', chance: 0.06, qty: [1, 1] },
  ],

  // Chance per hour of trip of also bringing back a recipe scroll
  // (0.01 = 1%, so about 8% on an 8-hour trip).
  scrollChancePerHour: 0.01,

  // A shop with Tailoring gets cloth on this share of rolls instead of 0.45;
  // the other kinds share what's left in the same proportions.
  tailoringClothChance: 0.60,
  // ...and every gathering trip (not raids) also brings home about this much
  // cloth an hour from the zone's tier, like a gatherer's haul. Halved on a bad haul.
  tailoringClothPerHour: 8,
};
