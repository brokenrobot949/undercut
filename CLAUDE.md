# Undercut — project rules

## Working with Rob
- Rob is the game designer and has no coding experience. After each session, explain what changed in plain language.
- `docs/DESIGN.md` is the source of truth. When Rob changes a design decision, update it.
- Build in the phases from DESIGN.md, in small, testable slices. Current phase: Phase 1 (The market, with Blacksmithing tiers 1–2).
- Rob commits and pushes with GitHub Desktop. Do not run `git push` unless Rob asks.

## Models and delegation
- Opus 5.5 leads: architecture, the market engine, clock and catch-up, saves, balance tuning, and review of all delegated work.
- Delegate to Sonnet when it saves time: data files written to schemas Opus defines, UI screens built from existing components, the credits lists.
- Delegate to Haiku for mechanical checks: recipe materials exist, every item has an icon and tier color, no banned names.
- Every delegated task gets the schema, the IP rules below and a definition of done. Review the result before it lands.
- At each phase gate, a fresh agent that has not seen the work runs the balance simulator and the phone screenshots and reports problems.

## Hard constraints
- Static site on GitHub Pages: plain HTML, CSS and JavaScript ES modules (`import` / `export`).
- No build step, no npm packages, no frameworks, no CDN links, no external network requests. Every file, including fonts, icons and sounds, lives in this repo.
- Relative paths only (`./js/main.js`). The live site is served from the `/undercut/` subfolder, so paths starting with `/` break online.
- Lowercase, hyphenated file and folder names. GitHub Pages is case-sensitive.
- Mobile-first portrait layout that also works on desktop.

## IP rules
- Never use World of Warcraft proper nouns in code, data, comments or UI text: no Orgrimmar, Stormwind, Horde, Alliance, Azeroth, Tauren or Forsaken, and no WoW zone, item, recipe, NPC or material names (Arcanite, Truesilver, Thorium, Mageweave, Runecloth, Black Lotus and the like).
- Generic words are fine: Blacksmithing, Herbalism, Orc, Dwarf, Warrior, Paladin, copper, linen, Exalted.
- Use names from DESIGN.md, or new original names.
- No WoW art, icons, sounds or fonts.

## Architecture
- Folder structure: see the Technical architecture section of `docs/DESIGN.md`.
- `js/engine/` holds game logic and never touches the DOM, so `tools/balance-sim.js` can run it in Node.
- `js/ui/` renders engine state, one module per tab plus shared components.
- `data/` holds all content and tunable numbers as ES modules exporting plain arrays and objects, with short comments so Rob can safely edit them. `data/tuning.js` holds global settings. Never hardcode content in engine files.
- One seeded random number generator, stored in the save.
- One clock module. Everything is scheduled by timestamp. On load, catch-up replays missed 10-minute market ticks in order, exact for up to 7 days.
- Faction themes are CSS custom properties in `css/theme-red.css` and `css/theme-blue.css`.

## Saves
- localStorage only. Prefix every key with `undercut:` because Rob's other games share the same github.io address.
- Every save includes a version number, with a migration path for older saves.
- Save after each action, every 30 seconds, and on `visibilitychange`.
- Export and import the full save as a copyable text code.

## Icons and fonts
- Icons come from game-icons.net (CC BY 3.0). Copy only the SVGs the game uses into `assets/icons/`, from Rob's local download.
- Icons use `currentColor` so CSS can tint them by material tier. Quality shows as the tile's border color.
- Keep `assets/icons/CREDITS.md` (icon and artist) and show every artist on the in-game Credits screen.
- Heading font: an open-license font file in `assets/fonts/`. Body text uses the system font.

## Sound (Phase 4)
- A small set of effects: coins on collect, sold, hero return, craft complete. No music.
- Files come from a CC0 sound pack in Rob's local download. Copy only the ones used into `assets/sounds/` and list them in `assets/sounds/CREDITS.md`.
- Use short .mp3 files so every phone browser can play them; convert from .ogg if the pack ships .ogg.
- Play nothing until the player's first tap (browser autoplay rules). Include a mute toggle, saved with the game.

## Testing
- Opening `index.html` directly won't work because of ES modules. Start a local static server from the repo root and give Rob the address.
- Remind Rob to hard refresh after changes.
- Keep debug mode working: fast-forward 1 h, 8 h or 24 h; add gold and materials; set skill; force an event; show market internals.
- Run `node tools/engine-check.js` after any change in `js/engine/`; every line must say PASS.
- Run `node tools/balance-sim.js` after any tuning change, and summarize milestone days and any flooded or never-sold items.
- Before calling a phase done, check every tab at phone size (390 × 844) in both themes, with screenshots if a headless browser is available, otherwise by asking Rob to check on his phone.
