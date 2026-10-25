import { useEffect, useRef, useState } from "react";
import roverPortrait from "./assets/characters/rover.png";
import hughPortrait from "./assets/characters/Hugh.png";
import { CAPTAIN_HUMAN, CLAW_BIT, OXY_FRAMES } from "../data/art.js";
import { isVoiceMuted, setVoiceMuted } from "../systems/voice.js";
import { duckMusic } from "../systems/music.js";

// Who's talking -> name + portrait (Hugh / R.O.V.E.R. use the cropped sprite style).
const SPEAKERS = {
  hugh: { name: "HUGH MANN", crop: "hugh", image: hughPortrait },
  rover: { name: "R.O.V.E.R.", crop: "rover", image: roverPortrait },
  oxy: { name: "DR OXY GENN", image: OXY_FRAMES?.[0] },
  mcmars: { name: "CAPTAIN McMARS", image: CAPTAIN_HUMAN },
  djc: { name: "DJ-CMONEY", image: CLAW_BIT },
};

const END_HOLD_S = 0.6; // keep the last line up briefly after the audio ends
const CAPTION_LEAD_S = 0.05; // show each word a hair early so it never trails the voice

/**
 * Plays one recorded scene (see data/voiceScenes.js) with captions synced to the audio.
 *  - Each line types out over its own start->end window, so text matches the voice.
 *  - The portrait + name switch to whoever is speaking.
 *  - If the audio can't play (muted, autoplay blocked, missing file) the same timings
 *    drive the captions from a clock, so the scene still works silently.
 *
 * Props:
 *  scene        the scene object
 *  interactive  true for story scenes: E/Enter/Space = next line, Esc = skip scene.
 *               false for small trade barks (click the box to skip; keys stay free).
 *  endActions   optional [{ label, onClick }] buttons shown after the last line
 *               (otherwise onDone fires automatically).
 *  onDone       called once when the scene finishes or is skipped.
 */
