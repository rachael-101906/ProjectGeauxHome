import { useEffect, useRef, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/backgrounds/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import roverSprite from "../components/assets/backgrounds/rover.png";
import RoverDialogue from "../components/RoverDialogue.jsx";
import { rover_dialogue, user_dialogue } from "../data/dialogue.js";

// Movement tuning: percent of the screen crossed per second.
const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;
// minX/maxX keep Hugh clear of the left and right travel buttons.
const MOVE_LIMITS = { minX: 10, maxX: 90, minY: 50, maxY: 88 };
const START_POSITION = { x: 50, y: 72 };

// R.O.V.E.R. waits on the right side of the crash site (percent of the screen).
// Hugh can press E when he is within ROVER_REACH of it.
const ROVER_SPOT = { x: 80, y: 53 };
const ROVER_REACH = { x: 12, y: 10 };

// Held-key lookup, lowercase so Caps Lock / Shift don't break movement.
const MOVE_KEYS = {
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
};

// R.O.V.E.R. conversation. rover_dialogue and user_dialogue come from
// data/dialogue.js, so editing the text there updates the game:
//   rover_dialogue[0]  R.O.V.E.R. asks the name -> player picks a reply
//   user_dialogue[0]   "Hugh Mann."  -> continues with rover_dialogue[1], [2]
//   user_dialogue[1]   "Goodbye."    -> closes the conversation
const ROVER_ASK_NAME = 0;
const ROVER_LAST_LINE = rover_dialogue.length - 1;

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
  const [roverLine, setRoverLine] = useState(ROVER_ASK_NAME);
  // Hugh's position lives in a ref and is written straight to the element each
  // frame, so walking doesn't re-render the whole screen.
  const hughRef = useRef(null);
  const positionRef = useRef({ ...START_POSITION });
  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const [nearRover, setNearRover] = useState(false);
  const movementBlocked = paused || objectivesOpen || roverOpen || Boolean(travelTarget);
  const blockedRef = useRef(movementBlocked);
  blockedRef.current = movementBlocked;
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

  // Smooth movement: track which keys are held and move every frame, instead of
  // relying on the OS key-repeat (which stalls at first and can't combine keys).
  useEffect(() => {
    const held = heldKeys.current;

    function onKeyDown(event) {
      if (
        event.key.toLowerCase() === "e" &&
        !event.repeat &&
        nearRoverRef.current &&
        !blockedRef.current
      ) {
        event.preventDefault();
        setRoverOpen(true);
        return;
      }

      const direction = MOVE_KEYS[event.key.toLowerCase()];
      if (!direction || event.ctrlKey || event.metaKey || event.altKey) return;
      if (blockedRef.current) return;
      event.preventDefault();
      held.add(direction);
    }

    function onKeyUp(event) {
      const direction = MOVE_KEYS[event.key.toLowerCase()];
      if (direction) held.delete(direction);
    }

    const releaseAll = () => held.clear();

    let frame;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (blockedRef.current) {
        held.clear();
      } else if (held.size > 0) {
        const dx = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
        const dy = (held.has("down") ? 1 : 0) - (held.has("up") ? 1 : 0);
        const position = positionRef.current;
        position.x = Math.min(
          MOVE_LIMITS.maxX,
          Math.max(MOVE_LIMITS.minX, position.x + dx * MOVE_SPEED_X * dt),
        );
        position.y = Math.min(
          MOVE_LIMITS.maxY,
          Math.max(MOVE_LIMITS.minY, position.y + dy * MOVE_SPEED_Y * dt),
        );
        const element = hughRef.current;
        if (element) {
          element.style.left = `${position.x}%`;
          element.style.top = `${position.y}%`;
          if (dx !== 0) element.dataset.facing = dx > 0 ? "right" : "left";
          element.dataset.walking = "true";
        }
      } else if (hughRef.current?.dataset.walking) {
        delete hughRef.current.dataset.walking;
      }

      // Only re-render when Hugh walks into or out of R.O.V.E.R.'s reach.
      const { x, y } = positionRef.current;
      const near =
        Math.abs(x - ROVER_SPOT.x) <= ROVER_REACH.x &&
        Math.abs(y - ROVER_SPOT.y) <= ROVER_REACH.y;
      if (near !== nearRoverRef.current) {
        nearRoverRef.current = near;
        setNearRover(near);
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
    };
  }, []);

  function closeRover() {
    setRoverOpen(false);
    setRoverLine(ROVER_ASK_NAME);
  }

  // What the player can press for the current R.O.V.E.R. line.
  const roverActions =
    roverLine === ROVER_ASK_NAME
      ? user_dialogue.map((label, index) => ({
          label,
          onClick: index === 0 ? () => setRoverLine(1) : closeRover,
        }))
      : roverLine < ROVER_LAST_LINE
        ? [{ label: "CONTINUE", onClick: () => setRoverLine(roverLine + 1) }]
        : [{ label: "CLOSE", onClick: closeRover }];

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
            ref={hughRef}
            role="img"
            style={{ left: `${START_POSITION.x}%`, top: `${START_POSITION.y}%` }}
          >
            <span className="hugh-mann__head" />
            <span className="hugh-mann__body" />
            <span className="hugh-mann__leg hugh-mann__leg--left" />
            <span className="hugh-mann__leg hugh-mann__leg--right" />
          </div>
        )}
      </div>

      {currentLocation.id === "arcadia" && (
        <button
          aria-label="Talk to R.O.V.E.R."
          className="rover-npc"
          onClick={() => !movementBlocked && setRoverOpen(true)}
          style={{ left: `${ROVER_SPOT.x}%`, top: `${ROVER_SPOT.y}%` }}
          type="button"
        >
          <span className="rover-npc__art">
            <img alt="" draggable="false" src={roverSprite} />
          </span>
          {nearRover && !movementBlocked && (
            <span className="rover-npc__prompt">[E] TALK</span>
          )}
        </button>
      )}

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
            onClick={() => (roverOpen ? closeRover() : setRoverOpen(true))}
            type="button"
          >
            R.O.V.E.R.
          </button>
          {roverOpen && (
            <RoverDialogue
              actions={roverActions}
              key={roverLine}
              message={rover_dialogue[roverLine]}
            />
          )}
        </aside>
      )}

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