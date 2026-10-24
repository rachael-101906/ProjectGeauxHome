import { useEffect, useRef, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";
import TraderScreen from "./TraderScreen.jsx";

import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/backgrounds/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import roverSprite from "../components/assets/backgrounds/rover.png";

import { rover_dialogue, user_dialogue } from "../data/dialogue.js";

// Movement tuning: percent of the screen crossed per second.
const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;
// minX/maxX keep Hugh clear of the left and right travel buttons.
const MOVE_LIMITS = { minX: 10, maxX: 90, minY: 50, maxY: 88 };
const START_POSITION = { x: 18, y: 72 }; // Spawn beside the crashed ship.
const MINE_SPOT = { x: 55, y: 75 };
const MINE_REACH = { x: 9, y: 12 };

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

export default function Base({ onMainMenu, onSave, saveError, savedGame = {} }) {
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [selectedTool, setSelectedTool] = useState(savedGame.selectedTool || "Drill");
  const [locationId, setLocationId] = useState(savedGame.location || "arcadia");
  const [oreCount, setOreCount] = useState(Math.max(0, Number(savedGame.oreCount) || 0));
  const [minedLocations, setMinedLocations] = useState(Array.isArray(savedGame.minedLocations) ? savedGame.minedLocations : []);
  const [miningNotice, setMiningNotice] = useState("");
  const [credits, setCredits] = useState(Math.max(0, Number(savedGame.credits) || 0));
  const [traderInventory, setTraderInventory] = useState(savedGame.traderInventory || { oxygenFilters: 0, repairKits: 0, drillUpgrades: 0 });
  const [showTradeScreen, setShowTradeScreen] = useState(false);
  const [travelMenuOpen, setTravelMenuOpen] = useState(false);
  const [showLocationTitle, setShowLocationTitle] = useState(true);
  const [charactersVisible, setCharactersVisible] = useState(false);
  const [travelTarget, setTravelTarget] = useState(null);
  const [roverOpen, setRoverOpen] = useState(false);
  const [roverLine, setRoverLine] = useState(ROVER_ASK_NAME);
  const [hughReply, setHughReply] = useState(false);
  const [roverSequence, setRoverSequence] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  // Hugh's position lives in a ref and is written straight to the element each frame
  const hughRef = useRef(null);
  const positionRef = useRef({ ...START_POSITION });
  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const [nearRover, setNearRover] = useState(false);

  const movementBlocked = paused || objectivesOpen || roverOpen || Boolean(travelTarget) || travelMenuOpen || roverSequence || fadeToBlack || showTradeScreen || showLocationTitle || !charactersVisible;
  const blockedRef = useRef(movementBlocked);
  blockedRef.current = movementBlocked;

  const locationIndex = Math.max(0, locations.findIndex((location) => location.id === locationId));
  const currentLocation = locations[locationIndex];
  const previousLocation =
    locations[(locationIndex - 1 + locations.length) % locations.length];
  const nextLocation = locations[(locationIndex + 1) % locations.length];

  useEffect(() => {
    if (onSave) {
      onSave({
        selectedTool,
        location: locationId,
        currentObjective: savedGame.currentObjective,
        objectives: savedGame.objectives,
        oreCount,
        minedLocations,
        credits,
        traderInventory,
      });
    }
  }, [
    onSave,
    savedGame.currentObjective,
    locationId,
    savedGame.objectives,
    selectedTool,
    oreCount,
    minedLocations,
    credits,
    traderInventory,
  ]);

  // Brief title card on every map: hold for one second, fade, then reveal characters.
  useEffect(() => {
    setShowLocationTitle(true);
    setCharactersVisible(false);
    const fadeTitle = window.setTimeout(() => setShowLocationTitle(false), 1000);
    const revealScene = window.setTimeout(() => setCharactersVisible(true), 1600);
    return () => { window.clearTimeout(fadeTitle); window.clearTimeout(revealScene); };
  }, [locationId]);

  function mineResource() {
    const { x, y } = positionRef.current;
    if (Math.abs(x - MINE_SPOT.x) > MINE_REACH.x || Math.abs(y - MINE_SPOT.y) > MINE_REACH.y) { setMiningNotice("MOVE CLOSER TO THE DEPOSIT"); return; }
    if (selectedTool !== "Drill") { setMiningNotice("EQUIP THE DRILL FIRST"); return; }
    if (minedLocations.includes(locationId)) { setMiningNotice("THIS DEPOSIT IS EMPTY"); return; }
    const nextOre = oreCount + 1;
    const nextMined = [...minedLocations, locationId];
    setOreCount(nextOre); setMinedLocations(nextMined); setMiningNotice("+1 MARTIAN ORE");
    onSave?.({ oreCount: nextOre, minedLocations: nextMined });
    window.setTimeout(() => setMiningNotice(""), 1800);
  }

  function sellOre(quantity) {
    const amount = quantity === "all" ? oreCount : Math.min(1, oreCount);
    if (!amount) return;
    const nextOre = oreCount - amount, nextCredits = credits + amount * 10;
    setOreCount(nextOre); setCredits(nextCredits);
    onSave?.({ oreCount: nextOre, credits: nextCredits });
  }

  function buyTraderItem(itemId, price) {
    if (credits < price) return;
    const nextCredits = credits - price;
    const nextInventory = { ...traderInventory, [itemId]: (traderInventory[itemId] || 0) + 1 };
    setCredits(nextCredits); setTraderInventory(nextInventory);
    onSave?.({ credits: nextCredits, traderInventory: nextInventory });
  }

  // Smooth movement loop
  useEffect(() => {
    const held = heldKeys.current;

    function onKeyDown(event) {
      if (event.key.toLowerCase() === "e" && !event.repeat && !blockedRef.current) {
        if (nearRoverRef.current) {
          event.preventDefault();
          setRoverOpen(true);
          return;
        }
        const { x, y } = positionRef.current;
        if (Math.abs(x - MINE_SPOT.x) <= MINE_REACH.x && Math.abs(y - MINE_SPOT.y) <= MINE_REACH.y) {
          event.preventDefault();
          mineResource();
          return;
        }
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
          Math.max(MOVE_LIMITS.minX, position.x + dx * MOVE_SPEED_X * dt)
        );
        position.y = Math.min(
          MOVE_LIMITS.maxY,
          Math.max(MOVE_LIMITS.minY, position.y + dy * MOVE_SPEED_Y * dt)
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

      // Check proximity to R.O.V.E.R.
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
    setHughReply(false);
  }

  // Hugh's selected name appears as his own line before R.O.V.E.R. responds.
  const roverActions = hughReply
    ? [{ label: "CONTINUE", onClick: () => { setHughReply(false); setRoverLine(1); } }]
    : roverLine === ROVER_ASK_NAME
    ? user_dialogue.map((label, index) => ({
        label,
        onClick: index === 0 ? () => setHughReply(true) : closeRover,
      }))
    : roverLine < ROVER_LAST_LINE
    ? [{ label: "CONTINUE", onClick: () => setRoverLine((line) => line + 1) }]
    : [{
        label: locationId === "arcadia" ? "LET'S RIDE TO VASTITAS" : "CHOOSE A DESTINATION",
        onClick: () => {
          if (locationId === "arcadia") finishRoverDialogue();
          else { setRoverOpen(false); setTravelMenuOpen(true); }
        },
      }];

  function finishRoverDialogue() {
    heldKeys.current.clear();
    setRoverOpen(false);
    setRoverSequence(true); // Hugh hops onto the rover, then they drive off-screen together.
    window.setTimeout(() => setFadeToBlack(true), 1500);
    window.setTimeout(() => {
      setLocationId("vastitas");
      positionRef.current = { ...START_POSITION };
      setShowTradeScreen(true);
      setRoverSequence(false);
      setFadeToBlack(false);
      setShowLocationTitle(true);
      setCharactersVisible(false);
      onSave?.({ location: "vastitas", playerX: START_POSITION.x, playerY: START_POSITION.y });
    }, 2700);
  }

  function chooseRoverDestination(destination) {
    setTravelMenuOpen(false);
    setFadeToBlack(true);
    heldKeys.current.clear();
    window.setTimeout(() => {
      setLocationId(destination.id);
      positionRef.current = { ...START_POSITION };
      setShowTradeScreen(destination.id === "vastitas");
      setFadeToBlack(false);
      setShowLocationTitle(true);
      setCharactersVisible(false);
      onSave?.({ location: destination.id, playerX: START_POSITION.x, playerY: START_POSITION.y });
    }, 1200);
  }

  function confirmTravel() {
    if (!travelTarget) return;
    const destination = travelTarget;
    setTravelTarget(null);
    chooseRoverDestination(destination);
  }

  // Handle Pause and Objectives hotkeys
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
        {charactersVisible && (
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

      {charactersVisible && (
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

      {showLocationTitle && <header className="mission-location location-title-splash">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
        <h1>{currentLocation.name}</h1>
        <p>
          {currentLocation.id === "arcadia"
            ? "CRASH SITE // SECTOR 01"
            : "TRAVEL ROUTE // SECTOR 02"}
        </p>
      </header>}

      {charactersVisible && !minedLocations.includes(locationId) && (
        <button className="mine-node" onClick={mineResource} style={{ left: `${MINE_SPOT.x}%`, top: `${MINE_SPOT.y}%` }} type="button" aria-label="Mine the nearby ore deposit">
          <span className="mine-node__rock" aria-hidden="true">◆</span><span className="mine-node__label">ORE [E]</span>
        </button>
      )}
      {miningNotice && <div className="mining-notice" role="status">{miningNotice}</div>}
      {charactersVisible && <div className="ore-counter" aria-live="polite">MARTIAN ORE: {oreCount}</div>}

      {charactersVisible && <button
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
        currentObjective={
          savedGame.objectiveUnlocked ? savedGame.currentObjective : ""
        }
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
            <img src={roverSprite} alt="Talk to Rover" />
          </button>
          {roverOpen && (
            <RoverDialogue
              actions={roverActions}
              key={`${roverLine}-${hughReply ? "hugh" : "rover"}`}
              message={hughReply ? "Hugh Mann." : rover_dialogue[roverLine]}
              speaker={hughReply ? "HUGH MANN" : "R.O.V.E.R."}
            />
          )}
        </aside>
      )}

      {roverSequence && (
        <div className="rover-ride-cutscene" aria-hidden="true">
          <div className="rover-ride-cutscene__rover"><img src={roverSprite} alt="" /></div>
          <div className="rover-ride-cutscene__hugh">
            <span className="hugh-mann__head" /><span className="hugh-mann__body" />
            <span className="hugh-mann__leg hugh-mann__leg--left" /><span className="hugh-mann__leg hugh-mann__leg--right" />
          </div>
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

      {showTradeScreen && (
        <TraderScreen credits={credits} oreCount={oreCount} inventory={traderInventory}
          onSellOre={sellOre} onBuyItem={buyTraderItem} onClose={() => setShowTradeScreen(false)} />
      )}

      {travelMenuOpen && (
        <div className="travel-menu-overlay" role="dialog" aria-modal="true" aria-labelledby="rover-destination-title">
          <section className="game-panel travel-menu-panel">
            <p className="game-eyebrow">R.O.V.E.R. // MARS TRANSIT</p><h2 id="rover-destination-title">WHERE TO, HUGH?</h2>
            <p>Choose any mapped destination and I will drive you there.</p>
            <div className="travel-destinations">{locations.map((destination) => (
              <button className="game-button" key={destination.id} disabled={destination.id === locationId}
                onClick={() => chooseRoverDestination(destination)} type="button">{destination.name}</button>
            ))}</div>
            <button className="game-button" onClick={() => setTravelMenuOpen(false)} type="button">CANCEL</button>
          </section>
        </div>
      )}

      {travelTarget && (
        <div
          className="travel-prompt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="travel-prompt-title"
        >
          <section className="game-panel travel-prompt__panel">
            <p className="game-eyebrow">EDGE OF SECTOR</p>
            <h2 id="travel-prompt-title">TRAVEL TO {travelTarget.name}?</h2>
            <p>The route ahead will move you away from the crash site.</p>
            <div className="travel-prompt__actions">
              <button
                className="game-button"
                onClick={confirmTravel}
                type="button"
              >
                TRAVEL
              </button>
              <button
                className="game-button"
                onClick={() => setTravelTarget(null)}
                type="button"
              >
                STAY HERE
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}