import { useEffect, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/backgrounds/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import RoverDialogue from "../components/RoverDialogue.jsx";
import { rover_dialogue } from "../data/dialogue.js";
import hugh from "../components/assets/characters/Hugh.png";
import hughLeftSway1 from "../components/assets/characters/HughLSway1.png";
import hughLeftSway2 from "../components/assets/characters/HughLSway2.png";
import rover from "../components/assets/backgrounds/rover.png";

const missionObjectives = [
  { name: "Communication Array", progress: 0 },
  { name: "Life Support Core", progress: 0 },
  { name: "Power System", progress: 0 },
  { name: "Propulsion Engine", progress: 0 },
];

const locations = [
  { id: "arcadia", name: "ARCADIA PLANITIA", asset: arcadia },
  { id: "albaMons", name: "ALBA MONS", asset: albaMons },
  { id: "tempeTerra", name: "TEMPE TERRA", asset: tempeTerra },
  { id: "vastitas", name: "VASTITAS BOREALIS", asset: vastitasBorealis },
];

export default function Base({ onMainMenu, onSave, saveError, savedGame }) {
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [selectedTool, setSelectedTool] = useState(
    savedGame.selectedTool || "Drill",
  );
  const [travelTarget, setTravelTarget] = useState(null);
  const [roverOpen, setRoverOpen] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 72 });
  const [playerDirection, setPlayerDirection] = useState("right");
  const [walkingFrame, setWalkingFrame] = useState(0);
  const [roverSequence, setRoverSequence] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const locationIndex = Math.max(
    0,
    locations.findIndex((location) => location.id === (savedGame.location || "arcadia")),
  );
  const currentLocation = locations[locationIndex];
  const previousLocation = locations[(locationIndex - 1 + locations.length) % locations.length];
  const nextLocation = locations[(locationIndex + 1) % locations.length];

  useEffect(() => {
    onSave({
      selectedTool,
      location: savedGame.location || "arcadia",
      currentObjective: savedGame.currentObjective,
      objectives: savedGame.objectives,
    });
  }, [
    onSave,
    savedGame.currentObjective,
    savedGame.location,
    savedGame.objectives,
    selectedTool,
  ]);

  useEffect(() => {
    function handleMovement(event) {
      const directions = {
        ArrowLeft: [-2, 0],
        a: [-2, 0],
        ArrowRight: [2, 0],
        d: [2, 0],
        ArrowUp: [0, -2],
        w: [0, -2],
        ArrowDown: [0, 2],
        s: [0, 2],
      };
      const direction = directions[event.key];
      if (!direction || paused || travelTarget) return;
      event.preventDefault();
      setPlayerDirection(direction[0] < 0 ? "left" : direction[0] > 0 ? "right" : playerDirection);
      setWalkingFrame((frame) => (frame + 1) % 2);
      setPlayerPosition((position) => ({
        x: Math.min(94, Math.max(6, position.x + direction[0])),
        y: Math.min(88, Math.max(50, position.y + direction[1])),
      }));
    }

    window.addEventListener("keydown", handleMovement);
    return () => window.removeEventListener("keydown", handleMovement);
  }, [paused, travelTarget]);

  function finishRoverDialogue() {
    setRoverSequence(true);
    window.setTimeout(() => setFadeToBlack(true), 1100);
  }

  const playerImage =
    playerDirection === "right"
      ? walkingFrame === 0
        ? hugh
        : hughLeftSway1
      : walkingFrame === 0
        ? hughLeftSway1
        : hughLeftSway2;

  function confirmTravel() {
    if (!travelTarget) return;
    onSave({ location: travelTarget.id });
    setTravelTarget(null);
  }

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
      <div
        aria-hidden="true"
        className="mission-landscape mission-landscape--image"
        style={{ backgroundImage: `url("${currentLocation.asset}")` }}
      >
        {currentLocation.id === "arcadia" && (
          <div className="mission-crash-site">
            <img className="mission-ship" src={spaceship} alt="" />
            <img className="mission-ship-smoke" src={smoke} alt="" />
          </div>
        )}
        {currentLocation.id === "arcadia" && (
          <div
            aria-label="Hugh Mann"
            className="hugh-mann"
            role="img"
            style={{
              left: `${playerPosition.x}%`,
              top: `${playerPosition.y}%`,
              backgroundImage: `url("${playerImage}")`,
            }}
          >
          </div>
        )}
      </div>

      <header className="mission-location">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
        <h1>{currentLocation.name}</h1>
        <p>{currentLocation.id === "arcadia" ? "CRASH SITE // SECTOR 01" : "TRAVEL ROUTE // SECTOR 02"}</p>
      </header>

      <button
        aria-label={`Travel toward ${previousLocation.name}`}
        className="edge-travel edge-travel--left"
        onClick={() => setTravelTarget(previousLocation)}
        type="button"
      >
        <span aria-hidden="true">‹</span>
        <small>{previousLocation.name}</small>
      </button>
      <button
        aria-label={`Travel toward ${nextLocation.name}`}
        className="edge-travel edge-travel--right"
        onClick={() => setTravelTarget(nextLocation)}
        type="button"
      >
        <small>{nextLocation.name}</small>
        <span aria-hidden="true">›</span>
      </button>

      {saveError && (
        <p aria-live="assertive" className="mission-save-error" role="alert">
          SAVE ERROR: {saveError}
        </p>
      )}

      <HUD
        currentObjective={savedGame.objectiveUnlocked ? savedGame.currentObjective : ""}
        onSelectTool={setSelectedTool}
        selectedTool={selectedTool}
      />

      {currentLocation.id === "arcadia" && (
        <aside className={`rover-tab${roverOpen ? " rover-tab--open" : ""}`}>
          <button
            aria-expanded={roverOpen}
            className="rover-tab__button"
            onClick={() => setRoverOpen((isOpen) => !isOpen)}
            type="button"
          >
            <img src={rover} alt="Talk to Rover" />
          </button>
        </aside>
      )}
      {roverOpen && !roverSequence && (
        <div className="rover-conversation">
          <RoverDialogue message={rover_dialogue[0]} onComplete={finishRoverDialogue} />
        </div>
      )}
      {roverSequence && (
        <div className="rover-escort" aria-hidden="true">
          <img className="rover-escort__rover" src={rover} alt="" />
          <img className="rover-escort__hugh" src={hugh} alt="" />
        </div>
      )}
      <div className={`black-fade${fadeToBlack ? " black-fade--active" : ""}`} />

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
      {travelTarget && (
        <div className="travel-prompt" role="dialog" aria-modal="true" aria-labelledby="travel-prompt-title">
          <section className="game-panel travel-prompt__panel">
            <p className="game-eyebrow">EDGE OF SECTOR</p>
            <h2 id="travel-prompt-title">TRAVEL TO {travelTarget.name}?</h2>
            <p>The route ahead will move you away from the crash site.</p>
            <div className="travel-prompt__actions">
              <button className="game-button" onClick={confirmTravel} type="button">TRAVEL</button>
              <button className="game-button" onClick={() => setTravelTarget(null)} type="button">STAY HERE</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}