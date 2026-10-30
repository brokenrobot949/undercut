// Shared UI pieces used by every tab.

// Builds an element: el('div', { class: 'panel', onclick: fn }, child, 'text', ...)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// Copper amount shown as gold, silver and copper coins. Zero parts are hidden.
export function coins(copper) {
  const total = Math.max(0, Math.floor(copper));
  const g = Math.floor(total / 10000);
  const s = Math.floor((total % 10000) / 100);
  const c = total % 100;
  const parts = [];
  if (g) parts.push(el('span', { class: 'coin g' }, g.toLocaleString()));
  if (g || s) parts.push(el('span', { class: 'coin s' }, s));
  parts.push(el('span', { class: 'coin c' }, c));
  return el('span', { class: 'coins', 'aria-label': `${g} gold ${s} silver ${c} copper` }, parts);
}

// "2 h 15 min", "45 min", "3 days 4 h"
export function formatDuration(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return 'under a minute';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days) return `${days} day${days > 1 ? 's' : ''}${hours ? ` ${hours} h` : ''}`;
  if (hours) return `${hours} h${mins ? ` ${mins} min` : ''}`;
  return `${mins} min`;
}

// A bottom sheet. Returns { body, close }. Closes on backdrop tap or Escape.
export function openSheet(title, { onClose } = {}) {
  const body = el('div', { class: 'sheet-body', style: 'display:grid;gap:16px' });
  const closeBtn = el('button', { class: 'btn', type: 'button' }, 'Close');
  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    el('div', { class: 'sheet-head' }, el('h2', {}, title), closeBtn),
    body);
  const backdrop = el('div', { class: 'sheet-backdrop' }, sheet);
  const app = document.querySelector('[data-theme]');
  (app || document.body).append(backdrop);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    if (onClose) onClose();
  }
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  return { body, close };
}

let toastTimer = null;
export function toast(message) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const node = el('div', { class: 'toast', role: 'status' }, message);
  (document.querySelector('[data-theme]') || document.body).append(node);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 2500);
}

// A placeholder card for tabs whose content arrives in a later phase.
export function comingSoon(title, text) {
  return el('section', { class: 'panel' }, el('h2', {}, title), el('p', { class: 'dim' }, text));
}
