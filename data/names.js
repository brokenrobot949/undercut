// Hero first names by race. Original names only: nothing from any existing game.
// Add as many as you like. Hilda and Brakka come from the design doc examples.

export const heroNames = {
  human: ['Aldric', 'Mira', 'Tomas', 'Elsbeth', 'Garrow', 'Wenna', 'Rowan', 'Hale', 'Corin', 'Bess', 'Edwin', 'Talia'],
  dwarf: ['Hilda', 'Korrin', 'Grisna', 'Durgan', 'Malda', 'Brannoc', 'Thorvi', 'Dagna', 'Orrik', 'Hesta', 'Bruni', 'Kelda'],
  gnome: ['Pip', 'Tibbet', 'Nella', 'Wix', 'Bindle', 'Quill', 'Fenna', 'Dobbs', 'Lirra', 'Tock', 'Mabbet', 'Sprocka'],
  elf: ['Aerin', 'Sylvae', 'Lioren', 'Faelan', 'Ithra', 'Caelith', 'Noriel', 'Vaelis', 'Elowen', 'Thiran', 'Saeli', 'Marin'],
  orc: ['Brakka', 'Grosh', 'Murga', 'Thrak', 'Zugra', 'Karg', 'Dursha', 'Roshk', 'Vasha', 'Gorran', 'Ulka', 'Brug'],
  troll: ['Zanko', 'Rasha', 'Jinto', 'Mabu', 'Kezi', 'Tobo', 'Yenza', 'Rukai', 'Sema', 'Doka', 'Venji', 'Zuri'],
  hornkin: ['Oshen', 'Brannu', 'Kiyala', 'Moro', 'Tavi', 'Hesu', 'Nakoa', 'Runa', 'Tobren', 'Ashe', 'Kemu', 'Laho'],
  risen: ['Mortimer', 'Ashby', 'Greer', 'Silas', 'Wren', 'Edda', 'Crane', 'Hollis', 'Vera', 'Thorne', 'Pell', 'Agnes'],
};

// Flavor lines for a bad haul. {name} and {zone} are filled in.
// A line is picked by the gathering profession the hero used on the trip.
export const badHaulLines = {
  mining: [
    '{name} was chased off by a bear and came home with half a load.',
    '{name} took a wrong turn in {zone} and lost half a day to the fog.',
    '{name} hit a seam of nothing but grit. Half a load.',
    'A rockslide in {zone} sent {name} home early with half a load.',
    '{name} spent too long arguing with a rival miner. Half a load.',
  ],
  herbalism: [
    '{name} sneezed through a whole meadow of pollen and came home with half a load.',
    '{name} picked the wrong plants in {zone} and had to toss half the basket.',
    'A sudden frost in {zone} wilted half of what {name} had gathered.',
    '{name} stopped to nap in the ferns and brought home half a load.',
  ],
  skinning: [
    '{name} lost the trail in {zone} and came home with half a load.',
    'A badger got into the pack and {name} brought home half a load.',
    '{name} fumbled a skinning knife into a stream. Half a load.',
    '{name} was spooked by an angry boar and fled {zone} with half a load.',
  ],
};
