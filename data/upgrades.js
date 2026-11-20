// Shop upgrades, bought with gold on the Shop tab. Safe to edit.
// Money is in copper: 10,000 = 1 gold, 100 = 1 silver.
//
// Fields:
//   id         never change this once players have saves (it's stored in them)
//   name       shown on the Shop tab
//   blurb      one line saying what each level does
//   levels     how many levels you can buy
//   cost       price of the first level, in copper
//   growth     each level costs this many times the one before (1.8 = +80%)
//   standing   guild standing needed for each level, in order (null = none).
//              Must have one entry per level.
//   per        how much each level adds; what it means depends on the upgrade
//              (see the comment on each one)
//   max        only on some: an extra effect at the top level

export const upgrades = [
  // +1 order slot at every workstation per level (3 at the start).
  { id: 'queue', name: 'Workstation queue', blurb: '+1 order slot at every workstation',
    levels: 5, cost: 10000, growth: 1.8, per: 1,
    standing: [null, null, 'friendly', 'friendly', 'honored'] },

  // Crafting time -8% per level, at every workstation except the forge.
  { id: 'tools', name: 'Tools', blurb: 'Crafting 8% faster',
    levels: 5, cost: 15000, growth: 1.8, per: 0.08,
    standing: [null, null, 'friendly', 'friendly', 'honored'] },

  // Smelting time at your forge -10% per level. At the top level, each bar
  // smelted has this chance of making one extra bar.
  { id: 'bellows', name: 'Bellows', blurb: 'Smelting at your forge 10% faster',
    levels: 5, cost: 10000, growth: 1.8, per: 0.10, max: { bonusBarChance: 0.10 },
    standing: [null, null, 'friendly', 'friendly', 'honored'] },

  // +12 bag slots per level (48 at the start).
  { id: 'bags', name: 'Bags and bank', blurb: '+12 storage slots',
    levels: 5, cost: 5000, growth: 1.8, per: 12,
    standing: [null, null, null, 'friendly', 'friendly'] },

  // Auction house cut -0.5 points per level (5% at the start, down to 2.5%),
  // and listing deposits -10% per level.
  { id: 'seal', name: "Auctioneer's seal", blurb: 'Auction house cut -0.5%, deposits -10%',
    levels: 5, cost: 50000, growth: 1.8, per: 0.005, depositPer: 0.10,
    standing: [null, 'friendly', 'friendly', 'honored', 'revered'] },

  // +8 listing slots per level (10 at the start).
  { id: 'listings', name: 'Listing board', blurb: '+8 auction house listing slots',
    levels: 5, cost: 7500, growth: 1.8, per: 8,
    standing: [null, null, 'friendly', 'friendly', 'honored'] },

  // +1 hero on the tavern board per level (3 at the start).
  { id: 'table', name: 'Tavern table', blurb: '+1 hero on the tavern board',
    levels: 3, cost: 20000, growth: 1.8, per: 1,
    standing: [null, 'friendly', 'honored'] },

  // +1 expedition slot per level (2 at the start).
  { id: 'charter', name: 'Expedition charter', blurb: '+1 hero out gathering at once',
    levels: 4, cost: 30000, growth: 1.8, per: 1,
    standing: [null, 'friendly', 'honored', 'revered'] },

  // +1 commission slot and +5% commission pay per level (3 slots at the start).
  { id: 'counter', name: 'Counter', blurb: '+1 commission slot, commission pay +5%',
    levels: 2, cost: 25000, growth: 1.8, per: 1, payPer: 0.05,
    standing: [null, 'friendly'] },

  // The Ledger. Level 1: a 7-day price chart on every item. Level 2: an
  // estimate of how fast a listing will sell. Level 3: the town crier warns
  // about events this many hours before they start.
  { id: 'ledger', name: 'Ledger', blurb: 'Price history, sell-time estimates, then early event warnings',
    levels: 3, cost: 20000, growth: 1.8, warnHours: 6,
    standing: [null, null, 'friendly'] },

  // The auctioneer's clerk looks after your listings while you're away.
  // Level 1: relists a listing that expires unsold, up to `relists` times.
  // Level 2 and up: also checks live listings every `checkHours[level - 1]`
  // hours and changes the price to stay first in line (free, no new deposit).
  // It never prices above the price you set, or below your floor (a share of
  // that price, picked from `floors` on the Auction tab; `floor` to start).
  { id: 'clerk', name: "Auctioneer's clerk", blurb: 'Relists and reprices your listings while you are away',
    levels: 3, cost: 15000, growth: 1.8,
    relists: 3, checkHours: [null, 2, 0.5], floors: [0.8, 0.85, 0.9, 0.95, 1], floor: 0.9,
    standing: [null, 'friendly', 'honored'] },
];

export const upgradeById = Object.fromEntries(upgrades.map((u) => [u.id, u]));
