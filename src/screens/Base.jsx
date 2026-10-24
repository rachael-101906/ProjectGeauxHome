import { useEffect, useState } from "react";
import {
  advanceObjective,
  collectIce,
  completeTravelObjective,
  createObjectiveState,
  getCurrentObjective,
  restoreHabitatPower,
  unlockTravel,
} from "../systems/ObjectiveManager.js";
import HUD from "../components/HUD.jsx";
import LocationWorld from "../components/LocationWorld.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";
import TravelMenu from "../components/TravelMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";

const roverIntroduction = [
  "Good news! We are only mostly stranded.",
  "The ship cannot leave yet.",
  "Let's gather some resources first.",
];

const dialogueForStage = {
  1: ["Let's gather 10 Ice to get our habitat systems running."],
  2: ["Thanks for gathering the Ice. Restore Habitat Power at the habitat."],
  3: ["The habitat is stable. I can transport us between Mars locations."],
  5: ["Alba Mons is a good place to continue the expedition. I'll be here when you need a ride."],
};

export default function Base({
  onMainMenu,
  onSave,
  saveError,
  savedGame,
}) {
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [selectedTool, setSelectedTool] = useState(
    savedGame.selectedTool === "Blaster" ? "Blaster" : "Pickaxe",
  );
  const [objectiveState, setObjectiveState] = useState(() =>
    createObjectiveState(savedGame),
  );
  const [dialogue, setDialogue] = useState(null);
  const [travelMenuOpen, setTravelMenuOpen] = useState(false);

  useEffect(() => {
    onSave({ selectedTool });
  }, [onSave, selectedTool]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();

        if (dialogue || travelMenuOpen) {
          setDialogue(null);
          setTravelMenuOpen(false);
          return;
        }

        if (objectivesOpen && !paused && event.key === "Escape") {
          setObjectivesOpen(false);
          return;
        }

        setObjectivesOpen(false);
        setPaused((isPaused) => !isPaused);
        setPauseNotice("");
        return;
      }

      if (paused) return;
      if (event.key === "Tab") {
        event.preventDefault();
        setObjectivesOpen((isOpen) => !isOpen);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogue, objectivesOpen, paused, travelMenuOpen]);

  function saveObjectiveState(nextState, updates = {}) {
    if (nextState !== objectiveState) setObjectiveState(nextState);
    onSave({
      objectiveStage: nextState.stage,
      currentObjective: getCurrentObjective(nextState),
      iceCollected: nextState.iceCollected,
      habitatPowered: nextState.habitatPowered,
      travelUnlocked: nextState.travelUnlocked,
      ...updates,
    });
  }

  function interact(entity) {
    if (entity.type === "resource") {
      if (entity.resource === "Ice" && objectiveState.stage === 1) {
        saveObjectiveState(collectIce(objectiveState));
      }
      return;
    }

    if (entity.type === "habitat") {
      saveObjectiveState(restoreHabitatPower(objectiveState));
      return;
    }

    if (entity.type !== "rover") return;

    if (objectiveState.stage >= 4) {
      setTravelMenuOpen(true);
      return;
    }

    setDialogue({
      action: objectiveState.stage === 0 ? "find-rover" :
        objectiveState.stage === 3 ? "unlock-travel" : "close",
      lines: objectiveState.stage === 0
        ? roverIntroduction
        : dialogueForStage[objectiveState.stage] ?? [
            "Keep following the current objective. I'll be here to help.",
          ],
    });
  }

  function continueDialogue() {
    if (dialogue?.action === "find-rover") {
      saveObjectiveState(advanceObjective(objectiveState));
    } else if (dialogue?.action === "unlock-travel") {
      saveObjectiveState(unlockTravel(objectiveState));
    }

    setDialogue(null);
  }

  function travelTo(destination) {
    const nextState = completeTravelObjective(objectiveState, destination.id);
    saveObjectiveState(nextState, { currentLocation: destination.name });
    setTravelMenuOpen(false);
  }

  const currentObjective = getCurrentObjective(objectiveState);
  const worldPaused = paused || objectivesOpen || Boolean(dialogue) || travelMenuOpen;

  return (
    <main className="mission-screen">
      <LocationWorld
        location={savedGame.currentLocation || "Arcadia Planitia"}
        onInteract={interact}
        onSelectTool={setSelectedTool}
        paused={worldPaused}
        selectedTool={selectedTool}
      />

      <header className="mission-location">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
        <h1>{savedGame.currentLocation || "Arcadia Planitia"}</h1>
        <p>MARS SURFACE // EXPEDITION ACTIVE</p>
      </header>

      {saveError && (
        <p aria-live="assertive" className="mission-save-error" role="alert">
          SAVE ERROR: {saveError}
        </p>
      )}

      <HUD
        currentObjective={currentObjective}
        objectiveProgress={
          objectiveState.stage === 1 ? objectiveState.iceCollected : undefined
        }
      />

      <div className="mission-actions">
        <button
          className="game-button"
          onClick={() => !paused && setObjectivesOpen(true)}
          type="button"
        >
          CURRENT OBJECTIVE [TAB]
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
        isOpen={objectivesOpen && !paused && !dialogue && !travelMenuOpen}
        objective={currentObjective}
        onClose={() => setObjectivesOpen(false)}
        progress={
          objectiveState.stage === 1 ? objectiveState.iceCollected : undefined
        }
      />
      {dialogue && (
        <RoverDialogue
          lines={dialogue.lines}
          onClose={() => setDialogue(null)}
          onContinue={continueDialogue}
        />
      )}
      {travelMenuOpen && (
        <TravelMenu
          currentLocation={savedGame.currentLocation || "Arcadia Planitia"}
          onClose={() => setTravelMenuOpen(false)}
          onTravel={travelTo}
        />
      )}
      {paused && (
        <PauseMenu
          onControls={() =>
            setPauseNotice("WASD: MOVE  //  E: INTERACT  //  1/2: EQUIP")
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
