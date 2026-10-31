// Copies the icons named in data/icons.js from the unzipped game-icons.net
// download into assets/icons/, recolors them to currentColor, deletes icons
// no longer used, and rewrites assets/icons/CREDITS.md and data/icon-credits.js.
//
// Run: node tools/copy-icons.js "<unzipped folder>\icons\ffffff\000000\1x1"
// (the folder that holds one subfolder per artist).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemIcons, uiIcons } from '../data/icons.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error('Give the folder that holds one subfolder per artist.');
  process.exit(1);
}

// game-icons.net folder names, shown as each artist's name.
const ARTISTS = {
  'andymeneely': 'Andy Meneely', 'aussiesim': 'Aussiesim', 'carl-olsen': 'Carl Olsen',
  'caro-asercion': 'Caro Asercion', 'cathelineau': 'Cathelineau', 'catsu': 'Catsu',
  'darkzaitzev': 'DarkZaitzev', 'delapouite': 'Delapouite', 'faithtoken': 'Faithtoken',
  'felbrigg': 'Felbrigg', 'generalace135': 'GeneralAce135', 'guard13007': 'Guard13007',
  'heavenly-dog': 'HeavenlyDog', 'irongamer': 'Irongamer', 'john-colburn': 'John Colburn',
  'john-redman': 'John Redman', 'kier-heyl': 'Kier Heyl', 'lorc': 'Lorc',
  'lord-berandas': 'Lord Berandas', 'lucasms': 'Lucas', 'pepijn-poolman': 'Pepijn Poolman',
  'pierre-leducq': 'Pierre Leducq', 'priorblue': 'PriorBlue', 'quoting': 'Quoting',
  'rihlsul': 'Rihlsul', 'sbed': 'Sbed', 'seregacthtuf': 'Seregacthtuf', 'skoll': 'Skoll',
  'sparker': 'Sparker', 'spencerdub': 'SpencerDub', 'starseeker': 'Starseeker',
  'various-artists': 'Various artists', 'viscious-speed': 'Viscious Speed',
  'willdabeast': 'Willdabeast', 'zajkonur': 'Zajkonur', 'zeromancer': 'Zeromancer',
};

const refs = new Set([...Object.values(itemIcons), ...Object.values(uiIcons)].map((x) => x.icon));
const byName = new Map(); // file name -> artist
for (const ref of refs) {
  const [artist, name] = ref.split('/');
  if (byName.has(name) && byName.get(name) !== artist) throw new Error(`Two artists' icons are both called ${name}.`);
  byName.set(name, artist);
}

const out = path.join(root, 'assets', 'icons');
for (const f of fs.readdirSync(out)) if (f.endsWith('.svg') && !byName.has(f.slice(0, -4))) fs.unlinkSync(path.join(out, f));

for (const [name, artist] of byName) {
  const file = path.join(src, artist, `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Missing icon ${artist}/${name}.`);
  const svg = fs.readFileSync(file, 'utf8')
    .replace('<path d="M0 0h512v512H0z"/>', '') // the black square behind every icon
    .replaceAll('fill="#fff"', 'fill="currentColor"');
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
}

const rows = [...byName].sort((a, b) => a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(out, 'CREDITS.md'), `# Icon credits

Icons from [game-icons.net](https://game-icons.net), licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
Only icons the game uses are copied here, recolored to one tintable color. Every artist listed below is also shown on the in-game Credits screen.
This file is written by \`node tools/copy-icons.js\`.

| Icon file | Artist |
| --- | --- |
${rows.map(([n, a]) => `| ${n}.svg | ${ARTISTS[a] ?? a} |`).join('\n')}
`);

const counts = {};
for (const [, a] of rows) counts[ARTISTS[a] ?? a] = (counts[ARTISTS[a] ?? a] ?? 0) + 1;
const artists = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(root, 'data', 'icon-credits.js'), `// Icon artists shown on the Credits screen. Written by \`node tools/copy-icons.js\`; don't edit by hand.

export const iconArtists = [
${artists.map(([n, c]) => `  { name: ${JSON.stringify(n)}, icons: ${c} },`).join('\n')}
];
`);
console.log(`Copied ${rows.length} icons by ${artists.length} artists.`);
