import "./game-ui.css";

export default function IntroStory({ onBeginMission }) {
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
            IN ARCADIA PLANITIA.
          </p>
          <p>
            LIFE SUPPORT SYSTEMS
            <br />
            ARE FAILING.
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
