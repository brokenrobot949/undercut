// Commissions: requests posted at the shop counter. Safe to edit numbers.
// Money is in copper. "Market" means the item's market value when posted.
// Reputation lists go by item tier, 1 to 5.

export const commissionTuning = {
  // Requests on the counter at once, and how often a new one posts (hours).
  slots: 3,
  postEveryHours: 2,
  // A request can ask for a recipe you'll learn soon: up to this many skill
  // points above yours. Below, it skips recipes this far under your skill.
  reachAbove: 10,
  reachBelow: 60,
};

// The four kinds. `weight` is how often each kind posts (a regular's request
// only when you have regulars). `qty` is [fewest, most]; gear always asks for one.
export const commissionTypes = [
  { id: 'standard', name: 'Standard', weight: 55, hours: [12, 24], payMult: 1.5,
    qty: { consumable: [3, 8], gear: [1, 1] }, rep: [75, 115, 160, 205, 250] },
  { id: 'rush', name: 'Rush', weight: 20, hours: [2, 4], payMult: 2.5,
    qty: { consumable: [2, 4], gear: [1, 1] }, rep: [150, 210, 275, 340, 400] },
  // Delivered in parts: gold and reputation are paid for each part handed in.
  { id: 'contract', name: 'Guild contract', weight: 10, hours: [48, 72], payMult: 1.25,
    qty: { consumable: [20, 40] }, rep: [500, 750, 1000, 1250, 1500] },
  // A regular wants gear for their class and level. Also builds loyalty and
  // gives the regular a level boost.
  { id: 'regular', name: "Regular's request", weight: 15, hours: [24, 24], payMult: 1.5,
    qty: { gear: [1, 1] }, rep: [50, 75, 100, 125, 150], levelBoost: 3 },
];

// Who posts guild contracts.
export const contractRequesters = ['The city garrison', 'The harbor watch', 'The Trade Guild stores', 'The royal stables', 'The road wardens'];
