// Global settings. Safe to edit: change the number, save, hard refresh.
// Money is always counted in copper: 1 gold = 100 silver = 10,000 copper.

export const tuning = {
  // How often the market updates, in minutes.
  tickMinutes: 10,

  // Longest absence the game replays tick by tick, in days.
  // Past this, the market jumps to a fresh state and timers just resolve.
  catchUpMaxDays: 7,

  // Autosave interval while the game is open, in seconds.
  autosaveSeconds: 30,

  // Gold a new shop starts with, in copper (5,000 = 50 silver).
  startingCopper: 5000,

  // Reputation needed for each Trade Guild standing.
  standings: [
    { id: 'neutral', name: 'Neutral', rep: 0 },
    { id: 'friendly', name: 'Friendly', rep: 3000 },
    { id: 'honored', name: 'Honored', rep: 9000 },
    { id: 'revered', name: 'Revered', rep: 21000 },
    { id: 'exalted', name: 'Exalted', rep: 42000 },
  ],
};
