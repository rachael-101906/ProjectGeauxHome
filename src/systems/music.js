// Background music: one looping track at a time with fade in/out.
// It's a module-level singleton so a track can carry over between screens
// (the intro music starts on the mission briefing and keeps playing into the game).
import introTrack from "../components/audio/intro.mp3";
import bossTrack from "../components/audio/final_boss.mp3";

export const TRACKS = { intro: introTrack, boss: bossTrack };

const VOLUME = 0.5;
// Named volume levels so screens agree: loud on the menu, quieter under gameplay.
export const MUSIC_LEVELS = { menu: 0.45, gameplay: 0.10, boss: 0.5 };
const FADE_MS = 1200;
const MUTE_KEY = "project-geaux-home:music-muted";

let current = null; // { name, audio, volume }
let wanted = null; // track we want playing (kept even if the browser blocked autoplay)
let wantedVolume = VOLUME;
let fadeTimers = new Set();
const resumeAt = {}; // track name -> seconds, so a track picks up where it left off
let duckCount = 0; // > 0 while someone is talking: music drops so dialogue is clear
const DUCK_FACTOR = 0.35;
const level = (volume) => volume * (duckCount > 0 ? DUCK_FACTOR : 1);

// Vite hot reload re-runs this file and would lose track of a playing song, leaving it
// stuck at full volume. Remember it on window so the fresh copy can silence it.
if (typeof window !== "undefined" && window.__geauxMusic) {
  window.__geauxMusic.pause();
  window.__geauxMusic = null;
}

export const isMusicMuted = () => {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
};

const activeFade = new WeakMap(); // audio -> interval id, so a new fade replaces the old one

function fade(audio, to, ms, done) {
  if (activeFade.has(audio)) {
    window.clearInterval(activeFade.get(audio));
    fadeTimers.delete(activeFade.get(audio));
  }
  const from = audio.volume;
  const start = performance.now();
  const id = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
    if (t >= 1) {
      window.clearInterval(id);
      fadeTimers.delete(id);
      activeFade.delete(audio);
      done?.();
    }
  }, 50);
  fadeTimers.add(id);
  activeFade.set(audio, id);
}

function retryOnGesture() {
  const retry = () => { if (wanted) playMusic(wanted, { volume: wantedVolume }); };
  window.addEventListener("pointerdown", retry, { once: true });
  window.addEventListener("keydown", retry, { once: true });
}

// volume: 0..1. If the track is already playing, it just fades to the new volume
// (so the menu music carries into the game without restarting).
export function playMusic(name, { volume = VOLUME } = {}) {
  wanted = name;
  wantedVolume = volume;
  if (isMusicMuted()) return;
  // Same track already playing or still starting (current is cleared if play() fails).
  if (current?.name === name) {
    if (current.volume !== volume) {
      current.volume = volume;
      fade(current.audio, level(volume), FADE_MS);
    }
    return;
  }
  if (current && current.name !== name) stopMusic({ keepWanted: true });
  const audio = new Audio(TRACKS[name]);
  audio.loop = true;
  audio.volume = 0;
  audio.currentTime = resumeAt[name] ?? 0;
  current = { name, audio, volume };
  window.__geauxMusic = audio;
  audio.play().then(() => fade(audio, level(volume), FADE_MS)).catch(() => {
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
  resumeAt[old.name] = old.audio.currentTime;
  if (window.__geauxMusic === old.audio) window.__geauxMusic = null;
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
    playMusic(wanted, { volume: wantedVolume });
  }
}

// Dialogue calls duckMusic() when a voice line starts and the returned function when it ends.
export function duckMusic() {
  duckCount += 1;
  if (current) fade(current.audio, level(current.volume), 300);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    duckCount -= 1;
    if (current) fade(current.audio, level(current.volume), 600);
  };
}