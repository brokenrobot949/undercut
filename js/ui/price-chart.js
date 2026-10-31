// The Ledger's 7-day price chart: average sale price per bucket as a line,
// with the item's base value as a dashed reference line. Inline SVG.

import { el, coinText } from './components.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 300;
const H = 90;
const PAD = 4;

function svg(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// `history` is priceHistory() output (oldest first); `base` the item's base value.
export function priceChart(history, base) {
  const prices = history.map((b) => b.price).filter((p) => p !== null);
  if (prices.length < 2) {
    return el('p', { class: 'small dim' }, 'Ledger: not enough sales in the last 7 days to chart.');
  }
  const lo = Math.min(base, ...prices) * 0.95;
  const hi = Math.max(base, ...prices) * 1.05;
  const x = (i) => PAD + (i / (history.length - 1)) * (W - PAD * 2);
  const y = (p) => PAD + (1 - (p - lo) / (hi - lo)) * (H - PAD * 2);

  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'price-chart', role: 'img',
    'aria-label': `Average sale price over 7 days, from ${coinText(Math.round(Math.min(...prices)))} to ${coinText(Math.round(Math.max(...prices)))}` });
  chart.append(svg('line', { x1: PAD, x2: W - PAD, y1: y(base), y2: y(base), class: 'chart-base' }));
  // One line per run of buckets with sales; gaps stay empty.
  let run = [];
  const flush = () => {
    if (run.length > 1) chart.append(svg('polyline', { points: run.join(' '), class: 'chart-line' }));
    else if (run.length === 1) chart.append(svg('circle', { cx: run[0].split(',')[0], cy: run[0].split(',')[1], r: 2, class: 'chart-dot' }));
    run = [];
  };
  history.forEach((b, i) => (b.price === null ? flush() : run.push(`${x(i).toFixed(1)},${y(b.price).toFixed(1)}`)));
  flush();

  const last = [...history].reverse().find((b) => b.price !== null).price;
  return el('div', { class: 'chart-wrap' },
    el('div', { class: 'small dim chart-head' }, el('span', {}, 'Price, last 7 days'), el('span', {}, 'now ', coinText(Math.round(last)))),
    chart,
    el('div', { class: 'small dim chart-foot' }, el('span', {}, '7 days ago'), el('span', {}, '- - base ', coinText(base)), el('span', {}, 'now')));
}
