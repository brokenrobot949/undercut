// Gathering zones. Design: ten zones, two per tier (one leans to ore, one to
// herbs and hides). Phase 1 has the two ore zones for tiers 1-2; the rest
// arrive with Herbalism and Skinning in Phase 2.
//
// Fields:
//   levels      hero level band [min, max] that can go here.
//   minSkill    gathering skill needed.
//   feePerHour  hire fee in copper for a 1-hour trip (see tuning.tavern.feeExponent).
//   loot        what a hero brings back per hour of trip, by gathering profession.

export const zones = [
  {
    id: 'rustvein-hollow', name: 'Rustvein Hollow', tier: 1, levels: [1, 15], minSkill: 1, feePerHour: 110,
    blurb: 'Red cliffs riddled with old copper workings.',
    loot: { mining: [{ item: 'copper-ore', perHour: 10 }, { item: 'rough-stone', perHour: 6 }] },
  },
  {
    id: 'tinmouth-ridge', name: 'Tinmouth Ridge', tier: 2, levels: [15, 25], minSkill: 75, feePerHour: 170,
    blurb: 'Windy ridges where tin runs close to the surface.',
    loot: { mining: [{ item: 'tin-ore', perHour: 7 }, { item: 'coarse-stone', perHour: 5 }, { item: 'copper-ore', perHour: 3 }] },
  },
];

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
