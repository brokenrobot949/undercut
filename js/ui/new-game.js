// New game screen: maker's mark name and capital choice.

import { el, setTheme } from './components.js';
import { factions } from '../../data/factions.js';

export function renderNewGame(root, { onStart }) {
  let chosen = null;

  const nameInput = el('input', {
    type: 'text', id: 'maker-name', maxlength: '20', autocomplete: 'off',
    placeholder: 'Your name', 'aria-describedby': 'maker-help',
  });
  const startBtn = el('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Open your shop');
  const cards = factions.map((f) => el('button', {
    class: 'faction-card', type: 'button', 'data-theme': f.theme, 'aria-pressed': 'false',
    onclick: () => choose(f),
  },
    el('h2', {}, f.capital),
    el('div', { class: 'small' }, `${f.name} · ${f.blurb}`),
    el('div', { class: 'small dim' }, `Heroes: ${f.races.join(', ')}. Only here: ${f.factionClass}s.`),
    el('div', { class: 'swatches', 'aria-hidden': 'true' },
      ['--bg', '--panel', '--accent', '--accent-strong', '--highlight'].map((v) => el('span', { style: `background:var(${v})` }))),
  ));

  function choose(faction) {
    chosen = faction;
    cards.forEach((card, i) => card.setAttribute('aria-pressed', String(factions[i] === faction)));
    setTheme(faction.theme);
    update();
  }
  function update() {
    startBtn.disabled = !(chosen && nameInput.value.trim());
  }
  nameInput.addEventListener('input', update);
  startBtn.addEventListener('click', () => {
    if (startBtn.disabled) return;
    onStart({ name: nameInput.value.trim(), factionId: chosen.id });
  });

  setTheme('red');
  root.replaceChildren(el('div', { class: 'new-game' },
    el('h1', { class: 'title-mark' }, 'Undercut'),
    el('p', { class: 'dim', style: 'text-align:center' }, 'Run a crafting shop. Beat the market.'),
    el('div', { class: 'panel' },
      el('div', { class: 'field' },
        el('label', { for: 'maker-name' }, "Maker's mark"),
        nameInput,
        el('span', { id: 'maker-help', class: 'small dim' }, 'Every item you craft carries this name.')),
    ),
    el('h2', {}, 'Choose your capital'),
    el('div', { class: 'faction-choices' }, cards),
    startBtn,
  ));
}