export default function VoicedScene({ scene, interactive = true, endActions, onDone, className = "" }) {
  const [, setTick] = useState(0);
  const [muted, setMuted] = useState(isVoiceMuted);
  const state = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Lower the background music while this scene is on screen.
  useEffect(() => duckMusic(), []);

  // --- Playback clock -------------------------------------------------------
  useEffect(() => {
    const s = {
      audio: null,
      useAudio: false,
      clockStart: performance.now(), // used when there's no audio
      offset: 0,
      finished: false,
      raf: 0,
    };
    state.current = s;

    if (scene.url) {
      const audio = new Audio(scene.url);
      audio.muted = isVoiceMuted();
      s.audio = audio;
      audio.play().then(
        () => {
          s.useAudio = true;
        },
        () => {
          // Autoplay blocked etc.: keep captions running on the clock.
          s.audio = null;
        },
      );
    }

    const loop = () => {
      setTick((n) => (n + 1) % 1e6);
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf);
      s.audio?.pause();
    };
  }, [scene]);

  const s = state.current;
  const now = () => {
    if (!s) return 0;
    if (s.useAudio && s.audio) return s.audio.ended ? scene.duration + END_HOLD_S : s.audio.currentTime;
    return (performance.now() - s.clockStart) / 1000 + s.offset;
  };
  const t = now();

  // Current line = last one that has started.
  let index = 0;
  scene.lines.forEach((line, i) => {
    if (line.start <= t + CAPTION_LEAD_S) index = i;
  });
  const line = scene.lines[index];
  const progress = Math.min(1, Math.max(0, (t - line.start) / Math.max(0.3, line.end - line.start)));
  // Word-by-word reveal: every word that has started is shown; the word being spoken
  // right now types out across its own duration. Keeps text locked to the voice.
  const visible = line.words
    ? line.words
        .filter(([start]) => start <= t + CAPTION_LEAD_S)
        .map(([start, end, word]) => {
          const p = Math.min(1, (t + CAPTION_LEAD_S - start) / Math.max(0.08, end - start));
          return word.slice(0, Math.max(1, Math.ceil(word.length * p)));
        })
        .join(" ")
    : line.text.slice(0, Math.ceil(line.text.length * progress));
  const finished = t >= scene.duration + END_HOLD_S;

  function seek(time) {
    if (!s) return;
    if (s.useAudio && s.audio) {
      s.audio.currentTime = Math.min(time, s.audio.duration || time);
    } else {
      s.offset += time - now();
    }
  }

  function finish() {
    if (!s || s.finished) return;
    s.finished = true;
    s.audio?.pause();
    doneRef.current?.();
  }

  // Auto-finish when there are no end buttons to wait for.
  useEffect(() => {
    if (finished && !endActions?.length) finish();
  });

  function next() {
    if (finished) {
      if (endActions?.length === 1) endActions[0].onClick();
      return;
    }
    const upcoming = scene.lines[index + 1];
    // Finish the current line first, then jump to the next one.
    if (progress < 1) seek(line.end);
    else if (upcoming) seek(upcoming.start);
    else seek(scene.duration + END_HOLD_S);
  }

  function skipAll() {
    if (endActions?.length) seek(scene.duration + END_HOLD_S);
    else finish();
  }

  // --- Keyboard (story scenes only) -----------------------------------------
  const keyRef = useRef({});
  keyRef.current = { next, skipAll, finished, endActions };
  useEffect(() => {
    if (!interactive) return undefined;
    function onKey(event) {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      const k = keyRef.current;
      if (k.finished && k.endActions?.length) {
        const n = Number(key);
        if (n >= 1 && n <= k.endActions.length) {
          event.preventDefault();
          k.endActions[n - 1].onClick();
        }
      }
      if (key === "e" || key === "enter" || key === " ") {
        event.preventDefault();
        event.stopImmediatePropagation();
        k.next();
      } else if (key === "escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        k.skipAll();
      }
    }
    // Capture phase so the game's own E / Esc handlers don't also fire.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [interactive]);

  function toggleMute() {
    const next = !muted;
    setVoiceMuted(next);
    setMuted(next);
    if (s?.audio) s.audio.muted = next;
  }

  const speaker = SPEAKERS[line.who] ?? SPEAKERS.hugh;

  return (
    <aside
      className={`rover-tab rover-tab--open voiced-scene${interactive ? "" : " voiced-scene--bark"} ${className}`}
      onClick={interactive ? undefined : finish}
    >
      <div className={`rover-dialogue rover-dialogue--${speaker.crop ?? "npc"}`}>
        <div className="rover-dialogue__portrait" aria-hidden="true">
          {speaker.crop ? (
            <span
              className={`portrait-crop portrait-crop--${speaker.crop}`}
              style={{ backgroundImage: `url("${speaker.image}")` }}
            />
          ) : (
            <img className="portrait-sprite" src={speaker.image} alt="" draggable="false" />
          )}
        </div>
        <div className="rover-dialogue__content">
          <div className="rover-dialogue__speaker">
            {speaker.name}
            <button
              aria-label={muted ? "Unmute voice" : "Mute voice"}
              className="rover-dialogue__mute"
              onClick={(event) => {
                event.stopPropagation();
                toggleMute();
              }}
              type="button"
            >
              {muted ? "VOICE OFF" : "VOICE ON"}
            </button>
          </div>
          <p aria-live="polite" className="rover-dialogue__text">
            {finished ? line.text : visible}
            <span aria-hidden="true" className="rover-dialogue__cursor">▌</span>
          </p>
          {finished && endActions?.length > 0 ? (
            <div className="rover-dialogue__actions">
              {endActions.map((action, i) => (
                <button className="rover-dialogue__choice" key={action.label} onClick={action.onClick} type="button">
                  {endActions.length > 1 ? `${i + 1}. ` : ""}
                  {action.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="voiced-scene__hint">
              {interactive ? "[E] NEXT  ·  [ESC] SKIP" : "CLICK TO SKIP"}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}