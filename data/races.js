// Hero races, their classes and gathering perks. Faction 'red' = Ember Pact
// (Kragmar), 'blue' = Azure Crown (Aldmere).
//
// Perk types the engine understands:
//   fee          hire fee multiplier (0.9 = 10% cheaper)
//   tripTime     trip length multiplier (0.9 = 10% shorter)
//   yield        gathering yield multiplier for one profession
//   badHaul      bad-haul chance multiplier (0.5 = half as likely)
//   extraLoot    an extra general loot roll (Phase 2)

export const races = [
  { id: 'human', name: 'Human', faction: 'blue', classes: ['warrior', 'paladin', 'rogue', 'priest', 'mage', 'warlock'],
    perk: { type: 'fee', value: 0.9, text: 'Hire fee −10%' } },
  { id: 'dwarf', name: 'Dwarf', faction: 'blue', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest'],
    perk: { type: 'yield', profession: 'mining', value: 1.15, text: 'Mining yield +15%' } },
  { id: 'gnome', name: 'Gnome', faction: 'blue', classes: ['warrior', 'rogue', 'mage', 'warlock'],
    perk: { type: 'tripTime', value: 0.9, text: 'Trips 10% shorter' } },
  { id: 'elf', name: 'Elf', faction: 'blue', classes: ['warrior', 'hunter', 'rogue', 'priest', 'druid'],
    perk: { type: 'yield', profession: 'herbalism', value: 1.15, text: 'Herbalism yield +15%' } },
  { id: 'orc', name: 'Orc', faction: 'red', classes: ['warrior', 'hunter', 'rogue', 'shaman', 'warlock'],
    perk: { type: 'badHaul', value: 0.5, text: 'Bad-haul chance −50%' } },
  { id: 'troll', name: 'Troll', faction: 'red', classes: ['warrior', 'hunter', 'rogue', 'priest', 'shaman', 'mage'],
    perk: { type: 'yield', profession: 'skinning', value: 1.15, text: 'Skinning yield +15%' } },
  { id: 'hornkin', name: 'Hornkin', faction: 'red', classes: ['warrior', 'hunter', 'shaman', 'druid'],
    perk: { type: 'yield', profession: 'herbalism', value: 1.15, text: 'Herbalism yield +15%' } },
  { id: 'risen', name: 'Risen', faction: 'red', classes: ['warrior', 'rogue', 'priest', 'mage', 'warlock'],
    perk: { type: 'extraLoot', value: 1, text: 'Extra general loot roll' } },
];

export const classes = [
  { id: 'warrior', name: 'Warrior', armor: 'plate' },
  { id: 'paladin', name: 'Paladin', armor: 'plate' },
  { id: 'hunter', name: 'Hunter', armor: 'mail' },
  { id: 'shaman', name: 'Shaman', armor: 'mail' },
  { id: 'rogue', name: 'Rogue', armor: 'leather' },
  { id: 'druid', name: 'Druid', armor: 'leather' },
  { id: 'priest', name: 'Priest', armor: 'cloth' },
  { id: 'mage', name: 'Mage', armor: 'cloth' },
  { id: 'warlock', name: 'Warlock', armor: 'cloth' },
];

export const raceById = Object.fromEntries(races.map((r) => [r.id, r]));
export const classById = Object.fromEntries(classes.map((c) => [c.id, c]));
