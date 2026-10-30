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
    theme: 'blue',
  },
];
