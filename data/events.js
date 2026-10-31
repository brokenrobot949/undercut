// Market events: things that shift demand or supply for a while, announced by
// the town crier on the Shop tab. Safe to edit numbers and text.
//
// Fields:
//   id          never change once players have saves
//   name        shown by the town crier
//   kind        what it does (the engine handles each kind):
//                 'demand'  multiplies NPC buyers for matching items by `mult`
//                 'supply'  multiplies NPC restocking of one matching item by `mult`
//                 'glut'    an NPC dumps `qty` units of one matching item at
//                           `priceRange` x the fair price
//                 'drive'   the guild posts a big city-wide contract (see
//                           data/commissions.js, type 'drive')
//   match       which items it touches. Every field given must match:
//                 category  'material', 'consumable' or 'gear'
//                 armor     gear only, e.g. 'weapon'
//                 tiers     list of tiers, e.g. [1, 2]
//                 idHas     list of words; the item id must contain one of them
//                 yours     true: only items your professions make or use
//   hours       how long it lasts
//   everyDays   about how often it comes round (each gap varies +/- 30%)
//   group       demand events in the same group never overlap
//   crier       the town crier's line. {item} becomes the item's name.
//   ended       optional line for "While you were away" when it ends

export const events = [
  { id: 'raid-night', name: 'Raid night', kind: 'demand', mult: 3, hours: 12, everyDays: 3.5, group: 'consumable',
    match: { category: 'consumable', idHas: ['ward', 'elixir', 'honing-stone', 'balance-weight'] },
    crier: 'Raid night! Heroes are stocking up on wards, elixirs, honing stones and balance weights.' },
  { id: 'fresh-recruits', name: 'Fresh recruits', kind: 'demand', mult: 2, hours: 48, everyDays: 7, group: 'gear',
    match: { category: 'gear', tiers: [1, 2] },
    crier: 'Fresh recruits have arrived in the city. Low-level gear is in demand.' },
  { id: 'tournament', name: 'Tournament', kind: 'demand', mult: 2, hours: 24, everyDays: 7, group: 'gear',
    match: { category: 'gear', armor: 'weapon' },
    crier: 'A tournament is on! Every fighter in town wants a better weapon.' },
  { id: 'ore-shortage', name: 'Ore shortage', kind: 'supply', mult: 0.3, hours: 24, everyDays: 7,
    match: { category: 'material', idHas: ['-ore'] },
    crier: 'A mine has flooded. {item} is scarce on the auction house.' },
  { id: 'glut', name: 'Glut', kind: 'glut', qty: [50, 80], priceRange: [0.5, 0.7], hours: 72, everyDays: 1,
    match: { category: ['material', 'consumable'], yours: true },
    crier: 'A trader is dumping {item} on the auction house, cheap.' },
  { id: 'guild-drive', name: 'Guild drive', kind: 'drive', hours: 72, everyDays: 14,
    crier: 'The guild has called a city-wide drive. Check the counter for a big contract.' },
];

export const eventById = Object.fromEntries(events.map((e) => [e.id, e]));

// How far ahead the calendar is planned, in days. The Ledger can only warn
// about events already on the calendar.
export const calendarDays = 7;

// The first event of each kind comes no sooner than this many hours into a
// new game, so new players learn the normal market first.
export const firstEventHours = 24;
