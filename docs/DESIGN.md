# Undercut — Game Design Document

Snapshot of the design doc as of Oct 30, 2026. This file is the source of truth for the build. Update it whenever a design decision changes.

## Overview

Undercut is a real-time idle economy game: you run a crafting shop in a fantasy capital, and every hero in the world is an NPC customer. You craft gear and potions, price them against simulated competitors on the auction house, and hire heroes to gather your materials.

**Design pillars**

- **The market is the game.** Prices, competition and demand shifts are what the player reads and plays against.
- **Every price is a decision.** Listing too high costs deposits and time, too low leaves gold on the table, and flooding an item crashes it.
- **Check in, don't babysit.** Short visits to collect, relist and send heroes out. The world keeps running while the phone is locked.
- **Shaped like WoW, named originally.** Classic-era structure and feel, with no Blizzard names.

**Closest existing games:** Shop Titans and Shop Heroes (craft, sell, send heroes for materials). Undercut's difference is a simulated MMO auction house with player-set prices, undercutting NPC sellers and market saturation.

**Endgame:** every profession at Artisan (300) and Exalted standing with the city's Trade Guild, which unlocks the best recipes.

## Factions and capitals

The player picks one of two capitals at the start. The choice sets the color theme, the hero races on the tavern board and one faction-only class. Recipes, items and zones are the same on both sides.

|  | Ember Pact (red) | Azure Crown (blue) |
| --- | --- | --- |
| Capital | Kragmar, a red-stone war city in the badlands | Aldmere, a white-stone harbor kingdom |
| Theme | Crimson and ember on charcoal | Royal blue and steel on navy |
| Hero races | Orc, Troll, Hornkin, Risen | Human, Dwarf, Gnome, Elf |
| Faction-only class | Shaman | Paladin |
| Trade Guild | Kragmar Trade Consortium | Aldmere Merchants' Guild |

The faction-only classes give each market a slightly different shape: Shamans wear mail, so red buys more mail; Paladins wear plate, so blue buys more plate.

One faction per save. Starting a new game with the other faction is allowed after exporting a backup.

**IP boundaries** (rules for everyone writing content, including Claude Code and any delegated model)

- No World of Warcraft proper nouns anywhere: no Orgrimmar, Stormwind, Horde, Alliance, Azeroth, Tauren, Forsaken, or any WoW zone, item, recipe or character name.
- Generic fantasy and trade words are fine: Blacksmithing, Herbalism, Orc, Dwarf, Warrior, Paladin, copper, linen, Exalted.
- No WoW art, icons, sounds, fonts or interface images.
- Mechanics can echo Classic (skill colors, listing durations, reputation tiers). Names and text must be original.

## Core loop and time model

The game runs in real time, and the player checks in every few hours to collect results, make decisions and leave. Everything is scheduled by timestamp, so heroes return, crafts finish and listings sell while the game is closed.

**The loop**

1. **Gold**, earned from sales and commissions, is spent on materials, hero fees, training, recipes and shop upgrades.
2. **Materials:** buy on the auction house (fast, pricey) or hire a hero (cheap, slow).
3. **Craft:** queue recipes at workstations; skill-ups depend on recipe color.
4. **Sell:** list on the auction house or fill commissions. Gold flows back to step 1.

Two side branches feed the loop:

- **Trade Guild:** commissions earn reputation, and standing unlocks recipes, ranks and profession wings.
- **Shop upgrades:** bought with gold; they add queue, listing and hero slots, speed up timers and lower fees.

Most gold comes from the auction house. Commissions add reputation, and reputation unlocks what you can craft next.

**A check-in**

1. The "While you were away" summary opens: items sold, listings expired, heroes returned, crafts finished, commissions posted or expired, events started.
2. Collect all: gold and returned items go to your bags. Sales, expired listings and hero hauls wait in the mailbox for Collect all. Finished crafts and smelts go straight to bags.
3. Act: relist, queue crafts, send heroes out, hand in commissions.
4. Leave. A typical visit takes 1 to 3 minutes.

**Timers** (starting values, tuned in playtests)

| Timer | Durations |
| --- | --- |
| Hero trips | 15 min, 1 h, 4 h, 8 h |
| Auction listings | 2 h, 8 h, 24 h |
| Crafting | 5 s to 2 min per item early, up to 10 min for top recipes |
| Smelting at your forge | 20 s per bar early, 1 min per bar at the top tier |
| Commission deadlines | 2 h to 3 days |
| Tavern board refresh | Every 4 h |
| Market tick | Every 10 min |

**Offline progress.** On load, the game replays everything since the last save in order: market ticks, sales, hero returns and finished crafts. Catch-up is exact for up to 7 days away. After a longer absence the market jumps to a fresh state and your timers resolve.

There are no push notifications, since a static site can't send them. The summary screen is how the player learns what happened.

**Cadence target:** 4 to 6 check-ins a day early, when timers are short. 2 to 3 a day later, when long trips and 24 h listings pay best.

## Professions, skill and recipes

The player starts with Blacksmithing, Leatherworking, Alchemy or Tailoring and unlocks more through shop expansions (wings). Enchanting (Phase 5) opens only with a wing. The first three each pair with a gathering profession, so the first choice also decides which heroes you hire first. Tailoring has no gathering profession; cloth comes from every hero trip instead (see Tailoring below).

| Profession | Makes | Main materials | Gathering pair |
| --- | --- | --- | --- |
| Blacksmithing | Weapons, plate and mail armor, grit, honing stones and balance weights | Bars, stone, essences | Mining |
| Leatherworking | Leather armor, armor kits, cloaks, quivers and ammo pouches | Leather, hides, thread, salt | Skinning |
| Alchemy | Healing and mana potions, elixirs, resistance potions, transmutes | Herbs, vials | Herbalism |

The starting profession is permanent. The other two never replace it.

- **Workstations:** Blacksmithing has the anvil and the forge, Leatherworking the workbench, Alchemy the alchemy table. Each has its own queue.
- **Starting materials:** a smithy starts with 4 copper bars and 6 rough stone, a leatherworker with 6 soft leather, 2 boar hides, 2 curing salt and 3 waxed thread, an alchemist with 6 dawnpetal, 6 silverfern and 10 simple vials.
- **The tavern** always offers one hero who gathers for your starting profession: a miner, skinner or herbalist.
- **Shops without a forge** still reach the City Smelter from the Workshop.
- **The Workshop** shows a profession switcher once a shop has more than one profession.

**Recipes by tier** (six per tier, plus one scroll-only recipe)

| Tier | Leatherworking | Alchemy |
| --- | --- | --- |
| 1 | Cured boar hide, Soft armor kit, Soft leather boots, Soft leather vest, Linen-lined cloak, Simple quiver; scroll: Boar-tusk belt | Faint mending draught, Faint focus draught, Ox-strength tonic, Owl-wit tonic; scroll: Bottled sunrise |
| 2 | Cured wolf hide, Supple armor kit, Supple leather gloves, Supple leather leggings, Wolfskin cloak, Wolfhide ammo pouch; scroll: Fen-stalker hood | Mild mending draught, Mild focus draught, Thornhide tonic, Swiftstep tonic; scroll: Fenlight tonic |
| 3 | Cured bear hide, Tough armor kit, Tough leather jerkin, Tough leather bracers, Silk-lined cloak, Bearhide quiver; scroll: Bear-claw gauntlets | Sturdy mending draught, Sturdy focus draught, Bulwark elixir, Keen-eye elixir, Transmute: iron to moonsilver; scroll: Philter of second wind |
| 4 | Cured basilisk hide, Boiled armor kit, Boiled leather cap, Boiled leather spaulders, Basilisk-scale cloak, Basilisk ammo pouch; scroll: Basilisk-eye mask | Potent mending draught, Potent focus draught, Emberward draught, Frostward draught, Transmute: moonsilver to starmetal; scroll: Ghostlight draught |
| 5 | Cured drakeling hide, Ironhide armor kit, Ironhide leather tunic, Ironhide leather boots, Drakeling cloak, Drakeling quiver; scroll: Drakewing mantle | Grand mending draught, Grand focus draught, Starlight elixir, Shadowward draught, Transmute: aether essence; scroll: Draught of the long night |

