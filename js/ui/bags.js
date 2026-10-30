// Bags tab: storage grid, vendor sales, trade goods vendor.

import { el, comingSoon } from './components.js';

export function renderBags() {
  return el('div', { class: 'main-inner' },
    comingSoon('Bags', 'Your materials and crafted goods. Arrives in Phase 1.'),
    comingSoon('Trade goods vendor', 'Vials, thread, salt, flux and coal. Arrives in Phase 1.'),
  );
}
