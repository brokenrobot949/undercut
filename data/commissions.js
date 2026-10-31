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
  // Reputation scales with what the order is worth, against a typical piece
  // of gear at its tier (copper, tiers 1-5). A big order earns the full amount
  // from the table below; a small one earns less, but never under repFloor.
  repValueRef: [150, 450, 800, 1400, 2600],
  repFloor: 0.25,
  // Multiplies all commission reputation. Lower it to slow standing down.
  repScale: 0.65,
};

// The four kinds. `weight` is how often each kind posts (a regular's request
// only when you have regulars). `qty` is [fewest, most]; gear always asks for one.
export const commissionTypes = [
  { id: 'standard', name: 'Standard', weight: 55, hours: [12, 24], payMult: 1.5,
    qty: { consumable: [3, 8], gear: [1, 1] }, rep: [75, 115, 160, 205, 250] },
  { id: 'rush', name: 'Rush', weight: 20, hours: [2, 4], payMult: 2.5,
    qty: { consumable: [2, 4], gear: [1, 1] }, rep: [150, 210, 275, 340, 400] },
  // Delivered in parts: gold and reputation are paid for each part handed in.
  // repRefMult: a contract counts as big at four times the usual order value.
  { id: 'contract', name: 'Guild contract', weight: 10, hours: [48, 72], payMult: 1.25, partial: true,
    qty: { consumable: [20, 40] }, rep: [500, 750, 1000, 1250, 1500], repRefMult: 4 },
  // Guild drive: only posted by the market event of the same name (weight 0),
  // on top of the usual slots. noRepScale: its reputation isn't multiplied by
  // repScale, so a full drive is worth the table value (up to 2,000).
  { id: 'drive', name: 'Guild drive', weight: 0, hours: [72, 72], payMult: 1.25, partial: true, noRepScale: true,
    qty: { consumable: [40, 80] }, rep: [1200, 1400, 1600, 1800, 2000], repRefMult: 8 },
  // A regular wants gear for their class and level. Also builds loyalty and
  // gives the regular a level boost.
  { id: 'regular', name: "Regular's request", weight: 15, hours: [24, 24], payMult: 1.5,
    qty: { gear: [1, 1] }, rep: [50, 75, 100, 125, 150], levelBoost: 3 },
];

// Who posts guild contracts.
// Who posts guild drives.
export const driveRequester = 'The Trade Guild';

export const contractRequesters = ['The city garrison', 'The harbor watch', 'The Trade Guild stores', 'The royal stables', 'The road wardens'];
