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
    { text: 'Your second profession wing', soon: true },
    { text: 'Tier 3 quartermaster recipes', soon: true },
  ] },
  { standing: 'honored', unlocks: [
    { text: 'Your third profession wing', soon: true },
    { text: 'Blue-quality quartermaster recipes', soon: true },
  ] },
  { standing: 'revered', unlocks: [
    { text: 'Raid expeditions and endgame materials', soon: true },
    { text: 'Top blue quartermaster recipes', soon: true },
  ] },
  { standing: 'exalted', unlocks: [
    { text: 'Masterwork (epic) recipes', soon: true },
    { text: 'The Guildmaster title and a top-tier shop banner', soon: true },
  ] },
];

// Short tips under the guild panel's standing bar.
export const guildTips = {
  earn: 'Earn reputation by filling commissions at the counter. Guild contracts give the most.',
  top: 'You are Exalted, the highest standing. Commissions still pay gold.',
};
