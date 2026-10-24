// ElevenLabs voice lines, fetched through the /api/tts proxy (see vite.config.js).
// Returns { audio, startTimes } where startTimes[i] = second character i is spoken,
// or null if voice is unavailable (no key, offline, static build) — callers then
// fall back to the plain typewriter.

const FALLBACK_VOICE = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs premade voice from their docs
const VOICES = {
  "R.O.V.E.R.": import.meta.env.VITE_ELEVENLABS_VOICE_ROVER || FALLBACK_VOICE,
  "HUGH MANN": import.meta.env.VITE_ELEVENLABS_VOICE_HUGH || FALLBACK_VOICE,
  "MARTY McMARS": import.meta.env.VITE_ELEVENLABS_VOICE_MARTY || FALLBACK_VOICE,
  "DJ-TMONEY": import.meta.env.VITE_ELEVENLABS_VOICE_DJ || FALLBACK_VOICE,
  "DR. OXY GENN": import.meta.env.VITE_ELEVENLABS_VOICE_OXY || FALLBACK_VOICE,
};

const MUTE_KEY = "project-geaux-home:voice-muted";
export const isVoiceMuted = () => localStorage.getItem(MUTE_KEY) === "1";
export const setVoiceMuted = (muted) => localStorage.setItem(MUTE_KEY, muted ? "1" : "0");

const cache = new Map();
let voiceDisabled = false; // stop retrying after the proxy says there's no key

export async function loadVoiceLine(text, speaker) {
  if (voiceDisabled || isVoiceMuted() || !text) return null;
  const voiceId = VOICES[speaker] || FALLBACK_VOICE;
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
          if (res.status === 503 || res.status === 404) voiceDisabled = true;
          if (!res.ok) throw new Error(`TTS ${res.status}`);
          const data = await res.json();
          const bytes = Uint8Array.from(atob(data.audio_base64), (c) => c.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
          return { url, startTimes: data.alignment?.character_start_times_seconds ?? [] };
        })
        .catch((error) => {
          cache.delete(key);
          console.warn("Voice unavailable, using typewriter:", error.message);
          return null;
        }),
    );
  }
  const line = await cache.get(key);
  return line ? { audio: new Audio(line.url), startTimes: line.startTimes } : null;
}
