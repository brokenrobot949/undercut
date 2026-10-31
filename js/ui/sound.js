// Sound effects. Browsers block sound until the player taps the page, so
// nothing loads or plays before the first tap. The mute switch is saved with
// the game (state.settings.mute). Files and credits: assets/sounds/.

const SOUNDS = ['coins', 'sold', 'hero-return', 'craft-complete'];
const VOLUME = 0.6;

let ctx = null;      // the shared app context, for the mute setting
let unlocked = false;
const clips = {};

export function initSound(appCtx) {
  if (ctx) return; // already listening (a new game reuses the same context)
  ctx = appCtx;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    for (const name of SOUNDS) {
      const audio = new Audio(`./assets/sounds/${name}.mp3`);
      audio.preload = 'auto';
      audio.volume = VOLUME;
      clips[name] = audio;
    }
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

// Plays one effect, unless muted or the player hasn't tapped yet.
export function playSound(name) {
  if (!unlocked || !clips[name] || ctx?.state?.settings?.mute) return;
  // A copy lets the same sound overlap itself (two sales in a row).
  const audio = clips[name].paused ? clips[name] : clips[name].cloneNode();
  audio.volume = VOLUME;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
