# Undercut

A real-time idle economy game: run a crafting shop in a fantasy capital and beat the auction house.

- Design: [docs/DESIGN.md](docs/DESIGN.md)
- Project rules: [CLAUDE.md](CLAUDE.md)

## Playing locally

ES modules don't run from a double-clicked file. From the repo folder run:

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

then open http://localhost:8000/ and hard refresh (Ctrl+Shift+R) after changes.

## Engine checks

```
node tools/engine-check.js
```

Tests the clock, catch-up, random generator and saves. Every line should say PASS.
