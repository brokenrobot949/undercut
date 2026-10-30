// The two capitals. The player picks one when starting a new game.
// `theme` must match a CSS file: css/theme-red.css or css/theme-blue.css.

export const factions = [
  {
    id: 'red',
    name: 'Ember Pact',
    capital: 'Kragmar',
    blurb: 'A red-stone war city in the badlands.',
    guild: 'Kragmar Trade Consortium',
    races: ['Orc', 'Troll', 'Hornkin', 'Risen'],
    factionClass: 'Shaman',
    // Gear demand multiplier by armor type (Shamans wear mail).
    armorDemand: { mail: 1.15, plate: 0.9 },
    theme: 'red',
  },
  {
    id: 'blue',
    name: 'Azure Crown',
    capital: 'Aldmere',
    blurb: 'A white-stone harbor kingdom.',
    guild: "Aldmere Merchants' Guild",
    races: ['Human', 'Dwarf', 'Gnome', 'Elf'],
    factionClass: 'Paladin',
    // Gear demand multiplier by armor type (Paladins wear plate).
    armorDemand: { mail: 0.9, plate: 1.15 },
    theme: 'blue',
  },
];
