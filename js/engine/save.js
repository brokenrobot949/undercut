// Saving, loading, migrations and the export code.
// `storage` is anything with getItem/setItem/removeItem: localStorage in the
// browser, or a plain stand-in object in Node.

import { SAVE_VERSION } from './game.js';

// Every key starts with "undercut:" because other games share this web address.
export const SAVE_KEY = 'undercut:save';
export const BACKUP_KEY = 'undercut:save-backup';

const EXPORT_PREFIX = 'UNDERCUT';

// One function per old version, upgrading a save by exactly one version.
// When the save shape changes: bump SAVE_VERSION in game.js and add a step here.
const migrations = {
  // 1: (save) => { save.newThing = 0; return save; },
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
  return save;
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

// Keeps a copy of the old save before "New game" or an import replaces it.
export function backupAndClear(storage) {
  const raw = storage.getItem(SAVE_KEY);
  if (raw) storage.setItem(BACKUP_KEY, raw);
  storage.removeItem(SAVE_KEY);
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
