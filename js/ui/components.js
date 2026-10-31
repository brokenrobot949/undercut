// Shared UI pieces used by every tab.

import { itemIcons, uiIcons, tints, tierTints } from '../../data/icons.js';
import { itemById } from '../../data/items.js';

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
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// An icon from assets/icons/, drawn in the text color (or `color`) through a mask.
// The path is set inline so it resolves against the page, not a stylesheet.
function iconSpan(ref, color, cls = 'icon') {
  if (!ref) return null;
  const url = `url("./assets/icons/${ref.icon.split('/')[1]}.svg")`;
  return el('span', { class: cls, 'aria-hidden': 'true',
    style: `-webkit-mask-image:${url};mask-image:${url}${color ? `;color:${color}` : ''}` });
}

// An item's icon on a dark tile: tinted by its material, bordered by its quality.
export function itemIcon(itemId, size = 'md') {
  const item = itemById[itemId];
  const ref = itemIcons[itemId];
  const tint = tints[ref?.tint ?? tierTints[item.tier - 1]];
  return el('span', { class: `icon-tile icon-${size} border-${item.quality}` }, iconSpan(ref, tint));
}

// A screen icon (tabs, professions, workstations), in the current text color.
export function uiIcon(key) {
  return iconSpan(uiIcons[key]);
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
  if (s) parts.push(el('span', { class: 'coin s' }, s));
  if (c || !parts.length) parts.push(el('span', { class: 'coin c' }, c));
  return el('span', { class: 'coins', 'aria-label': `${g} gold ${s} silver ${c} copper` }, parts);
}

// "1g 4s 20c" as plain text, for toasts.
export function coinText(copper) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return [g && `${g}g`, s && `${s}s`, (c || (!g && !s)) && `${c}c`].filter((x) => x !== 0 && x).join(' ') || '0c';
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

// Toasts stack above the tab bar, newest at the bottom, and fade after a few
// seconds. Only the last few stay, so a burst of news doesn't fill the screen.
const TOAST_MAX = 3;
function toastStack() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = el('div', { class: 'toast-stack', role: 'status', 'aria-live': 'polite' });
    (document.querySelector('[data-theme]') || document.body).append(stack);
  }
  return stack;
}
function showToast(node, ms) {
  const stack = toastStack();
  stack.append(node);
  while (stack.children.length > TOAST_MAX) stack.firstChild.remove();
  setTimeout(() => {
    node.classList.add('toast-out');
    setTimeout(() => node.remove(), 250);
  }, ms);
}
export function toast(message) {
  showToast(el('div', { class: 'toast' }, message), 3000);
}

// "Sold!" with the item's icon and what the sale paid.
export function soldToast(itemId, qty, copper) {
  showToast(el('div', { class: 'toast toast-sold' },
    itemIcon(itemId, 'sm'),
    el('span', {}, el('strong', {}, 'Sold! '), `${qty} × ${itemById[itemId].name}`),
    el('span', { class: 'toast-pay' }, '+', coins(copper))), 3500);
}

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Coins that count up from `from` to `to` copper over about half a second.
export function tickingCoins(from, to) {
  const node = el('span', { class: 'coin-tick' }, coins(to));
  if (to <= from || calm()) return node;
  node.replaceChildren(coins(from));
  node.classList.add('coin-up');
  const start = performance.now();
  const ms = 650;
  const step = (t) => {
    const k = Math.min(1, (t - start) / ms);
    const eased = 1 - (1 - k) ** 3;
    node.replaceChildren(coins(from + (to - from) * eased));
    if (k < 1) requestAnimationFrame(step);
    else setTimeout(() => node.classList.remove('coin-up'), 300);
  };
  requestAnimationFrame(step);
  return node;
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
// It starts at the right width, so a redraw doesn't refill it from empty.
let liveNow = 0;
export function progress(start, end) {
  return el('div', { class: 'bar progress' }, el('span', { 'data-start': String(start), 'data-end': String(end),
    style: `width:${barShare(start, end, liveNow) * 100}%` }));
}
const barShare = (start, end, now) => Math.max(0, Math.min(1, (now - start) / (end - start)));

export function updateLive(now) {
  liveNow = now;
  for (const node of document.querySelectorAll('[data-ends-at]')) {
    const left = Number(node.dataset.endsAt) - now;
    node.textContent = left > 0 ? formatClock(left) : 'done';
  }
  for (const node of document.querySelectorAll('[data-start][data-end]')) {
    node.style.width = `${barShare(Number(node.dataset.start), Number(node.dataset.end), now) * 100}%`;
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
