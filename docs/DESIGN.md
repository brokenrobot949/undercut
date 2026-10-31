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

The player starts with Blacksmithing, Leatherworking or Alchemy and unlocks the other two through shop expansions. Each pairs with one gathering profession, so the first choice also decides which heroes you hire first.

| Profession | Makes | Main materials | Gathering pair |
| --- | --- | --- | --- |
| Blacksmithing | Weapons, plate and mail armor, grit, honing stones and balance weights | Bars, stone, essences | Mining |
| Leatherworking | Leather armor, armor kits, cloaks, quivers and ammo pouches | Leather, hides, thread, salt | Skinning |
| Alchemy | Healing and mana potions, elixirs, resistance potions, transmutes | Herbs, vials | Herbalism |

The starting profession is permanent. The other two never replace it.

**Skill ranks.** Skill runs from 1 to 300 in four ranks. Each rank is trained at the Trade Guild for gold, once you reach the previous cap and the required guild standing.

| Rank | Skill range | Training cost | Guild standing needed |
| --- | --- | --- | --- |
| Apprentice | 1–75 | Free | Neutral |
| Journeyman | 75–150 | 1 g | Neutral |
| Expert | 150–225 | 50 g | Friendly |
| Artisan | 225–300 | 250 g | Honored |

Training costs are starting values.

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
- **Guild trainer:** core recipes, bought with gold once your skill reaches the recipe's orange number. Starting prices: 50 c to 5 s for tier 1, 3 s to 25 s for tier 2. The Workshop only lists recipes you know, and points to the trainer when a new one is for sale.
- **Guild quartermaster:** better recipes, gated by guild standing.
- **Rare drops:** heroes sometimes bring back a recipe scroll. It can be learned or sold on the auction house.

Intermediate recipes count for skill too: grinding stones from stone (Blacksmithing) and cured hides from hides and salt (Leatherworking).

**Crafting queue.** Each workstation has its own queue, 3 orders at the start. An order is one recipe times a quantity. Materials are reserved when an order is queued, and crafting continues offline.

**Item quality.** Poor (gray, vendor trash from trips), Common (white), Uncommon (green), Rare (blue), Epic (purple). Most crafted items are white or green. Guild recipes add blue items, and Exalted masterwork recipes are epic.

**Maker's mark.** Every crafted item carries your name. Commissions accept only items you made.

## Materials and smelting

Materials come in five tiers that follow hero level bands, with original names on a familiar ladder. Heroes bring back ore, never bars, so smelting is a step the player controls.

| Tier | Hero levels | Ore and bars | Stone | Leather | Herbs | Vial |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1–15 | Copper ore → copper bar | Rough stone | Light leather | Dawnpetal, Silverfern | Simple vial |
| 2 | 15–25 | Tin ore → tin bar; 1 copper bar + 1 tin bar → 2 bronze bars | Coarse stone | Medium leather | Thornbriar, Bruisewort | Simple vial |
| 3 | 25–35 | Iron ore → iron bar; iron bar + coal → steel bar | Ironstone | Heavy leather | Ironleaf, Wild sage | Leaded vial |
| 4 | 35–45 | Moonsilver ore → moonsilver bar | Flintstone | Thick leather | Sunbloom, Ghostcap | Leaded vial |
| 5 | 45–60 | Starmetal ore → starmetal bar | Basalt | Hardened leather | Starlily, Gravemoss | Crystal vial |

Each tier also has a hide (cured into leather goods with salt), a cloth, an elemental essence and one or two gems. Endgame recipes need rare materials from raid expeditions: Ember core, Voidglass shard and Wyrm scale.

**Four ways to get materials**

| Source | What it gives | Trade-off |
| --- | --- | --- |
| Hired gatherers | Ore and stone (Mining), herbs (Herbalism), leather and hides (Skinning) | Cheapest per unit, but you wait for the trip |
| General trip loot | Any hero on any trip: cloth, essences, gems, gray vendor trash, rare recipe scrolls | A random bonus on every trip |
| Trade goods vendor | Vials, thread, salt, flux and coal at fixed prices, unlimited | Always there; a small, steady gold sink |
| Auction house | Whatever NPC sellers have listed | Instant, at market price, and buying pushes the price up |

Cloth sells on the auction house until Tailoring arrives in a later update.

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

- **Gathering profession:** what they bring back. A miner brings ore, stone and sometimes gems.
- **Gathering skill and level:** which tier they can reach and how much they gather.
- **Trip length:** how much. Yield grows with time faster than the fee does, so long trips are cheaper per unit.
- **General loot:** every trip also rolls cloth, essences, gray trash and a small chance of a recipe scroll.

**No failed trips.** A trip never comes back empty. A bad haul comes with a short flavor line, like "Brakka was chased off by a bear and came home with half a load." This keeps the idle loop low-stress.

