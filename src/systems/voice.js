// Voice lines. Two sources, checked in this order:
//
// 1. PRE-MADE FILES (recommended for the demo: free, instant, works offline + on a static deploy)
//    Drop .mp3/.wav/.m4a files into src/components/assets/voice/ and map each one to the exact
//    line it speaks in src/data/voiceFiles.js.
//
// 2. LIVE ELEVENLABS (generates any line on the fly, needs an API key + `npm run dev`/`preview`)
//    Fetched through the /api/tts proxy in vite.config.js. Put ELEVENLABS_API_KEY in .env.local.
//
// Returns { audio, startTimes } (startTimes[i] = second character i is spoken; empty for
// pre-made files, so the dialogue box falls back to the typewriter) or null if no voice.

import { VOICE_FILES } from "../data/voiceFiles.js";

const voiceAssets = import.meta.glob("../components/assets/voice/**/*.{mp3,wav,m4a,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
});
const voiceAssetByName = Object.fromEntries(
  Object.entries(voiceAssets).map(([path, url]) => [path.split("/").pop().toLowerCase(), url]),
);

// Keys are matched case-insensitively ("CAPTAIN McMARS" === "CAPTAIN MCMARS").
const VOICES = {
  "R.O.V.E.R.": import.meta.env.VITE_ELEVENLABS_VOICE_ROVER,
  "HUGH MANN": import.meta.env.VITE_ELEVENLABS_VOICE_HUGH,
  "DR OXY GENN": import.meta.env.VITE_ELEVENLABS_VOICE_OXY,
  "DJ-CMONEY": import.meta.env.VITE_ELEVENLABS_VOICE_DJ,
  "CAPTAIN MCMARS": import.meta.env.VITE_ELEVENLABS_VOICE_MCMARS,
};
// Only speakers with their own voice ID get live audio; anyone else stays silent
// (a generic default voice made characters sound like the wrong person).
const voiceIdFor = (speaker = "") => VOICES[speaker.toUpperCase()] || null;

const MUTE_KEY = "project-geaux-home:voice-muted";
export const isVoiceMuted = () => localStorage.getItem(MUTE_KEY) === "1";
export const setVoiceMuted = (muted) => localStorage.setItem(MUTE_KEY, muted ? "1" : "0");

// Ignore spacing/quote differences when matching a line to its file.
const normalize = (text = "") =>
  text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const fileByLine = new Map(
  Object.entries(VOICE_FILES).map(([line, file]) => [normalize(line), file.toLowerCase()]),
);

// Lines without a file are fine (they use live ElevenLabs or the typewriter).
// `npm run voice:list` shows which files are still missing.

function preMadeLine(text) {
  const url = voiceAssetByName[fileByLine.get(normalize(text))];
  return url ? { audio: new Audio(url), startTimes: [] } : null;
}

const cache = new Map();
let liveVoiceDisabled = false; // stop retrying after the proxy says there's no key

export async function loadVoiceLine(text, speaker) {
  if (isVoiceMuted() || !text) return null;

  const file = preMadeLine(text);
  if (file) return file;

  if (liveVoiceDisabled) return null;
  const voiceId = voiceIdFor(speaker);
  if (!voiceId) return null;
  const key = `${voiceId}|${text}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      })
        .then(async (res) => {
          if (res.status === 503 || res.status === 404) liveVoiceDisabled = true;
          if (!res.ok) throw new Error(`TTS ${res.status}`);
          const data = await res.json();
          const bytes = Uint8Array.from(atob(data.audio_base64), (c) => c.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
          return { url, startTimes: data.alignment?.character_start_times_seconds ?? [] };
        })
        .catch((error) => {
          cache.delete(key);
          console.warn("Live voice unavailable, using typewriter:", error.message);
          return null;
        }),
    );
  }
  const line = await cache.get(key);
  return line ? { audio: new Audio(line.url), startTimes: line.startTimes } : null;
}