Cloaks are worn by every class and use bonus-loot cloth. Quivers and ammo pouches sell to hunters. Transmutes turn two bars (or essences) plus an herb into two of the next tier, which links Alchemy to Blacksmithing.

**Skill ranks.** Skill runs from 1 to 300 in four ranks. Each rank is trained at the Trade Guild for gold, once you reach the previous cap and the required guild standing.

| Rank | Skill range | Training cost | Guild standing needed |
| --- | --- | --- | --- |
| Apprentice | 1–75 | Free | Neutral |
| Journeyman | 75–150 | 1 g | Neutral |
| Expert | 150–225 | 2.5 g | Friendly |
| Artisan | 225–300 | 10 g | Honored |

Training costs are starting values, tuned in the Phase 2 balance pass (Oct 30, 2026) so a cautious player reaches Expert in week 1 and Artisan in weeks 2–3. Expert dropped from 4 g to 2.5 g on Nov 4, 2026: in playtesting, saving 4 g at skill 150 took several days of slow selling. Steady bots now train Expert the moment they reach Friendly, so standing, not gold, sets the pace; the flooder bot gets there 1–3 days sooner (days 9–12, was 12–14). A trial that also cut listing deposits by a quarter or a half pushed the endgame bots before day 42, so deposits stayed as they were.

**Skill-ups use recipe colors.** Each recipe's color comes from your current skill against four thresholds set in its data.

| Color | Chance of +1 skill per craft |
| --- | --- |
| Orange | 100% |
| Yellow | 75% |
| Green | 25% |
| Gray | 0% |

A typical recipe is orange for 15 points after you learn it, then yellow for 10, green for 10, then gray. Leveling means crafting things the market may not want (see leveling junk under Auction House).

