// Which pre-made audio file plays for which line of dialogue.
//
// Put the audio files in: src/components/assets/voice/
// and name them using the file names below. (.mp3 is assumed; to use .wav/.m4a just
// change the extension in FILE_EXT or in an override.) Any line without a file falls
// back to live ElevenLabs (if a key is set) or to the silent typewriter.
//
// Run `npm run voice:list` to print every file name next to the line it should say.

import {
  rover_dialogue,
  rover_travel_line,
  TRADER_DIALOGUE,
  user_dialogue,
} from "./dialogue.js";

const FILE_EXT = ".mp3";

// Trader ids in dialogue.js -> short file prefixes.
const TRADER_PREFIX = { martian: "oxy", human: "mcmars", robot: "djcmoney" };

const pad = (n) => String(n).padStart(2, "0");

// Builds [ [fileName, line], ... ] from dialogue.js, so edited lines still match.
export function voiceFileList() {
  const list = [];
  rover_dialogue.forEach((line, i) => list.push([`rover_intro_${pad(i + 1)}`, line]));
  list.push(["rover_travel", rover_travel_line]);
  list.push(["hugh_name", user_dialogue[0]]);
  Object.entries(TRADER_DIALOGUE).forEach(([id, t]) => {
    const p = TRADER_PREFIX[id] ?? id;
    t.intro.forEach((line, i) => list.push([`${p}_intro_${pad(i + 1)}`, line]));
    list.push([`${p}_repeat`, t.repeat]);
    list.push([`${p}_prompt`, t.prompt]);
    t.topics.forEach((topic, i) => list.push([`${p}_topic_${pad(i + 1)}`, topic.reply]));
    list.push([`${p}_farewell`, t.farewell]);
  });
  return list.filter(([, line]) => line).map(([name, line]) => [name + FILE_EXT, line]);
}

// Optional: map any other exact line to a file name of your choice.
// e.g. "Ughh... where am I?": "hugh_wake_up.mp3",
const OVERRIDES = {};

// line text -> file name (what systems/voice.js reads)
export const VOICE_FILES = {
  ...Object.fromEntries(voiceFileList().map(([file, line]) => [line, file])),
  ...OVERRIDES,
};
