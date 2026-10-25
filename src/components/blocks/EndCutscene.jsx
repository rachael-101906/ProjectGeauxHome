import { useEffect, useRef, useState } from "react";
import { stopMusic } from "../../systems/music.js";
import endScene from "../PGH-End Scene.mp4";
import "../css/game-ui.css";

const THE_END_MS = 3500;

// Final cutscene: plays the ending video, then "THE END", then calls onFinish().
export default function EndCutscene({ onFinish }) {
  const videoRef = useRef(null);
  const [needsClick, setNeedsClick] = useState(false);
  const [ended, setEnded] = useState(false);

  // The video has its own sound, so silence the game music.
  useEffect(() => { stopMusic({ fadeMs: 600 }); }, []);

  useEffect(() => {
    const video = videoRef.current;
    video?.play().catch(() => setNeedsClick(true)); // browser blocked sound: ask for a click
  }, []);

  useEffect(() => {
    if (!ended) return undefined;
    const id = window.setTimeout(onFinish, THE_END_MS);
    return () => window.clearTimeout(id);
  }, [ended, onFinish]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") setEnded(true); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="end-cutscene">
      <video
        className="end-cutscene__video"
        onEnded={() => setEnded(true)}
        playsInline
        ref={videoRef}
        src={endScene}
        style={{ opacity: ended ? 0 : 1 }}
      />
      {needsClick && !ended && (
        <button
          className="game-button end-cutscene__play"
          onClick={() => { setNeedsClick(false); videoRef.current?.play(); }}
          type="button"
        >
          CLICK TO PLAY
        </button>
      )}
      {!ended && (
        <button className="game-button end-cutscene__skip" onClick={() => setEnded(true)} type="button">
          SKIP [ESC]
        </button>
      )}
      {ended && (
        <div className="end-cutscene__end" role="status">
          <h1>THE END</h1>
          <p>THANKS FOR PLAYING PROJECT GEAUX HOME</p>
        </div>
      )}
    </main>
  );
}
