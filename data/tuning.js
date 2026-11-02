// Global settings. Safe to edit: change the number, save, hard refresh.
// Money is always counted in copper: 1 gold = 100 silver = 10,000 copper.

export const tuning = {
  // How often the market updates, in minutes.
  tickMinutes: 10,

  // Longest absence the game replays tick by tick, in days.
  // Past this, the market jumps to a fresh state and timers just resolve.
  catchUpMaxDays: 7,

  // Autosave interval while the game is open, in seconds.
  autosaveSeconds: 30,

  // Gold a new shop starts with, in copper (5,000 = 50 silver).
  startingCopper: 5000,
  // Materials a new shop starts with, by starting profession: enough for a
  // first craft or two.
  startingBags: {
    blacksmithing: { 'copper-bar': 4, 'rough-stone': 6 },
    leatherworking: { 'soft-leather': 6, 'boar-hide': 2, 'curing-salt': 2, 'waxed-thread': 3 },
    alchemy: { dawnpetal: 6, silverfern: 6, 'simple-vial': 10 },
    tailoring: { 'linen-scraps': 12, 'waxed-thread': 6 },
  },

  // ---- Shop ----
  // Bag slots at the start. Materials stack this many per slot; gear takes a slot each.
  bagSlots: 48,
  stackSize: 20,
  // Orders each workstation (anvil, forge) can hold at the start.
  queueSlots: 3,
  // Auction house listings you can have up at once, at the start.
  listingSlots: 10,
  // The City Smelter smelts instantly for this share of the bars' base value.
  smelterFee: 0.25,

  // ---- Skill ----
  // Chance of +1 skill per craft, by recipe color. A recipe's color comes from
  // your skill against the four numbers in its `skill` list (data/recipes.js).
  skillUpChance: { orange: 1, yellow: 0.75, green: 0.25, gray: 0 },

  // ---- Tavern ----
  tavern: {
    // Heroes on the hire board, and how often it refreshes (hours).
    boardSize: 3,
    refreshHours: 4,
    // Cost to refresh the board early, in copper.
    refreshFee: 25,
    // Heroes out gathering at once, at the start.
    expeditionSlots: 2,
    // Trip lengths offered, in hours.
    tripHours: [0.25, 1, 4, 8],
    // Fee = zone fee per hour x hours ^ this. Below 1, long trips cost less per hour.
    feeExponent: 0.85,
    // Chance a trip comes back with half a load (Orcs halve it again).
    badHaulChance: 0.12,
    // Each haul varies by up to this much either way.
    haulSpread: 0.2,
    // Hero levels on the board, [lowest, highest].
    heroLevels: [3, 60],
    // From this standing on, the last hero on the board is always level 60,
    // ready for a raid expedition.
    raiderStanding: 'revered',
    // Chance a hero knows two gathering professions instead of one.
    dualProfessionChance: 0.3,
    // Regulars: heroes you've hired before. Each re-hire adds a loyalty level.
    regulars: {
      max: 12, // regulars the tavern remembers; past this, the least loyal is forgotten
      maxLoyalty: 5,
      feeCutPerLoyalty: 0.04, // 4% cheaper per loyalty level
      yieldPerLoyalty: 0.03, // 3% more gathered per loyalty level
      inTownChance: 0.4, // chance each regular is in town at a board refresh
      levelsPerTripHour: 1 / 6, // levels gained per hour away (an 8 h trip = 1.3 levels)
    },
    // A hero gathering with two professions on one trip gathers each at this
    // share (0.6 each = a bit more in total, less of each).
    dualGatherShare: 0.6,
  },

  // ---- Auction house ----
  market: {
    // Selling to a vendor pays this share of an item's base value. This is the price floor.
    vendorShare: 0.25,
    // The auction house keeps this share of every sale.
    cut: 0.05,
    // Listing durations in hours, and the deposit for each: a share of
    // vendor price x quantity, lost for any units that don't sell.
    durations: [
      { hours: 2, deposit: 0.05 },
      { hours: 8, deposit: 0.10 },
      { hours: 24, deposit: 0.20 },
    ],

    // Buyers. Unserved buyers wait in a "reservoir" that refills at the
    // demand rate, up to this many hours of demand.
    reservoirHours: 24,
    // Share of waiting buyers who shop each 10-minute tick.
    shopperShare: 0.2,
    // How far a buyer's price limit strays from the fair price. 0.35 puts
    // most buyers within about +/-20% of fair, a few out to +/-35%.
    buyerSpread: 0.35,

    // NPC sellers. Each category restocks at this share of its demand...
    // A little above 1 keeps stock on the board to undercut. Much above 1 and
    // there's always something cheaper, so listing high never sells.
    npcSupply: { material: 1.2, consumable: 1.2, gear: 1.15, scroll: 1.15 },
    // ...and stops posting once this many hours of demand are already listed.
    npcMaxStockHours: 8,
    // Units per NPC listing, [smallest, largest].
    npcLotSize: { material: [5, 20], consumable: [2, 10], gear: [1, 1], scroll: [1, 1] },
    // NPCs post at fair price x somewhere in this range...
    npcPriceRange: [0.9, 1.25],
    // ...except this share of them, who undercut the lowest listing by 1-5%...
    npcUndercutShare: 0.25,
    // ...and this share, who need gold fast and list a bargain in this range.
    // Bargains are what flippers hunt for.
    npcBargainShare: 0.04,
    npcBargainRange: [0.6, 0.8],

    // Demand drifts up and down a little day to day, item by item.
    // About this much either way on a typical day.
    demandDrift: 0.12,
    // When the price is low, NPCs list less (higher = they hold back more).
    npcPriceElasticity: 2,

    // Fair price. Each tick it moves this share of the way to its target
    // (0.025 = about halfway in 4-5 hours).
    followRate: 0.025,
    // Listed stock below this many days of demand is normal and doesn't lower the price.
    normalSupplyDays: 0.4,
    // How hard extra stock pushes the price down. At 2.2, one extra day of
    // demand listed cuts the target price by about two thirds.
    floodStrength: 2.2,
    // Stock listed above fair price weighs on the price less and less, and
    // stops counting at fair x this.
    affordableUpTo: 2.5,
    // Waiting buyers above this share of the reservoir push the price up...
    normalScarcity: 0.1,
    // ...by up to this much when the reservoir is full.
    scarcityStrength: 0.4,
    // The fair price never goes above base x this.
    maxPriceMult: 3,

    // Demand tags on each item. Flooded and Slow: listed stock above normal,
    // in days of demand, or a price below base x slowPrice. Hot: a price above
    // base x hotPrice, or more than this share of the buyer reservoir waiting.
    // Rare items (gems, scrolls, gear) have few listings, so their price and
    // waiting buyers bounce around more; these keep Hot to about 1 check in 8.
    // Items with fewer than thinDemand buyers an hour use the "Thin" limits.
    tags: { floodedDays: 0.6, slowDays: 0.25, slowPrice: 0.88, hotPrice: 1.15, hotScarcity: 0.5,
      thinDemand: 1, hotPriceThin: 1.22, hotScarcityThin: 0.7 },
  },

  // Demand multiplier by hero level band (tier 1 to 5): the realm has the most
  // heroes at low levels and at the level cap.
  populationByTier: [1.0, 0.85, 0.75, 0.75, 1.2],

  // Reputation needed for each Trade Guild standing.
  standings: [
    { id: 'neutral', name: 'Neutral', rep: 0 },
    { id: 'friendly', name: 'Friendly', rep: 3000 },
    { id: 'honored', name: 'Honored', rep: 9000 },
    { id: 'revered', name: 'Revered', rep: 21000 },
    { id: 'exalted', name: 'Exalted', rep: 42000 },
  ],
};
