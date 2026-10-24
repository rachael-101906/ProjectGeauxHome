import { useEffect, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";

const missionObjectives = [
  { name: "Communication Array", progress: 0 },
  { name: "Life Support Core", progress: 0 },
  { name: "Power System", progress: 0 },
  { name: "Propulsion Engine", progress: 0 },
];

export default function Base({ onMainMenu, onSave, saveError, savedGame }) {
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [selectedTool, setSelectedTool] = useState(
    savedGame.selectedTool || "Drill",
  );

  useEffect(() => {
    onSave({
      selectedTool,
      currentObjective: savedGame.currentObjective,
      objectives: savedGame.objectives,
    });
  }, [onSave, savedGame.currentObjective, savedGame.objectives, selectedTool]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();

        if (objectivesOpen && !paused && event.key === "Escape") {
          setObjectivesOpen(false);
          return;
        }

        setObjectivesOpen(false);
        setPaused((isPaused) => !isPaused);
        setPauseNotice("");
        return;
      }

      if (paused) {
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        setObjectivesOpen((isOpen) => !isOpen);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objectivesOpen, paused]);

  return (
    <main className="mission-screen">
      <div aria-hidden="true" className="mission-landscape">
        <div className="mission-sun" />
        <div className="mission-ridge mission-ridge--distant" />
        <div className="mission-ridge mission-ridge--near" />
        <div className="mission-ground" />
      </div>

      <header className="mission-location">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
        <h1>ARCADIA PLANITIA</h1>
        <p>CRASH SITE // SECTOR 01</p>
      </header>

      {saveError && (
        <p aria-live="assertive" className="mission-save-error" role="alert">
          SAVE ERROR: {saveError}
        </p>
      )}

      <HUD
        currentObjective={savedGame.currentObjective}
        onSelectTool={setSelectedTool}
        selectedTool={selectedTool}
      />

      <div className="mission-actions">
        <button
          className="game-button"
          onClick={() => !paused && setObjectivesOpen(true)}
          type="button"
        >
          OBJECTIVES [TAB]
        </button>
        <button
          className="game-button"
          onClick={() => {
            setObjectivesOpen(false);
            setPaused(true);
          }}
          type="button"
        >
          PAUSE [ESC]
        </button>
      </div>

      <ObjectivesMenu
        isOpen={objectivesOpen && !paused}
        objectives={savedGame.objectives || missionObjectives}
        onClose={() => setObjectivesOpen(false)}
      />
      {paused && (
        <PauseMenu
          onControls={() =>
            setPauseNotice("TAB: OBJECTIVES  //  ESC OR P: RESUME")
          }
          onMainMenu={onMainMenu}
          onQuit={() =>
            setPauseNotice("CLOSE THIS BROWSER TAB TO QUIT THE GAME.")
          }
          onResume={() => {
            setPaused(false);
            setPauseNotice("");
          }}
          onSettings={() => setPauseNotice("NO CONFIGURABLE SETTINGS YET.")}
          notice={pauseNotice}
        />
      )}
    </main>
  );
}