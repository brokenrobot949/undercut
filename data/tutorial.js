// The tutorial: the first five commissions, posted by the guild quartermaster.
// Each step is done by doing the thing anywhere in the game (in any order);
// then you claim its reward at the commission counter. Normal commissions
// start once all five are claimed. Money is in copper (100 = 1 silver).
//
// Goals the engine understands:
//   craft   finish crafting the named recipe
//   list    list anything on the auction house
//   buy     buy anything on the auction house
//   smelt   smelt ore into bars (your forge or the City Smelter)
//   hire    hire a hero at the tavern
//   learn   learn a recipe from the guild trainer

export const tutorialMentor = { name: 'Marta Ashgrove', title: 'guild quartermaster' };

// The first customer: once per game, a buyer comes by soon after your first
// listing and buys it, if the price is no more than this much above market.
export const firstCustomer = { minSeconds: 60, maxSeconds: 120, maxPriceMult: 1.25, maxUnits: 5 };

export const tutorialSteps = {
  blacksmithing: [
    { goal: 'craft', recipe: 'copper-cleaver', title: 'Your first blade',
      text: 'Make a copper cleaver at the anvil. Your bags hold the copper bars and rough stone: make rough grit first, then the cleaver.', pay: 1000, rep: 25 },
    { goal: 'list', title: 'Open for business',
      text: 'List something on the auction house: the cleaver will do. Price it at or near the market, and a customer should come by within a couple of minutes.', pay: 1000, rep: 25 },
    { goal: 'buy', title: 'Shopping run',
      text: 'Buy a material on the auction house. Copper ore is cheap and you\'ll want it next.', pay: 1500, rep: 25 },
    { goal: 'smelt', title: 'Into the fire',
      text: 'Smelt ore into bars at your forge. It\'s free but takes a little time; the City Smelter is instant, for a fee.', pay: 1500, rep: 25 },
    { goal: 'hire', title: 'Hands for hire',
      text: 'Hire a hero at the tavern to gather while you\'re away. Even a short trip brings home a haul and some bonus loot.', pay: 2500, rep: 50 },
  ],
  leatherworking: [
    { goal: 'craft', recipe: 'soft-armor-kit', title: 'Your first kit',
      text: 'Make a soft armor kit at the workbench. Your bags hold the soft leather and waxed thread.', pay: 1000, rep: 25 },
    { goal: 'list', title: 'Open for business',
      text: 'List something on the auction house: the armor kit will do. Price it at or near the market, and a customer should come by within a couple of minutes.', pay: 1000, rep: 25 },
    { goal: 'buy', title: 'Shopping run',
      text: 'Buy a material on the auction house. Soft leather is cheap and always useful.', pay: 1500, rep: 25 },
    { goal: 'craft', recipe: 'cured-boar-hide', title: 'Salt and patience',
      text: 'Cure a boar hide at the workbench. Most leather goods need cured hides, and your bags hold two hides and the salt.', pay: 1500, rep: 25 },
    { goal: 'hire', title: 'Hands for hire',
      text: 'Hire a hero at the tavern to gather while you\'re away. A skinner brings hides and leather, plus some bonus loot.', pay: 2500, rep: 50 },
  ],
  alchemy: [
    { goal: 'craft', recipe: 'faint-mending-draught', title: 'Your first draught',
      text: 'Brew a faint mending draught at the alchemy table. Your bags hold the dawnpetal and vials.', pay: 1000, rep: 25 },
    { goal: 'list', title: 'Open for business',
      text: 'List something on the auction house: the draught will do. Price it at or near the market, and a customer should come by within a couple of minutes.', pay: 1000, rep: 25 },
    { goal: 'buy', title: 'Shopping run',
      text: 'Buy a material on the auction house. Dawnpetal and silverfern are cheap and always useful.', pay: 1500, rep: 25 },
    { goal: 'learn', title: 'New tricks',
      text: 'Learn a recipe from the trainer at the Trade Guild, on the Shop tab. The first one goes on sale at skill 10, so brew a few more draughts first.', pay: 1500, rep: 25 },
    { goal: 'hire', title: 'Hands for hire',
      text: 'Hire a hero at the tavern to gather while you\'re away. A herbalist brings herbs, plus some bonus loot.', pay: 2500, rep: 50 },
  ],
  tailoring: [
    { goal: 'craft', recipe: 'linen-patch-kit', title: 'Your first stitches',
      text: 'Sew a linen patch kit at the loom. Your bags hold the linen scraps and waxed thread.', pay: 1000, rep: 25 },
    { goal: 'list', title: 'Open for business',
      text: 'List something on the auction house: the patch kit will do. Price it at or near the market, and a customer should come by within a couple of minutes.', pay: 1000, rep: 25 },
    { goal: 'buy', title: 'Shopping run',
      text: 'Buy a material on the auction house. Linen scraps are cheap and always useful.', pay: 1500, rep: 25 },
    { goal: 'craft', recipe: 'spun-linen', title: 'Spin a yarn',
      text: 'Spin linen at the loom. Robes, cowls and satchels all need spun cloth.', pay: 1500, rep: 25 },
    { goal: 'hire', title: 'Hands for hire',
      text: 'Hire a hero at the tavern. Any hero brings home cloth as bonus loot, and tailors get more of it.', pay: 2500, rep: 50 },
  ],
};
