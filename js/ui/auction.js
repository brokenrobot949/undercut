// Auction House tab: browse and buy, sell, my listings.

import { el, comingSoon } from './components.js';

export function renderAuction() {
  return el('div', { class: 'main-inner' },
    comingSoon('Auction House', 'Browse, buy, sell and undercut. The full market arrives in Phase 1.'),
  );
}
