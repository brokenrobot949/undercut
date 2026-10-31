// What each Trade Guild standing unlocks, shown on the Shop tab's guild panel.
// The reputation each standing needs is in data/tuning.js (standings).
// Training ranks are listed automatically from data/professions.js, so they
// aren't repeated here.
//
// Fields:
//   standing  matches an id in tuning.standings
//   unlocks   one short line per reward
//   soon      true while that reward isn't built yet; the panel shows
//             "coming soon" next to it. Remove it when the feature lands.

export const standingUnlocks = [
  { standing: 'neutral', unlocks: [
    { text: 'Tier 1 and 2 recipes from the trainer' },
  ] },
  { standing: 'friendly', unlocks: [
    { text: 'Your second profession wing' },
    { text: 'Tier 3 quartermaster recipes' },
  ] },
  { standing: 'honored', unlocks: [
    { text: 'Your third profession wing' },
    { text: 'Blue-quality quartermaster recipes' },
  ] },
  { standing: 'revered', unlocks: [
    { text: 'Raid expeditions and endgame materials' },
    { text: 'Top blue quartermaster recipes' },
  ] },
  { standing: 'exalted', unlocks: [
    { text: 'Masterwork (epic) recipes' },
    { text: 'The Guildmaster title and a top-tier shop banner' },
  ] },
];

// The shop sign in the header grows with your standing (cosmetic only).
//   sign    the banner style, from css/base.css (.sign-0 to .sign-4)
//   title   shown after your shop's name, or null
export const shopSigns = {
  neutral: { sign: 0, title: null },
  friendly: { sign: 1, title: null },
  honored: { sign: 2, title: null },
  revered: { sign: 3, title: null },
  exalted: { sign: 4, title: 'Guildmaster' },
};

// Short tips under the guild panel's standing bar.
export const guildTips = {
  earn: 'Earn reputation by filling commissions at the counter. Guild contracts give the most.',
  top: 'You are Exalted, the highest standing. Commissions still pay gold.',
};
