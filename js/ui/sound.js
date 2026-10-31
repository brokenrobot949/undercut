// Sound effects. Browsers block sound until the player taps the page, so
// nothing loads or plays before the first tap. The mute switch is saved with
// the game (state.settings.mute). Files and credits: assets/sounds/.
//
// Uses Web Audio: once the audio context is started inside a tap, iPhone
// Safari lets it play later sounds from timers too (sales, returns, crafts).

const SOUNDS = ['coins', 'sold', 'hero-return', 'craft-complete'];
const VOLUME = 0.6;

let ctx = null;      // the shared app context, for the mute setting
let audio = null;    // the Web Audio context, made on the first tap
let gain = null;
const buffers = {};
const GESTURES = ['pointerdown', 'touchend', 'click', 'keydown'];

export function initSound(appCtx) {
  if (ctx) return; // already listening (a new game reuses the same context)
  ctx = appCtx;
  const unlock = () => {
    if (!audio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio = new Ctx();
      gain = audio.createGain();
      gain.gain.value = VOLUME;
      gain.connect(audio.destination);
      for (const name of SOUNDS) {
        fetch(`./assets/sounds/${name}.mp3`)
          .then((r) => r.arrayBuffer())
          .then((data) => new Promise((ok, fail) => audio.decodeAudioData(data, ok, fail)))
          .then((buffer) => { buffers[name] = buffer; })
          .catch(() => {});
      }
    }
    // Resuming (and playing a silent blip) inside the tap is what unlocks iPhone.
    if (audio.state !== 'running') audio.resume().catch(() => {});
    const blip = audio.createBufferSource();
    blip.buffer = audio.createBuffer(1, 1, 22050);
    blip.connect(audio.destination);
    blip.start(0);
    if (audio.state === 'running') for (const g of GESTURES) window.removeEventListener(g, unlock, true);
  };
  for (const g of GESTURES) window.addEventListener(g, unlock, true);
}

// Plays one effect, unless muted or the player hasn't tapped yet.
export function playSound(name) {
  if (!audio || !buffers[name] || ctx?.state?.settings?.mute) return;
  if (audio.state !== 'running') audio.resume().catch(() => {});
  const source = audio.createBufferSource();
  source.buffer = buffers[name];
  source.connect(gain);
  source.start(0);
}
