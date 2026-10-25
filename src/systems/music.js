// Background music: one looping track at a time with fade in/out.
// It's a module-level singleton so a track can carry over between screens
// (the intro music starts on the mission briefing and keeps playing into the game).
import introTrack from "../components/audio/intro.mp3";
import bossTrack from "../components/audio/final_boss.mp3";

export const TRACKS = { intro: introTrack, boss: bossTrack };

const VOLUME = 0.5;
const FADE_MS = 1200;
const MUTE_KEY = "project-geaux-home:music-muted";

let current = null; // { name, audio }
let wanted = null; // track we want playing (kept even if the browser blocked autoplay)
let fadeTimers = new Set();

export const isMusicMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
};

function fade(audio, to, ms, done) {
  const from = audio.volume;
  const start = performance.now();
  const id = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
    if (t >= 1) {
      window.clearInterval(id);
      fadeTimers.delete(id);
      done?.();
    }
  }, 50);
  fadeTimers.add(id);
}

function retryOnGesture() {
  const retry = () => { if (wanted) playMusic(wanted); };
  window.addEventListener("pointerdown", retry, { once: true });
  window.addEventListener("keydown", retry, { once: true });
}

export function playMusic(name) {
  wanted = name;
  if (isMusicMuted()) return;
  if (current?.name === name && !current.audio.paused) return;
  if (current && current.name !== name) stopMusic({ keepWanted: true });
  const audio = new Audio(TRACKS[name]);
  audio.loop = true;
  audio.volume = 0;
  current = { name, audio };
  audio.play().then(() => fade(audio, VOLUME, FADE_MS)).catch(() => {
    // Browsers block audio until the player clicks or presses a key; try again then.
    if (current?.audio === audio) current = null;
    retryOnGesture();
  });
}

export function stopMusic({ fadeMs = FADE_MS, keepWanted = false } = {}) {
  if (!keepWanted) wanted = null;
  const old = current;
  current = null;
  if (!old) return;
  fade(old.audio, 0, fadeMs, () => { old.audio.pause(); old.audio.src = ""; });
}

// Stop only if `name` is what's playing (so a late cleanup can't kill a newer track).
export function stopMusicIf(name, options) {
  if (wanted === name || current?.name === name) stopMusic(options);
}

export function setMusicMuted(muted) {
  try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch { /* ignore */ }
  if (muted) {
    const keep = wanted;
    stopMusic({ fadeMs: 300, keepWanted: true });
    wanted = keep;
  } else if (wanted) {
    playMusic(wanted);
  }
}