**Zones.** Ten zones, two per tier: one leans toward ore, the other toward herbs and hides. Heroes only go to zones within their level band. Ore zones: Rustvein Hollow (tier 1), Tinmouth Ridge (tier 2), Emberfall Quarry (tier 3), Moonscar Basin (tier 4) and Skyfall Crater (tier 5). The herb and hide zones are still to be named. At Revered standing, raid expeditions open: level-60 heroes only, 8 hours, a high fee, and the only source of endgame materials.

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
| Auction house cut on each sale | 5% |
| Listing slots | 10 at the start, up to 50 |
| Price helpers | Undercut (1% under the lowest), Match market, Custom |

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
- Requests come from recipes you know or are close to learning. One you can't make yet says where to get the recipe ("Quartermaster, Honored"), which gives the player a goal.
- Only items you crafted count, by maker's mark, so buying from the auction house to hand in doesn't work.
- Declining is free.

**Tutorial.** The first five commissions teach the game: craft an item, buy a material on the auction house, hire a hero, smelt ore, and list an item for sale.

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
| Standard commission | 75–250, by tier |
| Rush commission | 150–400 |
| Guild contract | 500–1,500 |
| Regular's request | 50–150 |
| Guild drive (event) | Up to 2,000 |

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
| Profession wing | Adds your second or third profession | Needs Friendly, then Honored |
| Shop sign | Cosmetic banner that grows with your standing | Follows standing |

First-level costs range from 50 s to 5 g. All costs are starting values in the data files.

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

## Economy and pacing

The first profession should reach Artisan in about 2 to 3 weeks of regular check-ins, and the full endgame should take about 6 to 8 weeks. Every number here is a starting value in the data files, tuned with the balance simulator and playtests.

**Currency.** Gold, silver and copper: 1 g = 100 s = 10,000 c, shown with coin icons. A new shop starts with 50 s and the materials for the first tutorial commission.

**Gold coming in:** NPC buyers on the auction house, commission payouts, vendor sales.

**Gold going out:** materials bought on the auction house, hero fees, lost deposits and the auction house cut, the trade goods vendor and City Smelter, training, recipes and shop upgrades.

**Tuning guardrails**

- NPC buyers are an unlimited source of gold, so costs scale by tier to keep gold meaningful.
- Margins before fees: about 20–40% on consumables and 40–80% on gear.
- Listing more than a day's demand of one item should cut its price by at least 30%.
- Hero-gathered materials should cost about 40–60% of the auction house price per unit, so hiring beats buying when you can wait.
- Every recipe should have a profitable use for at least part of its skill range, so no tier is pure junk.

**Pacing targets** (checked by the balance simulator)

| Milestone | Target |
| --- | --- |
| First sale | Under 5 minutes |
| Journeyman (75) | Day 1 |
| Expert (150) and Friendly | Week 1 |
| First profession at Artisan (300) and Honored | Weeks 2–3 |
| Revered | Weeks 4–5 |
| Exalted, all three professions at 300 | Weeks 6–8 |

## Interface

The layout is mobile-first in portrait, with five bottom tabs and a fixed header. On wide screens the tabs move to a sidebar and two panels sit side by side.

**Header:** gold with coin icons, the guild standing bar, and an alert dot when something has finished.

| Tab | What's on it |
| --- | --- |
| Shop (home) | "While you were away" summary, commission counter, town crier, guild standing, upgrades, and the Trade Guild trainer and quartermaster |
| Workshop | Profession switcher, skill bar and rank, recipe list colored by skill-up odds, craft queue, forge smelting queue |
| Auction House | Browse and buy, Sell (price helpers and duration), My Listings (status, place in line, cancel), Ledger charts |
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

**Type.** Headings use an open-license display font stored in the repo, such as Cinzel. Body text and numbers use the system font for readability.

**Motion** stays small and quick: coins tick up on collect, a "Sold!" toast, progress bars fill.

**Sound** is a small set of effects added in Phase 4: coins on collect, "sold," hero return and craft complete. They come from a free CC0 sound pack, such as Kenney's. Sound starts only after the player's first tap, with a mute toggle in settings. There is no music.

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

**Debug mode** (a hidden toggle): fast-forward 1 h, 8 h or 24 h; add gold and materials; set skill; force an event; show the market's internal numbers.

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
5. **Phase 4 · Polish and launch**
    - Icon pass and credits screen, motion, onboarding polish, home-screen install, sound effects.
    - Final tuning and a full phone test pass.

**Later updates:** Tailoring, Engineering, Enchanting (a shop service plus disenchanting), Cooking, First Aid, and a neutral port market.

## Decisions

All open design calls are settled.

| Decision | Locked |
| --- | --- |
| Game title | Undercut. The only other use found is a 2004 tabletop auction game, low risk for a free browser game |
| Faction, capital and guild names | Ember Pact and Kragmar, Azure Crown and Aldmere |
| Race names | Hornkin and Risen |
| Material and herb names | As written in Materials and smelting. Stones for tiers 3–5 use real rock names (ironstone, flintstone, basalt) to keep clear of the original game's stone ladder |
| Sound | In scope: a small set of effects in Phase 4 |
| Pacing | About 6 to 8 weeks to the full endgame |
| Save slots | One save with export, plus "New game" |
