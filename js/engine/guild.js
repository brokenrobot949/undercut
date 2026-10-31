// Trade Guild standing: which standing your reputation reaches, progress to
// the next one, and what each standing unlocks.

import { tuning } from '../../data/tuning.js';
import { ranks } from '../../data/professions.js';
import { standingUnlocks } from '../../data/guild.js';

// Index into tuning.standings of the standing your reputation reaches.
export function standingIndex(state) {
  const list = tuning.standings;
  let i = 0;
  while (i + 1 < list.length && state.reputation >= list[i + 1].rep) i++;
  return i;
}

// { current, next, share }: share is progress from current to next, 0 to 1
// (1 at the top standing).
export function getStanding(state) {
  const list = tuning.standings;
  const i = standingIndex(state);
  const current = list[i];
  const next = list[i + 1] || null;
  const share = next ? (state.reputation - current.rep) / (next.rep - current.rep) : 1;
  return { current, next, share };
}

export function hasStanding(state, standingId) {
  return standingIndex(state) >= tuning.standings.findIndex((s) => s.id === standingId);
}

// Every standing in order, with what it unlocks and whether you've reached it.
// Each unlock is { text, soon }.
export function standingLadder(state) {
  const reached = standingIndex(state);
  return tuning.standings.map((s, i) => {
    const training = ranks.filter((r) => r.standing === s.id && r.cost > 0)
      .map((r) => ({ text: `${r.name} training (skill to ${r.cap})`, soon: false }));
    const extra = (standingUnlocks.find((u) => u.standing === s.id)?.unlocks ?? [])
      .map((u) => ({ text: u.text, soon: !!u.soon }));
    return { ...s, reached: i <= reached, unlocks: [...training, ...extra] };
  });
}
