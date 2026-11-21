// audio.js — all sound is procedural WebAudio (oscillators, no audio files).
// Audio only starts after a user gesture; every call is guarded so the game
// runs fine with no audio context at all (headless screenshot staging).

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function ensureAudio() {
  if (audioContext) return audioContext;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  } catch (err) {
    audioContext = null;
  }
  return audioContext;
}

function tone(freq, durationMs, type, volume, whenMs, slideTo) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const start = ctx.currentTime + (whenMs || 0) / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + durationMs / 1000);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.12, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationMs / 1000 + 0.05);
  } catch (err) {
    // Sound must never break the game.
  }
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(660, 140, 'sine', 0.14, 0);
  tone(990, 220, 'sine', 0.12, 90);
}

// A soft low thud for a wrong click.
export function playWrong() {
  tone(140, 160, 'triangle', 0.1, 0, 90);
}

// A gentle shimmer when a hint is spent.
export function playHint() {
  tone(520, 120, 'sine', 0.08, 0, 780);
  tone(780, 160, 'sine', 0.07, 110, 1040);
}

// A rising arpeggio when a scene is complete.
export function playSceneComplete() {
  tone(523, 150, 'triangle', 0.12, 0);
  tone(659, 150, 'triangle', 0.12, 130);
  tone(784, 150, 'triangle', 0.12, 260);
  tone(1047, 320, 'triangle', 0.12, 390);
}

// A warm fanfare for the final results screen.
export function playFinalFanfare() {
  tone(523, 180, 'triangle', 0.12, 0);
  tone(659, 180, 'triangle', 0.12, 160);
  tone(784, 180, 'triangle', 0.12, 320);
  tone(1047, 220, 'triangle', 0.12, 480);
  tone(784, 220, 'triangle', 0.1, 700);
  tone(1047, 420, 'triangle', 0.12, 920);
}

// A single click tick for buttons and the title screen.
export function playClick() {
  tone(440, 70, 'sine', 0.08, 0);
}
