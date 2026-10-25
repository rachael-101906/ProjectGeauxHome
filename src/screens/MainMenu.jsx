// src/screens/MainMenu.jsx

import React from "react";
import { useEffect, useRef, useState } from "react";

import homeBackground from "../components/assets/backgrounds/home-page.png";
import logo from "../components/assets/logos/home_main_logo.png";
import introMusic from "../components/audio/intro.mp3";

export default function MainMenu({ onStartGame }) {
  const [panel, setPanel] = useState(null);
  const musicRef = useRef(null);

  useEffect(() => {
    const music = new Audio(introMusic);
    music.loop = true;
    music.volume = 0.45;
    musicRef.current = music;

    const startMusic = () => {
      music.play().catch(() => {
        // Browsers may require a user gesture before allowing audio playback.
      });
    };

    startMusic();
    window.addEventListener("pointerdown", startMusic, { once: true });
    window.addEventListener("keydown", startMusic, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      music.pause();
      music.currentTime = 0;
      musicRef.current = null;
    };
  }, []);

  return (
    <div
      className="main-menu"
      style={{ backgroundImage: `url("${homeBackground}")` }}
    >
      <div className="logo-frame logo-glow">
        <img
          src={logo}
          alt="Project Geaux Home"
          className="logo"
        />
      </div>

      <div className="menu-buttons">
        <button className="menu-button" onClick={onStartGame}>
          START GAME
        </button>

        <button className="menu-button" onClick={() => setPanel("help")} type="button">
          HELP
        </button>

        <button className="menu-button" onClick={() => setPanel("credits")} type="button">
          CREDITS
        </button>
      </div>

      {panel && (
        <div className="menu-info" role="dialog" aria-modal="true">
          <section className="menu-info__panel">
            <h2>{panel === "help" ? "HOW TO PLAY" : "CREDITS"}</h2>
            {panel === "help" ? (
              <p>Use the arrow keys or W A S D to move Hugh Mann. Reach the edge of Arcadia to travel to another sector.</p>
            ) : (
              <p>PROJECT GEAUX HOME<br />A pixel-art Mars survival adventure. By import hackathon.teamName, GeauxHack2026</p>
            )}
            <button className="menu-button menu-info__close" onClick={() => setPanel(null)} type="button">
              BACK
            </button>
          </section>
        </div>
      )}
    </div>
  );
}