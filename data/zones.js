// Gathering zones. Design: ten zones, two per tier (one leans to ore, one to
// herbs and hides).
//
// Fields:
//   levels      hero level band [min, max] that can go here.
//   minSkill    gathering skill needed.
//   feePerHour  hire fee in copper for a 1-hour trip (see tuning.tavern.feeExponent).
//   loot        what a hero brings back per hour of trip, by gathering profession. It may have
//               entries for 'mining', 'herbalism' and 'skinning'; a hero gathers with each of
//               their professions the zone has loot for.

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
  {
    id: 'fernwhistle-glade', name: 'Fernwhistle Glade', tier: 1, levels: [1, 15], minSkill: 1, feePerHour: 95,
    blurb: 'Sunny glades where the ferns hum in the wind.',
    loot: {
      herbalism: [{ item: 'dawnpetal', perHour: 8 }, { item: 'silverfern', perHour: 6 }],
      skinning: [{ item: 'boar-hide', perHour: 5 }, { item: 'soft-leather', perHour: 6 }],
    },
  },
  {
    id: 'bramblewick-fen', name: 'Bramblewick Fen', tier: 2, levels: [15, 25], minSkill: 75, feePerHour: 135,
    blurb: 'A bramble-choked fen full of wolves and thistles.',
    loot: {
      herbalism: [{ item: 'thistlebur', perHour: 6 }, { item: 'bruisewort', perHour: 5 }],
      skinning: [{ item: 'wolf-hide', perHour: 4 }, { item: 'supple-leather', perHour: 5 }],
    },
  },
  {
    id: 'wildsage-downs', name: 'Wildsage Downs', tier: 3, levels: [25, 35], minSkill: 125, feePerHour: 215,
    blurb: 'Rolling sage-covered hills where bears roam.',
    loot: {
      herbalism: [{ item: 'ironleaf', perHour: 5 }, { item: 'wild-sage', perHour: 5 }],
      skinning: [{ item: 'bear-hide', perHour: 4 }, { item: 'tough-leather', perHour: 5 }],
    },
  },
  {
    id: 'ghostlight-marsh', name: 'Ghostlight Marsh', tier: 4, levels: [35, 45], minSkill: 175, feePerHour: 290,
    blurb: 'A misty marsh lit at night by pale glowing caps.',
    loot: {
      herbalism: [{ item: 'sunbloom', perHour: 5 }, { item: 'ghostcap', perHour: 4 }],
      skinning: [{ item: 'basilisk-hide', perHour: 4 }, { item: 'boiled-leather', perHour: 4 }],
    },
  },
  {
    id: 'barrowmoor', name: 'Barrowmoor', tier: 5, levels: [45, 60], minSkill: 225, feePerHour: 365,
    blurb: 'Old burial mounds under moss, where drakelings nest.',
    loot: {
      herbalism: [{ item: 'starlily', perHour: 4 }, { item: 'barrowmoss', perHour: 4 }],
      skinning: [{ item: 'drakeling-hide', perHour: 3 }, { item: 'ironhide-leather', perHour: 4 }],
    },
  },
];

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
