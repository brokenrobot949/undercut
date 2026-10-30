// Workshop tab: professions, recipes, craft queue, forge.

import { el, comingSoon } from './components.js';

export function renderWorkshop() {
  return el('div', { class: 'main-inner' },
    comingSoon('Workshop', 'Your recipes, craft queue and skill bar will live here. Blacksmithing arrives in Phase 1.'),
    comingSoon('Forge', 'Smelt ore into bars here. Arrives in Phase 1.'),
  );
}
