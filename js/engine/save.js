// Saving, loading, migrations and the export code.
// `storage` is anything with getItem/setItem/removeItem: localStorage in the
// browser, or a plain stand-in object in Node.

import { SAVE_VERSION, checkSave } from './game.js';
import { createStations } from './crafting.js';
import { createSkills } from './skills.js';

// Every key starts with "undercut:" because other games share this web address.
export const SAVE_KEY = 'undercut:save';
export const BACKUP_KEY = 'undercut:save-backup';

const EXPORT_PREFIX = 'UNDERCUT';

// One function per old version, upgrading a save by exactly one version.
// When the save shape changes: bump SAVE_VERSION in game.js and add a step here.
const migrations = {
  // Version 2 (Phase 1): adds bags, the mailbox and the auction house.
  // The market is built fresh on the next catch-up.
  1: (save) => {
    save.bags = {};
    save.mailbox = { copper: 0, items: {} };
    save.market = null;
    return save;
  },
  // Version 3 (Phase 1): adds workstation queues and the tavern.
  // The tavern board is rolled on the next catch-up.
  2: (save) => {
    save.stations = createStations();
    save.tavern = null;
    return save;
  },
  // Version 4 (Phase 2): adds profession skill and ranks. Everyone starts at
  // skill 1, Apprentice, whatever they crafted before.
  3: (save) => {
    save.skills = createSkills();
    return save;
  },
};

export function migrate(save) {
  if (typeof save !== 'object' || save === null || !Number.isInteger(save.version)) {
    throw new Error('This is not an Undercut save.');
  }
  if (save.version > SAVE_VERSION) {
    throw new Error('This save comes from a newer version of the game. Hard refresh and try again.');
  }
  while (save.version < SAVE_VERSION) {
    const step = migrations[save.version];
    if (!step) throw new Error(`No upgrade path from save version ${save.version}.`);
    save = step(save);
    save.version++;
  }
  return checkSave(save);
}

export function writeSave(storage, state) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

// Returns the saved game, or null when there is none.
export function readSave(storage) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  return migrate(JSON.parse(raw));
}

// ---- Backups -------------------------------------------------------------
// "New game", import and restore keep the replaced save. The newest is
// undercut:save-backup, then -2 and -3; older ones drop off.
const BACKUP_KEYS = [BACKUP_KEY, `${BACKUP_KEY}-2`, `${BACKUP_KEY}-3`];

export function pushBackup(storage, raw) {
  for (let i = BACKUP_KEYS.length - 1; i > 0; i--) {
    const older = storage.getItem(BACKUP_KEYS[i - 1]);
    if (older) storage.setItem(BACKUP_KEYS[i], older);
  }
  storage.setItem(BACKUP_KEYS[0], raw);
}

export function backupAndClear(storage) {
  const raw = storage.getItem(SAVE_KEY);
  if (raw) pushBackup(storage, raw);
  storage.removeItem(SAVE_KEY);
}

// [{ key, name, faction, savedAt }] for the settings screen. Unreadable backups are skipped.
export function listBackups(storage) {
  const out = [];
  for (const key of BACKUP_KEYS) {
    try {
      const s = JSON.parse(storage.getItem(key));
      if (s?.player) out.push({ key, name: s.player.name, factionId: s.player.factionId, savedAt: s.clock?.lastSeenAt });
    } catch { /* skip */ }
  }
  return out;
}

// Loads a backup. The caller swaps it in; the current game becomes a backup.
export function readBackup(storage, key) {
  if (!BACKUP_KEYS.includes(key)) throw new Error('No such backup.');
  const raw = storage.getItem(key);
  if (!raw) throw new Error('That backup is gone.');
  return migrate(JSON.parse(raw));
}

// ---- Export code -------------------------------------------------------
// Format: UNDERCUT<version>.<base64 of the save JSON>.<checksum>
// The checksum catches codes that were cut short or mangled when pasted.

export function encodeExport(state) {
  const json = JSON.stringify(state);
  return `${EXPORT_PREFIX}${state.version}.${toBase64(json)}.${checksum(json)}`;
}

export function decodeExport(code) {
  const parts = code.replace(/\s+/g, '').split('.');
  if (parts.length !== 3 || !parts[0].startsWith(EXPORT_PREFIX)) {
    throw new Error("That doesn't look like an Undercut save code.");
  }
  let json;
  try {
    json = fromBase64(parts[1]);
  } catch {
    throw new Error('The save code is damaged. Copy the whole code and try again.');
  }
  if (checksum(json) !== parts[2]) {
    throw new Error('The save code is incomplete or damaged. Copy the whole code and try again.');
  }
  return migrate(JSON.parse(json));
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// FNV-1a hash, as 8 hex digits.
function checksum(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
