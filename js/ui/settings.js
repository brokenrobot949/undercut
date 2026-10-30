// Settings sheet: save export and import, new game, credits, and the hidden
// debug panel (tap the version line 5 times to turn it on).

import { el, openSheet, toast, formatDuration, fill } from './components.js';
import { encodeExport } from '../engine/save.js';
import { gameNow } from '../engine/clock.js';
import { debugAddCopper, debugAddMaterials, debugStartTestTimer } from '../engine/game.js';

export function openSettings(ctx) {
  const sheet = openSheet('Settings');
  draw();

  function draw() {
    const { state } = ctx;
    fill(sheet.body, 
      el('section', { class: 'panel' },
        el('h3', {}, 'Back up your save'),
        el('p', { class: 'small dim' },
          'Your game is saved in this browser. iPhone Safari can clear it after about a week without a visit, so copy this code somewhere safe now and then. It also moves your game to another device.'),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', type: 'button', onclick: showExport }, 'Export save code'),
          el('button', { class: 'btn', type: 'button', onclick: showImport }, 'Import save code'))),
      el('section', { class: 'panel' },
        el('h3', {}, 'New game'),
        el('p', { class: 'small dim' }, 'Starts over. Export your save first if you might want it back.'),
        el('button', { class: 'btn btn-danger', type: 'button', onclick: () => { sheet.close(); ctx.newGame(); } }, 'Start a new game')),
      backupsPanel(),
      state.settings.debug ? debugPanel() : null,
      versionLine(),
    );
  }

  function backupsPanel() {
    const backups = ctx.listBackups();
    if (!backups.length) return null;
    return el('section', { class: 'panel' },
      el('h3', {}, 'Earlier games on this device'),
      el('p', { class: 'small dim' }, 'Starting a new game or importing keeps the replaced game here. Restoring swaps it with your current game.'),
      el('div', { class: 'market-list' }, backups.map((b) => el('div', { class: 'my-listing' },
        el('span', { class: 'item-name' }, `${b.name}'s Shop`),
        el('button', { class: 'btn small-btn', type: 'button', onclick: () => {
          if (!confirm(`Restore ${b.name}'s Shop? Your current game becomes a backup.`)) return;
          try {
            ctx.restoreBackup(b.key);
            sheet.close();
            toast('Game restored.');
          } catch (e) {
            toast(e.message);
          }
        } }, 'Restore'),
        el('span', { class: 'small dim market-sub' }, b.savedAt ? `Last played ${new Date(b.savedAt).toLocaleString()}` : '')))));
  }

  function showExport() {
    const code = encodeExport(ctx.state);
    const area = el('textarea', { readonly: true, 'aria-label': 'Save code' }, code);
    const box = openSheet('Your save code');
    box.body.append(
      el('p', { class: 'small dim' }, 'Copy all of it. Paste it into Import on any device to load this game.'),
      area,
      el('button', { class: 'btn btn-primary', type: 'button', onclick: () => copy(area) }, 'Copy code'));
  }

  function showImport() {
    const area = el('textarea', { 'aria-label': 'Paste save code', placeholder: 'Paste your save code here' });
    const error = el('p', { class: 'small', style: 'color:#ff9d8f', role: 'alert' });
    const box = openSheet('Import save');
    box.body.append(
      el('p', { class: 'small dim' }, 'This replaces the game on this device. Your current save is kept as a backup.'),
      area, error,
      el('button', { class: 'btn btn-primary', type: 'button', onclick: () => {
        try {
          ctx.importCode(area.value);
          box.close();
          sheet.close();
          toast('Save loaded.');
        } catch (e) {
          error.textContent = e.message;
        }
      } }, 'Load this save'));
  }

  let versionTaps = 0;
  function versionLine() {
    return el('p', { class: 'small dim', style: 'text-align:center;user-select:none', onclick: () => {
      versionTaps++;
      if (versionTaps >= 5) {
        versionTaps = 0;
        ctx.act((state) => { state.settings.debug = !state.settings.debug; });
        toast(ctx.state.settings.debug ? 'Debug mode on.' : 'Debug mode off.');
        draw();
      }
    } }, `Undercut ${ctx.version} · Icons: game-icons.net (CC BY 3.0)`);
  }

  function debugPanel() {
    const { state } = ctx;
    const now = gameNow(state, Date.now());
    const c = state.clock;
    const btn = (label, fn) => el('button', { class: 'btn', type: 'button', onclick: () => { fn(); draw(); } }, label);
    return el('section', { class: 'panel' },
      el('h3', {}, 'Debug'),
      el('p', { class: 'small dim' }, 'Fast-forward'),
      el('div', { class: 'btn-row' },
        btn('+1 h', () => ctx.fastForward(1)),
        btn('+8 h', () => ctx.fastForward(8)),
        btn('+24 h', () => ctx.fastForward(24)),
        btn('+8 days', () => ctx.fastForward(24 * 8))),
      el('p', { class: 'small dim', style: 'margin-top:12px' }, 'Gold and timers'),
      el('div', { class: 'btn-row' },
        btn('+1 g', () => ctx.act((s) => debugAddCopper(s, 10000))),
        btn('+10 g', () => ctx.act((s) => debugAddCopper(s, 100000))),
        btn('+20 materials', () => ctx.act((s) => debugAddMaterials(s, 20))),
        btn('15 min test timer', () => ctx.act((s) => debugStartTestTimer(s, Date.now(), 15)))),
      el('p', { class: 'small dim', style: 'margin-top:12px' }, 'Internals'),
      el('dl', { class: 'kv' },
        kv('Game time', new Date(now).toLocaleString()),
        kv('Time skipped', formatDuration(c.offsetMs)),
        kv('Ticks run', c.ticksRun),
        kv('Last tick', new Date(c.lastTickAt).toLocaleTimeString()),
        kv('RNG seed / state', `${state.rng.seed} / ${state.rng.state}`),
        kv('Timers waiting', state.timers.map((t) => `${t.type} in ${formatDuration(t.at - now)}`).join(', ') || 'none'),
        kv('Save size', `${(JSON.stringify(state).length / 1024).toFixed(1)} KB`)),
    );
  }
}

function kv(key, value) {
  return [el('dt', {}, key), el('dd', {}, String(value))];
}

async function copy(area) {
  try {
    await navigator.clipboard.writeText(area.value);
    toast('Copied.');
  } catch {
    area.select();
    document.execCommand('copy');
    toast('Copied.');
  }
}
