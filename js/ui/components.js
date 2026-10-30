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

// Replaces a node's contents. Like el(), skips null/false and flattens arrays
// (the browser's own replaceChildren would print them as text).
export function fill(node, ...children) {
  node.replaceChildren(...children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false)
    .map((c) => (c instanceof Node ? c : String(c))));
}

// Switches the faction theme for the whole page, including the phone's browser bar.
export function setTheme(theme) {
  if (document.body.getAttribute('data-theme') === theme) return;
  document.body.setAttribute('data-theme', theme);
  const bar = getComputedStyle(document.body).getPropertyValue('--bg-deep').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bar);
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

// "1g 4s 20c" as plain text, for toasts.
export function coinText(copper) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return [g && `${g}g`, (g || s) && `${s}s`, `${c}c`].filter(Boolean).join(' ');
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

// A number field with − and + buttons. `stepper.value` reads it.
export function stepper({ value = 1, min = 1, max = Infinity, label = 'Quantity', onChange } = {}) {
  const input = el('input', { type: 'number', inputmode: 'numeric', min: String(min), value: String(value), 'aria-label': label });
  const clamp = (v) => Math.max(min, Math.min(max, Math.floor(Number(v) || min)));
  const set = (v) => { input.value = String(clamp(v)); onChange?.(Number(input.value)); };
  input.addEventListener('change', () => set(input.value));
  input.addEventListener('input', () => onChange?.(clamp(input.value)));
  const node = el('div', { class: 'stepper' },
    el('button', { class: 'btn', type: 'button', 'aria-label': 'Fewer', onclick: () => set(Number(input.value) - 1) }, '−'),
    input,
    el('button', { class: 'btn', type: 'button', 'aria-label': 'More', onclick: () => set(Number(input.value) + 1) }, '+'),
    Number.isFinite(max) ? el('button', { class: 'btn', type: 'button', onclick: () => set(max) }, 'Max') : null);
  return { node, get value() { return clamp(input.value); }, set };
}

// A price entered as gold, silver and copper. `coinInput.value` reads it in copper.
export function coinInput({ value = 0, label = 'Price', onChange } = {}) {
  const field = (name) => el('input', { type: 'number', inputmode: 'numeric', min: '0', placeholder: '0', 'aria-label': `${label}: ${name}` });
  const g = field('gold');
  const s = field('silver');
  const c = field('copper');
  const read = () => Math.max(0, Math.floor(Number(g.value) || 0) * 10000 + Math.floor(Number(s.value) || 0) * 100 + Math.floor(Number(c.value) || 0));
  const write = (v) => {
    v = Math.max(0, Math.round(v));
    g.value = v >= 10000 ? String(Math.floor(v / 10000)) : '';
    s.value = v >= 100 ? String(Math.floor((v % 10000) / 100)) : '';
    c.value = String(v % 100);
  };
  for (const f of [g, s, c]) f.addEventListener('input', () => onChange?.(read()));
  write(value);
  const node = el('div', { class: 'coin-input' },
    el('label', { class: 'coin g' }, g), el('label', { class: 'coin s' }, s), el('label', { class: 'coin c' }, c));
  return { node, get value() { return read(); }, set(v) { write(v); onChange?.(read()); } };
}

// Text that counts down to `endsAt` (game time). Updated every second by the app.
export function countdown(endsAt) {
  return el('span', { class: 'countdown', 'data-ends-at': String(endsAt) });
}

// A progress bar from `start` to `end` (game time). Updated every second by the app.
export function progress(start, end) {
  return el('div', { class: 'bar progress' }, el('span', { 'data-start': String(start), 'data-end': String(end) }));
}

export function updateLive(now) {
  for (const node of document.querySelectorAll('[data-ends-at]')) {
    const left = Number(node.dataset.endsAt) - now;
    node.textContent = left > 0 ? formatClock(left) : 'done';
  }
  for (const node of document.querySelectorAll('[data-start][data-end]')) {
    const start = Number(node.dataset.start);
    const share = (now - start) / (Number(node.dataset.end) - start);
    node.style.width = `${Math.max(0, Math.min(1, share)) * 100}%`;
  }
}

// "45s", "3:05", "2h 10m"
export function formatClock(ms) {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const h = Math.floor(s / 3600);
  return h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${Math.floor((s % 3600) / 60)}m`;
}

// A placeholder card for tabs whose content arrives in a later phase.
export function comingSoon(title, text) {
  return el('section', { class: 'panel' }, el('h2', {}, title), el('p', { class: 'dim' }, text));
}
