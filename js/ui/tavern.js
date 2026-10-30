// Tavern tab: hire board, regulars, expeditions.

import { el, comingSoon } from './components.js';

export function renderTavern() {
  return el('div', { class: 'main-inner' },
    comingSoon('Tavern', 'Hire heroes to gather materials. Miners arrive in Phase 1, the full tavern in Phase 2.'),
  );
}