- A recipe can't be crafted until your skill reaches its orange number. Until then it shows red with the skill it needs.
- The skill-up roll happens as each craft finishes, using the recipe's color at that moment. A long queue of one recipe slows down as it turns yellow and green.
- At a rank's cap, crafts give no skill until the next rank is trained.
- Smelting gives no skill.
- Each tier of recipes covers roughly 55 to 70 skill points, overlapping the next tier. Blacksmithing tier 1 starts at skill 1 (rough grit and the copper cleaver) and goes gray by 75. Tier 2 starts at 55 and goes gray by 140. Tier 3 runs 125 to 210, tier 4 190 to 275, and tier 5 starts at 250 and is still orange or yellow at 300.
- Each Blacksmithing tier has six recipes: a grit, a honing stone, a balance weight (named after that tier's stone), a weapon, a mail piece and a plate piece.

**Recipes.** About 25 per profession at launch, 5 per material tier, 75 in total. Sources:

- **Starting recipes:** every profession starts knowing its two skill-1 recipes (for Blacksmithing, rough grit and the copper cleaver). Smelting needs no recipe.
- **Guild trainer:** core recipes, bought with gold once your skill reaches the recipe's orange number. Prices: 50 c to 5 s for tier 1, 3 s to 25 s for tier 2, 30 s to 1.5 g for tiers 3 and 4, and 75 s to 2.5 g for tier 5. The Workshop only lists recipes you know, and points to the trainer when a new one is for sale.
- **Guild quartermaster:** better recipes, gated by guild standing.
- **Rare drops:** heroes sometimes bring back a recipe scroll. It can be learned (once your skill reaches the recipe) or sold on the auction house. Each profession has one scroll-only recipe per tier. Blacksmithing: Copper spurred knuckles, Bronze crested helm, Steel war pick, Moonsilver lamellar vest, Starmetal maul.

Intermediate recipes count for skill too: grit from stone (Blacksmithing) and cured hides from hides and salt (Leatherworking).

**Crafting queue.** Each workstation has its own queue, 3 orders at the start. An order is one recipe times a quantity. Materials are reserved when an order is queued, and crafting continues offline.

**Item quality.** Poor (gray, vendor trash from trips), Common (white), Uncommon (green), Rare (blue), Epic (purple). Most crafted items are white or green. Guild recipes add blue items, and Exalted masterwork recipes are epic.

**Maker's mark.** Every crafted item carries your name. Commissions accept only items you made.

## Tailoring (Phase 5)

Tailors weave cloth scraps into cloth armor (Priests, Mages and Warlocks wear cloth) and satchels (every class buys them). Approved Nov 2, 2026.

- **Workstation:** the Loom. A shop can start as a tailor (starting bags: 12 linen scraps and 6 waxed thread) or open Tailoring with a wing.
- **Materials:** cloth scraps of the tier and waxed thread. From tier 3, gear also needs an herb as dye (wild sage, sunbloom, starlily).
- **Intermediate:** spun cloth (2 scraps + thread), used by every piece of gear, like cured hides.
- **Consumable:** patch kits, sold in bulk like armor kits.
- **Cloth supply:** Tailoring has no gathering profession. While a shop has Tailoring, every gathering trip also brings home about 8 cloth an hour from the zone's tier (halved on a bad haul), and bonus loot rolls cloth 60% of the time instead of 45%. Both numbers are in `data/loot.js`. Cloth gear, satchels and patch kits sell to 30% more buyers than their Leatherworking counterparts.

| Tier | Intermediate | Consumable | Cloth gear | Satchel | Scroll-only |
| --- | --- | --- | --- | --- | --- |
| 1 | Spun linen | Linen patch kit | Linen handwraps, Linen robe, Linen cowl | Linen satchel | Hedgewitch shawl |
| 2 | Spun wool | Wool patch kit | Wool slippers, Wool trousers, Wool shawl | Wool satchel | Lamplighter's hood |
| 3 | Spun silk | Silk patch kit | Silk gloves, Silk robe, Silk sash | Silk satchel | Night-heron veil |
| 4 | Spun brocade | Brocade patch kit | Brocade slippers, Brocade doublet, Brocade cowl | Brocade satchel | Courtier's gloves |
| 5 | Spun samite | Samite patch kit | Samite robe, Samite handwraps, Samite trousers | Samite satchel | Stargazer's mantle |

- **Quartermaster:** Guild clerk's robe (Friendly, green, tier 3), Archivist's brocade gloves (Honored, blue, tier 4), Samite oracle's robe (Revered, blue, tier 5).
- **Masterworks (Exalted):** Flame-woven robe (Ember core), Voidglass-beaded cowl (Voidglass shard).

As built (Nov 2, 2026):

- Recipes copy Leatherworking's skill ranges, craft times and trainer prices. Scrap counts are scaled up so each recipe's material cost, and so its sale price, matches the Leatherworking piece it mirrors.
- NPCs stock and buy about 40% more cloth than before (linen 17, wool 14, silk 13, brocade 11 and samite 11 buyers an hour), so there's enough to buy.
- Cloth from trips started at 5 an hour; the sim showed tailors starved of cloth, so it went to 8.
- A regular's request can now ask for a satchel as well as a cloak or their own armor type.
- In the sim (Nov 2, 2026), the tailor bot reaches skill 300 on days 19–22 and the gate on days 48–54. Every steady bot reaches the gate on days 41–54, with no sim problems.
- Sim bot changes: a tailor hires any hero (they all bring cloth), bots follow the tutorial's craft and buy steps, and a bot that can't buy a full leveling batch buys a smaller one.

## Enchanting (Phase 5)

Enchanters break gear down into magical dust, then make charms that heroes use on their gear, plus a caster's off-hand focus. Approved Nov 2, 2026.

- **Workstation:** the Enchanting circle. Wing-only: it needs other gear to break down.
- **Disenchanting:** break any gear item from your bags into its tier's dust (2–3), with a 25% chance of that tier's essence (cinder, tide, gale, stone, aether). Blue and purple gear can also give a Lucent crystal. Disenchanting is instant and gives no skill, like smelting. Leveling junk finally has a use, and cheap auction-house gear can be bought to break down.
- **New materials:** Cinder dust, Tide dust, Gale dust, Stone dust, Aether dust and the Lucent crystal. All trade on the auction house, and NPCs sell them too.
- **Recipes per tier:** four charms (consumables: edge for weapons, ward for armor, stride for boots, mind for casters) and one focus (gear for cloth wearers). No scroll-only recipes.

| Tier | Charms | Focus |
| --- | --- | --- |
| 1 | Cinder edge charm, Cinder ward charm, Cinder stride charm, Cinder mind charm | Cinderglass focus |
| 2 | Tide edge charm, Tide ward charm, Tide stride charm, Tide mind charm | Tideglass focus |
| 3 | Gale edge charm, Gale ward charm, Gale stride charm, Gale mind charm | Galeglass focus |
| 4 | Stone edge charm, Stone ward charm, Stone stride charm, Stone mind charm | Stoneglass focus |
| 5 | Aether edge charm, Aether ward charm, Aether stride charm, Aether mind charm | Aetherglass focus |

- **The shop service:** a new commission type, the Enchanting request. A hero asks you to enchant their gear with a charm you made. It pays well and gives reputation, like a rush order.
- **Quartermaster:** Guild seal charm (Friendly, green, tier 3), Lucent focus (Honored, blue, tier 4), Starglass focus (Revered, blue, tier 5).
- **Masterworks (Exalted):** Wyrmeye orb (Wyrm scale), Voidglass orb (Voidglass shard).

As built (Nov 2, 2026):

- Recipes copy Leatherworking's skill ranges, craft times and trainer prices. A new Enchanting wing comes with 12 cinder dust and 6 waxed thread.
- Charms are dust and waxed thread only: edge 2 dust, ward 3, stride 4, mind 5. A focus is 5 dust, 1 essence and 1 bar of its tier. Gems, essences and lucent crystals are kept for the quartermaster and masterwork recipes, because they're scarce.
- Dust base values are 10, 20, 40, 65 and 100 copper by tier. NPCs stock and buy 20, 18, 16, 14 and 14 an hour, so there's enough to buy while leveling.
- Disenchanting numbers are in `data/enchanting.js`: dust per item is 1 (poor), 2 (common), 3 (uncommon), 4 (rare) or 6 (epic). There's a 25% chance of an essence, and a lucent crystal at 50% from rare gear, or 1 plus 50% from epic gear. Gear sheets have a Disenchant section, and the Enchanting circle lists every piece of gear in your bags.
- Enchanting requests post with weight 25, for 1–2 charms over 6–12 hours, and pay 2.5× market. They count as a full-size order at a fifth of the usual value, so they earn rush-level reputation.
- Trip cloth for a tailor now comes in the tier its Tailoring is working on, up to the zone's tier.
- Older saves learn any new profession's starting recipes on load.
- All commission reputation was raised slightly (repScale 0.68 → 0.70) so the steady bots stay inside 6–8 weeks.
- In the sim (Nov 2, 2026), a leatherworker who adds Enchanting, then Tailoring, reaches the gate on days 49–54. Every steady bot reaches it on days 42–54, with no sim problems.

Income pass (Nov 2, 2026, after the Phase 5 gate):

- Enchanting earned little because every grain of dust was bought. While a shop has Enchanting, every gathering trip now also brings home about 2 dust an hour, of the tier its Enchanting is working on (up to the zone's tier); this is `dustPerHour` in `data/enchanting.js`. 4 an hour made the enchanter bot too fast (day 38.5).
- Charms now sell for 1.6× their material cost and a focus for 2.0× (were 1.3× and 1.6×).
- Cloth gear, satchels and patch kits have 30% more buyers, since three classes wear cloth.
- Sim result: enchanter gate days 44, tailor 54–56, every steady bot 44–56, no problems.
- The Blacksmithing gap was the sim, not the game (Nov 2, 2026). Sim bots crafted goods to sell only from what was already in their bags, and never bought materials to do it. Smith bots had bags full of bars from their miners, so their anvil earned about 315 g a run; the tailor bot crafted under 1 g for sale, because its tier 3+ gear needs a dye herb its heroes don't bring. On paper every profession's market can absorb a similar profit per day. Two sim fixes:
  - Bots now buy the missing materials for up to 3 crafts of a sellable recipe that earns at least 15% over material cost. They spend at most 15% of their spare gold, and never more than 80% of what the goods will sell for. The flipper bot doesn't, so it still tests flipping on its own.
  - Bots keep materials for their top-tier (tier 5) recipes even once those turn gray, instead of selling them raw.
- Result: every steady bot reaches the gate on days 44–56, with no problems. Gold on day 60: tailor 37 g, tanner 54 g, enchanter 84 g, alchemist 109 g, cautious smith 123 g. No game numbers changed in this step.

## Materials and smelting

Materials come in five tiers that follow hero level bands, with original names on a familiar ladder. Heroes bring back ore, never bars, so smelting is a step the player controls.

| Tier | Hero levels | Ore and bars | Stone | Leather | Herbs | Vial |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1–15 | Copper ore → copper bar | Rough stone | Soft leather | Dawnpetal, Silverfern | Simple vial |
| 2 | 15–25 | Tin ore → tin bar; 1 copper bar + 1 tin bar → 2 bronze bars | Coarse stone | Supple leather | Thistlebur, Bruisewort | Simple vial |
| 3 | 25–35 | Iron ore → iron bar; iron bar + coal → steel bar | Ironstone | Tough leather | Ironleaf, Wild sage | Stoppered vial |
| 4 | 35–45 | Moonsilver ore → moonsilver bar | Flintstone | Boiled leather | Sunbloom, Ghostcap | Stoppered vial |
| 5 | 45–60 | Starmetal ore → starmetal bar | Basalt | Ironhide leather | Starlily, Barrowmoss | Cut-glass vial |

Each tier also has a hide (cured into leather goods with salt), a cloth, an elemental essence and a gem. Endgame recipes need rare materials from raid expeditions: Ember core, Voidglass shard and Wyrm scale.

| Tier | Hide | Cloth | Essence | Gem | Junk (vendor only) |
| --- | --- | --- | --- | --- | --- |
| 1 | Boar hide | Linen scraps | Cinder essence | Quartz | Bent horseshoe, Chipped bone dice |
| 2 | Wolf hide | Wool scraps | Tide essence | Garnet | Rusty buckle, Torn map scrap |
| 3 | Bear hide | Silk scraps | Gale essence | Topaz | Cracked tankard, Dull arrowhead |
| 4 | Basilisk hide | Brocade scraps | Stone essence | Tourmaline | Moth-eaten cloak, Broken compass |
| 5 | Drakeling hide | Samite scraps | Aether essence | Diamond | Faded love letter, Tarnished locket |

Junk never trades on the auction house. Until Leatherworking and Alchemy are playable, herbs, hides and leather sell to NPC crafters on the auction house.

**Four ways to get materials**

| Source | What it gives | Trade-off |
| --- | --- | --- |
| Hired gatherers | Ore and stone (Mining), herbs (Herbalism), leather and hides (Skinning) | Cheapest per unit, but you wait for the trip |
| General trip loot | Any hero on any trip: cloth, essences, gems, gray vendor trash, rare recipe scrolls | A random bonus on every trip |
| Trade goods vendor | Smithing flux, coal, curing salt, waxed thread, and simple, stoppered and cut-glass vials at fixed prices, unlimited | Always there; a small, steady gold sink |
| Auction house | Whatever NPC sellers have listed | Instant, at market price, and buying pushes the price up |

Cloth is Tailoring's main material (Phase 5). It also sells on the auction house.

**Smelting: timed or instant with a cost**

- **Your forge** comes with the Blacksmithing wing. Smelting there is free and timed, in its own queue, so it never blocks crafting. Tiers unlock by Blacksmithing rank: copper, tin and bronze at Apprentice, iron and steel at Journeyman, moonsilver at Expert, starmetal at Artisan. The City Smelter has no rank lock.
- **The City Smelter** is open to everyone. It smelts instantly for a fee of 25% of the bar's base value.
- Smelting gives no skill. It only converts ore to bars.
- Ore and bars both trade on the auction house. NPC sellers price bars above ore plus the smelter fee, so smelting your own is a small profit source.

**Stacks.** Materials and consumables stack to 20 per bag slot. Gear doesn't stack.

## Heroes and the Tavern

Hiring is one pick from a board, with no roster to manage. The tavern board shows 3 heroes for hire (upgradeable to 6) and refreshes every 4 hours, or sooner for a small fee.

**A hero card shows** name, race, class, level, up to two gathering professions with a skill value for each, hire fee and racial perk.

**Hiring a hero**

1. Pick a hero from the board.
2. Pick a zone. Only zones within the hero's level band and gathering skill are offered.
3. Pick a trip length: 15 min, 1 h, 4 h or 8 h.
4. Pay the fee. The hero leaves and uses an expedition slot (2 at the start, up to 6).

**What decides the haul**

- **Gathering profession:** what they bring back. A miner brings ore and stone, a herbalist herbs, a skinner hides and leather. A hero with two professions gathers with both when the zone has loot for both, each at 60% of the usual rate.
- **Gathering skill and level:** which tier they can reach and how much they gather.
- **Trip length:** how much. Yield grows with time faster than the fee does, so long trips are cheaper per unit.
- **General loot:** every trip also gets one bonus roll per hour (at least one; Risen get one more): cloth 45%, junk 29%, an essence 20%, a gem 6%, all from the zone's tier. Each trip also has about a 1% chance per hour of a recipe scroll. A bad haul halves only the gathered materials, never the bonus loot.

**No failed trips.** A trip never comes back empty. A bad haul comes with a short flavor line, like "Brakka was chased off by a bear and came home with half a load." This keeps the idle loop low-stress.

**Zones.** Ten zones, two per tier: one leans toward ore, the other toward herbs and hides. Heroes only go to zones within their level band. Ore zones: Rustvein Hollow (tier 1), Tinmouth Ridge (tier 2), Emberfall Quarry (tier 3), Moonscar Basin (tier 4) and Skyfall Crater (tier 5). Herb and hide zones: Fernwhistle Glade (1), Bramblewick Fen (2), Wildsage Downs (3), Ghostlight Marsh (4) and Barrowmoor (5). The first hero on the board always gathers for your profession at the tier you're crafting in. At Revered standing, raid expeditions open: level-60 heroes only, 8 hours, a high fee, and the only source of endgame materials. There are three raid destinations: Cindermaw Caldera (Ember core), The Hollow Spire (Voidglass shard) and Drakesleep Peaks (Wyrm scale).

As built (Oct 31, 2026; in `data/zones.js` under raidZones):

- Any level-60 hero can raid, whatever their gathering professions. From Revered, the last hero on the board is always level 60, and level-60 regulars can raid too.
- A raid brings back about 2.4 of its material (base value 25 s each), and loyalty raises that. It also brings the usual tier 5 bonus loot.
- The fee is about 30 s, roughly half the haul's value.
- NPC sellers never stock endgame materials, but NPC buyers still want them. Demand is 0.45 buyers an hour each (raised from 0.3 in Phase 4), so spares sell steadily at about base value.

**Races, classes and perks**

| Race | Faction | Classes | Gathering perk |
| --- | --- | --- | --- |
| Human | Blue | Warrior, Paladin, Rogue, Priest, Mage, Warlock | Hire fee −10% |
| Dwarf | Blue | Warrior, Paladin, Hunter, Rogue, Priest | Mining yield +15% |
| Gnome | Blue | Warrior, Rogue, Mage, Warlock | Trips 10% shorter |
| Elf | Blue | Warrior, Hunter, Rogue, Priest, Druid | Herbalism yield +15% |
| Orc | Red | Warrior, Hunter, Rogue, Shaman, Warlock | Bad-haul chance −50% |
| Troll | Red | Warrior, Hunter, Rogue, Priest, Shaman, Mage | Skinning yield +15% |
| Hornkin | Red | Warrior, Hunter, Shaman, Druid | Herbalism yield +15% |
| Risen | Red | Warrior, Rogue, Priest, Mage, Warlock | Extra general loot roll |

Class decides what gear a hero buys, which shapes demand on the auction house. It doesn't change what they gather.

**Regulars.** Hiring the same hero again builds loyalty, up to level 5. Each loyalty level cuts their fee 4% and raises their yield 3%. Regulars show up on the board more often, in their own row when they're in town.

Regulars also gain levels from trips, so a regular you keep hiring eventually reaches higher-tier zones. Filling a regular's commission gives them a large level boost. The game keeps up to 12 regulars.

- The first hire makes a hero a regular at loyalty 0. Each later hire adds a level.
- At each board refresh, each regular not out gathering is in town 40% of the time. A regular who got back from a trip in the last 4 hours is always in town.
- Trips earn about one level per 6 hours away. Each level adds 5 to every gathering skill the hero has. A regular can level out of a zone's band, which moves them up to the next tier's zones.
- When the tavern already remembers 12 regulars, a new hire replaces the least loyal one who isn't away.

## Auction House

The auction house simulates one realm's market: NPC sellers list goods, NPC buyers arrive over time, and the cheapest acceptable listing sells first. Every tradeable item (about 150 at launch) runs this model every 10-minute tick.

**What each item tracks**

| Value | Meaning |
| --- | --- |
| Base value | The anchor price, set in data. Crafted items are about material cost × 1.3 to 1.8, by tier |
| Fair price | What buyers expect to pay now. It moves with supply and demand and eases back toward base value |
| Demand rate | NPC buyers per hour at fair price, set by category, the hero population and active events |
| Demand reservoir | Buyers not yet served. It refills at the demand rate, up to 24 hours' worth. Each sale uses one |
| Listings | Every live listing, NPC and player, with price, quantity and expiry |
| Vendor price | A fixed sell-to-vendor price, about 25% of base value. This is the floor |

**Each tick**

1. NPC sellers post new listings at the item's restock rate, priced at fair price × 0.85 to 1.15. About a third of them undercut the lowest listing by 1 to 5%.
2. Buyers arrive from the reservoir. Each has a price limit near fair price, most within ±20%.
3. Each buyer takes the cheapest listing at or under their limit. Ties go to the older listing.
4. Fair price moves. Fast-clearing listings push it up, unsold stock pushes it down, and each tick it eases a little toward base value.
5. Expired listings return to their sellers. Deposits are lost.

That one model produces every behavior from the original notes, with no special rules:

- **List high, sell slowly:** fewer buyers will pay it, and cheaper listings are picked first.
- **List low, sell fast, earn less.**
- **Flooding crashes prices:** selling many units drains the reservoir and piles up unsold stock, so fair price falls. It recovers over 1 to 2 days as the reservoir refills.
- **Undercut wars:** NPC sellers react to your listing, so the lowest price changes while you're away.

**Listing rules** (starting values)

| Rule | Value |
| --- | --- |
| Durations | 2 h, 8 h, 24 h |
| Deposit, lost if unsold | 5%, 10% or 20% of vendor price × quantity, by duration |
| Default duration | The last one you picked (saved); 24 h for a new game |
| Auction house cut on each sale | 5% |
| Listing slots | 10 at the start, up to 50 |
| Price helpers | Undercut (1% under the lowest), Match market, Custom |

**Selling tips** (Nov 4, 2026). In the balance sim, the bot that lists everything at once and never relists earns a fraction of what the steady bot earns from the same materials. Three tips teach the steady habit:
- The listing panel says how many buyers come a day. When you list more than 6 hours of buyers at once (tipHours in data/tuning.js), it warns that a big lot can flood the market and suggests how many to list at a time.
- My listings shows a tip when one of your listings isn't first in line: cancel and list again just under the lowest price.
- The Trade Guild panel says commissions are the steadiest early gold and rush orders expire fast.

A listing is a quantity at one unit price, and units sell one at a time. Twenty potions at 45 s each can sell to twenty different buyers.

**What the player sees per item:** lowest listing, market value (average sale price over the last day), your listings and their place in line, and a demand tag: Hot, Steady, Slow or Flooded. The Ledger upgrade adds a 7-day price chart and a sell-time estimate.

**Buying.** Buy any quantity, cheapest listings first. Buying removes supply and nudges fair price up.

**Flipping is allowed.** Buying underpriced listings and relisting them higher is a real strategy. The 5% cut and deposits keep it from being free money.

**Demand.** The realm has a simulated hero population across five level bands, heaviest at low levels and at level 60, as in a live MMO. It stays broadly stable with a slow weekly drift, so every tier stays worth selling.

| Category | Volume | Margin | Demand comes from |
| --- | --- | --- | --- |
| Consumables: potions, stones, armor kits | High | Low | Hero activity; spikes during events |
| Gear: weapons and armor | Low | High | Heroes in the item's level band who wear its armor type |
| Materials | High | Low | NPC crafters |

Armor types: plate (Warrior, Paladin), mail (Hunter, Shaman), leather (Rogue, Druid), cloth (Priest, Mage, Warlock).

**Leveling junk.** Crafting for skill makes items you didn't plan to sell. You can sell them cheap, vendor them at the floor, or turn them in to a guild contract. Picking skill-up recipes that still sell is part of the craft.

## Commissions

The shop counter takes requests from named heroes: a specific item, a quantity and a deadline, for a premium over market price plus Trade Guild reputation. Commissions are the main source of reputation and act as the game's quest system.

| Type | Example | Deadline | Pays |
| --- | --- | --- | --- |
| Standard | Hilda, Dwarf Paladin, level 22, wants a bronze breastplate | 12–24 h | 1.5× market + reputation |
| Rush | 3 minor healing potions, needed tonight | 2–4 h | 2.5× market + reputation |
| Guild contract | The city garrison needs 30 ironstone honing stones | 2–3 days | Gold + large reputation; deliver in parts |
| Regular's request | One of your regulars wants gear for their level | 24 h | 1.5× market + loyalty + a level boost |

**Rules**

- The counter shows 3 commissions (upgradeable to 5). A new one posts every 2 hours, and unclaimed ones expire.
- Requests come from recipes you know or are close to learning. One you can't make yet says where to get the recipe ("Quartermaster, Honored"), which gives the player a goal. "Close" means up to 10 skill above yours, but never past your rank's skill cap (Nov 4, 2026): at Journeyman you never get a request for a recipe that needs Expert training. In playtesting, requests for an iron flanged mace while stuck at 150 could only be declined. In the sim this makes more requests fillable, so the steady bots reach the endgame gate about 1 day sooner on average (46.4 days over 30 runs, was 47.6).
- Only items you crafted count, by maker's mark, so buying from the auction house to hand in doesn't work.
- Declining is free.
- How often each kind posts: standard 55%, rush 20%, guild contract 10%, regular's request 15% (only once you have regulars).
- Quantities: gear is always one. Consumables: 3–8 for a standard request, 2–4 for a rush, 20–40 for a guild contract. Guild contracts take consumables only and pay 1.25× market. Gold and reputation are paid for each part handed in.
- A request picks a recipe of one of your professions, from 60 skill points below yours to 10 above. A regular's request picks gear for the regular's armor type (or a weapon or cloak). A filled regular's request adds a loyalty level and 3 hero levels.
- **Maker's mark:** the game counts which units in your bags you crafted. When you list, sell or use some of an item, bought units go first, so your crafted ones stay ready for commissions. Items returned from expired listings come back without the mark.

**Tutorial.** The first five commissions teach the game. They come from Marta Ashgrove, the guild quartermaster, one at a time. Each step is done anywhere in the game (in any order) and then claimed at the counter for its reward. Normal commissions start after the last claim.

| Step | Blacksmithing | Leatherworking | Alchemy | Reward |
| --- | --- | --- | --- | --- |
| 1 | Make a copper cleaver | Make a soft armor kit | Brew a faint mending draught | 10 s, 25 rep |
| 2 | List anything on the auction house | same | same | 10 s, 25 rep |
| 3 | Buy a material on the auction house | same | same | 15 s, 25 rep |
| 4 | Smelt ore into bars | Cure a boar hide | Learn a recipe from the trainer (the first is at skill 10) | 15 s, 25 rep |
| 5 | Hire a hero | same | same | 25 s, 50 rep |

**First customer.** Once per game, a customer comes by 1 to 2 minutes after your first listing and buys it (up to 5 units), as long as the price is no more than 25% above market. If it's priced higher, they pass with a hint, and your next listing gets another visit. In the simulator a new player's first sale lands at 2 to 3.5 minutes.

Existing saves skip the tutorial and the first customer.

Onboarding polish (Phase 4): until a step is done, its card has a "Show me" button that opens the tab where it's done (Workshop, Auction House or Tavern, or scrolls to the trainer). The matching tab icon glows gently. Once the step is done, the Shop tab glows instead, so the player knows to come back and claim it.

## Trade Guild and reputation

The Trade Guild is the long-term goal. Standing unlocks training ranks, recipes and shop expansions, and the endgame is Exalted standing with all three professions at 300.

| Standing | Total reputation | Unlocks |
| --- | --- | --- |
| Neutral | 0 | Apprentice and Journeyman training, tier 1–2 recipes |
| Friendly | 3,000 | Expert training, the second profession wing, tier 3 quartermaster recipes |
| Honored | 9,000 | Artisan training, the third profession wing, blue-quality recipes |
| Revered | 21,000 | Raid expeditions, endgame materials, top blue recipes |
| Exalted | 42,000 | Masterwork (epic) recipes, the Guildmaster title and a top-tier shop banner |

**Where reputation comes from** (starting values)

| Source | Reputation |
| --- | --- |
| Standard commission | Up to 75–250, by tier |
| Rush commission | 150–400 |
| Guild contract | 500–1,500 |
| Regular's request | 50–150 |
| Guild drive (event) | Up to 2,000 |

Commission reputation scales with what the order is worth. An order worth at least a typical piece of gear at its tier (150 c, 450 c, 8 s, 14 s, 26 s for tiers 1–5) earns the full amount; a smaller one earns less, never under a quarter. Guild contracts count as full size at four times that. All commission reputation is then multiplied by 0.70 (repScale in data/commissions.js; raised from 0.65 in the Phase 3 balance pass and to 0.70 in Phase 5), tuned so a cautious player reaches Friendly in week 1, Honored in weeks 2–3, Revered in weeks 4–5 and Exalted in weeks 6–8.

**Quartermaster recipes** (bought from the guild quartermaster once you reach the standing)

| Profession | Friendly (green, tier 3) | Honored (blue, tier 4) | Revered (blue, tier 5) |
| --- | --- | --- | --- |
| Blacksmithing | Guildsteel warhammer | Moonsilver bulwark greaves | Starmetal vanguard cuirass |
| Leatherworking | Guild courier's boots | Basilisk tracker's vest | Drakeling far-ranger's cloak |
| Alchemy | Assayer's tonic | Elixir of the steady hand | Draught of the iron will |

As built (Oct 31, 2026; in `data/recipes.js` with `learn: 'quartermaster'`):

- Prices: 1 g at Friendly, 2.5 g at Honored and 5 g at Revered. Each also needs the recipe's skill: 180 for tier 3, 245 for tier 4 and 285 for tier 5.
- Each one uses a bit more than the best normal recipe of its tier. The tier 3 ones add an essence, and the blue ones add a gem and an essence. Their base values are material cost × 1.7 (green) or × 2.1 (blue).
- Once you have the standing, commissions can ask for quartermaster items, with a hint saying where to buy the recipe.

**Masterwork recipes** (epic, Exalted; each needs an endgame material)

| Profession | Recipes |
| --- | --- |
| Blacksmithing | Emberheart greatsword (Ember core), Wyrmscale warplate (Wyrm scale) |
| Leatherworking | Wyrmscale hunter's mantle (Wyrm scale), Voidglass-studded jerkin (Voidglass shard) |
| Alchemy | Phoenix-ember philter (Ember core), Voidglass tincture of clarity (Voidglass shard) |

As built (Oct 31, 2026):

- The quartermaster sells masterworks for 10 g each at Exalted and skill 300.
- Each gear masterwork needs 2 of its endgame material plus about 1.2× the tier 5 materials of that station's Revered recipe. Each alchemy masterwork needs 1. Base values are material cost × 2.5: about 1.9 g for weapons and plate, 1.7 g for leatherworking gear, 92 s for the alchemy ones.
- The shop sign in the header grows with standing: no banner at Neutral, a bronze underline at Friendly, silver at Honored, a gold double line at Revered, and a full banner at Exalted. At Exalted, "Guildmaster" appears next to your standing. Both are set in `shopSigns` in `data/guild.js`.

Once Exalted, every commission still pays gold, and masterwork crafts become the high-end market. New professions in later updates add new goals on top.

## Shop upgrades

Upgrades are bought with gold, and a few also need guild standing. Most have 5 levels, each costing about 1.8× the last, which makes them the main gold sink after materials.

| Upgrade | Effect per level | Range |
| --- | --- | --- |
| Workstation queue | +1 order slot per workstation | 3 → 8 |
| Tools | Crafting time −8% | Up to −40% |
| Bellows (forge) | Smelting time −10%; max level adds a 10% bonus-bar chance | Up to −50% |
| Bags and bank | +12 storage slots | 48 → 108 |
| Auctioneer's seal | Auction house cut −0.5%, deposits −10% | Cut 5% → 2.5% |
| Listing board | +8 listing slots | 10 → 50 |
| Tavern table | +1 hero on the board (3 levels) | 3 → 6 |
| Expedition charter | +1 expedition slot (4 levels) | 2 → 6 |
| Counter | +1 commission slot, commission pay +5% (2 levels) | 3 → 5 |
| Ledger | Level 1 price history, level 2 sell-time estimates, level 3 event warnings 6 h early | 3 levels |
| Profession wing | Adds another profession | Needs Friendly, Honored, Revered, then Exalted |
| Shop sign | Cosmetic banner that grows with your standing | Follows standing |

First-level costs range from 50 s to 5 g. All costs are starting values in the data files.

As built (Oct 31, 2026; costs and standing gates are in `data/upgrades.js`):

- First-level costs: bags 50 s, listing board 75 s, queue and bellows 1 g, tools 1.5 g, tavern table 2 g, counter 2.5 g, expedition charter 3 g, auctioneer's seal 5 g. Buying every level of all nine costs about 270 g.
- Standing gates: the first level of each needs none. Later levels need Friendly, then Honored, and the top levels of the seal and charter need Revered.
- Profession wings: the second costs 3 g at Friendly, the third 8 g at Honored, the fourth 15 g at Revered and the fifth 25 g at Exalted (Phase 5), and you pick which profession each one opens. A new wing comes with that profession's starting materials. Costs are in `data/professions.js`.
- Ledger: 2 g, then 3.6 g, then 6.5 g, with level 3 needing Friendly. Level 1 adds a 7-day price chart (6-hour average sale prices against a dashed base-value line) to every item sheet. Level 2 adds a sell-time estimate under the listing form. It replays that item's market forward 5 times on a copy and reports "likely sells out in about N h", a chance to sell, or "unlikely to sell". Level 3 adds a "Coming soon" list to the town crier, 6 hours ahead.
- Tools speed up every workstation except the forge, and bellows speed up the forge.
- A listing keeps the auction house cut it was posted with.
- In the sim, bots buy upgrades only with gold left over after saving for their next training rank. They end day 60 with 30–230 g instead of 130–400 g.

## Late-game gold sinks

Added in Phase 4 (Oct 31, 2026) because gold piled up once every upgrade was bought. All prices and bonuses are in `data/shop-extras.js`.

| Kind | What it does | Items and prices |
| --- | --- | --- |
| Decor | Looks only; shown in the "Your shop" panel on the Shop tab | Brass counter bell 10 g, Hanging lanterns 15 g, Rug from the far markets 20 g, Display rack of blades 25 g, Stained-glass window 60 g |
| Sign styles | Looks only; change the lettering of your shop's name in the header, on top of the standing banner. Switch between owned styles, or back to the plain sign, any time | Carved oak sign 10 g, Ember lettering 25 g, Gilded frame 50 g |
| Guild donations | From Honored. A bonus for 24 hours; giving again adds another day, up to 3 days ahead | Sponsor a caravan 3 g (hero trips hired while it runs bring 15% more gathered materials), Fund the night watch 2 g (listing deposits halved), Host a guild feast 4 g (commissions posted while it runs pay 10% more) |
| Trophies | Looks only; shown in the trophy case | Gilded anvil 50 g, Merchant prince's scales 100 g, Crystal hourglass 150 g, Dragon-bone abacus 250 g, Crown of the market 500 g |

Everything together costs about 1,100 g, plus about 9 g a day to keep all three donations running. In the sim, bots start on these only after every upgrade is bought. In the Phase 4 sim run, the steady bots spent 180–390 g on them by day 70 and bought 6 to 9 of the 13 items, so the trophies stay a long-term goal. Their gold on day 60 fell from 52–297 g to 33–150 g, and the gate days didn't move. Save version 12 adds the `extras` record (owned decor, signs and trophies, the sign in use, and when each donation ends).

## Market events

Events shift demand or supply for a few hours to a few days, so the market keeps moving and reading it pays off. A town crier line on the Shop tab announces each event as it starts, and Ledger level 3 warns 6 hours early.

| Event | Effect | Length | How often |
| --- | --- | --- | --- |
| Raid night | Demand ×3 for resistance potions, elixirs, honing stones and balance weights | 12 h | Twice a week |
| Fresh recruits | Demand ×2 for tier 1–2 gear | 2 days | Weekly |
| Tournament | Demand ×2 for weapons | 1 day | Weekly |
| Ore shortage | One ore's NPC restock drops to 30%, so its price climbs | 1 day | Weekly |
| Glut | An NPC dumps 50+ of one item at 50–70% of fair price | Until sold | Daily |
| Guild drive | A city-wide bulk contract worth up to 2,000 reputation | 3 days | Every 2 weeks |

Events come from a seeded calendar that spreads them out, and two demand spikes never hit the same category at once.

As built (Oct 31, 2026; all numbers are in `data/events.js`):

- The calendar is planned 7 days ahead. Each gap varies by ±30%, and no event comes in a new shop's first 24 hours.
- NPC sellers restock to normal demand, so a demand event leaves the market short. Over a day, demand events raise the price about 15–20% and sales 45–70%, and the item shows "Hot". An ore shortage raises the ore's price about 13%. A glut drops the price about 20%. `node tools/event-effects.js` measures this.
- A glut is 50–80 units at 50–70% of fair price, and lasts until it sells or 3 days pass. It picks an item your professions make or use.
- A guild drive is a commission for 40–80 consumables, delivered in parts over 3 days. It sits on top of the usual counter slots, and its reputation (1,200–2,000 by tier) isn't scaled down by repScale.
- The town crier on the Shop tab lists running events and when they end. Starts appear in "While you were away".
- Debug can force any event, and it shows the calendar.

## Economy and pacing

The first profession should reach Artisan in about 2 to 3 weeks of regular check-ins, and the full endgame should take about 6 to 8 weeks. Every number here is a starting value in the data files, tuned with the balance simulator and playtests.

**Currency.** Gold, silver and copper: 1 g = 100 s = 10,000 c, shown with coin icons. A new shop starts with 50 s and the materials for the first tutorial commission.

**Gold coming in:** NPC buyers on the auction house, commission payouts, vendor sales.

**Gold going out:** materials bought on the auction house, hero fees, lost deposits and the auction house cut, the trade goods vendor and City Smelter, training, recipes and shop upgrades.

**Tuning guardrails**

- NPC buyers are an unlimited source of gold, so costs scale by tier to keep gold meaningful.
- Margins before fees: about 20–40% on consumables and 40–80% on gear.
- Listing more than a day's demand of one item should cut its price by at least 30%.
- Hero-gathered materials should cost about 40–60% of the auction house price per unit on 1- to 8-hour trips, so hiring beats buying when you can wait. 15-minute trips cost more (about 70%) as a convenience. Zone fees were cut 15% on Oct 31, 2026 to hit this.
- In a quiet market, an item shows "Hot" no more than about 1 check in 8.
- Thin markets (fewer than 1 buyer an hour: most gear, scrolls, gems) need a bigger move to show "Hot": a price 22% over base or 70% of the buyer reservoir waiting, against 15% and 50% for busy items. Endgame materials, which no NPC sells, show "Hot" only on price, and waiting buyers don't raise their price (Phase 4, Oct 31, 2026).
- Every recipe should have a profitable use for at least part of its skill range, so no tier is pure junk.

**Pacing targets** (checked by the balance simulator)

| Milestone | Target |
| --- | --- |
| First sale | Under 5 minutes |
| Journeyman (75) | Day 1, for a player who checks in about hourly on their first day |
| Expert (150) and Friendly | Week 1 |
| First profession at Artisan (300) and Honored | Weeks 2–3 |
| Revered | Weeks 4–5 |
| Exalted, all three professions at 300 | Weeks 6–8 |

**Phase 3 balance pass** (Oct 31, 2026). The simulator now runs 70 days. Its bots:
- open their second and third professions once every profession they have has Artisan trained and skill 270
- level all their professions and share hero slots between them
- buy upgrades and quartermaster recipes after saving for training and the next wing
- sell materials for recipes they've outgrown
- buy a recipe when nothing they know still gives skill-ups
- raid once they know a masterwork

Result: the steady bots (the cautious smith, the tanner, the alchemist and the flipper) reach Exalted with all three professions at 300 between days 43 and 52. A bot that checks in every hour gets there around day 37. The flooder strategy doesn't get there by day 70. Other changes in this pass:
- repScale went from 0.65 to 0.68.
- Blue quartermaster gear demand went from 0.25 to 0.35, so its price bounces less.
- `SIM_ONLY=bots` runs only the bot section, and `SIM_TRACE=<bot>` prints one bot's day-by-day state.

## Interface

The layout is mobile-first in portrait, with five bottom tabs and a fixed header. On wide screens the tabs move to a sidebar and two panels sit side by side.

**Header:** gold with coin icons, the guild standing bar, and an alert dot when something has finished.

| Tab | What's on it |
| --- | --- |
| Shop (home) | "While you were away" summary, a "Next goal" line after the tutorial, commission counter, town crier, guild standing, upgrades, and the Trade Guild trainer and quartermaster |
| Workshop | Profession switcher, skill bar and rank, recipe list colored by skill-up odds, craft queue, forge smelting queue |
| Auction House | My Listings (status, place in line, cancel), then Browse: a search box, "In your bags" and "For your craft" filters (the latter on by default), and category chips. Tap an item to buy or sell it (price helpers and duration). Ledger charts come later |
| Tavern | Hire board, regulars row, active expeditions with timers, returns to collect |
| Bags | Storage grid, vendor sales, trade goods vendor |

**Screen rules**

- Tapping any item opens one item sheet: icon, quality, market value, your stock, the recipes that use it, and List and Craft buttons.
- Recipe rows show profit at current prices (sale value minus material cost), so the player can see what's worth making.
- Recipe filters: Can craft now, Gives skill-ups, Profitable.
- Tap targets are at least 44 px, with main actions near the bottom where thumbs reach.
- Timers and numbers update live.

## Visual style and icons

The interface carries the look: dark panels, a faction accent color, and crisp vector icons in quality-colored frames. There are no sprites or scene art.

**Faction themes** are two sets of CSS color variables, swapped by the faction choice.

|  | Kragmar (red) | Aldmere (blue) |
| --- | --- | --- |
| Background | Charcoal brown | Deep navy |
| Panels | Warm dark stone | Cool slate |
| Accent | Crimson and ember | Royal blue and steel |
| Highlight | Brass | Silver |

**Icons** come from [game-icons.net](https://game-icons.net/about.html): about 4,000 single-color SVG icons under CC BY 3.0, free to use with credit to each artist.

- **Tinted by tier:** one sword icon becomes copper, bronze, iron, moonsilver and starmetal swords through color alone.
- **Framed by quality:** each icon sits on a dark rounded tile with a gray, white, green, blue or purple border.
- **Professions and skills** use the same set: anvil, flask, needle, pickaxe, sickle and skinning knife.
- Only icons the game uses are copied into the repo, with a credits list by artist and a Credits screen in the game.

As built (Phase 4, Oct 31, 2026):

- `data/icons.js` names each item's icon (`artist/icon-name` from the game-icons.net download) and its tint. Leaving the tint out uses the tier's metal color (copper, bronze, iron, moonsilver, starmetal). Tin and steel have their own colors, and herbs, leathers, potions, gems and junk have named tints.
- `node tools/copy-icons.js <folder>` copies just the icons in use into `assets/icons/`, recolors them to one tintable color, and rewrites `assets/icons/CREDITS.md` and `data/icon-credits.js`. The game uses 135 icons by 10 artists.
- Icons appear on bag tiles, auction rows, recipe and queue rows, commission cards, the item sheet and the tab bar. Settings has a Credits screen listing every icon artist.

**Type.** Headings use an open-license display font stored in the repo, such as Cinzel. Body text and numbers use the system font for readability.

**Motion** stays small and quick: coins tick up on collect, a "Sold!" toast, progress bars fill. As built (Phase 4): the header gold counts up over about half a second whenever it rises. Each sale while you're watching pops a "Sold!" card with the item's icon and what it paid. Messages stack above the tab bar (three at most) and fade after about 3 seconds. Progress bars keep their place when the screen redraws. Phones set to reduce motion get no animation.

**Sound** is a small set of effects added in Phase 4: coins on collect, "sold," hero return and craft complete. They come from a free CC0 sound pack, such as Kenney's. Sound starts only after the player's first tap, with a mute toggle in settings. There is no music. As built (Phase 4): four short .mp3 effects from Kenney's CC0 Interface Sounds and RPG Audio packs. A coin clink plays on Collect all, a chime when something sells while you watch, a door when a hero gets back, and a metal click when a crafting order finishes. Each check plays only one sound: a sale beats a hero return, which beats a finished craft. The Sound on/off switch in Settings is saved with the game. Credits are in `assets/sounds/CREDITS.md` and on the Credits screen.

## Technical architecture

The game is a static multi-file site in plain HTML, CSS and JavaScript modules, hosted on GitHub Pages. There is no build step, no npm packages, no frameworks and no CDN.

```
undercut/
  index.html
  CLAUDE.md
  docs/DESIGN.md
  css/
    base.css          layout and components
    theme-red.css     Kragmar colors
    theme-blue.css    Aldmere colors
  js/
    main.js           startup, clock, catch-up
    engine/           market, crafting, smelting, heroes, commissions,
                      guild, events, upgrades, save, rng
    ui/               one module per tab, plus shared components
  data/               items, materials, recipes, professions, zones,
                      races, classes, names, upgrades, events, tuning
  assets/
    icons/            game-icons.net SVGs in use, plus CREDITS.md
    sounds/           sound effects in use, plus CREDITS.md
    fonts/
  tools/
    balance-sim.js    headless bot, runs with Node
```

**Rules**

- Engine modules never touch the page, so all game logic runs without a browser and the balance simulator can drive it.
- All content and every tunable number lives in `data/` as plain exported lists with short comments, so Rob can safely edit prices and names. `data/tuning.js` holds the global settings: fees, tick length, reputation thresholds.
- One seeded random number generator, stored in the save, so a run can be replayed exactly.
- One clock module schedules everything by timestamp. On load, catch-up replays missed 10-minute ticks in order.
- Relative paths only, and lowercase hyphenated file names, since GitHub Pages is case-sensitive.

**Saves**

- localStorage, with every key prefixed `undercut:`, because Rob's other games share the same github.io address.
- Saved after every action, every 30 seconds, and when the page is hidden.
- Versioned, with migrations for older saves.
- Export and import as a copyable text code, for backups and moving between devices. iPhone Safari can clear a site's saved data after about a week without a visit.

**Home-screen install** (Phase 4)

- `manifest.webmanifest` and the app icon in `assets/app/` (Lorc's anvil on a dark tile) let phones add Undercut to the home screen, where it opens full screen.
- Settings has an "Add to your home screen" panel: an Install button when Chrome offers one, otherwise the steps for Safari or other browsers. It hides once the game runs from the home screen.
- On iPhone the home-screen app keeps its own save, separate from Safari, so the panel says to move the save with the export code.
- No offline mode or service worker, so a hard refresh always brings the newest version.

**Debug mode** (a hidden toggle): fast-forward 1 h, 8 h or 24 h; add gold and materials; set skill; learn all recipes; open all professions; force an event; show the market's internal numbers.

**Balance simulator.** `node tools/balance-sim.js` plays 60 in-game days with simple bot strategies (cautious, flooder, flipper). It reports gold over time, the day each milestone was reached, and any items whose prices collapsed or never sold. It runs after every tuning change.

**Testing.** Modules don't run from a double-clicked file, so testing uses a local server started from the repo root, then the live GitHub Pages address. Hard refresh after changes.

## Build phases

The auction house is the riskiest part of the design, so Phase 1 builds the full market with one profession and must pass its gate before more content is written. Each gate is checked with the balance simulator and a phone playtest. A phase that misses its gate gets tuned before the next one starts.

1. **Phase 0 · Foundation**
    - Repo, CLAUDE.md and DESIGN.md, folder skeleton, both faction themes, empty tabs.
    - Clock and catch-up, seeded random generator, saves with export code, debug fast-forward.
    - **Gate:** it runs on a phone from GitHub Pages, and a save survives a reload.
2. **Phase 1 · The market, with Blacksmithing tiers 1–2**
    - Full auction house simulation: NPC sellers and buyers, deposits, the cut, expiry and flooding.
    - Materials, forge and City Smelter, miners in the tavern, Bags, check-in summary, balance simulator.
    - **Gate:** pricing feels like a real decision; flooding cuts a price 30%+ and it recovers in 1–2 days.
3. **Phase 2 · Crafting and heroes**
    - All three professions across five tiers, ranks and training, colored skill-ups, recipe drops.
    - Full tavern with all gathering professions, perks, general loot and regulars; commissions and tutorial.
    - **Gate:** a new player reaches Journeyman on day 1 without help, and the sim hits the pacing targets.
4. **Phase 3 · Guild and progression**
    - Trade Guild standing, quartermaster recipes, profession wings, shop upgrades and the Ledger.
    - Market events, raid expeditions, endgame materials and masterwork recipes.
    - **Gate:** the sim reaches Exalted with all three professions at 300 in 6 to 8 weeks.
    - **Passed Oct 31, 2026:** a fresh reviewer ran the sim and checked every tab at phone size in both themes. The steady bots reached the gate on days 43–52. There were no layout problems or console errors, and the IP and hard-constraint checks were clean. Carried into Phase 4:
      - Gold piles up once every upgrade is bought (130–300 g by day 60), so it needs a late-game sink.
      - Spare endgame materials sell slowly on the auction house.
      - A few thin-market items (the Guildsteel warhammer, some blue and epic gear, a couple of scrolls) show "Hot" 13–18% of the time in a quiet market.
      - Some bot listings sell under 50%: iron bars, flintstone, two quartermaster gear items.
5. **Phase 4 · Polish and launch**
    - Icon pass and credits screen, motion, onboarding polish, home-screen install, sound effects.
    - Final tuning and a full phone test pass.
    - Late-game gold sinks (decor, sign styles, guild donations, trophies), added for the Phase 3 carry-over.
    - **Gate passed Oct 31, 2026:** a fresh reviewer ran the engine checks (167 PASS) and the sim. The steady bots reached the gate on days 38–55, with no sim problems and Hot at most 4% in a quiet market. They checked every tab, Settings, Credits and an item sheet at 390 × 844 in both themes, with no layout problems or console errors, and the IP and hard-constraint checks were clean. Fixed after the review: sound switched to Web Audio so iPhone Safari can play sounds that start from timers; the tutorial tab hint got a dot that shows in the blue theme and with reduced motion; the gilded sign's frame now shows only in the shop list, not in the header. Still open:
      - Sound on a real iPhone hasn't been tried yet.
      - In the sim, bots' spare endgame materials still show low sell-through (10–40%). A direct test sells every unit listed at market price, so this looks like how the bots list rather than the market.
      - A few thin-market items sell about half of what bots list (some quartermaster gear, Fenlight tonic, Tourmaline, tin and iron bars).

6. **Phase 5 · Tailoring and Enchanting** (approved Nov 2, 2026)
    - Tailoring tiers 1–5 with quartermaster recipes and masterworks; a shop can start as a tailor.
    - Enchanting: disenchanting, dusts, charms and foci, Enchanting requests at the counter.
    - Fourth and fifth profession wings (Revered, Exalted).
    - The endgame stays Exalted with any three professions at 300.
    - **Gate:** the sim's steady bots, including a tailor, reach the gate in 6–8 weeks; icons, credits and phone screenshots checked.
    - **Gate passed Nov 2, 2026:** a fresh reviewer ran the engine checks (all pass) and the sim (no problems). The steady bots reached the gate on days 42–54: cautious 44–47, tanner 50, alchemist 43–46, tailor 51–53, enchanter 49–54. Quiet-market Hot tags peaked at 7%. They checked the new screens at 390 × 844 in both themes with no layout problems or console errors, the IP and hard-constraint checks were clean, and a pre-Phase-5 save loaded and worked. Fixed after the review: a confirmation before disenchanting blue or purple gear; the guild panel lists the fourth (Revered) and fifth (Exalted) wings; the new-game text no longer says "the other two". Still open:
      - Tailor and enchanter shops were poorer in the sim than the older professions. Fixed in the income pass below (dust from trips for enchanters, better charm prices, more cloth-gear buyers) and by bots that buy materials to craft for sale.
      - A new tailor's Workshop shows the City Smelter panel, as an alchemist's does.

**Later updates:** Engineering, Cooking, First Aid, and a neutral port market.

## Decisions

All open design calls are settled.

| Decision | Locked |
| --- | --- |
| Game title | Undercut. The only other use found is a 2004 tabletop auction game, low risk for a free browser game |
| Faction, capital and guild names | Ember Pact and Kragmar, Azure Crown and Aldmere |
| Race names | Hornkin and Risen |
| Material and herb names | As written in Materials and smelting. Stones for tiers 3–5 use real rock names (ironstone, flintstone, basalt), and leathers, two herbs and two vials were renamed (Oct 30, 2026), to keep clear of the original game's names |
| Phase 5 names | Tailoring and Enchanting names as listed in their sections (approved Nov 2, 2026). Avoided as too close to the original game: "Bolt of … cloth", "… Bag", Spellthread, Embersilk, Duskweave, Minor/Lesser/Greater enchant tiers, Strange/Soul/Vision Dust, Glimmering/Prismatic Shard, Runed rods, Wizard oil |
| Phase 4 names | Gold-sink decor, sign styles, donations and trophies as listed under Late-game gold sinks (approved Oct 31, 2026) |
| Phase 3 names | Quartermaster recipes, masterwork recipes and raid destinations as listed above (approved Oct 31, 2026). Wyrmrest, Windrunner, Shadowhide, "Flask of…" and "… Depths" or "Molten …" raid names were rejected as too close to the original game |
| Sound | A small set of effects, added in Phase 4 |
| Pacing | About 6 to 8 weeks to the full endgame |
| Save slots | One save with export, plus "New game" |
