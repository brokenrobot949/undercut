// Gathering zones. Design: ten zones, two per tier (one leans to ore, one to
// herbs and hides). Tiers 1-5 have their ore zones; the herb and hide zones
// arrive with Herbalism and Skinning.
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
  {
    id: 'emberfall-quarry', name: 'Emberfall Quarry', tier: 3, levels: [25, 35], minSkill: 125, feePerHour: 245,
    blurb: 'A smoking quarry cut deep into iron-red rock.',
    loot: { mining: [{ item: 'iron-ore', perHour: 7 }, { item: 'ironstone', perHour: 5 }, { item: 'tin-ore', perHour: 2 }] },
  },
  {
    id: 'moonscar-basin', name: 'Moonscar Basin', tier: 4, levels: [35, 45], minSkill: 175, feePerHour: 310,
    blurb: 'A pale crater lake ringed with silver-veined cliffs.',
    loot: { mining: [{ item: 'moonsilver-ore', perHour: 6 }, { item: 'flintstone', perHour: 4 }, { item: 'iron-ore', perHour: 2 }] },
  },
  {
    id: 'skyfall-crater', name: 'Skyfall Crater', tier: 5, levels: [45, 60], minSkill: 225, feePerHour: 400,
    blurb: 'Black glass and starmetal where a falling star struck.',
    loot: { mining: [{ item: 'starmetal-ore', perHour: 5 }, { item: 'basalt', perHour: 4 }, { item: 'moonsilver-ore', perHour: 2 }] },
  },
];

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
