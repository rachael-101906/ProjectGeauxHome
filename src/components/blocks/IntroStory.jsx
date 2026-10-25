import { useEffect } from "react";
import { playMusic } from "../../systems/music.js";
import "../css/game-ui.css";

export default function IntroStory({ onBeginMission }) {
  // Intro music starts with the briefing and keeps playing into the game until Hugh wakes up.
  useEffect(() => { playMusic("intro"); }, []);

  return (
    <main className="game-ui-screen intro-story">
      <section
        className="game-panel intro-story__panel"
        aria-labelledby="mission-briefing-title"
      >
        <p className="game-eyebrow">PROJECT GEAUX HOME // FIELD REPORT 01</p>
        <h1 className="game-title" id="mission-briefing-title">
          MISSION BRIEFING
        </h1>

        <div className="intro-story__narrative">
          <p className="intro-story__year">YEAR 2089</p>
          <p>
            YOUR TRANSPORT HAS CRASHED
            <br />
            ON THE PLANET MARS, IN THE DESERT REGION OF ARCADIA PLANITIA.
          </p>
          <p>
            YOUR LIFE SUPPORT SYSTEMS
            <br />
            ARE DAMAGED, YOUR COMMS ARE BUSTED, AND YOUR SHIP IS IN TATTERS. 
            <br />
            WILL YOU BE ABLE TO GEAUX HOME?
          </p>
        </div>

        <div className="intro-story__objectives">
          <h2 className="game-section-title">CURRENT OBJECTIVE:</h2>
          <p>FIND R.O.V.E.R.</p>
        </div>

        <button
          className="game-button intro-story__begin"
          onClick={onBeginMission}
          type="button"
        >
          BEGIN MISSION
        </button>
      </section>
    </main>
  );
}
