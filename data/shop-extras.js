// Late-game gold sinks, bought on the Shop tab: decor and sign styles (looks
// only), guild donations (a bonus for a while) and trophies (very expensive,
// shown in a trophy case). Safe to edit. Money is in copper: 10,000 = 1 gold.
//
// Fields:
//   id        never change this once players have saves (it's stored in them)
//   name      shown on the Shop tab
//   cost      price in copper
//   icon      'artist/icon-name' from game-icons.net (run tools/copy-icons.js after changing)
//   tint      a color key from data/icons.js

// Decor for the "Your shop" panel. Looks only.
export const decor = [
  { id: 'counter-bell', name: 'Brass counter bell', cost: 100000, icon: 'lorc/ringing-bell', tint: 'bronze' },
  { id: 'lanterns', name: 'Hanging lanterns', cost: 150000, icon: 'delapouite/old-lantern', tint: 'fire' },
  { id: 'far-market-rug', name: 'Rug from the far markets', cost: 200000, icon: 'delapouite/red-carpet', tint: 'mending' },
  { id: 'blade-rack', name: 'Display rack of blades', cost: 250000, icon: 'lorc/sword-array', tint: 'iron' },
  { id: 'stained-glass', name: 'Stained-glass window', cost: 600000, icon: 'delapouite/window', tint: 'aether' },
];

// Shop sign styles: change how your shop's name looks in the header. Looks only.
// Buy once, then switch between the ones you own (or the plain sign) any time.
//   style     the CSS class suffix in css/base.css (.sign-style-<style>)
export const signStyles = [
  { id: 'carved-oak', name: 'Carved oak sign', cost: 100000, style: 'oak' },
  { id: 'ember-lettering', name: 'Ember lettering', cost: 250000, style: 'ember' },
  { id: 'gilded-frame', name: 'Gilded frame', cost: 500000, style: 'gilded' },
];

// Guild donations: pay gold for a bonus that lasts `hours`. Donating again
// while one runs adds another `hours`, up to `maxHours` ahead.
//   standing  guild standing needed (ids from data/tuning.js)
//   effect    what it does (the engine reads these):
//     haul        hero trips hired while it runs bring back `value` x the gathered materials
//     deposit     listing deposits x `value` while it runs
//     commission  commissions posted while it runs pay `value` x as much
export const donations = [
  { id: 'caravan', name: 'Sponsor a caravan', cost: 30000, hours: 24, maxHours: 72, standing: 'honored',
    effect: 'haul', value: 1.15, blurb: 'Hero trips hired in the next day bring home 15% more materials.', icon: 'delapouite/caravan', tint: 'earth' },
  { id: 'night-watch', name: 'Fund the night watch', cost: 20000, hours: 24, maxHours: 72, standing: 'honored',
    effect: 'deposit', value: 0.5, blurb: 'Listing deposits are halved for a day.', icon: 'delapouite/watchtower', tint: 'iron' },
  { id: 'guild-feast', name: 'Host a guild feast', cost: 40000, hours: 24, maxHours: 72, standing: 'honored',
    effect: 'commission', value: 1.10, blurb: 'Commissions posted in the next day pay 10% more.', icon: 'lorc/roast-chicken', tint: 'tonic' },
];

// Trophies for the trophy case. Very expensive, looks only.
export const trophies = [
  { id: 'gilded-anvil', name: 'Gilded anvil', cost: 500000, icon: 'lorc/anvil', tint: 'flower' },
  { id: 'merchant-scales', name: 'Merchant prince\'s scales', cost: 1000000, icon: 'lorc/scales', tint: 'bronze' },
  { id: 'crystal-hourglass', name: 'Crystal hourglass', cost: 1500000, icon: 'lorc/hourglass', tint: 'gem' },
  { id: 'dragon-bone-abacus', name: 'Dragon-bone abacus', cost: 2500000, icon: 'delapouite/abacus', tint: 'cloth' },
  { id: 'market-crown', name: 'Crown of the market', cost: 5000000, icon: 'lorc/crown', tint: 'flower' },
];
